/**
 * Запускается ПОСЛЕ `npx cap add android`.
 * Включает minifyEnabled/shrinkResources (R8) и настраивает подпись release-сборки
 * через переменные окружения (чтобы keystore и пароли не попадали в репозиторий).
 */
const fs = require('fs');
const path = require('path');

const GRADLE_PATH = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

if (!fs.existsSync(GRADLE_PATH)) {
  console.error('android/app/build.gradle не найден. Сначала выполните `npx cap add android`.');
  process.exit(1);
}

let gradle = fs.readFileSync(GRADLE_PATH, 'utf8');

const SIGNING_BLOCK = `
    signingConfigs {
        release {
            storeFile file(System.getenv("RELEASE_STORE_FILE") ?: "release.keystore")
            storePassword System.getenv("RELEASE_STORE_PASSWORD")
            keyAlias System.getenv("RELEASE_KEY_ALIAS")
            keyPassword System.getenv("RELEASE_KEY_PASSWORD")
        }
    }
`;

// 1. добавляем signingConfigs внутрь блока android { ... }
if (!gradle.includes('signingConfigs')) {
  gradle = gradle.replace(/android\s*\{/, match => `${match}\n${SIGNING_BLOCK}`);
}

// 2. включаем R8/ProGuard и привязываем signingConfig к release
gradle = gradle.replace(
  /buildTypes\s*\{\s*release\s*\{([^}]*)\}/s,
  (m, inner) => {
    let body = inner;
    if (!body.includes('minifyEnabled')) body += '\n            minifyEnabled true';
    if (!body.includes('shrinkResources')) body += '\n            shrinkResources true';
    if (!body.includes('signingConfig')) body += '\n            signingConfig signingConfigs.release';
    if (!body.includes('proguardFiles')) {
      body += "\n            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'";
    }
    return `buildTypes {\n        release {${body}\n        }`;
  }
);

// 3. versionName/versionCode из файла VERSION (синхронно с сервером)
const APPV = fs.readFileSync(path.join(__dirname, '..', 'VERSION'), 'utf8').trim();
const vp = APPV.split('.').map(n => parseInt(n, 10) || 0);
const vcode = vp[0] * 10000 + (vp[1] || 0) * 100 + (vp[2] || 0);
gradle = gradle.replace(/versionName\s+"[^"]*"/, `versionName "${APPV}"`).replace(/versionCode\s+\d+/, `versionCode ${vcode}`);

fs.writeFileSync(GRADLE_PATH, gradle);
console.log('android/app/build.gradle настроен: R8 (minify+shrink) + подпись release из env.');

// 3. минимальные доп. правила proguard, чтобы не ломать three.js / WebView JS-мосты
const proguardPath = path.join(__dirname, '..', 'android', 'app', 'proguard-rules.pro');
const extra = `
# --- добавлено build-пайплайном защищённой сборки ---
-keep class com.getcapacitor.** { *; }
-keepclassmembers class * extends android.webkit.WebChromeClient { *; }
-dontwarn com.getcapacitor.**
# AssetKeyPlugin обращается через Capacitor reflection - не переименовывать/не выпиливать
-keep class ${'${applicationId}'}.AssetKeyPlugin { *; }
`;
fs.appendFileSync(proguardPath, extra);
console.log('proguard-rules.pro дополнен правилами для Capacitor/WebView.');

// 4. генерируем нативный плагин AssetKey: ключ раздроблен и XOR-замаскирован,
//    в JS-бандл не попадает вообще, отдаётся только по запросу через bridge.
const ASSET_KEY = process.env.ASSET_KEY;
if (!ASSET_KEY || ASSET_KEY.length !== 64) {
  console.error('ASSET_KEY не задан — нативный плагин ключа не может быть сгенерирован.');
  process.exit(1);
}

const pkg = require(path.join(__dirname, '..', 'capacitor.config.json')).appId; // com.ats.tanks
const pkgDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'java', ...pkg.split('.'));
if (!fs.existsSync(pkgDir)) {
  console.error('Не найдена папка пакета: ' + pkgDir);
  process.exit(1);
}

const XOR_BYTE = Math.floor(Math.random() * 255) + 1;
const keyBytes = Buffer.from(ASSET_KEY, 'hex');
const maskedHex = Buffer.from(keyBytes.map(b => b ^ XOR_BYTE)).toString('hex');
// рубим на 4 куска, чтобы ключ не лежал одной читаемой строкой в classes.dex
const chunkSize = Math.ceil(maskedHex.length / 4);
const parts = [];
for (let i = 0; i < maskedHex.length; i += chunkSize) parts.push(maskedHex.slice(i, i + chunkSize));
const partsLiteral = parts.map(p => `"${p}"`).join(', ');

