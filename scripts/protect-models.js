/**
 * Защита 3D-моделей в APK. Запускается ПОСЛЕ `cap sync` и `configure-android.js`.
 *
 * Что делает:
 *  1) шифрует все android/app/src/main/assets/public/models/*.glb (AES-256-CTR, свой IV у каждого файла).
 *     В APK они больше не лежат открытым текстом: распаковав APK, получите шифртекст, а не .glb.
 *  2) создаёт нативный класс ModelGuard (Java): перехватывает запросы WebView к /models/*.glb,
 *     расшифровывает потоком (без загрузки файла целиком в память) и отдаёт игре обычный .glb.
 *     Игровой JS НЕ меняется и ключа не видит — никакого WebCrypto и моста Capacitor
 *     (именно они давали зависания загрузки в старой схеме).
 *  3) подключает ModelGuard в MainActivity.
 *
 * Ключ: секрет ASSET_KEY (64 hex-символа) или, если не задан, случайный на каждую сборку.
 * Ключ хранится в Java в виде двух XOR-масок, чтобы его не нашёл простой поиск строк по APK.
 * Это ЗАТРУДНЯЕТ извлечение, но не делает его невозможным: тот, кто декомпилирует APK
 * или снимет дамп памяти работающей игры, модели получит. Абсолютной защиты клиента не существует.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const pkg = require(path.join(ROOT, 'capacitor.config.json')).appId;
const javaDir = path.join(ROOT, 'android', 'app', 'src', 'main', 'java', ...pkg.split('.'));
const modelsDir = path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public', 'models');
const MAGIC = Buffer.from('ATSG');

function die(m) { console.error('protect-models: ' + m); process.exit(1); }

if (!fs.existsSync(modelsDir)) die('нет папки моделей ' + modelsDir);
if (!fs.existsSync(path.join(javaDir, 'MainActivity.java'))) die('нет MainActivity.java');

// ---- ключ ----
let key;
if (process.env.ASSET_KEY) {
  if (!/^[0-9a-fA-F]{64}$/.test(process.env.ASSET_KEY.trim())) die('ASSET_KEY должен быть 64 hex-символа (openssl rand -hex 32)');
  key = Buffer.from(process.env.ASSET_KEY.trim(), 'hex');
} else {
  key = crypto.randomBytes(32);
  console.log('ASSET_KEY не задан — использован случайный ключ этой сборки.');
}

// ---- шифрование ----
const files = fs.readdirSync(modelsDir).filter(f => f.toLowerCase().endsWith('.glb'));
if (!files.length) die('в папке моделей нет .glb — нечего защищать');
let total = 0;
for (const f of files) {
  const p = path.join(modelsDir, f);
  const plain = fs.readFileSync(p);
  if (plain.subarray(0, 4).equals(MAGIC)) die(f + ' уже зашифрован другим ключом. Запускайте на свежем android/ (после npx cap add android), иначе игра не сможет расшифровать модели.');
  if (plain.subarray(0, 4).toString('latin1') !== 'glTF') die(f + ' не похож на .glb');
  const iv = crypto.randomBytes(16);
  const c = crypto.createCipheriv('aes-256-ctr', key, iv);
  fs.writeFileSync(p, Buffer.concat([MAGIC, iv, c.update(plain), c.final()]));
  total++;
}
// страховка: ни один файл не должен остаться открытым
for (const f of files) {
  if (!fs.readFileSync(path.join(modelsDir, f)).subarray(0, 4).equals(MAGIC)) die('файл остался незашифрованным: ' + f);
}
console.log('зашифровано моделей:', total, 'из', files.length);

// ---- Java: ModelGuard ----
const mask = crypto.randomBytes(32);
const A = [...key].map((b, i) => b ^ mask[i]);
const B = [...mask];
const arr = a => a.map(v => '0x' + v.toString(16).padStart(2, '0')).join(',');
const java = `package ${pkg};

import android.content.res.AssetManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;
import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/** Расшифровывает /models/*.glb на лету; остальные запросы обрабатывает Capacitor как обычно. */
public class ModelGuard extends BridgeWebViewClient {
  private static final int[] A = {${arr(A)}};
  private static final int[] B = {${arr(B)}};
  private final AssetManager assets;

  public ModelGuard(Bridge bridge, AssetManager assets) {
    super(bridge);
    this.assets = assets;
  }

  static byte[] key() {
    byte[] k = new byte[32];
    for (int i = 0; i < 32; i++) k[i] = (byte) (A[i] ^ B[i]);
    return k;
  }

  /** Формат файла: "ATSG" + IV(16) + AES-256-CTR шифртекст. */
  static InputStream decrypt(InputStream in, byte[] key) throws Exception {
    DataInputStream d = new DataInputStream(in);
    byte[] h = new byte[20];
    d.readFully(h);
    if (h[0] != 'A' || h[1] != 'T' || h[2] != 'S' || h[3] != 'G') throw new java.io.IOException("bad header");
    byte[] iv = new byte[16];
    System.arraycopy(h, 4, iv, 0, 16);
    Cipher c = Cipher.getInstance("AES/CTR/NoPadding");
    c.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new IvParameterSpec(iv));
    return new CipherInputStream(d, c);
  }

  @Override
  public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
    String p = request.getUrl().getPath();
    if (p != null && p.startsWith("/models/") && p.endsWith(".glb") && !p.contains("..")) {
      try {
        Map<String, String> h = new HashMap<>();
        h.put("Access-Control-Allow-Origin", "*");
        h.put("Cache-Control", "no-store");
        return new WebResourceResponse("model/gltf-binary", null, 200, "OK", h, decrypt(assets.open("public" + p), key()));
      } catch (Exception e) {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
      }
    }
    return super.shouldInterceptRequest(view, request);
  }
}
`;
fs.writeFileSync(path.join(javaDir, 'ModelGuard.java'), java);
console.log('ModelGuard.java создан.');

// ---- подключение в MainActivity ----
const maPath = path.join(javaDir, 'MainActivity.java');
let ma = fs.readFileSync(maPath, 'utf8');
if (!/ModelGuard/.test(ma)) {
  const before = ma;
  ma = ma.replace(/super\.onCreate\(\s*(\w+)\s*\);/, (m) => m + ' getBridge().setWebViewClient(new ModelGuard(getBridge(), getAssets()));');
  if (ma === before) die('не найден super.onCreate(...) в MainActivity.java');
  fs.writeFileSync(maPath, ma);
  console.log('MainActivity.java: ModelGuard подключён.');
}
