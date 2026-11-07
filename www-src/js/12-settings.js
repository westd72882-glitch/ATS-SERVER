/* Аватарки + вкладка «СЕТЬ» в настройках */
(function(){
const $=id=>document.getElementById(id),L=k=>{try{return localStorage.getItem(k)}catch(_){return null}},S=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
const g=$('avg');
const paint=()=>AV.paint();
const draw=()=>{g.innerHTML=AV.own().map(id=>'<button data-i="'+id+'" class="r'+AV.get(id).r+'">'+AV.svg(id)+'</button>').join('')};
const mark=()=>g.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.i==AV.sel()));
g.onclick=e=>{const b=e.target.closest('button');if(!b)return;AV.setSel(b.dataset.i);paint();mark()};
const open=()=>{draw();mark();$('avp').classList.add('on')};
$('pava').onclick=open;$('avx').onclick=()=>$('avp').classList.remove('on');
/* кнопка профиля в ангаре открывает профиль (11-profile уже вешает onclick) */
paint();
/* сеть */
const SRV=[{id:'ru',n:'RU-1 Москва',r:'Онлайн'},{id:'eu',n:'EU-1 Франкфурт',r:'Онлайн'}];
let cur=L('maus_srv')||'ru',off=L('maus_off')=='1';
const api=()=>window.API_URL||'';
async function ping(){if(!api())return null;const t=performance.now();try{const c=new AbortController(),to=setTimeout(()=>c.abort(),3000);await fetch(api()+'/api/login',{method:'OPTIONS',signal:c.signal});clearTimeout(to);return Math.round(performance.now()-t)}catch(_){return -1}}
async function render(){
 const G=(()=>{try{return !!JSON.parse(localStorage.getItem('maus_session')).guest}catch(_){return false}})(),p=G?null:await ping();
 $('nst').textContent=G?'Оффлайн · гостевой режим (боты)':(p===null?'Сервер не настроен':p<0?'Нет связи с сервером':'Онлайн · '+p+' мс');
 $('nco').textContent=off?'Подключиться':'Отключиться';
 $('nsl').innerHTML=SRV.map(s=>'<button class="ns'+(s.id==cur?' on':'')+'" data-s="'+s.id+'"><span>'+s.n+'<br><small>'+s.r+'</small></span><i>'+(s.id==cur?'✓':'')+'</i></button>').join('')}
$('nsl').onclick=e=>{const b=e.target.closest('button');if(!b)return;cur=b.dataset.s;S('maus_srv',cur);if(cur!='local'&&off){off=false;S('maus_off','0')}render();if(typeof toast=='function')toast('Сервер: '+SRV.find(s=>s.id==cur).n)};
$('nco').onclick=()=>{off=!off;S('maus_off',off?'1':'0');render();if(typeof toast=='function')toast(off?'Отключено от сети':'Подключено')};
$('nacc').onclick=()=>{try{localStorage.removeItem('maus_session')}catch(_){}location.reload()};
$('nex').onclick=()=>$('exq').classList.add('on');
$('stabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.t=='pn')render()});
})();
