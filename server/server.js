// ATS server: аккаунты, версия, облачное сохранение (танки/серебро/золото/настройки), бои, рейтинг.
// ENV: PORT, DATA_DIR (на Render — путь к Disk, напр. /data), APP_VERSION
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const VERSION=process.env.APP_VERSION||(()=>{try{return (fs.existsSync(path.join(__dirname,'VERSION'))?fs.readFileSync(path.join(__dirname,'VERSION'),'utf8'):fs.readFileSync(path.join(__dirname,'..','VERSION'),'utf8')).trim()}catch(_){return require('./package.json').version}})();
const db={users:{},sessions:{},saves:{},eco:{},promos:{},battles:{},tickets:{}};
const store=require('./store')(db),mark=store.mark,flush=store.flush;
setInterval(flush,2000);for(const s of['SIGTERM','SIGINT'])process.on(s,async()=>{await flush();process.exit(0)});
const tries={};
// Промокоды берутся ТОЛЬКО из переменной окружения PROMOS_JSON (Render → Environment), в публичный репозиторий их класть нельзя.
// Формат: {"mycode":{"gold":1000,"silver":50000,"msg":"Текст"},"tankcode":{"tank":"govnotank","msg":"..."}}
const PROMOS=(()=>{try{const o=JSON.parse(process.env.PROMOS_JSON||'{}'),r={};for(const k of Object.keys(o))if(o[k]&&typeof o[k]=='object')r[String(k).trim().toLowerCase()]=o[k];return r}catch(e){console.error('PROMOS_JSON некорректен:',e.message);return{}}})();
const hash=(p,s)=>crypto.scryptSync(p,s,32).toString('hex');
const H={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization,X-App-Version','Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS'};
const send=(res,c,o)=>{res.writeHead(c,H);res.end(JSON.stringify(o))};
const fail=(res,m,c=400,x={})=>send(res,c,Object.assign({error:m},x));
const session=u=>{const t=crypto.randomBytes(24).toString('hex');db.sessions[t]=u.nick;mark('sessions',t);return{nick:u.nick,token:t,version:VERSION}};
const limit=(k,max)=>{const n=(tries[k]=(tries[k]||0)+1);setTimeout(()=>{if(tries[k]>0)tries[k]--},6e5);return n>max};
const KEYOK=k=>/^maus_[a-z0-9_]+$/i.test(k)&&!/^maus_(session|users|pend_)/.test(k);
// ===== серверная экономика: танки, покупки, продажа, промокоды, награды, задания, почта =====
const TK={maus:[10,'Германия'],amx40:[6,'Франция'],amx50b:[10,'Франция'],type4:[10,'Япония'],oho:[7,'Япония'],oi:[5,'Япония'],e100:[10,'Германия'],e100h:[10,'Германия'],fv4005:[10,'Великобритания'],ms1:[1,'СССР'],bt5:[2,'СССР'],bt7:[3,'СССР'],kv1:[5,'СССР'],kv2:[6,'СССР'],is6:[8,'СССР'],govnotank:[8,'Европа',1000]};
const CHAIN=['ms1','bt5','bt7','kv1','kv2','is6'],RCOST={1:400,2:1200,3:4500,4:9500,5:25000,6:70000,7:200000,8:800000,9:2500000,10:8000000},GPRICE={5:1500,6:2000,7:2800,8:4500,9:6500,10:9000};
const AVR={a0:'c',a1:'c',r1:'r',r2:'r',r3:'r',e1:'e',e2:'e',e3:'e',l1:'l',l2:'l',l3:'l'},AVP={c:0,r:400,e:1200,l:3500};
const QDEF=[['k5','k',5,5000],['k25','k',25,20000],['b3','b',3,4000],['w1','w',1,8000],['d5k','d',5000,6000],['d30k','d',30000,25000]];
const prem=id=>TK[id][1]!='СССР',gprice=id=>TK[id][2]||GPRICE[TK[id][0]]||9000,fmt=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const newEco=()=>({cr:500,au:0,xp:0,own:['ms1'],res:['ms1'],av:['a0','a1'],promos:[],q:{k:0,b:0,w:0,d:0,c:[]},mail:[{id:1,t:'Добро пожаловать, танкист!',b:'Командование выделило стартовый подарок. Заберите награду и выполняйте задания во вкладке «Задачи».',r:3000,rd:0,c:0}]});
const num=(v,d)=>Number.isFinite(+v)&&+v>=0?Math.floor(+v):d;
function ecoGet(key){let e=db.eco[key];if(e)return e;e=newEco();const sv=db.saves[key]&&db.saves[key].data;
 if(sv){try{const o=JSON.parse(sv.maus_eco2||'null');if(o){e.cr=num(o.cr,e.cr);e.au=num(o.au,e.au);e.xp=num(o.xp,0);e.own=[...new Set(['ms1',...(o.own||[]).filter(i=>TK[i])])];e.res=[...new Set(['ms1',...(o.res||[]).filter(i=>CHAIN.includes(i))])];
   if(o.q&&typeof o.q=='object'){e.q={k:num(o.q.k,0),b:num(o.q.b,0),w:num(o.q.w,0),d:num(o.q.d,0),c:(o.q.c||[]).filter(i=>QDEF.some(d=>d[0]==i))}}if(Array.isArray(o.mail))e.mail=o.mail.slice(0,30).map(m=>({id:num(m.id,0),t:String(m.t||'').slice(0,80),b:String(m.b||'').slice(0,400),r:num(m.r,0),rd:m.rd?1:0,c:m.c?1:0}))}}catch(_){}
  try{const a=JSON.parse(sv.maus_avown||'null');if(Array.isArray(a))e.av=[...new Set([...e.av,...a.filter(i=>AVR[i])])]}catch(_){}
  try{const p=JSON.parse(sv.maus_promo||'null');if(Array.isArray(p))e.promos=p.filter(c=>PROMOS[c])}catch(_){}}
 const up=db.promos[key];if(Array.isArray(up))e.promos=[...new Set([...e.promos,...up.filter(c=>PROMOS[c])])];
 db.eco[key]=e;mark('eco',key);return e}
const mailPush=(e,t,b,r)=>{e.mail.unshift({id:Date.now(),t,b,r:r||0,rd:0,c:0});e.mail.length=Math.min(e.mail.length,30)};
function ecoOp(key,j){const e=ecoGet(key),id=String(j.id||''),op=j.op;let msg='';
 if(op=='research'){if(!TK[id]||!CHAIN.includes(id)||e.own.includes(id))throw'Недоступно';const i=CHAIN.indexOf(id);if(i>0&&!e.own.includes(CHAIN[i-1]))throw'Сначала получите предыдущий танк';const c=RCOST[TK[id][0]];if(e.cr<c)throw'Не хватает серебра';e.cr-=c;e.own.push(id);if(!e.res.includes(id))e.res.push(id);msg='Получен: '+id}
 else if(op=='buy'){if(!TK[id]||!prem(id)||e.own.includes(id))throw'Недоступно';const g=gprice(id);if(e.au<g)throw'Не хватает золота';e.au-=g;e.own.push(id);msg='Танк куплен'}
 else if(op=='sell'){if(!TK[id]||id=='ms1'||!e.own.includes(id))throw'Этот танк нельзя продать';const p=prem(id),back=Math.floor((p?gprice(id):RCOST[TK[id][0]])*.5);if(p)e.au+=back;else e.cr+=back;e.own=e.own.filter(x=>x!=id);mark('eco',key);return{msg:'sold',back,cur:p?'au':'cr'}}
 else if(op=='avatar'){const r=AVR[id];if(!r||e.av.includes(id))throw'Недоступно';const p=AVP[r];if(e.au<p)throw'Не хватает золота';e.au-=p;e.av.push(id);msg='Куплена аватарка'}
 else if(op=='claimMail'){const x=e.mail.find(m=>m.id==+j.id);if(!x||x.c||!x.r)throw'Нечего забирать';x.c=1;e.cr+=x.r;msg='+'+fmt(x.r)+' кр.'}
 else if(op=='claimQuest'){const d=QDEF.find(d=>d[0]==id);if(!d||e.q.c.includes(id)||e.q[d[1]]<d[2])throw'Задание не выполнено';e.q.c.push(id);e.cr+=d[3];msg='Награда: +'+fmt(d[3])+' кр.'}

 else if(op=='promo'){const c=String(j.code||'').trim().toLowerCase(),r=PROMOS[c];if(!r)throw'Промокод не найден';if(e.promos.includes(c))throw'Промокод уже активирован';e.promos.push(c);db.promos[key]=e.promos.slice();mark('promos',key);
  if(r.tank){if(e.own.includes(r.tank))e.au+=1000;else e.own.push(r.tank)}if(r.gold)e.au+=r.gold;if(r.silver)e.cr+=r.silver;msg=r.msg}
 else throw'Неизвестная операция';
 mark('eco',key);return{msg}}
const TANKS=require('./tanks.json');
const MODELS=path.join(__dirname,'models');
// Ключ моделей: ASSET_KEY (Render → Environment). Запасной вариант — производная от DATABASE_URL (стабильна между перезапусками). Без обоих выдача моделей отключена.
const AK=process.env.ASSET_KEY||(process.env.DATABASE_URL?crypto.createHash('sha256').update('ats-assets:'+process.env.DATABASE_URL).digest('hex'):'');
if(!AK)console.warn('ASSET_KEY не задан и нет DATABASE_URL: модели выдаваться НЕ будут');
const mkey=id=>crypto.createHmac('sha256',AK).update('key:'+id).digest();
const miv=id=>{const v=crypto.createHmac('sha256',AK).update('iv:'+id).digest().subarray(0,16);v.fill(0,8);return Buffer.from(v)}; // младшие 8 байт = 0: счётчик не переполнится (совместимо с WebCrypto length:64)
// ===== игровой клиент (server/game) раздаётся ПОДПИСАННЫМ манифестом; клиент в APK проверяет подпись и хэши файлов =====
// Ключ подписи (ECDSA P-256) выводится из ASSET_KEY — стабилен между перезапусками; публичная часть: GET /api/pubkey (её вшивает сборка APK).
const GAME=path.join(__dirname,'game'),LOADER_MIN=1,GF={};
const b64u=b=>Buffer.from(b).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const SIGNK=(()=>{if(!AK)return null;const N=0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;
 const d=BigInt('0x'+crypto.createHmac('sha256',AK).update('sign-key').digest('hex'))%(N-1n)+1n,db=Buffer.from(d.toString(16).padStart(64,'0'),'hex');
 const e=crypto.createECDH('prime256v1');e.setPrivateKey(db);const pu=e.getPublicKey();
 const priv=crypto.createPrivateKey({key:{kty:'EC',crv:'P-256',d:b64u(db),x:b64u(pu.subarray(1,33)),y:b64u(pu.subarray(33,65))},format:'jwk'});
 return{priv,pub:crypto.createPublicKey(priv).export({type:'spki',format:'der'}).toString('base64')}})();
const BUNDLE=(()=>{try{if(!SIGNK)return null;const boot=JSON.parse(fs.readFileSync(path.join(GAME,'boot.json'),'utf8')),files={};
 const walk=(dir,rel)=>{for(const f of fs.readdirSync(dir,{withFileTypes:true})){const r=rel?rel+'/'+f.name:f.name;if(f.isDirectory())walk(path.join(dir,f.name),r);else if(r!='boot.json'){const buf=fs.readFileSync(path.join(dir,f.name));GF[r]=buf;files[r]={h:crypto.createHash('sha256').update(buf).digest('hex'),s:buf.length}}}};walk(GAME,'');
 for(const p of boot.parts){const f=p.s||p.c||p.h;if(!files[f])throw new Error('нет файла '+f)}
 const body=JSON.stringify({v:VERSION,minLoader:LOADER_MIN,boot,files}),sig=crypto.sign('sha256',Buffer.from(body),{key:SIGNK.priv,dsaEncoding:'ieee-p1363'}).toString('base64');
 console.log('Игровой клиент: файлов',Object.keys(files).length,'| публичный ключ',SIGNK.pub.slice(-12));return{body,sig}}catch(e){console.error('Игровой клиент (server/game) не готов — запустите node scripts/pack-game.js:',e.message);return null}})();
const META=(async()=>{const o={};if(!AK)return o;for(const f of fs.existsSync(MODELS)?fs.readdirSync(MODELS):[]){if(!/\.glb$/i.test(f))continue;const id=f.slice(0,-4);
 const h=await new Promise((ok,bad)=>{const x=crypto.createHash('sha256');fs.createReadStream(path.join(MODELS,f)).on('data',d=>x.update(d)).on('end',()=>ok(x.digest('hex'))).on('error',bad)});
 o[id]={h:crypto.createHmac('sha256',AK).update('h:'+h).digest('hex').slice(0,16),s:fs.statSync(path.join(MODELS,f)).size}}console.log('Моделей в манифесте:',Object.keys(o).length);return o})().catch(e=>{console.error('manifest',e);return{}});
async function applyBattle(key,r){const e=ecoGet(key),dmg=Math.max(0,Math.min(60000,Math.round(r.dmg||0))),kills=Math.max(0,Math.min(30,r.kills|0)),win=!!r.win;
 const cr=Math.round(dmg*1.2+kills*1000+(win?6000:1500)),xp=Math.round(cr/2);e.cr+=cr;e.xp+=xp;e.q.k+=kills;e.q.b++;e.q.d+=dmg;if(win)e.q.w++;
 mailPush(e,(win?'Победа':'Поражение')+': отчёт о бое','Урон: '+fmt(dmg)+'\nУничтожено: '+kills+'\nНаграда: '+fmt(cr)+' кр.',0);
 const s=db.battles[key]=db.battles[key]||{b:0,w:0,dmg:0,kills:0,xp:0,mk:0,hist:[]};s.hist=s.hist||[];
 s.b++;if(win)s.w++;s.dmg+=dmg;s.kills+=kills;s.xp=(s.xp||0)+xp;s.mk=Math.max(s.mk||0,kills);
 s.hist.unshift({t:Date.now(),win,dmg,kills,tank:String(r.tank||'').slice(0,32),map:String(r.map||'').slice(0,32),mode:r.mode||0});s.hist.length=Math.min(s.hist.length,50);
 mark('battles',key);mark('eco',key);return{reward:{cr,xp},eco:e,stats:{b:s.b,w:s.w,dmg:s.dmg,kills:s.kills,xp:s.xp,mk:s.mk}}}
const server=http.createServer((req,res)=>{
 if(req.method=='OPTIONS')return send(res,204,{});
 const url=req.url.split('?')[0];
 if(url=='/'||url=='/health'||url=='/api/version')return send(res,200,{ok:true,version:VERSION});
 // публичные: ключ проверки подписи, манифест и файлы игры (код не секрет; модели и ключи к ним — только по токену)
 if(url=='/api/pubkey'||url=='/api/bundle'||url.startsWith('/api/game/')){const ip0=String(req.headers['x-forwarded-for']||req.socket.remoteAddress);if(limit('g'+ip0,900))return fail(res,'Слишком часто',429);
  if(url=='/api/pubkey'){if(!SIGNK)return fail(res,'Ключ не настроен (задайте ASSET_KEY)',503);res.writeHead(200,{'Content-Type':'text/plain','Access-Control-Allow-Origin':'*','Cache-Control':'no-cache'});return res.end(SIGNK.pub)}
  if(!BUNDLE)return fail(res,'Игровые файлы не готовы на сервере',503);
  if(url=='/api/bundle'){res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'no-cache'});return res.end(JSON.stringify(BUNDLE))}
  let rel='';try{rel=decodeURIComponent(url.slice(10))}catch(_){}const f=Object.prototype.hasOwnProperty.call(GF,rel)?GF[rel]:null;if(!f)return fail(res,'Не найдено',404);
  res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Length':f.length,'Access-Control-Allow-Origin':'*','Cache-Control':'no-cache'});return res.end(f)}
 let b='';req.on('data',d=>{b+=d;if(b.length>3e5)req.destroy()});req.on('end',async()=>{try{
  // ЖЁСТКАЯ проверка версии для всех остальных запросов
  const cv=String(req.headers['x-app-version']||'');
  if(cv!==VERSION)return fail(res,'Версия игры устарела. Требуется '+VERSION+', у вас '+(cv||'?')+'. Обновите приложение.',426,{version:VERSION,upgrade:true});
  const j=b?JSON.parse(b):{},ip=req.headers['x-forwarded-for']||req.socket.remoteAddress;
  const auth=()=>{const t=String(req.headers.authorization||'').replace('Bearer ','');const n=db.sessions[t];return n&&db.users[n.toLowerCase()]?db.users[n.toLowerCase()]:null};
  if(url=='/api/register'||url=='/api/login'){if(limit('a'+ip,20))return fail(res,'Слишком много попыток, подождите',429)}
  if(url=='/api/register'){const nick=String(j.nick||'').trim(),pw=String(j.password||'');
   if(!/^[\p{L}\p{N}_\-]{3,16}$/u.test(nick)||pw.length<6||pw.length>128)return fail(res,'Неверные данные');
   if(db.users[nick.toLowerCase()])return fail(res,'Ник занят');
   const salt=crypto.randomBytes(8).toString('hex');
   db.users[nick.toLowerCase()]={nick,salt,h:hash(pw,salt),created:Date.now()};mark('users',nick.toLowerCase());
   return send(res,200,session(db.users[nick.toLowerCase()]))}
  if(url=='/api/login'){const k=String(j.login||'').trim().toLowerCase(),u=db.users[k];
   if((tries['f'+k]||0)>=8)return fail(res,'Слишком много неудачных попыток входа, подождите 10 минут',429);
   if(!u||hash(String(j.password||'').slice(0,128),u.salt)!==u.h){limit('f'+k,1e9);return fail(res,'Неверный ник или пароль',401)}return send(res,200,session(u))}
  if(url=='/api/promo/check'){if(limit('p'+ip,40))return fail(res,'Слишком часто',429);const c=String(j.code||'').trim().toLowerCase(),r=PROMOS[c];if(!r)return fail(res,'Промокод не найден');return send(res,200,{ok:true,code:c,reward:r})}
  const u=auth();if(!u)return fail(res,'Сессия недействительна, войдите заново',401,{relogin:true});
  const key=u.nick.toLowerCase();
  if(url=='/api/nick'){if(limit('n'+key,10))return fail(res,'Слишком часто',429);const nn=String(j.nick||'').trim(),nk=nn.toLowerCase();
   if(!/^[\p{L}\p{N}_\-]{3,16}$/u.test(nn))return fail(res,'Ник: 3–16 символов, буквы, цифры, _ и -');
   if(nk==key&&nn==u.nick)return fail(res,'Это ваш текущий ник');if(nk!=key&&db.users[nk])return fail(res,'Ник занят');
   const e=ecoGet(key);if(e.au<750)return fail(res,'Не хватает золота (нужно 750)');e.au-=750;u.nick=nn;
   if(nk!=key){for(const c of['users','saves','eco','promos','battles']){if(db[c][key]!==undefined){db[c][nk]=db[c][key];db[c][key]=undefined;mark(c,nk);mark(c,key)}}
    for(const t in db.sessions)if(String(db.sessions[t]).toLowerCase()==key){db.sessions[t]=nn;mark('sessions',t)}
    for(const t in db.tickets)if(db.tickets[t].nick==key)db.tickets[t].nick=nk}
   else{mark('users',key)}
   mark('eco',nk);await flush();return send(res,200,{ok:true,nick:nn,eco:db.eco[nk]})}
  if(url=='/api/me')return send(res,200,{nick:u.nick,version:VERSION});
  // 3D-модели лежат на сервере в открытом виде, клиенту уходят ЗАШИФРОВАННЫМИ (AES-256-CTR); ключи выдаются только по токену сессии
  if(url=='/api/assets'){if(limit('s'+key,60))return fail(res,'Слишком часто',429);if(!AK)return fail(res,'Ключ моделей не настроен на сервере (задайте ASSET_KEY)',503);
   const meta=await META;const m={},k={};for(const id in meta){m[id]={h:meta[id].h,s:meta[id].s};k[id]=mkey(id).toString('hex')}return send(res,200,{m,k})}
  if(url.startsWith('/api/model/')){if(limit('m'+key,300))return fail(res,'Слишком часто',429);if(!AK)return fail(res,'Ключ моделей не настроен на сервере',503);const id=url.slice(11);
   if(!/^[a-z0-9_]+$/i.test(id)||!TK[id])return fail(res,'Не найдено',404);const f=path.join(MODELS,id+'.glb');
   let st;try{st=fs.statSync(f)}catch(_){return fail(res,'Нет модели',404)}
   const iv=miv(id),c=crypto.createCipheriv('aes-256-ctr',mkey(id),iv);
   res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Length':st.size+16,'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.write(iv);
   return fs.createReadStream(f).on('error',()=>res.destroy()).pipe(c).pipe(res)}
  if(url=='/api/save/get'){const sv=db.saves[key],e=ecoGet(key);if(!sv)return send(res,200,{save:null});const d=Object.assign({},sv.data,{maus_eco2:JSON.stringify(e)});return send(res,200,{save:{data:d,ts:sv.ts}})}
  if(url=='/api/save/put'){const d=j.data;if(!d||typeof d!='object')return fail(res,'Нет данных');
   ecoGet(key);const out={};let n=0;for(const k of Object.keys(d)){if(!KEYOK(k)||typeof d[k]!='string'||d[k].length>5e4||++n>60)continue;if(k=='maus_eco2'||k=='maus_stats'||k=='maus_promo'||k=='maus_avown')continue;out[k]=d[k]}
   db.saves[key]={data:out,ts:Date.now()};mark('saves',key);await flush();return send(res,200,{ok:true,ts:db.saves[key].ts})}
  if(url=='/api/eco/get'){return send(res,200,{eco:ecoGet(key)})}
  if(url=='/api/eco/op'){if(limit('e'+key,400))return fail(res,'Слишком часто',429);try{const r=ecoOp(key,j);await flush();return send(res,200,Object.assign({ok:true,eco:ecoGet(key)},r))}catch(x){if(typeof x=='string')return fail(res,x);throw x}}
  if(url=='/api/promo'){try{const r=ecoOp(key,{op:'promo',code:j.code});await flush();return send(res,200,{ok:true,msg:r.msg,eco:ecoGet(key)})}catch(x){if(typeof x=='string')return fail(res,x);throw x}}
  if(url=='/api/stats'){const s=db.battles[key]||{b:0,w:0,dmg:0,kills:0,xp:0,mk:0};return send(res,200,{stats:{b:s.b,w:s.w,dmg:s.dmg,kills:s.kills,xp:s.xp||0,mk:s.mk||0}})}
  if(url=='/api/battle/start'){if(limit('b'+key,60))return fail(res,'Слишком часто',429);const tk=String(j.tank||''),e=ecoGet(key),mode=[1,5,10].includes(+j.mode)?+j.mode:1;
   if(!TANKS[tk]||!e.own.includes(tk))return fail(res,'Танк недоступен');const id=crypto.randomBytes(12).toString('hex');
   for(const k in db.tickets)if(Date.now()-db.tickets[k].t0>36e5||db.tickets[k].nick==key)delete db.tickets[k];
   db.tickets[id]={nick:key,tank:tk,mode,t0:Date.now()};return send(res,200,{ticket:id})}
  if(url=='/api/battle/end'){const t=db.tickets[String(j.ticket||'')];if(!t||t.nick!=key)return fail(res,'Бой не найден или уже засчитан');delete db.tickets[j.ticket];
   const st=TANKS[t.tank],sec=(Date.now()-t.t0)/1000;if(sec<20)return fail(res,'Бой слишком короткий');
   // бой с ботами идёт на клиенте — награду ограничиваем физикой боя: урон/киллы не больше, чем успеет нанести танк за время боя
   const shots=Math.floor(sec/(st.rel*.8))+1,kills=Math.min(+j.kills>0?Math.floor(+j.kills):0,t.mode,shots),dmg=Math.min(+j.dmg>0?Math.floor(+j.dmg):0,shots*st.dmg*1.2,t.mode*2400);
   const out=await applyBattle(key,{win:!!j.win&&sec>=40,dmg,kills,tank:t.tank,mode:t.mode,map:String(j.map||'').slice(0,16)});await flush();return send(res,200,Object.assign({ok:true},out))}
  if(url=='/api/top'){const top=Object.entries(db.battles).map(([k,s])=>({nick:(db.users[k]||{}).nick||k,b:s.b,w:s.w,dmg:s.dmg})).sort((a,c)=>c.dmg-a.dmg).slice(0,20);return send(res,200,{top})}
  fail(res,'Не найдено',404)}catch(e){console.error(e);fail(res,'Ошибка запроса')}})});
// ===== мультиплеер: серверный бой (combat.js) =====
require('./combat')(server,{VERSION,authToken:t=>{const n=db.sessions[t],u=n&&db.users[n.toLowerCase()];return u?u.nick:null},
 ownedTank:(nick,id)=>ecoGet(nick.toLowerCase()).own.includes(id),
 onEnd:async(nick,r)=>{const out=await applyBattle(nick.toLowerCase(),r);await flush();return out}});
store.load().then(()=>server.listen(process.env.PORT||3000,()=>console.log('ATS server up, version',VERSION))).catch(e=>{console.error('Не удалось подключиться к БД',e);process.exit(1)});
