/* Минификация и переименование переменных в собранных JS (папка www/js). */
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const DIR = path.join(__dirname, '..', 'www', 'js');

(async () => {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.js'));
  for (const f of files) {
    const p = path.join(DIR, f);
    const src = fs.readFileSync(p, 'utf8');
    try {
      const out = await minify(src, {
        mangle: { toplevel: false, reserved: ['window', 'document'] },
        compress: { passes: 2, drop_console: false },
        format: { comments: false },
      });
      if (out.code) fs.writeFileSync(p, out.code);
      console.log('obf', f, src.length, '->', (out.code || src).length);
    } catch (e) {
      console.warn('skip (parse error)', f, e.message);
    }
  }
})();
