/* ===== запуск и главный цикл ===== */
const fb=$('fire'),ret=$('ret');let last=0;
function wreckFx(T,dt){T.dead>0&&(Math.random()<dt*22)&&smoke.emit(T.x+R2()*3,T.root.position.y+2.5,T.z+R2()*3,R2(),2+Math.random()*2,R2(),3,2,2.5,[.12,.12,.12],.7);
 if(T.dead>4&&Math.random()<dt*10)fire.emit(T.x+R2()*3,T.root.position.y+2.4,T.z+R2()*3,0,2.5,0,.5,2.5,1,[1,.45,.1],.8)}
const mm=$('mm').getContext('2d');
function minimap(){if((_mmf=(_mmf+1)%2))return;const w=300,k=w/430;mm.clearRect(0,0,w,w);mm.save();mm.translate(w/2,w/2);mm.rotate(cy);   /* карта повёрнута по камере: вверх = куда смотришь */
 mm.translate(-P.x*k,-P.z*k);mm.strokeStyle='#fff6';mm.lineWidth=3;mm.strokeRect(-200*k,-200*k,400*k,400*k);mm.fillStyle='#fff3';cols.forEach(c=>{mm.beginPath();mm.arc(c.x*k,c.z*k,Math.max(2.5,c.r*k),0,6.3);mm.fill()});
 ENEMIES.forEach(e=>{if(!e.alive)return;mm.fillStyle=e.team=='A'?'#4a9be0':'#e0483a';mm.fillRect(e.x*k-8,e.z*k-8,16,16)});mm.restore();
 mm.save();mm.translate(w/2,w/2);mm.rotate(cy-P.h);mm.fillStyle='#5fcf6a';mm.beginPath();mm.moveTo(0,-14);mm.lineTo(10,11);mm.lineTo(-10,11);mm.fill();mm.restore();
 mm.strokeStyle='#fff8';mm.lineWidth=2;mm.beginPath();mm.moveTo(w/2,w/2);mm.lineTo(w/2,12);mm.stroke()}
let MED=0;
/* засвет: вражеский танк виден, только если до него есть прямая видимость (или он рядом / только что стрелял); после потери — ещё ~2.5 с */
function losClear(e){const ax=P.x,az=P.z,ay=P.root.position.y+2.4,bx=e.x,bz=e.z,by=e.root.position.y+1.8,d=Math.hypot(bx-ax,bz-az),n=Math.max(2,Math.ceil(d/3));
 for(let i=1;i<n;i++){const k=i/n,x=ax+(bx-ax)*k,z=az+(bz-az)*k,y=ay+(by-ay)*k;if(y<H(x,z))return false;for(const c of cols){const dx=x-c.x,dz=z-c.z;if(Math.abs(dx)>c.r||Math.abs(dz)>c.r)continue;if(y<c.h&&dx*dx+dz*dz<c.r*c.r)return false}}return true}
function spotUpdate(e,dt){if(!e.alive||e.team===P.team||!P.alive||BEND){e.spot=true;if(e.alive)e.root.visible=true;return}
 e.spt=(e.spt||0)-dt;e.chk=(e.chk||0)-dt;const d=Math.hypot(e.x-P.x,e.z-P.z);
 if(e.chk<=0){e.chk=.18+Math.random()*.08;if(d<45||(d<445&&losClear(e)))e.spt=2.5}
 if(e.fl>0&&d<445)e.spt=Math.max(e.spt,1.2);
 e.spot=e.spt>0;e.root.visible=e.spot}
function teamHud(dt){S.bt=(S.bt||0)+dt;const A=[P,...ENEMIES.filter(e=>e.team=='A')],B=ENEMIES.filter(e=>e.team=='B');
 const row=(T,me)=>`<div class="tr${T.alive?'':' d'}${me?' me':''}">${ROM[T.tier]||''}<i></i></div>`,key=A.map(t=>t.alive|0).join('')+B.map(t=>t.alive|0).join('');
 if(teamHud.k!==key){teamHud.k=key;$('tl').innerHTML=A.map((t,i)=>row(t,i==0)).join('');$('tr').innerHTML=B.map(t=>row(t)).join('');
  const dm=L=>L.map(t=>'<u'+(t.alive?'':' class=d')+'></u>').join('');$('da').innerHTML=dm(A);$('db').innerHTML=dm(B);
  $('sa').textContent=B.filter(t=>!t.alive).length;$('sb').textContent=A.filter(t=>!t.alive).length}
 const r=Math.max(0,420-S.bt|0);$('clk').textContent=(r/60|0)+':'+String(r%60).padStart(2,'0');
 MED=Math.max(0,MED-dt);0}
