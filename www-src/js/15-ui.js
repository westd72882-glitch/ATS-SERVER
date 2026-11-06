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
window.ecoOp=(op,args,cb)=>window.mausCall('eco/op',Object.assign({op},args||{})).then(r=>{applyEco(r.eco);if(cb)cb(r)}).catch(e=>tst(e.message||'Нет связи с сервером'));
let lastTok=null;setInterval(()=>{const s=sess(),t=s&&s.token||'';if(t===lastTok)return;lastTok=t;if(ONL())window.mausCall('eco/get',{}).then(r=>{applyEco(r.eco);if(typeof buildHangar=='function')buildHangar()}).catch(()=>{})},1000);

const css=document.createElement('style');css.textContent=`
#rs,#up{position:fixed;inset:0;display:none;color:#fff;font-family:system-ui,sans-serif;overflow:hidden}
#rs{z-index:45;background:#2a2a24 radial-gradient(ellipse at 50% 60%,#4a4a40,#16160f)}#rs.on{display:block}
#rs .tb{position:absolute;left:0;right:0;top:0;height:12.4vh;background:#050505;display:flex;align-items:center}
#rs .hb{width:12.4vh;height:12.4vh;margin:0 1.4vh 0 calc(env(safe-area-inset-left,0px) + 1vh);background:#2b2b2b;border:0;display:flex;align-items:center;justify-content:center}
#rs .hb svg{width:6vh;height:6vh;fill:none;stroke:#cfd3d6;stroke-width:2.2}
#rs .tt small{display:block;font:800 3.2vh Impact,'Arial Narrow',system-ui;letter-spacing:.2vh}#rs .tt b{font:700 4.6vh Impact,'Arial Narrow',system-ui;color:#d8d8d0;letter-spacing:.2vh}
#rs .tabs{margin-left:auto;display:flex;height:100%;padding-right:calc(env(safe-area-inset-right,0px) + 1vh)}
#rs .tabs button{all:unset;width:19vh;text-align:center;font:700 2.6vh Impact,'Arial Narrow',system-ui;color:#aaa;letter-spacing:.1vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.6vh}
#rs .tabs button.on{background:#383838;color:#ddd}#rs .tabs svg{width:7vh;height:7vh;fill:#cfd3d6}
#rs .bn{position:absolute;left:0;right:0;top:12.4vh;height:16vh;text-align:center;overflow:hidden;
 background:linear-gradient(#0003,#0005),radial-gradient(ellipse 22vh 9vh at 12% 60%,#7f8f3a,#0000 70%),radial-gradient(ellipse 18vh 8vh at 28% 40%,#c9b54a,#0000 70%),radial-gradient(ellipse 30vh 12vh at 70% 70%,#3d6a3a,#0000 70%),radial-gradient(ellipse 24vh 10vh at 90% 30%,#6f8f55,#0000 70%),linear-gradient(90deg,#4d6a3c,#5b7d46 40%,#6a8a4e 70%,#3f5a3a)}
#rs .bn:before{content:'';position:absolute;inset:0;background:url(img/load2.jpg) center/cover;opacity:.35;mix-blend-mode:luminosity}
#rs .bn svg.tk{position:absolute;bottom:-2vh;width:30vh;height:30vh;opacity:.55;fill:#18240f}
#rs .bn h1{position:relative;margin:1.6vh 0 0;font:900 8.6vh Impact,'Arial Narrow',system-ui;letter-spacing:.2vh;text-shadow:0 .5vh 1.4vh #000c,0 0 .4vh #000}
#rs .bn p{position:relative;margin:0;font:800 3.6vh Impact,'Arial Narrow',system-ui;letter-spacing:.1vh;text-shadow:0 .3vh .8vh #000}
#rs.lose .bn{filter:hue-rotate(-70deg) saturate(.7) brightness(.85)}
#rs .rib{position:absolute;left:0;right:0;top:28.4vh;height:10.6vh;background:repeating-linear-gradient(90deg,#0000 0 .5vh,#0001 .5vh 1vh),linear-gradient(#c2191a,#8e0b0c 50%,#b01415);box-shadow:0 .3vh .6vh #000a,inset 0 .3vh .5vh #f66a;display:flex;justify-content:center;align-items:center;gap:4.4vh}
#rs .rib svg{width:9.4vh;height:9.4vh;filter:drop-shadow(0 .4vh .5vh #000a)}
#rs .got{position:absolute;left:0;right:0;top:39.6vh;text-align:center;font:800 3.4vh Impact,'Arial Narrow',system-ui}
#rs .bx{position:absolute;top:44.4vh;width:35vh;height:18.6vh;border:.25vh solid #6d6d66;background:#0003}
#rs .bx.a{left:calc(50% - 35vh)}#rs .bx.b{left:50%;opacity:.35}
#rs .bx h4{margin:0;height:6vh;line-height:6vh;text-align:center;font:500 3.2vh system-ui;border-bottom:.25vh solid #6d6d66}
#rs .bx div{display:flex;justify-content:flex-end;align-items:center;gap:1vh;padding:0 1.8vh;height:6.2vh;font:800 4.6vh Impact,'Arial Narrow',system-ui;letter-spacing:.2vh}
#rs .bx div svg{width:4.6vh;height:4.6vh}
#rs .cart{position:absolute;top:47.8vh;left:calc(50% + 36.8vh);width:13vh;height:10vh;border:0;border-radius:.6vh;background:linear-gradient(#4cbf3a,#2a8a1e);box-shadow:0 .3vh .8vh #000a;display:flex;align-items:center;justify-content:center}
#rs .cart svg{width:6.4vh;height:6.4vh;fill:none;stroke:#fff;stroke-width:2}
#rs .st{position:absolute;top:65.6vh;left:calc(50% - 45vh);width:90vh;height:12.6vh;display:flex;border:.25vh solid #6d6d66;background:#0003}
#rs .st>div{flex:1;text-align:center;border-left:.25vh solid #6d6d66;padding-top:1.4vh;font:500 3.2vh system-ui;color:#ddd}#rs .st>div:first-child{border:0}
#rs .st b{display:flex;justify-content:center;align-items:center;gap:1vh;margin-top:.8vh;font:800 5vh Impact,'Arial Narrow',system-ui;color:#fff}#rs .st b svg{width:5.4vh;height:5.4vh}
#rs .bt{position:absolute;left:0;right:0;bottom:0;height:14vh;background:#1e1e1c;border-top:.2vh solid #0008;display:flex;align-items:center;padding:0 calc(env(safe-area-inset-right,0px) + 1vh) 0 calc(env(safe-area-inset-left,0px) + 5vh)}
#rs .bt .m b{display:block;font:800 4.4vh Impact,'Arial Narrow',system-ui;color:#fff}#rs .bt .m span{font:500 3.4vh system-ui;color:#999}
#rs .bt .t{position:absolute;left:50%;top:0;height:100%;display:flex;align-items:center;transform:translateX(-62%)}
#rs .bt .t i{font:800 3.4vh system-ui;font-style:normal;color:#ccc;margin-right:1vh;align-self:flex-start;margin-top:2.2vh;letter-spacing:.2vh}
#rs .bt .t svg.tn{width:13vh;height:11vh;fill:#6f7a62;margin-right:2vh}
#rs .bt .t b{display:block;font:800 4.6vh Impact,'Arial Narrow',system-ui}#rs .bt .t span{font:500 3.4vh system-ui;color:#999}
#rs .bt .d{margin-left:auto;text-align:right;margin-right:2.4vh}#rs .bt .d b{display:block;font:800 4.4vh Impact,'Arial Narrow',system-ui}#rs .bt .d span{font:500 3.4vh system-ui;color:#999}
#rs .bt button{all:unset;width:12vh;height:10vh;background:#3a4650;display:flex;align-items:center;justify-content:center;border-radius:.4vh}#rs .bt button svg{width:7vh;height:7vh;fill:#e8edf0}
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
rs.innerHTML=`<div class="tb"><button class="hb" id="rs_h"><svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10"/></svg></button><div class="tt"><small>РЕЗУЛЬТАТЫ БОЯ</small><b id="rs_n"></b></div>
<div class="tabs"><button class="on"><svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.500 9-8 11-4.500-2-8-6-8-11V5z"/></svg>ЛИЧНЫЕ</button><button><svg viewBox="0 0 24 24"><path d="M8 3l6 2v5c0 4-3 7-6 8-3-1-6-4-6-8V5zM17 8l5 2v4c0 3-2 5-5 6z"/></svg>КОМАНДНЫЕ</button><button><svg viewBox="0 0 24 24"><path d="M3 5h18v2H3zM3 11h12v2H3zM3 17h18v2H3z"/></svg>ДЕТАЛЬНЫЕ</button><button><svg viewBox="0 0 24 24"><path d="M6 3h12v4a6 6 0 01-12 0zM9 15h6v3h3v3H6v-3h3z"/></svg>НАГРАДЫ</button></div></div>
<div class="bn"><svg class="tk" style="left:-4vh" viewBox="0 0 24 24"><use href="#i-tank"/></svg><svg class="tk" style="right:-3vh;transform:scaleX(-1)" viewBox="0 0 24 24"><use href="#i-tank"/></svg><h1 id="rs_t"></h1><p id="rs_s"></p></div>
<div class="rib" id="rs_m"></div><div class="got">Получено за бой</div>
<div class="bx a"><h4>Без премиума</h4><div><span id="rs_x1"></span><svg viewBox="0 0 24 24"><path d="M12 2.500l2.900 6.100 6.600.8-4.900 4.600 1.300 6.600L12 17.300 6.100 20.600l1.300-6.600L2.500 9.400l6.600-.8z" fill="none" stroke="#6bb7ff" stroke-width="1.800"/></svg></div><div><span id="rs_c1"></span><svg><use href="#c-silv"/></svg></div></div>
<div class="bx b"><h4>С премиумом</h4><div><span id="rs_x2"></span><svg viewBox="0 0 24 24"><path d="M12 2.500l2.900 6.100 6.600.8-4.900 4.600 1.300 6.600L12 17.300 6.100 20.600l1.300-6.600L2.500 9.400l6.600-.8z" fill="none" stroke="#6bb7ff" stroke-width="1.800"/></svg></div><div><span id="rs_c2"></span><svg><use href="#c-silv"/></svg></div></div>
<button class="cart" id="rs_cart"><svg viewBox="0 0 24 24"><path d="M2 3h3l2.500 12h11l2-8H6.500M9 20h.1M17 20h.1"/></svg></button>
<div class="st"><div>Урон<b><span id="rs_d"></span><svg viewBox="0 0 24 24" fill="none" stroke="#e8edf0" stroke-width="1.800"><path d="M3 12h13M12 6l6 6-6 6M19 4v16"/></svg></b></div><div>Итого кредитов<b><span id="rs_ct"></span><svg><use href="#c-silv"/></svg></b></div><div>Уничтожено<b><span id="rs_k"></span><svg viewBox="0 0 24 24" fill="none" stroke="#e8edf0" stroke-width="1.800"><path d="M2 14l8-8 6 3-2 3 6 5M4 18h16M5 10l11 4"/></svg></b></div></div>
<div class="bt"><div class="m"><b id="rs_map"></b><span>Встречный бой</span></div><div class="t"><i id="rs_tr"></i><svg class="tn" viewBox="0 0 24 24"><use href="#i-tank"/></svg><div><b id="rs_tn"></b><span id="rs_ts"></span></div></div><div class="d"><b id="rs_dt"></b><span id="rs_tm"></span></div><button id="rs_rp"><svg viewBox="0 0 24 24"><path d="M3 4h18v16H3zM8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5M10 9l5 3-5 3z"/></svg></button></div>`;
document.body.appendChild(rs);
const p2=n=>String(n).padStart(2,'0');
const oEnd=window.endBattle;
if(typeof oEnd=='function')window.endBattle=function(win){
 if(BEND||inHangar)return;const sn=JSON.stringify(ECO),cr0=ECO.cr,xp0=ECO.xp||0,alive=!!(P&&P.alive),dmg=DMG,kl=kills;oEnd(win);
 const r0=$('res');if(r0){r0.style.display='none';r0.classList.remove('on')}
 const cr=ECO.cr-cr0,xp=(ECO.xp||0)-xp0,cat=P&&P.cat||{},now=new Date(),s=(()=>{try{return JSON.parse(localStorage.getItem('maus_session'))}catch(_){return null}})();
 rs.className='on '+(win?'win':'lose');$('rs_n').textContent=s&&s.nick||'Игрок';
 $('rs_t').textContent=win?'Победа!':'Поражение';$('rs_s').textContent=win?'Вся техника противника уничтожена':'Вся ваша техника уничтожена';
 const ms=MED.filter(m=>m[1]({kills:kl,dmg,alive,win})).slice(0,6);$('rs_m').innerHTML=ms.length?ms.map(medal).join(''):'';$('rs_m').style.visibility=ms.length?'visible':'hidden';
 $('rs_x1').textContent=$('rs_x2').textContent=F(xp);$('rs_c1').textContent=$('rs_c2').textContent=F(cr);
 $('rs_d').textContent=F(dmg);$('rs_ct').textContent=F(cr);$('rs_k').textContent=kl;
 const mp=(typeof MAPS!='undefined'&&MAPS.find(m=>m.id==curMap))||{name:'Полигон'};$('rs_map').textContent=mp.name;
 $('rs_tr').textContent=ROM[cat.tier||P&&P.tier||1];$('rs_tn').textContent=cat.name||'Maus';$('rs_ts').textContent=alive?'Выжил':'Уничтожен';
 $('rs_dt').textContent=p2(now.getDate())+'.'+p2(now.getMonth()+1)+'.'+now.getFullYear();$('rs_tm').textContent=p2(now.getHours())+':'+p2(now.getMinutes())+':'+p2(now.getSeconds());
 if(ONL()){const o=JSON.parse(sn);Object.keys(ECO).forEach(k=>delete ECO[k]);Object.assign(ECO,o);hCredits();   /* онлайн: награду и исход считает сервер */
  const show=r=>{applyEco(r.eco);window.SRV_STATS=r.stats;const R=r.reward||{};$('rs_t').textContent=r.win===undefined?$('rs_t').textContent:(r.win?'Победа!':'Поражение');
   rs.className='on '+((r.win===undefined?win:r.win)?'win':'lose');$('rs_x1').textContent=$('rs_x2').textContent=F(R.xp||0);$('rs_c1').textContent=$('rs_c2').textContent=$('rs_ct').textContent=F(R.cr||0);
   $('rs_d').textContent=F(r.dmg!=null?r.dmg:dmg);$('rs_k').textContent=r.kills!=null?r.kills:kl},fail=()=>tst('Нет связи с сервером: награда не начислена');
  if(window.NET&&NET.on){let n=0;const w=()=>{if(NET.res){const r=NET.res;if(r.err)return fail();show(r);return}if(++n>40)return fail();setTimeout(w,250)};w()}
  else if(window.BT){const t=window.BT;window.BT=null;window.mausCall('battle/end',{ticket:t,win:!!win,dmg,kills:kl,map:mp.id||''}).then(show).catch(e=>tst(e.message||'Нет связи с сервером'))}
  else fail()}};
const oRB=window.rewardBattle;if(typeof oRB=='function')window.rewardBattle=function(k){if(ONL())return;return oRB(k)};
$('rs_h').onclick=()=>{rs.className='';$('rgo').click()};
$('rs_rp').onclick=$('rs_cart').onclick=()=>{if(typeof toast=='function')toast('Недоступно')};
rs.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{if(typeof toast=='function'&&!b.classList.contains('on'))toast('Скоро')});

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
 <div class="tr">${pv?`<div class="card sm" style="left:calc(env(safe-area-inset-left,0px) + 3vh);top:7vh">${tIco(pv)}<span class="tx">${ROM[pv.tier]}</span><b>${pv.name}</b>${CK.replace('class="ck"','class="ck" style="right:-1vh;bottom:-1vh"')}</div><div class="ln" style="left:calc(env(safe-area-inset-left,0px) + 37vh);width:7vh;top:17vh;height:.25vh"></div>`:''}
  <div class="card cu" style="left:calc(env(safe-area-inset-left,0px) + 46vh);top:0">${tIco(c)}<span class="tx">◆ ${R}</span><b>${c.name}</b><small>${({'ТТ':'Тяжёлый танк','СТ':'Средний танк','ЛТ':'Лёгкий танк','ПТ':'ПТ-САУ'})[c.cls]||c.cls||''}</small>${CK.replace('class="ck"','class="ck" style="right:-1.4vh;bottom:-1.4vh"')}</div></div>
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
const g=$('a_guest');if(g)g.onclick=()=>{try{localStorage.setItem('maus_session',JSON.stringify({nick:'Гость',token:'',guest:true}))}catch(_){}$('auth').classList.remove('on');const n=$('hnick');if(n)n.textContent='Гость'};
})();
