const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const JS_DIR = path.join(__dirname, '..', 'www', 'js');

const OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.3,
  debugProtection: true,
  debugProtectionInterval: 2000,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  selfDefending: true,
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  stringArrayThreshold: 0.9,
  splitStrings: true,
  splitStringsChunkLength: 8,
  transformObjectKeys: true,
  numbersToExpressions: true,
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
