/**
 * Сборка www/ из www-src/ (простое копирование + 00-config.js).
 * Шифрования моделей и обфускации JS больше нет.
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

console.log('1/1 копирование исходников...');
copyDir(SRC, DST);
// в APK не должно попадать ничего лишнего (dev-сервер, заметки)
for (const f of ['serve.py', 'start.bat', 'start.sh', 'README.txt']) fs.rmSync(path.join(DST, f), { force: true });

const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const API = (process.env.API_URL || 'https://ats-server-foza.onrender.com').replace(/\/+$/, '');
fs.writeFileSync(path.join(DST, 'js', '00-config.js'),
  `window.APP_VERSION=${JSON.stringify(VERSION)};window.API_URL=${JSON.stringify(API)};`);
console.log('версия', VERSION, 'API', API || '(демо-режим)');

console.log('\nСборка www/ готова к упаковке через Capacitor.');
