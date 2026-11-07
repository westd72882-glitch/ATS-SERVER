/* Экран результата боя (как в WoT Blitz) + экран «Характеристики/Улучшения» с ветками модулей + кнопка «Гость» */
(function(){
const $=id=>document.getElementById(id),F=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
/* ---------- РЕЖИМЫ: гость = оффлайн (боты, всё на устройстве); аккаунт = онлайн (всё через сервер) ---------- */
const sess=()=>{try{return JSON.parse(localStorage.getItem('maus_session'))}catch(_){return null}};
window.ONL=()=>{const s=sess();return !!(window.API_URL&&s&&s.token&&!s.guest&&window.mausCall)};
const tst=t=>{if(typeof toast=='function')toast(t)};
function applyEco(e){if(!e)return;const rd={};(ECO.mail||[]).forEach(m=>{if(m.rd)rd[m.id]=1});
 Object.keys(ECO).forEach(k=>delete ECO[k]);Object.assign(ECO,e);(ECO.mail||[]).forEach(m=>{if(rd[m.id])m.rd=1});
 try{if(e.av)localStorage.setItem('maus_avown',JSON.stringify(e.av));if(e.promos)localStorage.setItem('maus_promo',JSON.stringify(e.promos))}catch(_){}
 js('maus_eco2',ECO);hCredits();if(typeof badges=='function')badges()}
window.applyEco=applyEco;window.ecoOp=(op,args,cb)=>window.mausCall('eco/op',Object.assign({op},args||{})).then(r=>{applyEco(r.eco);if(cb)cb(r)}).catch(e=>tst(e.message||'Нет связи с сервером'));
let lastTok=null;setInterval(()=>{const s=sess(),t=s&&s.token||'';if(t===lastTok)return;lastTok=t;if(ONL())window.mausCall('eco/get',{}).then(r=>{applyEco(r.eco);if(typeof buildHangar=='function')buildHangar()}).catch(()=>{})},1000);

const css=document.createElement('style');css.textContent=`
#rs,#up{position:fixed;inset:0;display:none;color:#fff;font-family:system-ui,sans-serif;overflow:hidden}
#rs{z-index:45;background:#0c1117}#rs.on{display:block}
#rs:before{content:'';position:absolute;inset:0;background:linear-gradient(112deg,#0c1117 0 46%,var(--ra) 46% 46.5%,#141c24 46.5% 100%)}
#rs.win{--ra:#37d58a;--rb:#0f3a2a}#rs.lose{--ra:#ff5a4d;--rb:#3d1512}
#rs .rl{position:absolute;left:calc(env(safe-area-inset-left,0px) + 6vh);top:9vh;width:46vh}
#rs .rl small{display:block;font:600 2.4vh system-ui;letter-spacing:.5vh;color:#7f8c97}
#rs .rl .nk{display:block;margin-top:.6vh;font:700 3.4vh system-ui;color:#e8edf0}
#rs .rl h1{margin:7vh 0 0;font:900 12vh/1 system-ui;letter-spacing:-.3vh;color:var(--ra);text-transform:uppercase}
#rs .rl p{margin:2vh 0 0;padding-left:2vh;border-left:.6vh solid var(--ra);font:500 2.8vh/1.3 system-ui;color:#b9c4cd}
#rs .rr3{position:absolute;left:calc(50% + 4vh);right:calc(env(safe-area-inset-right,0px) + 6vh);top:9vh;display:flex;flex-direction:column;gap:1.6vh}
#rs .sc{display:flex;align-items:center;justify-content:space-between;height:15vh;padding:0 4vh;background:linear-gradient(90deg,var(--rb),#1b242d);clip-path:polygon(0 0,100% 0,100% 70%,96% 100%,0 100%);border-top:.4vh solid var(--ra)}
#rs .sc span{font:600 2.8vh system-ui;letter-spacing:.3vh;color:#aab6c0;text-transform:uppercase}
#rs .sc b{display:flex;align-items:center;gap:1.2vh;font:800 7vh system-ui;color:#fff;font-variant-numeric:tabular-nums}
#rs .sc b svg{width:5.6vh;height:5.6vh}
#rs .inf{position:absolute;left:calc(env(safe-area-inset-left,0px) + 6vh);bottom:5vh;display:flex;gap:5vh;align-items:flex-end}
#rs .inf div b{display:block;font:700 3.2vh system-ui;color:#e8edf0}#rs .inf div span{font:500 2.4vh system-ui;color:#7f8c97}
#rs .hb{position:absolute;right:calc(env(safe-area-inset-right,0px) + 6vh);bottom:5vh;all:unset;box-sizing:border-box;position:absolute;right:calc(env(safe-area-inset-right,0px) + 6vh);bottom:5vh;padding:2.2vh 7vh 2.2vh 8vh;background:var(--ra);color:#07100c;font:800 3.4vh system-ui;letter-spacing:.4vh;clip-path:polygon(4vh 0,100% 0,100% 100%,0 100%);cursor:pointer}
#rs .hb:active{filter:brightness(.88)}
/* улучшения */
#up{z-index:46;background:#0d0f10 radial-gradient(ellipse at 50% 60%,#2b2a24,#0b0c0c)}#up.on{display:block}
#up .hd{position:absolute;left:calc(env(safe-area-inset-left,0px) + 3vh);right:calc(env(safe-area-inset-right,0px) + 3vh);top:2vh;display:flex;align-items:center;font-size:2.8vh}
#up .hd button{all:unset;font-size:5vh;margin-right:4vh;line-height:1}#up .hd b{font-weight:600}#up .hd span{color:#9aa}
#up .cur{margin-left:auto;display:flex;gap:4vh;font-size:2.8vh}#up .cur i{font-style:normal;display:flex;align-items:center;gap:1vh}#up .cur svg{width:4vh;height:4vh}
#up .tr{position:absolute;left:0;right:30vw;top:20vh;bottom:14vh}
#up .card{position:absolute;width:38vh;height:34vh;background:radial-gradient(ellipse at 50% 40%,#3a3d3f,#25272a);overflow:hidden;color:#fff}
#up .card .ct{position:absolute;left:8%;top:8%;width:84%;height:56%;object-fit:contain;fill:#9a8f70;filter:drop-shadow(0 .6vh .6vh #000a)}
#up .card b{position:absolute;left:1.6vh;bottom:5.6vh;font-size:3.2vh}#up .card small{position:absolute;left:1.6vh;bottom:1.6vh;font-size:2.4vh;color:#9a9a96}
#up .card .tx{position:absolute;left:1.4vh;top:1.2vh;font-size:2.6vh;font-weight:700}
#up .card.sm{width:34vh;height:20vh}#up .card.sm b{font-size:2.6vh;bottom:1.6vh}#up .card.sm .ct{top:2%;height:66%}
#up .card.cu{outline:.35vh solid #f0a030}
#up .ck{position:absolute;width:5.6vh;height:5.6vh;border-radius:50%;background:#e8e8e8;display:flex;align-items:center;justify-content:center}
#up .ck svg{width:3.6vh;height:3.6vh;fill:none;stroke:#222;stroke-width:3}
#up .ln{position:absolute;background:#667}
#up .pn{position:absolute;right:calc(env(safe-area-inset-right,0px) + 1vh);top:10.4vh;bottom:14vh;width:28vw;min-width:44vh;background:#23272a;border-radius:1vh;padding:2.6vh 2.4vh;overflow:auto;font-size:2.6vh}
#up .ph{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.4vh}
#up .pn h3{margin:0;font-size:3.2vh;font-weight:500}#up .pn .sub{color:#9aa;font-size:2.4vh}
#up .pt{display:flex;gap:1.4vh}#up .pt button{all:unset;padding:0 1.2vh 1vh;border-bottom:.45vh solid transparent}#up .pt button.on{border-color:#f0a030}#up .pt svg{width:4.4vh;height:4.4vh;fill:none;stroke:#aab;stroke-width:2}#up .pt button.on svg{stroke:#fff}
#up .sr{display:flex;gap:1.8vh;align-items:flex-start;padding:1.7vh 0}#up .sr>svg{width:4.4vh;height:4.4vh;flex:none;fill:none;stroke:#e4e6e8;stroke-width:1.7;margin-top:.4vh}#up .sr>div{flex:1}
#up .sr p{display:flex;justify-content:space-between;align-items:baseline;margin:0 0 1vh;font-size:3vh}#up .sr small{font-size:2.4vh;color:#9aa}#up .sr b{font-size:3vh}
#up .br{height:1.2vh;background:repeating-linear-gradient(90deg,#ffffff30 0 .35vh,#0000 .35vh .9vh);position:relative}
#up .br i{position:absolute;left:0;top:0;bottom:0;background:repeating-linear-gradient(90deg,#f0b050 0 .35vh,#0000 .35vh .9vh)}#up .br i:after{content:'';position:absolute;right:-.2vh;top:-.5vh;bottom:-.5vh;width:.35vh;background:#fff}
#up .sec{background:#32373a;padding:1.4vh 1.6vh;font:700 2.2vh system-ui;letter-spacing:.2vh;margin:1vh 0 0}
#up .rw{display:flex;justify-content:space-between;gap:2vh;padding:1.5vh 0;border-bottom:1px solid #ffffff14}#up .rw span{color:#cfd3d6}
#up .ar{display:grid;grid-template-columns:1.3fr 1fr 1fr;padding:1.1vh 0;text-align:right}#up .ar span:first-child{text-align:left;color:#cfd3d6}#up .ar.h{color:#9aa;font-size:2.2vh}
#up .ft{position:absolute;left:0;right:0;bottom:0;height:13.4vh;background:#16181a}
#up .eye{position:absolute;left:calc(env(safe-area-inset-left,0px) + 3vh);bottom:1.4vh;width:8.6vh;height:8.6vh;border:0;background:#3a3c3e;display:flex;align-items:center;justify-content:center}#up .eye svg{width:5vh;height:5vh;fill:none;stroke:#eee;stroke-width:2}
#up .sell{position:absolute;right:calc(env(safe-area-inset-right,0px) + 1vh);bottom:1.4vh;width:25vw;min-width:40vh;height:8.6vh;border:0;background:#a3171e;color:#fff;font:800 2.8vh system-ui;letter-spacing:.3vh}#up .sell:disabled{background:#4a4c4e;color:#9a9c9e}
#up .cf{position:absolute;inset:0;background:#000b;display:none;align-items:center;justify-content:center;z-index:3}#up .cf.on{display:flex}
#up .cf>div{width:56vh;background:#23272a;border:1px solid #ffffff22;border-radius:1vh;padding:3vh;text-align:center}#up .cf h4{margin:0 0 1.4vh;font-size:3.4vh}#up .cf p{margin:.6vh 0;font-size:2.8vh;color:#dde}
#up .cf .am{display:flex;justify-content:center;align-items:center;gap:1vh;color:#ffd45a}#up .cf .am svg{width:3.6vh;height:3.6vh}
#up .cf .bb{display:flex;gap:2vh;margin-top:2.6vh}#up .cf .bb button{all:unset;flex:1;padding:1.8vh 0;font:800 2.8vh system-ui;background:#3a3c3e;border-radius:.6vh}#up .cf .bb .y{background:#a3171e}
/* круги наций в дереве */
.nl{width:12.4vh!important;padding:1.4vh 0!important;gap:1.8vh!important;align-items:center;overflow-x:hidden}
.nf{width:8.4vh!important;height:8.4vh!important;min-height:8.4vh;margin:0!important;border:.35vh solid #ffffff55!important;border-radius:50%!important;box-sizing:border-box;opacity:.6!important;transform:none!important;outline:none!important;flex:none}
.nf svg{width:100%!important;height:100%!important;border-radius:50%}
.nf.on{opacity:1!important;border-color:#ff9c1f!important;box-shadow:0 0 0 .4vh #12181f,0 0 0 .8vh #ff9c1f}`;
document.head.appendChild(css);

/* ---------- РЕЗУЛЬТАТ БОЯ ---------- */
const MED=[
 ['Воин',k=>k.kills>=1,'#c9ccd0','M32 14l6 8-6 22-6-22z M22 26h20 M28 40h8'],
 ['Основной калибр',k=>k.dmg>=1000,'#e8b84a','M18 36h28v6H18z M24 30h16v6H24z M30 22h4v8h-4z'],
 ['Стойкость',k=>k.alive,'#8a9099','M32 14l14 5v10c0 9-6 15-14 18-8-3-14-9-14-18V19z'],
 ['Победа',k=>k.win,'#6aa86a','M32 16l4.600 9.400 10.400 1.500-7.500 7.300 1.800 10.300L32 39.600l-9.300 4.900 1.800-10.300-7.500-7.300 10.400-1.500z'],
 ['Разрушитель',k=>k.kills>=3,'#d28a52','M20 40l8-8 4 4 8-10 M20 22l24 20 M44 22L20 42'],
 ['Мастер',k=>k.dmg>=3000,'#b6bcc4','M32 14l4 10h10l-8 6 3 10-9-6-9 6 3-10-8-6h10z']];
function medal(m){return`<svg viewBox="0 0 64 64"><defs><linearGradient id="mg${m[0].length}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${m[2]}"/></linearGradient></defs><circle cx="32" cy="32" r="27" fill="#2b2f2a" stroke="url(#mg${m[0].length})" stroke-width="3.500"/><path d="M10 38c-2-12 4-22 14-26M54 38c2-12-4-22-14-26" fill="none" stroke="${m[2]}" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 3"/><path d="${m[3]}" fill="${m[2]}" stroke="#111" stroke-width="1.500" stroke-linejoin="round"/></svg>`}
const rs=document.createElement('div');rs.id='rs';
rs.innerHTML=`<div class="rl"><small>РЕЗУЛЬТАТЫ БОЯ</small><b class="nk" id="rs_n"></b><h1 id="rs_t"></h1><p id="rs_s"></p></div>
<div class="rr3"><div class="sc"><span>Нанесено урона</span><b><span id="rs_d" style="font:inherit;color:inherit;letter-spacing:0;text-transform:none"></span></b></div><div class="sc"><span>Уничтожено</span><b><span id="rs_k" style="font:inherit;color:inherit;letter-spacing:0;text-transform:none"></span></b></div><div class="sc"><span>Кредиты</span><b><span id="rs_ct" style="font:inherit;color:inherit;letter-spacing:0;text-transform:none"></span><svg><use href="#c-silv"/></svg></b></div></div>
<div class="inf"><div><b id="rs_map"></b><span>Карта</span></div><div><b><span id="rs_tr" style="font:inherit;color:inherit"></span> <span id="rs_tn" style="font:inherit;color:inherit"></span></b><span id="rs_ts"></span></div><div><b id="rs_dt"></b><span id="rs_tm"></span></div></div>
<button class="hb" id="rs_h">В АНГАР</button>`;
document.body.appendChild(rs);
const p2=n=>String(n).padStart(2,'0');
const oEnd=window.endBattle;
if(typeof oEnd=='function')window.endBattle=function(win){
 if(BEND||inHangar)return;const sn=JSON.stringify(ECO),cr0=ECO.cr,xp0=ECO.xp||0,alive=!!(P&&P.alive),dmg=DMG,kl=kills;oEnd(win);
 const r0=$('res');if(r0){r0.style.display='none';r0.classList.remove('on')}
 const cr=ECO.cr-cr0,xp=(ECO.xp||0)-xp0,cat=P&&P.cat||{},now=new Date(),s=(()=>{try{return JSON.parse(localStorage.getItem('maus_session'))}catch(_){return null}})();
 rs.className='on '+(win?'win':'lose');$('rs_n').textContent=s&&s.nick||'Игрок';
 $('rs_t').textContent=win?'Победа!':'Поражение';$('rs_s').textContent=win?'Вся техника противника уничтожена':'Вся ваша техника уничтожена';
 $('rs_d').textContent=F(dmg);$('rs_ct').textContent=F(cr);$('rs_k').textContent=kl;
 const mp=(typeof MAPS!='undefined'&&MAPS.find(m=>m.id==curMap))||{name:'Полигон'};$('rs_map').textContent=mp.name;
 $('rs_tr').textContent=ROM[cat.tier||P&&P.tier||1];$('rs_tn').textContent=cat.name||'Maus';$('rs_ts').textContent=alive?'Выжил':'Уничтожен';
 $('rs_dt').textContent=p2(now.getDate())+'.'+p2(now.getMonth()+1)+'.'+now.getFullYear();$('rs_tm').textContent=p2(now.getHours())+':'+p2(now.getMinutes())+':'+p2(now.getSeconds());
 if(ONL()){const o=JSON.parse(sn);Object.keys(ECO).forEach(k=>delete ECO[k]);Object.assign(ECO,o);hCredits();   /* онлайн: награду и исход считает сервер */
  const show=r=>{applyEco(r.eco);window.SRV_STATS=r.stats;const R=r.reward||{};$('rs_t').textContent=r.win===undefined?$('rs_t').textContent:(r.win?'Победа!':'Поражение');
   rs.className='on '+((r.win===undefined?win:r.win)?'win':'lose');$('rs_ct').textContent=F(R.cr||0);
   $('rs_d').textContent=F(r.dmg!=null?r.dmg:dmg);$('rs_k').textContent=r.kills!=null?r.kills:kl},fail=()=>tst('Нет связи с сервером: награда не начислена');
  if(window.NET&&NET.on){let n=0;const w=()=>{if(NET.res){const r=NET.res;if(r.err)return fail();show(r);return}if(++n>40)return fail();setTimeout(w,250)};w()}
  else if(window.BT){const t=window.BT;window.BT=null;window.mausCall('battle/end',{ticket:t,win:!!win,dmg,kills:kl,map:mp.id||''}).then(show).catch(e=>tst(e.message||'Нет связи с сервером'))}
  else fail()}};
const oRB=window.rewardBattle;if(typeof oRB=='function')window.rewardBattle=function(k){if(ONL())return;return oRB(k)};
$('rs_h').onclick=()=>{rs.className='';$('rgo').click()};

/* ---------- ХАРАКТЕРИСТИКИ / УЛУЧШЕНИЯ ---------- */
const up=document.createElement('div');up.id='up';document.body.appendChild(up);
const IC={dmg:'M3 12h13M12 6l6 6-6 6M19 4v16',rate:'M4 8h16M4 12h16M4 16h16',pen:'M3 12h14M11 6l6 6-6 6M20 6v12',arm:'M12 3l8 3v6c0 5-3.500 8-8 10-4.500-2-8-5-8-10V6z',spd:'M4 16a8 8 0 1116 0M12 16l4-5'};
const CK='<span class="ck"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></span>';
const fires=c=>({'ТТ':10,'СТ':12,'ЛТ':12,'ПТ':12}[c]||12);
let upMode='b';
const tIco=c=>{const u=typeof ICONS!='undefined'&&ICONS[c.id];return u?'<img class="ct" src="'+u+'">':'<svg class="ct" viewBox="0 0 24 24"><use href="#i-tank"/></svg>'};
const sellInfo=c=>{if(!c||c.id=='ms1'||!ECO.own.includes(c.id))return null;const p=c.nat!='СССР';return{gold:p,n:Math.floor((p?c.gold:c.rc)*.5)}};
function bar(v,mx){const f=Math.max(.02,Math.min(1,v/mx))*100;return'<div class="br"><i style="width:'+f+'%"></i></div>'}
function openUp(){
 const c=(P&&P.cat)||{name:'?',tier:1,arm:[0,0,0,0,0]},a=c.arm||[0,0,0,0,0],cat=typeof CATALOG!='undefined'?CATALOG:[],mx=k=>Math.max(1,...cat.map(k)),
  pv=cat.filter(x=>x.nat==c.nat&&x.tier<c.tier&&x.id!=c.id&&ECO.own.includes(x.id)).sort((p,q)=>q.tier-p.tier)[0],R=ROM[c.tier],tw=Math.round(a[3]*.75),tr=Math.round(a[3]*.5),sl=sellInfo(c),
  rate=60/(c.rel||1),ar=(a[0]+a[1]+a[2])/3;
 const row=(ic,t,v,b)=>'<div class="sr"><svg viewBox="0 0 24 24"><path d="'+IC[ic]+'"/></svg><div><p><span>'+t+'</span><b>'+v+'</b></p>'+b+'</div></div>';
 const brief=row('dmg','Урон, <small>ед</small>',c.dmg,bar(c.dmg,mx(x=>x.dmg)))+row('rate','Скорострельность, <small>вс/м</small>',rate.toFixed(1),bar(rate,mx(x=>60/(x.rel||1))))+row('pen','Бронепробиваемость, <small>мм</small>',c.pen,bar(c.pen,mx(x=>x.pen)))+row('arm','Бронирование, <small>мм</small>',ar.toFixed(1),bar(ar,mx(x=>(x.arm[0]+x.arm[1]+x.arm[2])/3)))+row('spd','Скорость, <small>км/ч</small>',c.kmh,bar(c.kmh,mx(x=>x.kmh)));
 const det=`<div class="sec">ВЫЖИВАЕМОСТЬ</div><div class="rw"><span>Прочность, ед</span><b>${F(c.hp)}</b></div><div class="ar h"><span>Основное бронирование, мм</span><span>башня</span><span>корпус</span></div><div class="ar"><span>лоб</span><b>${a[3]}</b><b>${a[0]}</b></div><div class="ar"><span>борт</span><b>${tw}</b><b>${a[1]}</b></div><div class="ar"><span>корма</span><b>${tr}</b><b>${a[2]}</b></div><div class="rw"><span>Вероятность возгорания при попадании в двигатель, %</span><b>${fires(c.cls)}</b></div>
  <div class="sec">ОГНЕВАЯ МОЩЬ</div><div class="rw"><span>Урон, ед</span><b>${c.dmg}</b></div><div class="rw"><span>Бронепробиваемость, мм</span><b>${c.pen}</b></div><div class="rw"><span>Перезарядка, с</span><b>${c.rel}</b></div><div class="sec">МОБИЛЬНОСТЬ</div><div class="rw"><span>Максимальная скорость, км/ч</span><b>${c.kmh}</b></div>`;
 up.innerHTML=`<div class="hd"><button id="up_b">←</button><b>${c.name}</b><span>&nbsp;/ Улучшения</span><div class="cur"><i><svg><use href="#c-gold"/></svg>${F(ECO.au)}</i><i><svg><use href="#c-silv"/></svg>${F(ECO.cr)}</i></div></div>
 <div class="tr">
  <div class="card cu" style="left:calc(env(safe-area-inset-left,0px) + 8vh);top:7vh">${tIco(c)}<span class="tx">◆ ${R}</span><b>${c.name}</b><small>${({'ТТ':'Тяжёлый танк','СТ':'Средний танк','ЛТ':'Лёгкий танк','ПТ':'ПТ-САУ'})[c.cls]||c.cls||''}</small>${CK.replace('class="ck"','class="ck" style="right:-1.4vh;bottom:-1.4vh"')}</div></div>
 <div class="pn"><div class="ph"><div><h3>${c.name}</h3><div class="sub">${upMode=='b'?'Краткие':'Подробные'} характеристики</div></div><div class="pt"><button data-m="b" class="${upMode=='b'?'on':''}"><svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h12M3 18h18"/></svg></button><button data-m="d" class="${upMode=='d'?'on':''}"><svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h12M3 18h10M18 15v6M15 18h6"/></svg></button></div></div>${upMode=='b'?brief:det}</div>
 <div class="ft"></div><button class="eye" id="up_e"><svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3.500"/></svg></button>
 <button class="sell" id="up_s"${sl?'':' disabled'}>${sl?'ПРОДАТЬ':'НЕЛЬЗЯ ПРОДАТЬ'}</button>
 <div class="cf" id="up_c"><div><h4>Продать танк?</h4><p>${R} ${c.name}</p><p class="am">${sl?'Вы получите '+F(sl.n)+' <svg><use href="'+(sl.gold?'#c-gold':'#c-silv')+'"/></svg> (50% стоимости)':''}</p><div class="bb"><button id="up_n">Отмена</button><button id="up_y" class="y">Продать</button></div></div></div>`;
 up.classList.add('on');
 $('up_b').onclick=$('up_e').onclick=()=>up.classList.remove('on');
 up.querySelectorAll('.pt button').forEach(b=>b.onclick=()=>{upMode=b.dataset.m;openUp()});
 $('up_s').onclick=()=>{if(sl)$('up_c').classList.add('on')};$('up_n').onclick=()=>$('up_c').classList.remove('on');
 $('up_y').onclick=()=>{$('up_c').classList.remove('on');const fin=()=>{up.classList.remove('on');if(typeof setPlayer=='function')setPlayer('ms1');if(typeof buildHangar=='function')buildHangar();hCredits();tst('Танк продан: +'+F(sl.n)+(sl.gold?' зол.':' кр.'))};
  if(ONL()){window.ecoOp('sell',{id:c.id},fin);return}
  ECO.own=ECO.own.filter(x=>x!=c.id);if(sl.gold)ECO.au+=sl.n;else ECO.cr+=sl.n;js('maus_eco2',ECO);fin()};
}
const mu=$('mup');if(mu){const n=mu.cloneNode(true);mu.replaceWith(n);n.onclick=openUp}
const hp=$('hprof');if(hp)hp.addEventListener('click',()=>{if(ONL())window.mausCall('stats',{}).then(r=>{window.SRV_STATS=r.stats;if($('prof').classList.contains('on')&&hp.onclick)hp.onclick()}).catch(()=>{})});

/* ---------- ОТКЛЮЧИТЬСЯ: выход на окно входа ---------- */
const nc=$('nco');if(nc){const n=nc.cloneNode(true);nc.replaceWith(n);n.textContent='Отключиться';
 n.onclick=()=>{try{if(window.NET&&NET.ws)NET.ws.close()}catch(_){}try{localStorage.removeItem('maus_session')}catch(_){}location.reload()}}
/* ---------- ГОСТЬ ---------- */
/* офлайн/гостевой режим удалён: игра только онлайн (боты — через серверный билет) */
})();
