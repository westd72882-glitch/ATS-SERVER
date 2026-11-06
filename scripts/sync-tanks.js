// node scripts/sync-tanks.js — переносит характеристики танков из клиента в server/tanks.json (единый источник правды для серверного боя)
const fs=require('fs'),p=require('path');
const src=fs.readFileSync(p.join(__dirname,'../www-src/js/04-tank.js'),'utf8');
const a=src.indexOf('CATALOG=[')+8,b=src.indexOf('];',a)+1;
const cat=new Function('return '+src.slice(a,b))();
const out={};for(const c of cat)out[c.id]={kmh:c.kmh,tier:c.tier,len:c.len,hp:c.hp,dmg:c.dmg,pen:c.pen,rel:c.rel,cls:c.cls,arm:c.arm,clip:c.clip||null,
 vel:{'ТТ':850,'СТ':950,'ЛТ':1050,'ПТ':1150}[c.cls]||900};
fs.writeFileSync(p.join(__dirname,'../server/tanks.json'),JSON.stringify(out));
console.log('tanks.json:',Object.keys(out).length,'танков');