let _dty=0,_dgp=0,_rdd=0,_mmf=0;function updateDisp(dt){if(!P.disp)P.disp=.0045;const rate=(Math.abs(wrap(P.ty-_dty))+Math.abs(P.gp-_dgp))/Math.max(dt,.001);_dty=P.ty;_dgp=P.gp;
 const tg=.0045+.006*Math.min(1,Math.abs(P.v)/(P.vm||6))+.005*Math.min(1,Math.abs(P.w)/.6)+.006*Math.min(1,rate/.9);
 P.disp+=(tg-P.disp)*Math.min(1,dt*(tg>P.disp?8:1.6))}
function hud(dt){
 $('spd').textContent=Math.round(Math.abs(P.v)*3.6);
 const f=P.hp/P.maxhp;$('hpfill').style.width=f*100+'%';$('hpfill').style.background=f>.5?'var(--grn)':f>.25?'#e8b33a':'var(--red)';$('hptxt').textContent=Math.ceil(P.hp)+' / '+P.maxhp;{const hb=$('hpfill').parentNode;hb.style.visibility=P.alive?'visible':'hidden'}
 const q=P.rl/(P.rlm||P.cat.rel);fb.style.background=q>0?`conic-gradient(#0000 ${q*360}deg,#e8b33a 0)`:'none';fb.style.borderRadius='50%';
 teamHud(dt);ENEMIES.forEach(e=>{const t=e.tag;spotUpdate(e,dt);if(!e.alive){t.style.display='none';return}const v=e.root.position.clone();v.y+=e.box.y1+1.5;const s=toScreen(v),d=Math.hypot(e.x-P.x,e.z-P.z);
  if(s.vis&&d<300&&e.spot){const k=cl(1.3-d/190,.5,1.15);t.style.display='block';t.style.transform=`translate(${s.x}px,${s.y-innerHeight*.045}px) scale(${k.toFixed(2)})`;t.lastChild.firstChild.style.width=e.hp/e.maxhp*100+'%';t.firstElementChild.style.setProperty('--f',(cl(e.hp/e.maxhp,0,1)*100).toFixed(1)+'%');t.firstElementChild.textContent=Math.ceil(e.hp)+'/'+e.maxhp}else t.style.display='none'});
 /* прицел орудия — в точке реального попадания снаряда */
 if(P.alive){updateDisp(dt);const r=impactPoint();let rp=r.p;{const dv=rp.clone().sub(cam.position),mx=cam.far*.85;if(dv.length()>mx)rp=cam.position.clone().add(dv.setLength(mx))}const s=toScreen(rp);const dd=Math.max(26,2*P.disp*(innerHeight/2)/Math.tan(cam.fov*Math.PI/360));if(Math.abs(dd-_rdd)>.5){_rdd=dd;ret.style.width=ret.style.height=dd+'px';ret.style.margin=(-dd/2)+'px 0 0 '+(-dd/2)+'px'}const x=cl(s.x,20,innerWidth-20),y=cl(s.y,20,innerHeight-20);ret.style.opacity=s.vis?1:0;ret.style.transform=`translate(${x}px,${y}px)`;let am='';ret.classList.remove('g','y','r');if(r.hit&&r.hit.k=='tank'){const ai=armorInfo(r.hit.T,r.hit,r.v),q2=ai.ric?9:ai.eff/P.cat.pen;ret.classList.add(q2>1.15?'r':q2<.85?'g':'y');am=ai.ric?' · рикошет':' · '+Math.round(ai.eff)+' мм';if(scope){HL.t=S.t;HL.T=r.hit.T;HL.st=q2>1.15?2:q2<.85?0:1;hlSet(HL.T,HL.st)}else hlSet(null)}else if(scope&&HL.T&&HL.T.alive&&S.t-HL.t<.4)hlSet(HL.T,HL.st);else hlSet(null);if(0){}
  $('dist').textContent=Math.round(r.p.distanceTo(cam.position)-(scope?2:CD))+' м'+am;$('rtm').textContent=P.rl>0?P.rl.toFixed(1)+' с':'готов';$('srl').firstChild.textContent=P.rl>0?'ПЕРЕЗАРЯДКА '+P.rl.toFixed(1)+' с':'ГОТОВ';$('srl').lastChild.firstChild.style.width=(100-q*100)+'%';$('rlb').firstChild.style.height=(100-q*100)+'%'}else{ret.style.opacity=0;hlSet(null)}
 minimap();
 fo=Math.max(0,fo-dt*2.5);$('flash').style.opacity=fo;const dg=$('dmg');dg.style.opacity=Math.max(0,dg.style.opacity-dt*1.5)}
