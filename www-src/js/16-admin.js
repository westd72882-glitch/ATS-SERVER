/* Админ-панель: доступна только аккаунту Ats_Admin. Сервер сам проверяет права на каждый вызов. */
(function(){
const $=id=>document.getElementById(id);
const nick=()=>{try{return (JSON.parse(localStorage.getItem('maus_session'))||{}).nick||''}catch(_){return''}};
const isAdmin=()=>nick().toLowerCase()==='ats_admin';
const fmt=n=>n==null?'—':String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');

function paintBtn(){const b=$('padm');if(b)b.style.display=isAdmin()?'':'none'}
paintBtn();
const mo=new MutationObserver(paintBtn);
try{mo.observe(document.getElementById('hnick')||document.body,{childList:true,subtree:true})}catch(_){}

async function call(path,body){
 if(typeof window.mausCall!=='function')throw new Error('Нет связи с сервером');
 return window.mausCall('admin/'+path,body||{});
}

let busy=false;
async function render(q){
 const l=$('adl');l.innerHTML='<p class="emp2">Загрузка…</p>';
 try{
  const r=await call('users',{q:q||''});
  if(!r.users.length){l.innerHTML='<p class="emp2">Никого не найдено</p>';return}
  l.innerHTML=r.users.map(u=>{
   const banned=u.banned;
   return '<div class="adr'+(banned?' b':'')+'" data-n="'+u.nick.replace(/"/g,'&quot;')+'">'
    +'<div class="adi"><b>'+u.nick+'</b><small>боёв '+(u.battles||0)+' · побед '+(u.wins||0)+' · '+fmt(u.cr)+' кр · '+fmt(u.au)+' зол'
    +(banned?' · заблокирован: '+(banned.reason||'')+'':'')+'</small></div>'
    +'<div class="ada">'
    +(banned?'<button data-act="unban" class="mqb">Разбан</button>':'<button data-act="ban" class="mqb danger">Бан</button>')
    +'<button data-act="grant" class="mqb">Выдать</button>'
    +'<button data-act="kick" class="mqb">Кикнуть</button>'
    +'</div></div>';
  }).join('');
 }catch(e){l.innerHTML='<p class="emp2">'+(e.message||'Ошибка')+'</p>'}
}

$('adx').onclick=()=>$('adm').classList.remove('on');
$('padm').onclick=()=>{if(!isAdmin())return;$('adm').classList.add('on');$('ads').value='';render('')};
let t0;$('ads').addEventListener('input',()=>{clearTimeout(t0);t0=setTimeout(()=>render($('ads').value),300)});

$('adl').addEventListener('click',async e=>{
 const b=e.target.closest('button[data-act]');if(!b||busy)return;
 const row=b.closest('.adr'),n=row.dataset.n,act=b.dataset.act;
 busy=true;b.disabled=true;
 try{
  if(act==='ban'){
   const reason=prompt('Причина блокировки (необязательно):','')||'';
   await call('ban',{nick:n,reason});
  }else if(act==='unban'){
   await call('unban',{nick:n});
  }else if(act==='kick'){
   await call('kick',{nick:n});
  }else if(act==='grant'){
   const cr=prompt('Выдать кредитов (оставьте пустым, чтобы не менять):','');
   const au=prompt('Выдать золота (оставьте пустым, чтобы не менять):','');
   const body={nick:n};if(cr!==null&&cr.trim()!=='')body.cr=+cr;if(au!==null&&au.trim()!=='')body.au=+au;
   await call('grant',body);
  }
  await render($('ads').value);
 }catch(err){alert(err.message||'Ошибка')}
 finally{busy=false}
});
})();
