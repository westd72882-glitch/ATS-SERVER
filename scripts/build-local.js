/**
 * ЛОКАЛЬНАЯ сборка www/ для APK: вся игра (код, стили, библиотеки, картинки и 3D-модели) вшита в APK,
 * сервер не нужен — игра идёт на устройстве (аккаунт, ангар и экономика хранятся в памяти телефона, бои с ботами).
 * Глобальная сборка (scripts/build.js) кладёт в APK только загрузчик и тянет всё с сервера.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'www-src');
const MODELS = path.join(ROOT, 'server', 'models');
const DST = path.join(ROOT, 'www');

fs.rmSync(DST, { recursive: true, force: true });
fs.mkdirSync(DST, { recursive: true });
for (const d of ['css', 'js', 'libs', 'img']) fs.cpSync(path.join(SRC, d), path.join(DST, d), { recursive: true });
fs.cpSync(path.join(SRC, 'index.html'), path.join(DST, 'index.html'));
fs.cpSync(MODELS, path.join(DST, 'models'), { recursive: true });

// Конфиг: пустой API_URL = игра без сервера; ATS_LOCAL включает загрузку моделей из APK
const ver = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
fs.writeFileSync(path.join(DST, 'js', '00-config.js'),
  "window.ATS_LOCAL=true;window.APP_VERSION='" + ver + "';window.API_URL='';\n");

const glb = fs.readdirSync(path.join(DST, 'models')).filter(f => f.endsWith('.glb'));
if (!glb.length) { console.error('build-local: в server/models нет .glb'); process.exit(1); }
const mb = glb.reduce((a, f) => a + fs.statSync(path.join(DST, 'models', f)).size, 0) / 1048576;
console.log('www/ готов (ЛОКАЛЬНАЯ сборка): игра + ' + glb.length + ' моделей, ' + mb.toFixed(0) + ' МБ, версия ' + ver);