let paused=true;
const NATIVE=!!(window.Capacitor&&(Capacitor.isNativePlatform?Capacitor.isNativePlatform():(Capacitor.getPlatform&&Capacitor.getPlatform()!='web'))),ANDROID=/Android/i.test(navigator.userAgent)&&!NATIVE,inFS=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
/* полный экран только на Android: входим при первом касании и возвращаемся сразу после случайного выхода */
function goFull(){if(!ANDROID||inFS())return;const d=document.documentElement,f=d.requestFullscreen||d.webkitRequestFullscreen;try{const r=f&&f.call(d,{navigationUI:'hide'});r&&r.then&&r.then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}).catch(()=>{})}catch(_){}}
if(ANDROID){['pointerup','touchend','click','keydown'].forEach(n=>addEventListener(n,()=>goFull(),true));['fullscreenchange','webkitfullscreenchange'].forEach(n=>document.addEventListener(n,()=>{if(!inFS())goFull()}));document.addEventListener('visibilitychange',()=>{if(!document.hidden)goFull()});
 /* окно входа/регистрации: после фокуса, ухода клавиатуры и изменения размера снова в полный экран */
 ['focusin','focusout'].forEach(n=>document.addEventListener(n,()=>setTimeout(goFull,250)));addEventListener('resize',()=>setTimeout(goFull,250));goFull()}
function toMenu(){if(typeof clearFx=='function')clearFx();CDN=0;if(typeof specSet=="function")specSet(null);{const _c=$("cdn");if(_c)_c.style.display="none"}if(!BEND&&typeof rewardBattle=='function')rewardBattle(kills);DMG=0;setScope(false);paused=true;$("pause").style.display=$("btns").style.display=$("chat").style.display="none";$("chat").classList.remove("on");jx=jy=0;base.style.left=base.style.top="";for(const k in ptr)delete ptr[k];clearEnemies();kills=0;$("kills").textContent=0;respawnPlayer();P.x=0;P.z=0;P.h=0;cy=0;updatePlayer(.016);if(AC)EG.gain.value=0;$("load").style.display="flex";enterHangar()}
function setPause(v){paused=v;$("pause").classList.remove("hang");if(v){const t=document.querySelector("#stabs button");if(t)t.click()}$("pause").style.display=v?"flex":"none";if(v&&AC)EG.gain.value=0;last=0}
var muted=false;$("bsnd").onclick=()=>{muted=!muted;if(AC)MG.gain.value=muted?0:1;$("bsnd").classList.toggle("off",muted);audio();if(AC)muted?AC.suspend():AC.resume()};
const camIc=()=>{const t=$("bcam").querySelector("text");if(t)t.textContent=["БЛИЗКО","СРЕДНЕ","ДАЛЕКО"][CDi][0]+(CDi+1)};camIc();
$("bcam").onclick=()=>{CDi=(CDi+1)%3;CDt=CDS[CDi];try{localStorage.setItem("maus_cam",CDi)}catch(_){}camIc();say(["Камера: близко","Камера: средне","Камера: далеко"][CDi])};
$("bpause").onclick=()=>setPause(true);$("bchat").onclick=()=>$("chat").classList.toggle("on");$("pres").onclick=()=>setPause(false);$("pexit").onclick=toMenu;document.querySelectorAll("#chat button").forEach(b=>b.onclick=()=>{feed("Вы: "+b.textContent);$("chat").classList.remove("on")});
document.querySelectorAll('.md').forEach(b=>b.onclick=()=>{MODE=+b.dataset.n;document.querySelectorAll('.md').forEach(x=>x.classList.toggle('sel',x==b))});
$("play").onclick=()=>{if(typeof specSet=="function")specSet(null);clearEnemies();makeEnemies(MODE);respawnPlayer();warm();goFull();audio();if(AC&&!muted)AC.resume();$("load").style.display="none";leaveHangar();$("btns").style.display="flex";paused=false;S.bt=0;MED=0;teamHud.k=null};
let _fc=0,_fl=0,_lt=0,_fm=0;const fpsEl=$('fps');
function loop(ts){requestAnimationFrame(loop);_fc++;if(!_fl)_fl=ts;if(_lt)_fm=Math.max(_fm,ts-_lt);_lt=ts;if(ts-_fl>=500){const f=Math.round(_fc*1000/(ts-_fl)),I=R.info.render;fpsEl.className=f>=50?'ok':f>=30?'mid':'bad';fpsEl.textContent=f+' FPS';_fc=0;_fm=0;_fl=ts}
 if(paused){last=ts;if(inHangar)hangarRender(ts);return}const dt=Math.min(.05,(ts-last)/1000||.016);last=ts;S.t+=dt;if(CDN>0){CDN-=dt;S.bt=0;const n=Math.ceil(CDN),cb=$('cdn').firstChild;if(cb._n!==n){cb._n=n;cb.textContent=n>0?n:'';cb.style.animation='none';void cb.offsetWidth;cb.style.animation=''}if(CDN<=0)$('cdn').style.display='none'}cam.updateMatrixWorld();_pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);FR.setFromProjectionMatrix(_pm);ALL.forEach(T=>{_sp.center.set(T.x,3,T.z);_sp.radius=9;T.vis=FR.intersectsSphere(_sp)});
 ALL.forEach(T=>{if(T.tk>0)trackTick(T,dt);T.rl=Math.max(0,T.rl-dt);T.fl=Math.max(0,T.fl-dt);T.flare.material.opacity=T.fl>0?Math.min(1,T.fl/.08):0;T.flare.scale.setScalar(2.2+T.fl*10);if(T!==P&&T.alive)T.gunM.position.z=0;if(T!==P)T.rec=Math.max(0,T.rec-dt*1.1),T.gunM.position.z=Math.pow(T.rec,2)*.9});
 updatePlayer(dt);ENEMIES.forEach(e=>{if(e.net){if(e.alive)netTick(e,dt)}else if(CDN<=0)aiUpdate(e,dt);if(!e.alive)wreckFx(e,dt)});if(!P.alive)wreckFx(P,dt);
 updateShells(dt);flash.intensity*=Math.pow(.0004,dt);smoke.update(dt);fire.update(dt);hud(dt);R.render(scene,cam)}
