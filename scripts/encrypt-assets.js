/**
 * Шифрует все .glb модели AES-256-GCM.
 * Ключ берётся из переменной окружения ASSET_KEY (64 hex-символа = 32 байта).
 * В CI он приходит из GitHub Secrets и никогда не попадает в репозиторий.
 *
 * Формат зашифрованного файла:  [12 байт IV][16 байт TAG][ciphertext]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC_DIR = path.join(__dirname, '..', 'www', 'models');
const KEY_HEX = process.env.ASSET_KEY;

if (!KEY_HEX || KEY_HEX.length !== 64) {
  console.error('ASSET_KEY не задан или имеет неверную длину (нужно 64 hex-символа / 32 байта).');
  console.error('Локально задайте, например: export ASSET_KEY=$(openssl rand -hex 32)');
  process.exit(1);
}

const key = Buffer.from(KEY_HEX, 'hex');

function encryptFile(filePath) {
  const plain = fs.readFileSync(filePath);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  const out = Buffer.concat([iv, tag, enc]);

  const encPath = filePath + '.enc';
  fs.writeFileSync(encPath, out);
  fs.unlinkSync(filePath); // исходный .glb не должен попасть в APK в открытом виде
  console.log(`  зашифровано: ${path.basename(filePath)} -> ${path.basename(encPath)}`);
}

if (!fs.existsSync(SRC_DIR)) {
  console.error('Папка models не найдена: ' + SRC_DIR);
  process.exit(1);
}

const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.glb'));
console.log(`Шифрование ${files.length} моделей (AES-256-GCM)...`);
files.forEach(f => encryptFile(path.join(SRC_DIR, f)));
console.log('Готово.');
