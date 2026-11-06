/* Расшифровка ассетов AES-256-GCM.
   Приоритет источника ключа:
     1) нативный Capacitor-плагин AssetKey (ключ вообще не лежит в JS-бандле на Android)
     2) __ASSET_KEY_B64__ — встроенный fallback, нужен ТОЛЬКО для теста в обычном браузере
        (npx cap serve / открыть www вручную), на реальной Android-сборке не используется.
   Ключ, полученный из плагина, держится в памяти ровно на время расшифровки текущей модели
   и не кэшируется в долгоживущей переменной. */
const __ASSET_KEY_B64__PLACEHOLDER = "__ASSET_KEY_B64__";
let __nativeKeyPromise = null;

function __getKeyBytes() {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AssetKey) {
    if (!__nativeKeyPromise) {
      __nativeKeyPromise = window.Capacitor.Plugins.AssetKey.getKey().then(r => {
        const hex = r.key;
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        return bytes;
      });
    }
    return __nativeKeyPromise;
  }
  return Promise.resolve(Uint8Array.from(atob(__ASSET_KEY_B64__PLACEHOLDER), c => c.charCodeAt(0)));
}

async function __decryptAsset(buf) {
  const bytes = new Uint8Array(buf);
  const iv = bytes.slice(0, 12);
  const tag = bytes.slice(12, 28);
  const data = bytes.slice(28);
  const ctWithTag = new Uint8Array(data.length + tag.length);
  ctWithTag.set(data, 0);
  ctWithTag.set(tag, data.length);

  const rawKey = await __getKeyBytes();
  const cryptoKey = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ctWithTag);
  return plain;
}