addEventListener('resize',resize);resize();
/* модели грузим по 2 штуки, а не все 16 сразу (иначе на телефоне кончается память и загрузка встаёт на 94%); сбойная/зависшая модель выкидывается из каталога, а не вешает игру */
const _ids=CATALOG.filter(c=>c.id!='maus').map(c=>c.id),_tot=_ids.length+1;
const _tmo=(p,ms,id)=>new Promise((ok,bad)=>{const t=setTimeout(()=>bad(new Error('таймаут '+id)),ms);p.then(v=>{clearTimeout(t);ok(v)},e=>{clearTimeout(t);bad(e)})});
async function loadAll(){dbg('загрузка: maus (основная модель)');const _w=setTimeout(()=>{const l=$('ltxt');if(l&&loadProg.n==null)l.textContent='Загрузка идёт долго… подождите'},15000);let items;try{items=await _tmo(loadModel(),45000,'maus')}finally{clearTimeout(_w)}dbg('maus загружен');loadProg(_tot);const q=_ids.slice(),bad=[];
 const wk=async()=>{while(q.length){const id=q.shift();try{dbg('модель '+id+'…');{let er;for(let t=0;t<3;t++){try{await _tmo(loadGlb(id),120000,id);er=null;break}catch(e){er=e}}if(er)throw er};dbg('модель '+id+' ок')}catch(e){console.warn('model fail',id,e);bad.push(id)}loadProg(_tot);await new Promise(r=>setTimeout(r,25))}};
 await Promise.all([wk(),wk(),wk()]);
 bad.forEach(id=>{const x=CATALOG.findIndex(c=>c.id==id);if(x>=0)CATALOG.splice(x,1)});
 
 return items}
window.startGame=function(){if(startGame.on)return;startGame.on=1;try{showLoader('','Загрузка игры…');setBar(0)}catch(_){}
new Promise(r=>requestAnimationFrame(()=>setTimeout(r,80))).then(()=>loadAll()).then(async items=>{if(window.srvGateFn)await window.srvGateFn();dbg('все модели загружены, строю ангар');ITEMS=items;buildHangar();setPlayer(ECO.own[0]||'maus');if(typeof applyGfx=='function')applyGfx();prepHangar();
 $('ltxt').style.display='none';$('play').style.display='block';$('go').style.display='flex';updatePlayer(.016);requestAnimationFrame(loop)}).catch(e=>{console.error('loadAll',e);$('ltxt').textContent='Ошибка загрузки: '+e.message+' '});};
