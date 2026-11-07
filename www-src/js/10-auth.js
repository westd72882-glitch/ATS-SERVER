/* Регистрация/вход. API_URL — адрес сервера (папка server/). Пустой = демо-режим на устройстве (код показывается на экране). */
(function(){
const API_URL=window.API_URL||'',$=id=>document.getElementById(id);let mode='in',step=0,pend=null;
const er=(t,ok)=>{const e=$('a_er');e.textContent=t||'';e.className='er'+(ok?' ok':'')};
const lsG=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(_){return null}},lsS=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
async function hash(p,s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s+':'+p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function api(path,body){
 if(API_URL){er('Подключение к серверу… (первый запрос может занять до минуты)',true);dbg('api '+path);const r=await fetch(API_URL+'/api/'+path,{method:'POST',headers:{'Content-Type':'application/json','X-App-Version':window.APP_VERSION||'0'},body:JSON.stringify(body)}).catch(e=>{throw new Error(e&&e.name=='AbortError'?'Сервер не отвечает (таймаут). Попробуйте ещё раз или играйте гостем':'Нет связи с сервером')});const j=await r.json().catch(()=>({}));er('');if(!r.ok)throw new Error(j.error||'Ошибка сервера ('+r.status+')');return j}
 /* демо-режим */
 const U=lsG('maus_users')||{};
 if(path=='register'){if(U[body.nick.toLowerCase()])throw new Error('Ник занят');U[body.nick.toLowerCase()]={nick:body.nick,h:await hash(body.password,body.nick.toLowerCase())};lsS('maus_users',U);return{nick:body.nick,token:'local'}}
 if(path=='login'){const k=body.login.trim().toLowerCase(),u=U[k];if(!u||u.h!=await hash(body.password,u.nick.toLowerCase()))throw new Error('Неверный ник или пароль');return{nick:u.nick,token:'local'}}
}
function bootLoad(){try{const l=$('ldr');if(!l||l.style.display!='none')return;showLoader('','Загрузка профиля…');setBar(0);setTimeout(()=>setBar(100,2300),60);setTimeout(()=>{$('ltxt').textContent='Вход в ангар…'},1500);setTimeout(hideLoader,2500)}catch(_){}}
function done(r){lsS('maus_session',{nick:r.nick,token:r.token});if(window.startGame&&!startGame.on)startGame();else{bootLoad();if(window.mausPull)setTimeout(window.mausPull,50)}$('auth').classList.remove('on');$('auth').classList.add('sp');const n=$('hnick');if(n)n.textContent=r.nick}
function ui(){const up=mode=='up';for(const[i,v]of[['a_mail',false],['a_pass2',up],['a_code',false],['a_nick',!step],['a_pass',!step]]){$(i).style.display=$('l_'+i).style.display=v?'':'none'}
 $('a_re').style.display='none';$('a_agw').style.display=up?'':'none';
 $('a_go').textContent=up?'Зарегистрироваться':'Войти';$('a_h').textContent=up?'РЕГИСТРАЦИЯ В ATS BLITZ':'ВОЙТИ В ATS BLITZ';$('a_sw').textContent=up?'Уже есть аккаунт? Войти':'Нет аккаунта? Регистрация';$('a_pass').autocomplete=up?'new-password':'current-password';
 $('a_nick').placeholder='Никнейм';document.querySelectorAll('#auth .at button').forEach(b=>b.classList.toggle('on',b.dataset.m==mode))}
document.querySelectorAll('#auth .at button').forEach(b=>b.onclick=()=>{mode=b.dataset.m;step=0;er();ui()});
async function sendCode(){const r=await api('register',pend);er(r.demoCode?'Демо-режим: ваш код '+r.demoCode:'Код отправлен на '+pend.email,true)}
$('a_sw').onclick=()=>{mode=mode=='in'?'up':'in';step=0;er();ui()};
$('auth').addEventListener('click',e=>{const A=$('auth');if(A.classList.contains('sp')&&!e.target.closest('#a_lic,#a_back'))A.classList.remove('sp')});
const eu=$('eula');$('a_lic').addEventListener('click',e=>{if(e.target.closest('u')){e.stopPropagation();eu.classList.add('on')}});$('e_ok').onclick=()=>eu.classList.remove('on');
{const l=document.createElement('label');l.id='a_agw';l.innerHTML='<input type="checkbox" id="a_ag"> Я принимаю <u id="a_agl">пользовательское соглашение</u>';$('a_go').parentNode.insertBefore(l,$('a_go'));$('a_agl').onclick=e=>{e.preventDefault();eu.classList.add('on')}}
{const o=document.createElement('button');o.id='a_off';o.type='button';o.textContent='Играть офлайн';$('a_go').parentNode.appendChild(o);o.onclick=()=>{er();window.OFFLINE_MODE=true;$('auth').classList.remove('on');$('auth').classList.add('sp');if(window.startGame)startGame()}}
$('a_back').onclick=()=>{er();$('auth').classList.add('sp')};
$('a_re').onclick=async()=>{try{await sendCode()}catch(e){er(e.message)}};
$('af').onsubmit=async ev=>{ev.preventDefault();er();const nick=$('a_nick').value.trim(),pass=$('a_pass').value;$('a_go').disabled=true;
 try{
  if(mode=='in'){if(!nick||!pass)throw new Error('Введите ник и пароль');done(await api('login',{login:nick,password:pass}));return}
  if(!/^[\p{L}\p{N}_\-]{3,16}$/u.test(nick))throw new Error('Ник: 3–16 символов, буквы, цифры, _ и -');
  if(!$('a_ag').checked)throw new Error('Примите пользовательское соглашение');try{localStorage.setItem('maus_eula','7.11.2026')}catch(_){}
  if(pass.length<6)throw new Error('Пароль минимум 6 символов');if(pass!==$('a_pass2').value)throw new Error('Пароли не совпадают');
  done(await api('register',{nick,password:pass}));
 }catch(e){er(e.message||'Ошибка сети')}finally{$('a_go').disabled=false}};
document.querySelectorAll('#af input').forEach(i=>i.addEventListener('focus',()=>setTimeout(()=>{try{i.scrollIntoView({block:'center'})}catch(_){}},350)));
let s=lsG('maus_session');if(s&&s.guest){try{localStorage.removeItem('maus_session')}catch(_){}s=null}ui();if(!API_URL)er('Сервер не подключён: аккаунт сохранится только на этом устройстве',true);if(s&&s.nick){const n=$('hnick');if(n)n.textContent=s.nick;if(window.startGame)startGame()}else{$('auth').classList.add('on','sp')}
})();
