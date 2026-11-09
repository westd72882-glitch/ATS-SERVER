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
const LOCAL=!!window.ATS_LOCAL||!window.API_URL;
const api=()=>window.API_URL||'';
const host=()=>{try{return new URL(api()).host}catch(_){return api()}};
async function ping(){if(!api())return null;const t=performance.now();try{const c=new AbortController(),to=setTimeout(()=>c.abort(),3000);const r=await fetch(api()+'/api/version',{cache:'no-store',signal:c.signal});clearTimeout(to);return(r.ok||r.status==426)?Math.round(performance.now()-t):-1}catch(_){return -1}}
async function render(){
 const G=(()=>{try{return !!JSON.parse(localStorage.getItem('maus_session')).guest}catch(_){return false}})();
 if(LOCAL){$('nst').textContent='Локальный режим · без сервера';$('nsh').style.display='none';
  $('nsl').innerHTML='<div class="ns on"><span>Игра работает на устройстве<br><small>Аккаунт, ангар и прогресс хранятся в памяти телефона. Бои проходят против ботов.</small></span><i>✓</i></div>';return}
 $('nsh').style.display='';$('nst').textContent=G?'Оффлайн · гостевой режим (боты)':'Проверка связи…';
 $('nsl').innerHTML='<div class="ns on"><span>'+host()+'<br><small>Проверка…</small></span><i></i></div>';
 const p=G?null:await ping();
 $('nst').textContent=G?'Оффлайн · гостевой режим (боты)':(p===null?'Сервер не настроен':p<0?'Нет связи с сервером':'Онлайн · '+p+' мс');
 $('nsl').innerHTML='<div class="ns on"><span>'+host()+'<br><small>'+(p===null||p<0?'Недоступен':'Онлайн · '+p+' мс')+'</small></span><i>'+(p>=0&&p!==null?'✓':'')+'</i></div>'}
$('nacc').onclick=()=>{try{localStorage.removeItem('maus_session')}catch(_){}location.reload()};
$('nex').onclick=()=>$('exq').classList.add('on');
$('stabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.t=='pn')render()});
})();
