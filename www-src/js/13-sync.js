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
fetch(API+'/api/version').then(r=>r.json()).then(j=>{if(j.version&&j.version!==VER)block(j.version)}).catch(()=>{});
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
window.mausPull=async function(){const s=gs();if(!s||!s.token)return;
 try{const r=await call('save/get');const sv=r.save;
  if(!sv){push();return}
  const loc=snap(),d=sv.data;let diff=false;for(const k of Object.keys(d))if(loc[k]!==d[k])diff=true;for(const k of Object.keys(loc))if(!(k in d))diff=true;
  if(diff){applying=true;for(const k of Object.keys(loc))if(!(k in d))ri.call(localStorage,k);for(const k of Object.keys(d))si.call(localStorage,k,d[k]);
   if(!sessionStorage.getItem('maus_rl')){sessionStorage.setItem('maus_rl','1');location.reload();return}applying=false}
  sessionStorage.removeItem('maus_rl')}catch(e){}};
mausPull();
})();
