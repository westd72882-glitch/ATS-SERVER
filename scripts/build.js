/**
 * Сборка www/ для APK. В APK кладётся ТОЛЬКО загрузчик (scripts/loader) и картинки (www-src/img).
 * Код игры и 3D-модели в APK не попадают: код раздаёт сервер (server/game, подписанный манифест), модели — по токену.
 * ENV: API_URL — адрес сервера; SIGN_PUB — публичный ключ проверки подписи (base64 SPKI, его отдаёт сервер: GET /api/pubkey).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DST = path.join(ROOT, 'www');
const API = (process.env.API_URL || 'https://ats-server-foza.onrender.com').replace(/\/+$/, '');
const PUB = (process.env.SIGN_PUB || '').trim();
if (!PUB) { console.error('build: не задан SIGN_PUB (публичный ключ проверки подписи). Его отдаёт сервер: GET ' + API + '/api/pubkey'); process.exit(1); }

fs.rmSync(DST, { recursive: true, force: true });
fs.mkdirSync(DST, { recursive: true });
fs.cpSync(path.join(__dirname, 'loader'), DST, { recursive: true });
fs.cpSync(path.join(ROOT, 'www-src', 'img'), path.join(DST, 'img'), { recursive: true });
fs.writeFileSync(path.join(DST, 'config.js'), 'window.ATS_CFG=' + JSON.stringify({ api: API, pub: PUB }) + ';');
console.log('www/ готов: загрузчик + картинки; API', API);
