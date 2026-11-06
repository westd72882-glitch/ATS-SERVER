/**
 * Полная сборка защищённого www/ из www-src/:
 *   1) копирование исходников игры в www/
 *   2) шифрование .glb моделей (AES-256-GCM)
 *   3) патч загрузчика моделей + index.html
 *   4) внедрение ключа расшифровки
 *   5) обфускация JS
 *
 * Результат (www/) далее используется Capacitor'ом для сборки APK.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'www-src');
const DST = path.join(ROOT, 'www');

function copyDir(src, dst) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(dst, { recursive: true });
  fs.cpSync(src, dst, { recursive: true });
}

console.log('1/5 копирование исходников...');
copyDir(SRC, DST);

const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const API = (process.env.API_URL || 'https://ats-server-foza.onrender.com').replace(/\/+$/, '');
fs.writeFileSync(path.join(DST, 'js', '00-config.js'),
  `window.APP_VERSION=${JSON.stringify(VERSION)};window.API_URL=${JSON.stringify(API)};`);
console.log('версия', VERSION, 'API', API || '(демо-режим)');

console.log('2/5 шифрование моделей...');
execSync('node scripts/encrypt-assets.js', { cwd: ROOT, stdio: 'inherit' });

console.log('3/5 патч загрузчика моделей...');
execSync('node scripts/patch-loader.js', { cwd: ROOT, stdio: 'inherit' });

console.log('4/4 обфускация JS...');
// Важно: ключ шифрования НЕ встраивается в www/js на этом этапе — он вообще не должен
// попадать в веб-бандл. Для Android-релиза ключ генерируется прямо в нативном коде
// скриптом scripts/configure-android.js (после `npx cap add android`), минуя JS.
// Если нужно локально протестировать игру в обычном браузере (без Android/Capacitor),
// запустите отдельно: `node scripts/inject-key.js` — он подставит тестовый ключ в www/js
// до обфускации (делать это нужно самостоятельно и НЕ для прод-сборки).
execSync('node scripts/obfuscate.js', { cwd: ROOT, stdio: 'inherit' });

console.log('\nСборка www/ готова к упаковке через Capacitor.');
