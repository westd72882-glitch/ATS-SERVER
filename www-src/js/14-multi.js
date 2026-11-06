/* Панель выбора боя: мультиплеер (онлайн-очередь 1x1/5x5/10x10) или бой с ботами; заглушки GAGROS / AERO */
(function(){
const API=window.API_URL||'',VER=window.APP_VERSION||'0',$=id=>document.getElementById(id);
const RM=['','I','II','III','IV','V','VI','VII','VIII','IX','X'];
const NET=window.NET={on:false,began:false,abs:'A',me:'',roster:[],px:{},ws:null,q:{},online:0,inQ:0};
const tok=()=>{try{return JSON.parse(localStorage.getItem('maus_session')).token}catch(_){return''}};
/* --- стиль --- */
const st=document.createElement('style');st.textContent=`
#bp{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:#000a;font-family:system-ui;color:#fff}#bp.on{display:flex}
#bp .bx{width:min(92vw,78vh*1.5);max-height:92vh;overflow:auto;background:#12181ff7;border:1px solid #fff3;border-radius:.8vh;padding:2.4vh 3vh}
#bp h2{margin:0 0 1.6vh;font-size:3.2vh;display:flex;justify-content:space-between;align-items:center}#bp h2 b{cursor:pointer;font-size:3.6vh;padding:0 1vh}
#bp .row{display:flex;gap:1vh;margin-bottom:1.4vh}#bp .row button{flex:1;padding:1.5vh 1vh;border:1px solid #fff3;border-radius:.6vh;background:#1c252e;color:#fff;font:700 2.4vh system-ui}
#bp .row button.sel{border-color:#e8892a;color:#ffb27a;background:#2a2118}#bp small{display:block;font-size:1.7vh;font-weight:500;opacity:.65}
#bp .inf{font-size:2vh;line-height:1.5;margin:1vh 0;opacity:.95;min-height:9vh}#bp .inf b{color:#ffb27a}
#bp .go{width:100%;padding:2vh;border:0;border-radius:.6vh;background:linear-gradient(#f2704a,#d9482a);color:#fff;font:800 3.2vh system-ui}#bp .go.c{background:#3a4652}
#bp .lb{font-size:1.8vh;opacity:.7;margin:.4vh 0 .8vh}`;document.head.appendChild(st);
const bp=document.createElement('div');bp.id='bp';bp.innerHTML=`<div class="bx"><h2><span>Выбор боя</span><b id="bpx">×</b></h2>
<div class="row" id="bpt"><button data-k="mp" class="sel">Мультиплеер</button><button data-k="bot">С ботами</button></div>
<div class="lb">Режим</div><div class="row" id="bpm"><button data-n="1" class="sel">1 на 1</button><button data-n="5">5 на 5</button><button data-n="10">10 на 10</button></div>
<div class="lb">Карта</div><div class="row" id="bpmap"><button data-m="poly" class="sel">Полигон</button><button data-m="meadow">Луга и поля</button><button data-m="himmel">Химмельсдорф</button></div>
<div class="inf" id="bpi"></div><button class="go" id="bpg">В БОЙ!</button></div>`;document.body.appendChild(bp);
let kind='mp',mode=1,queued=false;
const G=()=>{try{return !!JSON.parse(localStorage.getItem('maus_session')).guest}catch(_){return false}};
const bots=()=>kind=='bot';
/* --- сеть --- */
function send(o){if(NET.ws&&NET.ws.readyState==1)NET.ws.send(JSON.stringify(o))}
function connect(){if(!API||!tok()||NET.ws)return;
 let w;try{w=new WebSocket(API.replace(/^http/,'ws')+'/ws?token='+tok()+'&v='+encodeURIComponent(VER))}catch(_){return}
 NET.ws=w;w.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(_){return}onMsg(m)};
 w.onclose=()=>{NET.ws=null;queued=false;render();if(bp.classList.contains('on')||NET.on)setTimeout(connect,2500)}}
function onMsg(m){
 if(m.t=='online'){NET.online=m.n;NET.q=m.q||{};render()}
 else if(m.t=='match'){queued=false;startMatch(m)}
 else if(m.t=='st'){const e=NET.px[m.id];if(!e)return;e.tx=m.x;e.tz=m.z;e.th=m.h;e.tty=m.ty;e.tgp=m.gp;e.tv=m.v;e.tw=m.w;
  if(!e.inited){e.inited=1;e.x=m.x;e.z=m.z;e.h=m.h}}
 else if(m.t=='shot'){const e=NET.px[m.id];if(!e||!e.alive)return;e.tur.rotation.y=e.ty=m.ty;e.gunG.rotation.x=e.gp=m.gp;e.root.position.set(e.x,0,e.z);e.root.rotation.y=e.h;e.root.updateMatrixWorld(true);e.rl=0;shoot(e,.002)}
 else if(m.t=='hit'){const T=m.v==NET.me?P:NET.px[m.v];if(!T)return;const mine=m.by==NET.me,pos=T.root.position;
  if(m.r=='trk'){trackHit(T,m.side,m.end,V3(pos.x,1,pos.z));return}
  if(m.r=='p'){T.hp=m.hp;if(mine)DMG+=m.d;
   if(T===P){$('dmg').style.opacity=1;S.shake=.7;popup('-'+m.d,innerWidth/2-20,innerHeight*.62,true)}else if(mine)popup('-'+m.d,innerWidth/2+30,innerHeight*.42)}
  else if(T===P||mine){const tx=m.r=='r'?'Рикошет':'Не пробил';popup(tx,innerWidth/2-40,T===P?innerHeight*.62:innerHeight*.42,false)}}
 else if(m.t=='dead'){const T=m.id==NET.me?P:NET.px[m.id];if(T&&T.alive){T.hp=0;kill(T,m.by==NET.me?P:(m.by==m.id?T:(NET.px[m.by]||T)))}}
 else if(m.t=='corr'){P.x=m.x;P.z=m.z;if(m.h!=null)P.h=m.h;P.v=0}
 else if(m.t=='end'){NET.res=m;if(m.eco)applyEco(m.eco)}
 else if(m.t=='err'){if(typeof toast=='function')toast(m.e||'Ошибка боя');queued=false;render()}}
/* --- запуск боя --- */
function startMatch(m){NET.on=true;NET.began=false;NET.abs=m.team;NET.me=m.id;NET.roster=m.players.filter(p=>p.id!==m.id);NET.px={};
 MODE=m.mode;NET.res=null;if(m.map){const o=document.querySelector('.mpi[data-m="'+m.map+'"]');if(o)o.click()}bp.classList.remove('on');startBattle()}
const oME=makeEnemies;makeEnemies=function(n){if(!NET.on)return oME(n);P.team='A';
 for(const r of NET.roster){const rel=r.team==NET.abs?'A':'B',cat=CATALOG.find(c=>c.id==r.tank)||CATALOG[0],e=buildTank(cat.id);
  e.team=rel;e.net=1;e.name=r.nick;e.nick=r.nick;e.netId=r.id;e.tier=cat.tier;e.tag=document.createElement('div');e.tag.className='tag'+(rel=='A'?' ally':'');
  e.tag.innerHTML=r.nick+' · '+cat.name+'<span class=hpt></span><i><b></b></i>';document.body.appendChild(e.tag);ALL.push(e);ENEMIES.push(e);resetEnemy(e);
  const sp=spawnPos(r.team);e.x=e.tx=sp.x;e.z=e.tz=sp.z;e.h=e.th=r.team=='B'?Math.PI:0;e.tty=e.tgp=e.tv=e.tw=0;e.root.position.set(e.x,0,e.z);NET.px[r.id]=e}};
const oRP=respawnPlayer;respawnPlayer=function(){oRP();if(NET.on){const p=spawnPos(NET.abs);P.x=p.x;P.z=p.z;P.h=NET.abs=='B'?Math.PI:0;cy=P.h}};
window.netTick=function(e,dt){if(e.tx==null)return;const k=Math.min(1,dt*10);
 e.x+=(e.tx-e.x)*k;e.z+=(e.tz-e.z)*k;e.h+=wrap(e.th-e.h)*k;e.ty+=wrap(e.tty-e.ty)*k;e.gp+=(e.tgp-e.gp)*k;e.v=e.tv;e.w=e.tw;
 e.root.position.set(e.x,0,e.z);e.root.rotation.y=e.h;e.tur.rotation.y=e.ty;e.gunG.rotation.x=e.gp;animTracks(e,dt)};
const oSH=shoot;shoot=function(T,s){const r0=T===P?P.rl:0,ok=T===P&&P.alive&&CDN<=0;oSH(T,s);
 if(NET.on&&ok&&r0<=0&&P.rl>0)send({t:'shot',ty:P.tur.rotation.y,gp:P.gunG.rotation.x})};
setInterval(()=>{if(!NET.on)return;if(!inHangar)NET.began=true;
 if(NET.began&&inHangar){send({t:'leave'});NET.on=false;NET.px={};return}
 if(NET.began&&P&&P.alive)send({t:'st',x:P.x,z:P.z,h:P.h,ty:P.tur.rotation.y,gp:P.gunG.rotation.x,v:P.v,w:P.w})},100);
/* --- бой с ботами: билет на сервере (награда считается по нему и проверяется на правдоподобие) --- */
window.BT=null;const oSB=startBattle;startBattle=function(){if(!NET.on&&typeof ONL=='function'&&ONL()){window.BT=null;window.mausCall('battle/start',{tank:P.cat.id,mode:MODE}).then(r=>{window.BT=r.ticket}).catch(()=>{})}return oSB.apply(this,arguments)};
/* --- панель --- */
function render(){
 bp.querySelectorAll('#bpt button').forEach(b=>b.classList.toggle('sel',b.dataset.k==kind));
 bp.querySelectorAll('#bpm button').forEach(b=>b.classList.toggle('sel',+b.dataset.n==mode));
 const t=(typeof P!='undefined'&&P&&P.cat)?'Ваш танк: <b>'+RM[P.tier]+' '+P.cat.name+'</b>':'',i=$('bpi'),g=$('bpg');
 if(bots()){i.innerHTML=t+'<br>'+(G()?'Гостевой режим (оффлайн): ':'')+'бой против ботов '+mode+' на '+mode+'.';g.textContent='В БОЙ!';g.className='go';return}
 if(!API||!tok()){i.innerHTML=t+'<br>Мультиплеер недоступен: нет сервера или вы не вошли.';g.textContent='Нет сервера';g.className='go c';return}
 const q=NET.q[mode]||{n:0,need:mode*2,tiers:[]},c=!!NET.ws;
 i.innerHTML=t+'<br>Игроков в сети: <b>'+(c?NET.online:'…')+'</b>'+
  (queued?'<br>Поиск боя '+mode+' на '+mode+': <b>'+q.n+' / '+q.need+'</b>':'<br>В очереди '+mode+' на '+mode+': <b>'+q.n+' / '+q.need+'</b>')+
  '<br>Танки в очереди: '+(q.tiers.length?q.tiers.map(x=>RM[x]).join(', '):'—');
 g.textContent=!c?'Подключение…':queued?'Отмена':'Искать бой';g.className='go'+(queued?' c':'')}
function open(){kind=G()?'bot':'mp';bp.querySelectorAll('#bpt button').forEach(b=>b.style.display=(b.dataset.k=='bot')==G()?'':'none');render();bp.classList.add('on');connect()}
$('play').onclick=open;$('bpx').onclick=()=>{if(queued){send({t:'cancel'});queued=false}bp.classList.remove('on')};
$('bpt').onclick=e=>{const b=e.target.closest('button');if(!b||queued)return;kind=b.dataset.k;render()};
$('bpm').onclick=e=>{const b=e.target.closest('button');if(!b||queued)return;mode=+b.dataset.n;render()};
$('bpmap').onclick=e=>{const b=e.target.closest('button');if(!b||queued)return;bp.querySelectorAll('#bpmap button').forEach(x=>x.classList.toggle('sel',x==b));const o=document.querySelector('.mpi[data-m="'+b.dataset.m+'"]');if(o)o.click()};
$('bpg').onclick=()=>{
 if(bots()){MODE=mode;bp.classList.remove('on');startBattle();return}
 if(!NET.ws)return;
 if(queued){send({t:'cancel'});queued=false}else{send({t:'queue',mode,tank:P.cat.id,tier:P.tier});queued=true}render()};
/* --- заглушки вместо боковых кнопок --- */
for(const[id,txt]of[['mpb','GAGROS'],['mb','AERO']]){const o=$(id);if(!o)continue;const n=o.cloneNode(true);o.replaceWith(n);
 n.querySelectorAll('svg,span').forEach(x=>x.style.display='none');const s=document.createElement('span');s.textContent=txt;s.style.cssText='position:static;transform:none;display:block;font:800 2.2vh system-ui;color:#fff;opacity:1;text-shadow:0 .1vh .3vh #000';n.appendChild(s)}
/* --- промокоды (вкладка «Сеть»), работают и без сервера; использованные хранятся в maus_promo (при онлайне уходят в облако) --- */
const pb=$('prb');if(pb)pb.onclick=()=>{const c=$('pri').value.trim().toLowerCase(),T=m=>{if(typeof toast=='function')toast(m)};if(!c)return;
 if(ONL()){ecoOp('promo',{code:c},r=>{buildHangar();if(typeof buildShop=='function')buildShop();$('pri').value='';T(r.msg)});return}
  const apply=w=>{let used=[];try{used=JSON.parse(localStorage.getItem('maus_promo'))||[]}catch(_){}
  if(used.includes(c)){T('Промокод уже активирован');return}
  used.push(c);try{localStorage.setItem('maus_promo',JSON.stringify(used))}catch(_){}
  if(w.tank){if(ECO.own.includes(w.tank))ECO.au+=1000;else ECO.own.push(w.tank)}
  if(w.gold)ECO.au+=w.gold;if(w.silver)ECO.cr+=w.silver;
  js('maus_eco2',ECO);hCredits();buildHangar();if(typeof buildShop=='function')buildShop();$('pri').value='';T(w.msg)};
  /* оффлайн: код проверяет сервер, на устройстве кодов нет */
  if(!window.API_URL){T('Для проверки промокода нужен сервер');return}
  fetch(window.API_URL+'/api/promo/check',{method:'POST',headers:{'Content-Type':'application/json','X-App-Version':window.APP_VERSION||'0'},body:JSON.stringify({code:c})}).then(r=>r.json().then(j=>({ok:r.ok,j}))).then(x=>{if(!x.ok){T(x.j.error||'Промокод не найден');return}apply(x.j.reward)}).catch(()=>T('Нет связи с сервером — промокод проверить нельзя'))};
})();
