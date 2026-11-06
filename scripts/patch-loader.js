/**
 * 1. Копирует js/00-crypto.js (модуль расшифровки) в www/js/
 * 2. Добавляет на него <script> в index.html перед остальными игровыми скриптами
 * 3. Меняет getGlb() так, чтобы она тянула *.glb.enc и расшифровывала буфер
 */
const fs = require('fs');
const path = require('path');

const WWW = path.join(__dirname, '..', 'www');
const TPL = path.join(__dirname, 'templates', '00-crypto.js');

// 1. копируем helper
fs.copyFileSync(TPL, path.join(WWW, 'js', '00-crypto.js'));

// 2. index.html: подключаем helper первым из игровых скриптов
const idxPath = path.join(WWW, 'index.html');
let idx = fs.readFileSync(idxPath, 'utf8');
if (!idx.includes('00-crypto.js')) {
  idx = idx.replace(
    '<script src="js/01-core.js',
    '<script src="js/00-crypto.js"></script>\n<script src="js/01-core.js'
  );
  fs.writeFileSync(idxPath, idx);
  console.log('index.html пропатчен: добавлен js/00-crypto.js');
}

// 3. 04-tank.js: fetch .glb.enc + расшифровка
const tankPath = path.join(WWW, 'js', '04-tank.js');
let tank = fs.readFileSync(tankPath, 'utf8');

const OLD = `const getGlb=id=>fetch('models/'+id+'.glb').then(r=>{if(!r.ok)throw new Error('models/'+id+'.glb: '+r.status);return r.arrayBuffer()});`;
const NEW = `const getGlb=id=>fetch('models/'+id+'.glb.enc').then(r=>{if(!r.ok)throw new Error('models/'+id+'.glb.enc: '+r.status);return r.arrayBuffer()}).then(buf=>__decryptAsset(buf));`;

if (!tank.includes(OLD)) {
  console.error('Не найдена исходная функция getGlb — возможно, игра уже изменена. Патч пропущен, проверьте вручную.');
  process.exit(1);
}
tank = tank.replace(OLD, NEW);
fs.writeFileSync(tankPath, tank);
console.log('04-tank.js пропатчен: модели грузятся из .glb.enc и расшифровываются в рантайме.');
