/**
 * Пакует игровой клиент (www-src: html-разметка, JS, CSS, libs) в server/game/ — оттуда сервер раздаёт его подписанным
 * манифестом (/api/bundle + /api/game/<файл>). В APK остаётся только маленький загрузчик (scripts/loader) и картинки.
 * Запускайте после ЛЮБОГО изменения в www-src/js, www-src/css, www-src/libs, www-src/index.html:  node scripts/pack-game.js
 * и коммитьте server/game/.
 */
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'www-src');
const OUT = path.join(ROOT, 'server', 'game');

const clean = p => p.split('?')[0].replace(/^\.?\//, '');
const put = (rel, data) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };

async function min(src, name) {
  try {
    const o = await minify(src, { mangle: { toplevel: false, reserved: ['window', 'document'] }, compress: { passes: 2, drop_console: false }, format: { comments: false } });
    return o.code || src;
  } catch (e) { console.warn('skip minify (parse error)', name, e.message); return src; }
}

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'));
  const bm = html.match(/<body([^>]*)>/);
  const body = html.slice(html.indexOf(bm[0]) + bm[0].length, html.lastIndexOf('</body>'));
  const bodyClass = (bm[1].match(/class="([^"]*)"/) || [])[1] || '';
  const lang = (html.match(/<html[^>]*lang="([^"]*)"/) || [])[1] || 'ru';

  const parts = []; let inl = 0, hn = 0;
  const addScript = async (attrs, text) => {
    const src = (attrs.match(/src="([^"]+)"/) || [])[1];
    if (src) {
      const rel = clean(src);
      if (rel === 'js/00-config.js') return;                 // конфиг (версия, адрес сервера) задаёт загрузчик
      let code = fs.readFileSync(path.join(SRC, rel), 'utf8');
      if (rel.startsWith('js/')) code = await min(code, rel);
      put(rel, code); parts.push({ s: rel });
    } else {
      const rel = 'js/_inline' + (inl++) + '.js';
      put(rel, await min(text, rel)); parts.push({ s: rel });
    }
  };
  // head: скрипты и таблица стилей по порядку (meta/title/иконки есть в загрузчике)
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>|<link\b[^>]*rel="stylesheet"[^>]*>/g;
  let m;
  while ((m = re.exec(head))) {
    if (m[0].startsWith('<link')) { const rel = clean(m[0].match(/href="([^"]+)"/)[1]); put(rel, fs.readFileSync(path.join(SRC, rel))); parts.push({ c: rel }); }
    else await addScript(m[1], m[2]);
  }
  // body: куски разметки и скрипты по порядку
  const sre = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
  let last = 0;
  const chunk = s => { if (s.trim()) { const rel = 'html/p' + (hn++) + '.html'; put(rel, s); parts.push({ h: rel }); } };
  while ((m = sre.exec(body))) { chunk(body.slice(last, m.index)); await addScript(m[1], m[2]); last = m.index + m[0].length; }
  chunk(body.slice(last));

  put('boot.json', JSON.stringify({ htmlLang: lang, bodyClass, parts }));
  const n = parts.length;
  console.log('server/game готов: частей', n, '(скриптов', parts.filter(p => p.s).length + ', разметки', hn + ')');
})();
