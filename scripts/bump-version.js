// node scripts/bump-version.js 1.1.0 — меняет версию сразу для сервера и APK
const fs=require('fs'),p=require('path'),v=process.argv[2];
if(!/^\d+\.\d+\.\d+$/.test(v||'')){console.error('Формат: 1.2.3');process.exit(1)}
for(const f of['VERSION','server/VERSION'])fs.writeFileSync(p.join(__dirname,'..',f),v+'\n');
console.log('Версия',v,'— закоммить и запушь: сервер и APK соберутся с ней');
