/* Профиль, статистика, диалог выхода (Esc / кнопка «Назад» на Android) */
(function(){
const $=id=>document.getElementById(id),K='maus_stats';
const ld=()=>{if(window.SRV_STATS&&window.ONL&&ONL())return Object.assign({b:0,w:0,dmg:0,xp:0,mk:0,m:0,mt:0},window.SRV_STATS);try{return Object.assign({b:0,w:0,dmg:0,xp:0,mk:0,m:0,mt:0},JSON.parse(localStorage.getItem(K))||{})}catch(_){return{b:0,w:0,dmg:0,xp:0,mk:0,m:0,mt:0}}};
const sv=s=>{try{localStorage.setItem(K,JSON.stringify(s))}catch(_){}};
const fm=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+$)/g,' ');
/* учёт боёв */
if(typeof endBattle=='function'){const o=endBattle;endBattle=function(win){if(!BEND&&!inHangar){const s=ld();s.b++;if(win)s.w++;s.dmg+=DMG||0;s.xp+=Math.round(((DMG||0)*1.2+kills*1000+(win?6000:1500))/2);s.mk=Math.max(s.mk,kills);sv(s)}return o(win)}}
function nick(){try{return JSON.parse(localStorage.getItem('maus_session')).nick}catch(_){return'Танкист'}}
function fill(){const s=ld();$('pnick').textContent=nick();
 const it=[['Бои',s.b],['Победы',(s.b?s.w/s.b*100:0).toFixed(2)+'%'],['Средний урон за бой',s.b?fm(s.dmg/s.b):'0'],['Точность стрельбы','--'],['Средний опыт за бой',s.b?fm(s.xp/s.b):'--'],['Воинская честь','☆☆☆☆☆'],['Максимум уничтожено за бой',s.mk],['Танки со знаком «Мастер»','0/0']];
 $('pgrid').innerHTML=it.map(x=>'<div><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join('')}
const open=()=>{fill();$('prof').classList.add('on')},close=()=>{$('prof').classList.remove('on');$('pnr').style.display='none'};
$('hprof').onclick=open;$('pback').onclick=close;
$('pava').onclick=()=>{if(typeof toast=='function')toast('Смена аватара пока недоступна')};
$('pchn').style.display='none';
$('pnok').onclick=async()=>{const v=$('pni').value.trim(),T=m=>{if(typeof toast=='function')toast(m)};
 if(!/^[\p{L}\p{N}_\-]{3,16}$/u.test(v)){T('Ник: 3–16 символов');return}if(v==nick()){T('Это ваш текущий ник');return}
 if(ECO.au<750){T('Не хватает золота: смена ника стоит 750');return}
 const fin=n=>{try{const s=JSON.parse(localStorage.getItem('maus_session'))||{};s.nick=n;localStorage.setItem('maus_session',JSON.stringify(s))}catch(_){}
  $('hnick').textContent=n;$('pnick').textContent=n;$('pnr').style.display='none';hCredits();T('Ник изменён (−750 золота)')};
 if(typeof ONL=='function'&&ONL()){try{const r=await window.mausCall('nick',{nick:v});if(typeof applyEco=='function')applyEco(r.eco);else{ECO.au=r.eco.au}fin(r.nick)}catch(e){T(e.message||'Ошибка')}return}
 ECO.au-=750;try{localStorage.setItem('maus_eco2',JSON.stringify(ECO))}catch(_){}fin(v)};
/* выход */
const ex=$('exq'),shown=()=>ex.classList.contains('on');
let _bt=0;function back(){const n=Date.now();if(n-_bt<700)return;_bt=n;if($('auth').classList.contains('on')&&!shown()){ex.classList.add('on');return}
 if(shown()){ex.classList.remove('on');return}
 if($('prof').classList.contains('on')){close();return}
 ex.classList.add('on')}
$('exn').onclick=()=>ex.classList.remove('on');
$('exy').onclick=()=>{try{const A=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App;if(A&&A.exitApp)return A.exitApp()}catch(_){}window.close()};
addEventListener('keydown',e=>{if(e.key=='Escape'){e.preventDefault();back()}});
document.addEventListener('backbutton',e=>{e.preventDefault();back()});
try{const A=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App;if(A&&A.addListener)A.addListener('backButton',back)}catch(_){}
})();