let pluginSrc = fs.readFileSync(path.join(__dirname, 'templates', 'AssetKeyPlugin.java'), 'utf8');
pluginSrc = pluginSrc
  .replace('__PACKAGE__', pkg)
  .replace('__KEY_PARTS__', partsLiteral)
  .replace('__XOR_BYTE__', String(XOR_BYTE));

fs.writeFileSync(path.join(pkgDir, 'AssetKeyPlugin.java'), pluginSrc);
console.log('AssetKeyPlugin.java сгенерирован (ключ раздроблен + XOR-замаскирован).');

// 5. регистрируем плагин в MainActivity (instance initializer block, как рекомендует Capacitor)
const mainActivityPath = path.join(pkgDir, 'MainActivity.java');
let mainActivity = fs.readFileSync(mainActivityPath, 'utf8');
if (!mainActivity.includes('AssetKeyPlugin')) {
  mainActivity = mainActivity.replace(
    /public class MainActivity extends BridgeActivity \{/,
    `public class MainActivity extends BridgeActivity {\n  {\n    registerPlugin(AssetKeyPlugin.class);\n  }\n`
  );
  fs.writeFileSync(mainActivityPath, mainActivity);
  console.log('MainActivity.java: AssetKeyPlugin зарегистрирован.');
}

// 6. принудительная альбомная ориентация на уровне Android-манифеста
//    (главный способ — работает даже если пользователь повернёт телефон/отключит автоповорот)
const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
if (!manifest.includes('android:screenOrientation')) {
  manifest = manifest.replace(
    /(<activity\s+android:name="\.MainActivity")/,
    '$1\n            android:screenOrientation="landscape"\n            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"'
  );
  fs.writeFileSync(manifestPath, manifest);
  console.log('AndroidManifest.xml: MainActivity зафиксирована в landscape.');
} else {
  console.log('AndroidManifest.xml уже содержит screenOrientation — пропущено.');
}

// 7. полный экран без чёрной рамки у фронтальной камеры (вырез): рисуем под вырезом
const stylesPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'values', 'styles.xml');
if (fs.existsSync(stylesPath)) {
  let st = fs.readFileSync(stylesPath, 'utf8');
  if (!/windowLayoutInDisplayCutoutMode|windowFullscreen/.test(st)) {
    st = st.replace(/(<style name="AppTheme\.NoActionBar"[^>]*>)/,
      '$1\n        <item name="android:windowFullscreen">true</item>\n        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>');
    st = st.replace(/(<style name="AppTheme\.NoActionBarLaunch"[^>]*>)/,
      '$1\n        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>');
    fs.writeFileSync(stylesPath, st);
    console.log('styles.xml: fullscreen + cutout shortEdges.');
  }
}

// 8. настоящий полный экран в коде: рисуем под вырезом камеры, прячем системные панели
//    (иначе Android оставляет чёрную полосу ~97px у фронтальной камеры)
{
  let ma = fs.readFileSync(mainActivityPath, 'utf8');
  if (!/goFull|layoutInDisplayCutoutMode|getInsetsController/.test(ma)) {
    const code = `
  @Override public void onCreate(android.os.Bundle b) { super.onCreate(b); goFull();
    androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (v, ins) -> {
      if (ins.isVisible(androidx.core.view.WindowInsetsCompat.Type.systemBars())) v.post(() -> goFull());
      return androidx.core.view.ViewCompat.onApplyWindowInsets(v, ins);
    });
  }
  @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) goFull(); }
  private void goFull() {
    android.view.Window w = getWindow();
    androidx.core.view.WindowCompat.setDecorFitsSystemWindows(w, false);
    if (android.os.Build.VERSION.SDK_INT >= 28) {
      android.view.WindowManager.LayoutParams p = w.getAttributes();
      p.layoutInDisplayCutoutMode = android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
      w.setAttributes(p);
    }
    androidx.core.view.WindowInsetsControllerCompat c = androidx.core.view.WindowCompat.getInsetsController(w, w.getDecorView());
    c.hide(androidx.core.view.WindowInsetsCompat.Type.systemBars());
    c.setSystemBarsBehavior(androidx.core.view.WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
  }
`;
    ma = ma.replace('registerPlugin(AssetKeyPlugin.class);\n  }\n', 'registerPlugin(AssetKeyPlugin.class);\n  }\n' + code);
    fs.writeFileSync(mainActivityPath, ma);
    console.log('MainActivity.java: goFull() добавлен.');
  }
}
