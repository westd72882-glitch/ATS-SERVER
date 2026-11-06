/**
 * Подставляет ASSET_KEY (hex, из env) как base64 в www/js/00-crypto.js
 * перед обфускацией. Сам hex-ключ нигде в репозитории не хранится —
 * он живёт только в GitHub Secrets и в памяти job'а во время сборки.
 */
const fs = require('fs');
const path = require('path');

const KEY_HEX = process.env.ASSET_KEY;
if (!KEY_HEX || KEY_HEX.length !== 64) {
  console.error('ASSET_KEY не задан или неверной длины.');
  process.exit(1);
}

const keyB64 = Buffer.from(KEY_HEX, 'hex').toString('base64');
const cryptoJsPath = path.join(__dirname, '..', 'www', 'js', '00-crypto.js');
let content = fs.readFileSync(cryptoJsPath, 'utf8');
content = content.replace('__ASSET_KEY_B64__', keyB64);
fs.writeFileSync(cryptoJsPath, content);
console.log('Ключ расшифровки внедрён в 00-crypto.js (далее будет обфусцирован).');
