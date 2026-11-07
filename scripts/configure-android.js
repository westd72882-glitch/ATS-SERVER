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
    // Capacitor по умолчанию пишет "minifyEnabled false" — принудительно заменяем на true
    if (/minifyEnabled\s+\w+/.test(body)) body = body.replace(/minifyEnabled\s+\w+/, 'minifyEnabled true');
    else body += '\n            minifyEnabled true';
    if (/shrinkResources\s+\w+/.test(body)) body = body.replace(/shrinkResources\s+\w+/, 'shrinkResources true');
    else body += '\n            shrinkResources true';
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
`;
fs.appendFileSync(proguardPath, extra);
console.log('proguard-rules.pro дополнен правилами для Capacitor/WebView.');

const pkg = require(path.join(__dirname, '..', 'capacitor.config.json')).appId;
const pkgDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'java', ...pkg.split('.'));
if (!fs.existsSync(pkgDir)) {
  console.error('Не найдена папка пакета: ' + pkgDir);
  process.exit(1);
}
const mainActivityPath = path.join(pkgDir, 'MainActivity.java');

// 6. принудительная альбомная ориентация на уровне Android-манифеста
//    (главный способ — работает даже если пользователь повернёт телефон/отключит автоповорот)
const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
manifest = manifest.replace(/<activity\b[^>]*android:name="\.MainActivity"[^>]*>/, tag => {
  tag = tag.replace(/\s+android:screenOrientation="[^"]*"/, '');
  tag = tag.replace(/\s+android:configChanges="[^"]*"/, '');
  return tag.replace(/<activity/, '<activity\n            android:screenOrientation="sensorLandscape"\n            android:configChanges="orientation|screenSize|smallestScreenSize|screenLayout|keyboardHidden|keyboard|uiMode|locale"');
});
// защита: запрет adb backup (иначе локальные данные приложения можно вытащить без root) и запрет HTTP без TLS
manifest = manifest.replace(/<application\b[^>]*>/, tag => {
  tag = tag.replace(/\s+android:allowBackup="[^"]*"/, '').replace(/\s+android:usesCleartextTraffic="[^"]*"/, '');
  return tag.replace(/<application/, '<application\n        android:allowBackup="false"\n        android:usesCleartextTraffic="false"');
});
fs.writeFileSync(manifestPath, manifest);
console.log('AndroidManifest.xml: MainActivity зафиксирована в sensorLandscape.');
console.log('AndroidManifest.xml: allowBackup=false, cleartext запрещён.');

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
    ma = ma.replace(/public class MainActivity extends BridgeActivity \{/, m => m + '\n' + code);
    fs.writeFileSync(mainActivityPath, ma);
    console.log('MainActivity.java: goFull() добавлен.');
  }
}

// 10. Защита: выключаем WebView remote-debugging в релизе (иначе ресурсы и JS
//     можно открыть через chrome://inspect на подключённом по USB телефоне)
{
  let ma = fs.readFileSync(mainActivityPath, 'utf8');
  if (!/setWebContentsDebuggingEnabled/.test(ma)) {
    ma = ma.replace(
      /public class MainActivity extends BridgeActivity \{/,
      m => m + '\n  static { android.webkit.WebView.setWebContentsDebuggingEnabled(false); }'
    );
    fs.writeFileSync(mainActivityPath, ma);
    console.log('MainActivity.java: WebView debugging отключён в релизе.');
  }
}

// 9. иконка приложения (ATS BLITZ) + имя
{
  const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
  const iconDir = path.join(__dirname, 'icons');
  for (const d of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
    const dst = path.join(resDir, 'mipmap-' + d);
    fs.mkdirSync(dst, { recursive: true });
    fs.copyFileSync(path.join(iconDir, `ic_launcher-${d}.png`), path.join(dst, 'ic_launcher.png'));
    fs.copyFileSync(path.join(iconDir, `ic_launcher_round-${d}.png`), path.join(dst, 'ic_launcher_round.png'));
    fs.copyFileSync(path.join(iconDir, `ic_launcher_foreground-${d}.png`), path.join(dst, 'ic_launcher_foreground.png'));
  }
  const bg = path.join(resDir, 'values', 'ic_launcher_background.xml');
  fs.writeFileSync(bg, '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#1E6FC8</color>\n</resources>\n');
  const strings = path.join(resDir, 'values', 'strings.xml');
  if (fs.existsSync(strings)) {
    fs.writeFileSync(strings, fs.readFileSync(strings, 'utf8').replace(/(<string name="(?:app_name|title_activity_main)">)[^<]*/g, '$1ATS BLITZ'));
  }
  console.log('Иконка ATS BLITZ и имя приложения применены.');
}

// 11. шифрование 3D-моделей (должно идти ПОСЛЕ правок MainActivity выше). Если не удалось — сборка падает,
//     чтобы в APK никогда не попали открытые модели.
require('./protect-models.js');
