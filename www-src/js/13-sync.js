/* Облачная синхронизация: версия, сохранение (танки/деньги/настройки), бои */
(function(){
const API=window.API_URL||'',VER=window.APP_VERSION||'0',SK='maus_session';
if(!API)return;
const gs=()=>{try{return JSON.parse(localStorage.getItem(SK))}catch(_){return null}};
const OK=k=>/^maus_/.test(k)&&!/^maus_(session|users|pend_)/.test(k);
const call=async(p,body)=>{const s=gs(),h={'Content-Type':'application/json','X-App-Version':VER};if(s&&s.token)h.Authorization='Bearer '+s.token;
 const r=await fetch(API+'/api/'+p,{method:'POST',headers:h,body:JSON.stringify(body||{})});const j=await r.json().catch(()=>({}));
 if(r.status==426)block(j.version);if(r.status==401&&j.relogin){try{localStorage.removeItem(SK)}catch(_){}location.reload()}
 if(!r.ok)throw new Error(j.error||'Ошибка сервера');return j};
window.mausCall=call;
function block(v){if(document.getElementById('vblock'))return;const d=document.createElement('div');d.id='vblock';
 d.style.cssText='position:fixed;inset:0;z-index:99999;background:#0b0f14;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font:18px sans-serif;text-align:center;padding:24px';
 d.innerHTML='<h2>Требуется обновление</h2><p>Версия игры '+VER+', сервер '+(v||'новее')+'.<br>Скачайте новую версию APK.</p>';document.body.appendChild(d)}
/* проверка версии при запуске */
{const L=document.getElementById('ltxt');if(L&&!(window.loadProg&&loadProg.n))L.textContent='Подключение к серверу…'}
fetch(API+'/api/version').then(r=>r.json()).then(j=>{if(j.version&&j.version!==VER)block(j.version)}).catch(()=>{const L=document.getElementById('ltxt');if(L&&!(window.loadProg&&loadProg.n))L.textContent='Сервер недоступен, офлайн-режим'});
/* пуш сохранения (дебаунс) */
let tm=null,applying=false;
const snap=()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(OK(k))o[k]=localStorage.getItem(k)}return o};
const push=()=>{const s=gs();if(!s||!s.token||applying)return;call('save/put',{data:snap()}).catch(()=>{})};
const sched=()=>{clearTimeout(tm);tm=setTimeout(push,2500)};
const si=Storage.prototype.setItem,ri=Storage.prototype.removeItem;
Storage.prototype.setItem=function(k,v){si.call(this,k,v);if(OK(k))sched()};
Storage.prototype.removeItem=function(k){ri.call(this,k);if(OK(k))sched()};
addEventListener('pagehide',()=>{const s=gs();if(s&&s.token&&tm){try{fetch(API+'/api/save/put',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json','X-App-Version':VER,Authorization:'Bearer '+s.token},body:JSON.stringify({data:snap()})})}catch(_){}}});
/* пулл при старте/после входа: сервер главнее; если отличается — применить и перезагрузить */
const HG=()=>typeof inHangar!='undefined'&&inHangar&&window.ldStatus;
window.mausPull=async function(){const s=gs();if(!s||!s.token)return;
 try{if(HG())ldStatus('Синхронизация с сервером…',40);else{const L=document.getElementById('ltxt');if(L&&!(window.loadProg&&loadProg.n))L.textContent='Синхронизация с сервером…'}const r=await call('save/get');const sv=r.save;
  if(!sv){push();return}
  const loc=snap(),d=sv.data;let diff=false;for(const k of Object.keys(d))if(loc[k]!==d[k])diff=true;for(const k of Object.keys(loc))if(!(k in d))diff=true;
  if(diff){applying=true;for(const k of Object.keys(loc))if(!(k in d))ri.call(localStorage,k);for(const k of Object.keys(d))si.call(localStorage,k,d[k]);
   if(!sessionStorage.getItem('maus_rl')){sessionStorage.setItem('maus_rl','1');location.reload();return}applying=false}
  sessionStorage.removeItem('maus_rl');if(HG()){ldStatus('Синхронизация завершена',100);setTimeout(()=>{try{hideLoader()}catch(_){}},400)}}catch(e){if(HG()){ldStatus('Не удалось синхронизироваться, продолжаем офлайн',100);setTimeout(()=>{try{hideLoader()}catch(_){}},1200)}}};
/* Ожидание сервера перед входом в игру (Render «просыпается» до ~60 с) */
const ping=async(ms)=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),ms||8000);try{const r=await fetch(API+'/api/version',{cache:'no-store',signal:c.signal});return r.ok||r.status==426}catch(_){return false}finally{clearTimeout(t)}};
window.srvGateFn=async function(){const s=gs();if(!(s&&s.token&&!s.guest))return;
 const L=document.getElementById('ltxt'),ld=document.getElementById('ldr');let off=false,t0=Date.now(),btn=null;
 const say=t=>{if(L){L.style.display='';L.textContent=t}};
 while(!off){const sec=Math.round((Date.now()-t0)/1000);
  say(navigator.onLine===false?'Нет подключения к интернету…':sec<5?'Подключение к серверу…':'Сервер запускается, подождите… '+sec+' с');
  
  if(await ping(8000))break;await new Promise(r=>setTimeout(r,1500))}
 if(btn)btn.remove();if(off)return;
 say('Синхронизация данных…');try{await window.mausPull()}catch(_){}};
/* Потеря связи: отключаем от игры */
(function(){let bad=0,shown=false;const lost=()=>{if(shown)return;shown=true;try{if(window.NET&&NET.ws)NET.ws.close()}catch(_){}
  const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:99998;background:#000d;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3vh;font:700 3.4vh system-ui;text-align:center';
  d.innerHTML='<div>Соединение с сервером потеряно</div><button style="padding:2vh 7vh;border:0;border-radius:.6vh;background:#d9482a;color:#fff;font:800 3vh system-ui">Переподключиться</button>';
  d.querySelector('button').onclick=()=>location.reload();document.body.appendChild(d)};
 addEventListener('offline',()=>{if(gs()&&gs().token)lost()});
 let pinging=false;setInterval(async()=>{if(pinging)return;const s=gs();if(!(s&&s.token&&!s.guest)||document.hidden)return;pinging=true;try{if(await ping(6000))bad=0;else if(++bad>=2)lost()}finally{pinging=false}},15000)})();
if(!(gs()&&gs().token))mausPull();
})();
