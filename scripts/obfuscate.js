const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const JS_DIR = path.join(__dirname, '..', 'www', 'js');

// Лёгкий профиль: тяжёлые трансформации (control-flow flattening, dead code, debugProtection,
// selfDefending, rc4, splitStrings) убивали FPS в игровом цикле — оставлены только дешёвые.
const OPTIONS = {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  selfDefending: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.7,
  stringArrayCallsTransform: false,
  splitStrings: false,
  transformObjectKeys: false,
  numbersToExpressions: false,
  simplify: true,
  unicodeEscapeSequence: false
};

const files = fs.readdirSync(JS_DIR).filter(f => f.endsWith('.js'));
console.log(`Обфускация ${files.length} файлов...`);

files.forEach(f => {
  const p = path.join(JS_DIR, f);
  const src = fs.readFileSync(p, 'utf8');
  const result = JavaScriptObfuscator.obfuscate(src, OPTIONS).getObfuscatedCode();
  fs.writeFileSync(p, result);
  console.log(`  обфусцирован: ${f}`);
});

// libs/three.min.js и GLTFLoader.js НЕ трогаем — это сторонние библиотеки,
// их обфускация ничего не даёт и может сломать сборку/производительность.
console.log('Готово.');
