/* ===== ангар: отдельная сцена-цех, камера, интерфейс, настройки ===== */
const hscene=new THREE.Scene();hscene.background=new THREE.Color(0x12171d);hscene.fog=new THREE.Fog(0x12171d,55,130);
function ctex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return t}
function noise(x,w,h,n,a){for(let i=0;i<n;i++){const v=Math.random()*255|0;x.fillStyle=`rgba(${v},${v},${v},${a})`;x.fillRect(Math.random()*w,Math.random()*h,2,2)}}
const HM=(c,r=.9,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const hConc=HM(0x9aa1a8),hDark=HM(0x262c33,.8,.3),hYel=HM(0xe3b32a,.7),hBlk=HM(0x181b1f,.85),hSteel=HM(0x3b434c,.6,.5);
function hbox(w,h,d,m,x,y,z,sh){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);if(sh){o.castShadow=true}o.receiveShadow=true;hscene.add(o);return o}
(function buildShop(){
 const X=28,Z=32,HH=15;
 /* пол и площадка с жёлто-чёрной разметкой */
 const fT=ctex(256,256,(x,w,h)=>{x.fillStyle='#646b72';x.fillRect(0,0,w,h);noise(x,w,h,3500,.12);x.strokeStyle='#0006';x.lineWidth=3;x.strokeRect(0,0,w,h)},[X*2/4,Z*2/4]);
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(X*2,Z*2).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:fT,roughness:.85}));fl.receiveShadow=true;hscene.add(fl);
 const pT=ctex(480,672,(x,w,h)=>{x.fillStyle='#3b4148';x.fillRect(0,0,w,h);noise(x,w,h,7000,.1);const b=36;
  x.save();x.beginPath();x.rect(0,0,w,h);x.rect(b,b,w-2*b,h-2*b);x.clip('evenodd');x.fillStyle='#e3b32a';x.fillRect(0,0,w,h);x.fillStyle='#14161a';
  for(let i=-h;i<w+h;i+=46){x.beginPath();x.moveTo(i,0);x.lineTo(i+23,0);x.lineTo(i+23-h,h);x.lineTo(i-h,h);x.fill()}x.restore();
  x.strokeStyle='#e3b32a';x.lineWidth=4;x.strokeRect(b+10,b+10,w-2*b-20,h-2*b-20)});
 pT.wrapS=pT.wrapT=THREE.ClampToEdgeWrapping;
 const pl=new THREE.Mesh(new THREE.PlaneGeometry(15,21).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:pT,roughness:.8,polygonOffset:true,polygonOffsetFactor:-2}));pl.position.y=.03;pl.receiveShadow=true;hscene.add(pl);
 [-9.5,9.5].forEach(x=>hbox(.25,.02,Z*2,hYel,x+(x<0?-3:3),.03,0));
 /* стены */
 const wT=ctex(256,256,(x,w,h)=>{x.fillStyle='#4f5760';x.fillRect(0,0,w,h);noise(x,w,h,2500,.08);x.fillStyle='#363c43';x.fillRect(0,h*.64,w,h*.36);x.fillStyle='#0006';x.fillRect(0,0,4,h);x.fillStyle='#fff1';x.fillRect(4,0,2,h);x.fillStyle='#e3b32a';x.fillRect(0,h*.64-3,w,3)});
 const wm=L=>{const t=wT.clone();t.needsUpdate=true;t.repeat.set(L/4,1);return new THREE.MeshStandardMaterial({map:t,roughness:.95})};
 [[0,-Z-.5,X*2+2,1],[0,Z+.5,X*2+2,1]].forEach(([x,z,w,d])=>hbox(w,HH,d,wm(w),x,HH/2,z));
 [[-X-.5],[X+.5]].forEach(([x])=>hbox(1,HH,Z*2,wm(Z*2),x,HH/2,0));
 const ce=new THREE.Mesh(new THREE.PlaneGeometry(X*2,Z*2).rotateX(Math.PI/2),HM(0x1b2025));ce.position.y=HH;hscene.add(ce);
 /* колонны */
 for(let z=-24;z<=24;z+=8)[-13,13].forEach(x=>{hbox(1.3,HH-.5,1.3,hConc,x,(HH-.5)/2,z,true);hbox(1.55,.9,1.55,hBlk,x,.45,z);hbox(1.4,.35,1.4,hYel,x,1.15,z)});
 /* фермы перекрытия */
 const seg=(x1,y1,x2,y2,z,t)=>{const L=Math.hypot(x2-x1,y2-y1),o=new THREE.Mesh(new THREE.BoxGeometry(L,t,t),hSteel);o.position.set((x1+x2)/2,(y1+y2)/2,z);o.rotation.z=Math.atan2(y2-y1,x2-x1);hscene.add(o)};
 [-24,-8,8,24].forEach(z=>{const n=10,W=28,dx=W/n;seg(-W/2,13.9,W/2,13.9,z,.5);seg(-W/2,11.9,W/2,11.9,z,.4);
  for(let i=0;i<n;i++){const a=-W/2+i*dx,b=a+dx;i%2?seg(a,13.9,b,11.9,z,.2):seg(a,11.9,b,13.9,z,.2)}});
 [-13,13].forEach(x=>hbox(.6,.6,Z*2-2,hSteel,x,12.6,0));
 /* лампы */
 const lg=new THREE.MeshBasicMaterial({color:0xe9f3ff}),lgeo=new THREE.CylinderGeometry(.2,.8,.5,12),ggeo=new THREE.CircleGeometry(.68,16).rotateX(Math.PI/2);
 [-20,-8,4,16].forEach(z=>[-6,6].forEach(x=>{hbox(.05,3.6,.05,hBlk,x,13.1,z);const s=new THREE.Mesh(lgeo,hDark);s.position.set(x,11,z);hscene.add(s);const g=new THREE.Mesh(ggeo,lg);g.position.set(x,10.74,z);hscene.add(g)}));
 /* галерея с лестницей */
 hbox(5,.3,20,hDark,24.5,4.2,-19,true);hbox(.1,.1,20,hSteel,22.1,5.5,-19);
 for(let z=-28;z<=-10;z+=3.6)hbox(.12,1.3,.12,hSteel,22.1,4.9,z);
 for(let i=0;i<13;i++){const t=4.2-(i+1)*.3;hbox(2.2,t,.9,hDark,23.3,t/2,-9+.45+i*.9,true)}
 for(let z=-28;z<=-10;z+=6)hbox(.4,4.1,.4,hSteel,22.2,2.05,z);
 /* реквизит */
 [[-22,1,-29],[-19.6,1,-29],[-20.8,3,-29]].forEach(([x,y,z])=>hbox(2,2,2,HM(0x6e5436),x,y,z,true));
 const bc=[0x7b2f2a,0x3d4a57,0x7b2f2a],br=new THREE.CylinderGeometry(.5,.5,1.1,14),rg=new THREE.CylinderGeometry(.51,.51,.12,14);
 [[21.5,6],[22.8,7],[21.2,7.4]].forEach(([x,z],i)=>{const b=new THREE.Mesh(br,HM(bc[i],.6,.4));b.position.set(x,.55,z);b.castShadow=b.receiveShadow=true;hscene.add(b);const r=new THREE.Mesh(rg,hYel);r.position.set(x,.8,z);hscene.add(r)});
 hbox(1.6,.12,6,hDark,-26,1,10,true);[8,12].forEach(z=>hbox(1.4,1,.15,hSteel,-26,.5,z));
 const pq=new THREE.Mesh(new THREE.PlaneGeometry(12,2),new THREE.MeshBasicMaterial({color:0xa7adb3,map:ctex(512,86,(x,w,h)=>{x.fillStyle='#161b20';x.fillRect(0,0,w,h);x.fillStyle='#e8892a';x.fillRect(0,0,12,h);x.fillStyle='#cfd6dc';x.font='700 52px system-ui';x.textBaseline='middle';x.fillText('АНГАР',44,h/2+3)})}));pq.position.set(0,8,-Z+.01);hscene.add(pq);
})();
hscene.add(new THREE.HemisphereLight(0x8fa4bd,0x2c2a28,.8));
const hsun=new THREE.DirectionalLight(0xfff0dc,1.15);hsun.position.set(3,26,4);hsun.castShadow=true;hsun.shadow.mapSize.set(1024,1024);
Object.assign(hsun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:60});hsun.shadow.bias=-.001;hsun.shadow.normalBias=.06;hscene.add(hsun,hsun.target);
const hspot=new THREE.SpotLight(0xdbe8ff,1.1,45,.8,.7,1);hspot.position.set(0,13,0);hscene.add(hspot,hspot.target);
/* hfill (точечный свет) убран: дорогой для PBR-шейдера, вклад минимальный */
hsun.intensity=1.3;

/* камера-орбита вокруг танка: тяни по экрану, без касаний — медленно сама */
let hAz=-.6,hEl=.2,hIdle=0,hLast=0,hDrag=null;
let hDirty=true,hFrozen=false;
/* ангар: тени считаем один раз (камера крутится, свет и танк стоят), разрешение ограничено, статика заморожена */
function hFreeze(){if(hFrozen)return;hFrozen=true;hscene.updateMatrixWorld(true);hscene.children.forEach(o=>{if(o!==P.root&&!o.isLight){o.traverse(c=>{c.matrixAutoUpdate=false;if(c.isMesh&&c.castShadow&&Math.abs(c.position.x)>16)c.castShadow=false})}})}
function hPR(){}   /* разрешение задаётся только в настройках */
let hR=9.5;const hPt={};let hPd=0;
function hangarRender(ts){hFreeze();hPR();R.shadowMap.autoUpdate=false;if(hDirty){R.shadowMap.needsUpdate=true;hDirty=false}
 const dt=Math.min(.05,(ts-hLast)/1000||.016);hLast=ts;if(!hDrag){hIdle+=dt;if(hIdle>3&&panel=='h')hAz+=dt*.06}
 const c=P.cat,r=hR,y=P.root.position.y,ce=Math.cos(hEl);
 cam.position.set(Math.sin(hAz)*ce*r,y+1+Math.sin(hEl)*r,Math.cos(hAz)*ce*r);cam.lookAt(0,y+.9,0);const sh=0;cam.setViewOffset(innerWidth,innerHeight,-sh,0,innerWidth,innerHeight);R.render(hscene,cam)}
$('load').addEventListener('pointerdown',e=>{if(!inHangar||e.target.closest('button,.ui,#hangar,#hinfo,#modes,#maps,#go,#hsb,#shop'))return;hPt[e.pointerId]=[e.clientX,e.clientY];if(Object.keys(hPt).length==2){const q=Object.values(hPt);hPd=Math.hypot(q[0][0]-q[1][0],q[0][1]-q[1][1]);hDrag=null}else hDrag={id:e.pointerId,x:e.clientX,y:e.clientY};hIdle=0});
$('load').addEventListener('wheel',e=>{if(inHangar&&!e.target.closest('#hangar,#hinfo,#shop,#modes,#maps')){hR=cl(hR+e.deltaY*.01,6,11.5);e.preventDefault()}},{passive:false});
addEventListener('pointermove',e=>{if(hPt[e.pointerId]){hPt[e.pointerId]=[e.clientX,e.clientY];const q=Object.values(hPt);if(q.length==2&&inHangar){const d=Math.hypot(q[0][0]-q[1][0],q[0][1]-q[1][1]);if(hPd>0)hR=cl(hR*hPd/d,6,11.5);hPd=d;hIdle=0;return}}if(!hDrag||e.pointerId!=hDrag.id)return;hAz-=(e.clientX-hDrag.x)*.008;hEl=cl(hEl+(e.clientY-hDrag.y)*.003,.04,.55);hDrag.x=e.clientX;hDrag.y=e.clientY;hIdle=0});
const hup=e=>{delete hPt[e.pointerId];hPd=0;if(hDrag&&e.pointerId==hDrag.id)hDrag=null};addEventListener('pointerup',hup);addEventListener('pointercancel',hup);

function enterHangar(){inHangar=true;hDirty=true;document.body.classList.add('hg');hscene.add(P.root);P.root.visible=true;cam.fov=55;cam.updateProjectionMatrix();$('load').classList.add('on');$('hg').style.display='block';$('modes').classList.remove('open');hIdle=0;hInfo();hideLoader();setTimeout(hSel,30)}
function leaveHangar(){inHangar=false;cam.clearViewOffset();R.shadowMap.autoUpdate=true;hPR();document.body.classList.remove('hg');scene.add(P.root);$('modes').classList.remove('open')}
function hInfo(){const c=P&&P.cat;if(!c)return;const r=(k,v)=>`<div><em>${k}</em><span>${v}</span></div>`,a=c.arm;
 $('hinfo').innerHTML=`<b class="${isPrem(c)?'gold':''}">${c.name}</b><em>${KI(c.cls)} ${ROM[c.tier]} уровень · ${c.nat} · ${c.cls}${isPrem(c)?' · <u class="gold">Премиум</u>':' · Ветка'}</em><h5>ХАРАКТЕРИСТИКИ</h5>${r('Прочность',c.hp+' HP')}${r('Скорость',c.kmh+' км/ч')}${r('Урон',c.dmg)}${r('Пробитие',c.pen+' мм')}${c.clip?r('Барабан',c.clip.n+' сн. / '+c.clip.gap+' с между'):''}${r(c.clip?'Перезарядка барабана':'Перезарядка',c.rel+' с')}<h5>БРОНЯ</h5>${r('Лоб корпуса',a[0]+' мм')}${r('Борт',a[1]+' мм')}${r('Корма',a[2]+' мм')}${r('Башня',a[3]+' мм')}${r('Крыша',a[4]+' мм')}`}
function hSel(){const h=$('hangar'),s=h.querySelector('.hc.sel');if(s)h.scrollLeft=s.offsetLeft-h.clientWidth/2+s.offsetWidth/2;hBar()}
{const _sp=setPlayer;setPlayer=function(id){_sp(id);if(inHangar){hscene.add(P.root);hDirty=true;hInfo();hBar()}}}
$('mb').onclick=()=>$('modes').classList.toggle('open');
document.querySelectorAll('.md').forEach(b=>b.addEventListener('click',()=>{$('mbt').textContent=b.dataset.n+'×'+b.dataset.n;$('modes').classList.remove('open')}));

/* лента танков: перетаскивание с инерцией, колесо мыши, полоса прокрутки */
let hBar=()=>{};
(function(){const h=$('hangar'),sb=$('hsb'),th=sb.firstChild;let d=null,v=0,mv=0,raf=0;
 hBar=()=>{const m=h.scrollWidth-h.clientWidth;sb.style.visibility=m>2?'visible':'hidden';const w=Math.max(.12,h.clientWidth/Math.max(1,h.scrollWidth));th.style.width=w*100+'%';th.style.left=(m>0?h.scrollLeft/m*(1-w)*100:0)+'%'};
 h.addEventListener('scroll',hBar);addEventListener('resize',hBar);
 h.addEventListener('pointerdown',e=>{cancelAnimationFrame(raf);d={x:e.clientX,id:e.pointerId};mv=0;v=0});
 h.addEventListener('pointermove',e=>{if(!d||e.pointerId!=d.id)return;const dx=e.clientX-d.x;if(!mv&&Math.abs(dx)>6){mv=1;try{h.setPointerCapture(e.pointerId)}catch(_){}}if(mv){h.scrollLeft-=dx;v=-dx;d.x=e.clientX}});
 const end=e=>{if(!d||e.pointerId!=d.id)return;d=null;if(mv){const f=()=>{if(Math.abs(v)<.5)return;h.scrollLeft+=v;v*=.94;raf=requestAnimationFrame(f)};f()}};
 h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end);
 h.addEventListener('wheel',e=>{h.scrollLeft+=e.deltaY+e.deltaX;e.preventDefault()},{passive:false});
 th.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();th.setPointerCapture(e.pointerId);const sx=e.clientX,s0=h.scrollLeft;
  th.onpointermove=ev=>{const m=h.scrollWidth-h.clientWidth,tr=Math.max(1,sb.clientWidth-th.offsetWidth);h.scrollLeft=s0+(ev.clientX-sx)/tr*m};th.onpointerup=()=>{th.onpointermove=th.onpointerup=null}});
 sb.addEventListener('pointerdown',e=>{if(e.target!==sb)return;const r=sb.getBoundingClientRect();h.scrollLeft=(e.clientX-r.left)/r.width*(h.scrollWidth-h.clientWidth)})})();

/* иконки танков: рендер каждой модели во вторичный канвас */
const ICONS={};
function makeIcons(){let r;const W=800,H=440;try{r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true})}catch(e){return}
 r.setPixelRatio(1);r.setSize(W,H,false);r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xdfe8f2,0x3a3630,1.15));const dl=new THREE.DirectionalLight(0xfff2e0,1.8);dl.position.set(-8,10,-6);sc.add(dl);const dl2=new THREE.DirectionalLight(0x9fb8d8,.5);dl2.position.set(8,4,6);sc.add(dl2);
 const ic=new THREE.PerspectiveCamera(24,W/H,.1,400),oc=document.createElement('canvas'),tc=document.createElement('canvas');oc.width=W;oc.height=H;tc.width=W;tc.height=H;
 [...CATALOG,...CATALOG].forEach(c=>{if(ICONS[c.id])return;let T;try{r.toneMappingExposure=1.05;T=buildTank(c.id);sc.add(T.root);T.root.updateMatrixWorld(true);
  const b=new THREE.Box3();T.root.traverse(m=>{if(m.isMesh&&!m.isSprite&&m.visible&&m.geometry&&!(m.userData&&m.userData.hl)&&!(m.material&&m.material.transparent&&m.material.opacity<.6)){m.geometry.boundingBox||m.geometry.computeBoundingBox();b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld))}});
  const ct=b.getCenter(new THREE.Vector3()),dir=new THREE.Vector3(-.85,.28,-.5).normalize(),cr=[];
  for(let i=0;i<8;i++)cr.push(new THREE.Vector3(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z));
  let d=b.getSize(new THREE.Vector3()).length()*2;
  for(let it=0;it<4;it++){ic.position.copy(ct).addScaledVector(dir,d);ic.lookAt(ct);ic.updateMatrixWorld(true);ic.updateProjectionMatrix();
   let mx=0,my=0;cr.forEach(p=>{const q=p.clone().project(ic);mx=Math.max(mx,Math.abs(q.x));my=Math.max(my,Math.abs(q.y))});d*=Math.max(mx,my)/.8}
  ic.position.copy(ct).addScaledVector(dir,d);ic.lookAt(ct);r.render(sc,ic);
  /* автообрезка по прозрачности: танк всегда занимает весь кадр */
  const tx=tc.getContext('2d',{willReadFrequently:true});tx.clearRect(0,0,W,H);tx.drawImage(r.domElement,0,0);
  const px=tx.getImageData(0,0,W,H).data;let x0=W,y0=H,x1=0,y1=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(px[(y*W+x)*4+3]>12){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<=x0||y1<=y0){ICONS[c.id]=r.domElement.toDataURL('image/png')}else{
   const cw=x1-x0+1,ch=y1-y0+1,m=W*.06,k=Math.min((W-2*m)/cw,H*.78/ch),ox=oc.getContext('2d');ox.clearRect(0,0,W,H);ox.imageSmoothingQuality='high';
   ox.drawImage(tc,x0,y0,cw,ch,(W-cw*k)/2,(H-ch*k)/2,cw*k,ch*k);
   /* выравнивание яркости/цвета: средняя яркость как у первого танка */
   const id=ox.getImageData(0,0,W,H),d=id.data;let sm=0,n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>40){sm+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;n++}
   const av=n?sm/n:1;if(!ICONS._ref)ICONS._ref=av*.72;const f=Math.min(1.8,Math.max(.5,ICONS._ref/av));if(Math.abs(f-1)>.02){for(let i=0;i<d.length;i+=4){d[i]=Math.min(255,d[i]*f);d[i+1]=Math.min(255,d[i+1]*f);d[i+2]=Math.min(255,d[i+2]*f)}ox.putImageData(id,0,0)}
   ICONS[c.id]=oc.toDataURL('image/png')}}catch(e){}
  if(T)try{disposeTank(T)}catch(e){}});
 try{r.dispose();r.forceContextLoss&&r.forceContextLoss()}catch(e){}
 addIcons()}
function addIcons(){document.querySelectorAll('.hc').forEach(b=>{const u=ICONS[b.dataset.id];if(u&&!b.querySelector('img')){const im=new Image();im.src=u;im.draggable=false;b.insertBefore(im,b.firstChild)}})}

/* экраны загрузки: игра и бой */
const _ldi=$('ldb').firstChild;
const ART=['img/load1.jpg','img/load2.jpg'];function pickArt(){const a=ART[Math.random()*ART.length|0],b=ART.find(x=>x!=a);$('lart').src=a;$('blbg').src=b}
function showLoader(t,s){pickArt();$('ltxt').textContent=s;$('ltxt').style.display='';$('ldr').style.display='flex'}
window.ldStatus=function(t,p){try{showLoader('',t);if(p!=null)setBar(p)}catch(_){}};
function hideLoader(){$('ldr').style.display='none'}
function setBar(p,ms){_ldi.style.transition=ms?`width ${ms}ms linear`:'none';_ldi.style.width=p+'%'}
function loadProg(total){loadProg.n=(loadProg.n||0)+1;setBar(loadProg.n/total*80);$('ltxt').textContent='Загрузка моделей: '+loadProg.n+' из '+total+' ('+Math.round(loadProg.n/total*100)+'%)'}
function prepHangar(){showLoader('','Подготовка ангара и иконок техники…');setBar(85);setTimeout(()=>{makeIcons();setBar(100);enterHangar()},50)}
let _bl=0;
const NICK=['Wolf_88','TankDad','Kuzya','Panzer_X','Ivan_T','Gnom','StaliNick','Rex','Viking','Shturm','Barsik','Orel','Tigr','NightFox','Zeus','Mamont','Sapper','Kolya','Hawk','Bison'];
const TIPS=['Чем ярче красная подсветка в снайперском режиме, тем ниже шанс пробития.','Бейте в борт и корму: там броня тоньше, а под острым углом снаряд рикошетит.','Цвет прицела показывает шанс пробития: зелёный — пробьёте, красный — нет.','Перед выстрелом дождитесь полной перезарядки: тяжёлые танки стреляют редко, но больно.','Используйте аптечку, когда прочность упала ниже половины.'];
function fillBL(){const A=[P,...ENEMIES.filter(e=>e.team=='A')],B=ENEMIES.filter(e=>e.team=='B'),nk=NICK.slice().sort(()=>Math.random()-.5);let i=0;
 const row=(t,me)=>`<div class="p${me?' me':''}"><span>${me?'Вы':(t.nick||nk[i++%nk.length])}</span><u>${ICONS[t.cat.id]?'<img src="'+ICONS[t.cat.id]+'">':''}${ROM[t.tier]||''} ${t.cat.name}</u></div>`,ord=L=>L.slice().sort((a,b)=>b.tier-a.tier);
 $('bla').innerHTML=ord(A).map(t=>row(t,t===P)).join('');$('blb').innerHTML=ord(B).map(t=>row(t)).join('');$('bltip').textContent=TIPS[Math.random()*TIPS.length|0]}
function setBL(p,ms){const i=$('blbar').firstChild;i.style.transition=ms?`width ${ms}ms linear`:'none';i.style.width=p+'%'}
function startBattle(){if(_bl)return;_bl=1;pickArt();goFull();audio();if(AC&&!muted)AC.resume();$('modes').classList.remove('open');
 const n=MODE;$('bl').style.display='block';$('bla').innerHTML=$('blb').innerHTML='';$('bltip').textContent='';setBL(0);void $('bl').offsetWidth;setBL(100,6200);$('blmap').textContent=($('mpt')||{}).textContent||'Полигон';
 setTimeout(()=>{clearEnemies();makeEnemies(n);respawnPlayer();warm();fillBL();DMG=0;kills=0;$('kills').textContent=0;BEND=false},400);
 setTimeout(()=>{$('load').style.display='none';leaveHangar();$('btns').style.display='flex';paused=false;S.bt=0;MED=0;teamHud.k=null;$('bl').style.display='none';_bl=0;CDN=5;$('cdn').style.display='flex'},6500)}
$('play').onclick=startBattle;

/* ===== экономика и магазин ===== */
const jl=k=>{try{return JSON.parse(localStorage.getItem(k))||{}}catch(_){return{}}},js=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
/* ===== экономика: ветка СССР исследуется за серебро, премиум покупается в магазине за золото ===== */
const SOVB=CATALOG.filter(c=>c.nat=='СССР').map(c=>c.id);               /* танки ветки (не продаются) */
const isPrem=c=>!!c&&c.nat!='СССР';                                        /* всё остальное - премиум */
const RCOST={1:400,2:1200,3:4500,4:9500,5:25000,6:70000,7:200000,8:800000,9:2500000,10:8000000};   /* цена исследования по уровню */
const GPRICE={5:1500,6:2000,7:2800,8:4500,9:6500,10:9000};               /* цена премиум-танка в золоте по уровню */
CATALOG.forEach(c=>{if(isPrem(c))c.gold=c.gold||GPRICE[c.tier]||9000;c.rc=RCOST[c.tier]});
const ECO=Object.assign({cr:500,au:0,xp:0,own:['ms1'],res:['ms1']},jl('maus_eco2'));if(!((jl('maus_session')||{}).nick))ECO.au=0;;
ECO.own=ECO.own.filter(id=>CATALOG.some(c=>c.id==id));if(!ECO.own.includes('ms1'))ECO.own.unshift('ms1');
ECO.res=ECO.res.filter(id=>SOVB.includes(id));if(!ECO.res.includes('ms1'))ECO.res.unshift('ms1');
const fmt=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
function hCredits(){$('crv').textContent=fmt(ECO.cr);$('gdv').textContent=fmt(ECO.au)}
function toast(t){const e=$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,2600)}
let shopCat='t';
function buildShop0(){const sh=$('shop'),I={t:'<path d="M3 15h18l-2 4H5zM6 15v-3h9l3-2h3v5M9 12V9h5v3"/>',a:'<path d="M3 12l9-9h8v8l-9 9z"/><circle cx="16" cy="8" r="1.5"/>',e:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',v:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'},N={t:'Танки',a:'Акции',e:'Обмен',v:'Аватарки'};
 const tabs=Object.keys(I).map(k=>`<button class="stb${k==shopCat?' on':''}" data-k="${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg><span>${N[k]}</span></button>`).join('');
 const gl='<svg class="gi"><use href="#c-gold"/></svg>',sl='<svg class="gi"><use href="#c-silv"/></svg>';
 const offer=(g,sv,t,ic)=>`<div class="so"><b>${t}</b><div class="oi"><svg><use href="#c-gold"/></svg><span class="ar">→</span><svg><use href="#c-silv"/></svg></div><div class="sx">${gl}${fmt(g)}<i>→</i>${sl}${fmt(sv)}</div><button class="sbuy" data-g="${g}" data-s="${sv}" data-t="${t}"${ECO.au<g?' disabled':''}>Купить</button></div>`;
 let body='';
 if(shopCat=='t')body=CATALOG.filter(isPrem).sort((a,b)=>b.tier-a.tier||b.gold-a.gold).map(c=>{const o=ECO.own.includes(c.id);return `<div class="so prem"><b class="pn">${ROM[c.tier]} ${c.name}</b>${ICONS[c.id]?'<img class="ti" src="'+ICONS[c.id]+'">':''}<div class="sx">${KI(c.cls)} ${c.nat} · ${c.cls}</div><div class="sx gp">${gl}${fmt(c.gold)}</div><button class="sbuy" data-id="${c.id}"${o||ECO.au<c.gold?' disabled':''}>${o?'В ангаре':'Купить'}</button></div>`}).join('');
 else if(shopCat=='v')body=['l','e','r'].map(r=>AV.DB.filter(a=>a.r==r).map(a=>{const o=AV.has(a.id),R=AV.R[r];return `<div class="so avc r${r}"><div class="avi">${AV.svg(a.id)}</div><b class="avn">${a.n}</b><div class="avr">${R.n}</div><div class="sx gp">${gl}${fmt(R.p)}</div><button class="sbuy" data-aid="${a.id}"${o||ECO.au<R.p?' disabled':''}>${o?'Куплено':'Купить'}</button></div>`}).join('')).join('');
 else if(shopCat=='a')body=offer(100,60000,'Малый набор')+offer(500,350000,'Выгодный набор +17%')+offer(2000,1600000,'Большой набор +33%');
 else body=offer(10,5000,'10 золота')+offer(100,50000,'100 золота')+offer(1000,500000,'1000 золота');
 const _sg=sh.querySelector('.sgrid'),_st=_sg?_sg.scrollTop:0;sh.innerHTML=`<div class="sth">${tabs}<button class="sx2" aria-label="Выход">✕</button></div><div class="sgrid">${body}</div>`;sh.querySelector('.sgrid').scrollTop=_st;
 sh.querySelectorAll('.stb').forEach(b=>b.onclick=()=>{shopCat=b.dataset.k;buildShop()});
 sh.querySelector('.sx2').onclick=()=>showPanel('h');
 sh.querySelectorAll('.sbuy').forEach(b=>b.onclick=()=>{if(b.dataset.aid){const a=AV.get(b.dataset.aid),pr=AV.R[a.r].p;if(AV.has(a.id)||ECO.au<pr)return;confirmBuy('аватарка «'+a.n+'»','<div class="avi">'+AV.svg(a.id)+'</div>',gl+fmt(pr),()=>{const fin=()=>{AV.add(a.id);AV.setSel(a.id);AV.paint();buildShop();toast('Куплена аватарка: '+a.n)};if(ONL()){ecoOp('avatar',{id:a.id},fin);return}ECO.au-=pr;js('maus_eco2',ECO);hCredits();fin()});return}if(b.dataset.id){const c=CATALOG.find(c=>c.id==b.dataset.id);confirmBuy(c.name,ICONS[c.id]?'<img src="'+ICONS[c.id]+'">':'',gl+fmt(c.gold),()=>buy(c.id));return}const g=+b.dataset.g,s=+b.dataset.s;if(ECO.au<g)return;confirmBuy(b.dataset.t||'Обмен','<svg><use href="#c-gold"/></svg><svg><use href="#c-silv"/></svg>',gl+fmt(g)+' → '+sl+fmt(s),()=>{ECO.au-=g;ECO.cr+=s;js('maus_eco2',ECO);hCredits();toast('+'+fmt(s)+' серебра');buildShop()})})}
function confirmBuy(t,ic,pr,fn){const e=$('conf');e.querySelector('h3').textContent=(/^исслед/.test(t)?'Исследовать'+t.slice(11):'Купить: '+t)+'?';e.querySelector('.cic').innerHTML=ic;e.querySelector('.cpr').innerHTML=pr;e.style.display='flex';e.querySelector('.cno').onclick=()=>e.style.display='none';e.querySelector('.cyes').onclick=()=>{e.style.display='none';fn()}}
function buy(id){const c=CATALOG.find(c=>c.id==id);if(!isPrem(c)||ECO.own.includes(id)||ECO.au<c.gold)return;const fin=()=>{buildHangar();buildShop();toast('Куплен премиум-танк: '+c.name)};if(ONL()){ecoOp('buy',{id},fin);return}ECO.au-=c.gold;ECO.own.push(id);js('maus_eco2',ECO);hCredits();fin()}
/* исследование ветки: платим серебром, танк сразу появляется в ангаре */
function chainPrev(id){const B=BRANCHES['СССР'].filter(Boolean),i=B.indexOf(id);return i>0?B[i-1]:null}
function research(id){const c=CATALOG.find(c=>c.id==id),pv=chainPrev(id);if(!c||!SOVB.includes(id)||ECO.own.includes(id))return;
 if(pv&&!ECO.own.includes(pv)){toast('Сначала получите '+CATALOG.find(x=>x.id==pv).name);return}
 if(ECO.cr<c.rc){toast('Не хватает серебра: нужно '+fmt(c.rc));return}
 const fin=()=>{buildHangar();buildShop();toast('Получен: '+c.name)};if(ONL()){ecoOp('research',{id},fin);return}ECO.cr-=c.rc;ECO.own.push(id);ECO.res.push(id);js('maus_eco2',ECO);hCredits();fin()}
function rewardBattle(k){if(ONL()){ecoOp('leave',{kills:k},r=>toast(r.msg));return}const e=500+k*1500;ECO.cr+=e;js('maus_eco2',ECO);hCredits();toast('Награда за бой: +'+fmt(e)+' кр.')}
{const _e=enterHangar;enterHangar=function(){_e();hCredits()}}
hCredits();

/* ===== настройки графики и игры (сохраняются) ===== */
const PRE={l:{res:'50',obj:'l',tank:'l',fx:'l',dist:'l',sh:'0',hd:false},m:{res:'75',obj:'m',tank:'m',fx:'m',dist:'m',sh:'2',hd:false},h:{res:'100',obj:'h',tank:'h',fx:'h',dist:'h',sh:'3',hd:true}};
const CFG=Object.assign({snd:true,fps:true,sens:1,gq:'h',aa:'1'},PRE.h,jl('maus_cfg4'));if(+CFG.res>100||!+CFG.res)CFG.res='100';
const saveCfg=()=>js('maus_cfg4',CFG);
[smoke,fire].forEach(p=>{const e=p.emit;p.emit=function(x,y,z,vx,vy,vz,life,s,gr,rgb,a){if(Math.random()>=FXK)return;const k=.45+.55*FXK;e.call(p,x,y,z,vx,vy,vz,life*k,s*k,gr,rgb,a)}});
function applyCfg(){muted=!CFG.snd;if(AC){MG.gain.value=muted?0:1;muted?AC.suspend():AC.resume()}
 $('bsnd').classList.toggle('on',CFG.snd);$('sfps').classList.toggle('on',CFG.fps);$('fps').style.display=CFG.fps?'':'none';$('ssens').value=CFG.sens;SENS=+CFG.sens;
 document.querySelectorAll('.seg[data-k]').forEach(g=>g.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v==CFG[g.dataset.k])));
 document.querySelectorAll('.sw[data-k]').forEach(b=>b.classList.toggle('on',!!CFG[b.dataset.k]));
 document.querySelectorAll('#gq button').forEach(b=>b.classList.toggle('on',b.dataset.v==CFG.gq))}
function applyGfx(){const o=GL[CFG.obj],t=GL[CFG.tank],f=GL[CFG.fx],d=GL[CFG.dist];TQ=t;FXK=[.3,.65,1][f];
 PRMAX=Math.max(.5,Math.min((devicePixelRatio||1)*(+CFG.res||100)/100,R.capabilities.maxTextureSize/Math.max(innerWidth,innerHeight)));PR=PRMAX;R.setPixelRatio(PR);
 const sh=+CFG.sh||0,sz=[1024,512,1024,2048,3072][sh];sun.castShadow=hsun.castShadow=sh>0;if(sun.shadow.mapSize.x!=sz){sun.shadow.mapSize.set(sz,sz);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
 scene.fog.near=[55,75,90][d];scene.fog.far=[170,240,330][d];cam.far=[230,320,700][d];cam.updateProjectionMatrix();resize();
 const an=CFG.hd?R.capabilities.getMaxAnisotropy():1,ta=m=>{[].concat(m.material||[]).forEach(x=>{if(x&&x.map&&x.map.anisotropy!=an){x.map.anisotropy=an;x.map.needsUpdate=true}})};
 if(window.GTEX){GTEX.anisotropy=an;GTEX.needsUpdate=true}Object.values(MODELS).forEach(m=>m.traverse(ta));
 ALL.forEach(T=>T.root.traverse(m=>{if(m.isMesh&&!m.userData.hl)m.castShadow=t>0}));
 hDirty=true;hPR()}
const gfx=()=>{saveCfg();applyCfg();try{applyGfx()}catch(e){console.error(e)}};
document.querySelectorAll('.seg[data-k]').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=g.dataset.k;CFG[k]=b.dataset.v;if(k=='aa'){saveCfg();applyCfg();return}CFG.gq='x';gfx()}));
document.querySelectorAll('.sw[data-k]').forEach(b=>b.addEventListener('click',()=>{CFG[b.dataset.k]=!CFG[b.dataset.k];CFG.gq='x';gfx()}));
$('gq').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.v!='x')Object.assign(CFG,PRE[b.dataset.v]);CFG.gq=b.dataset.v;gfx()});
$('stabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('#stabs button').forEach(x=>x.classList.toggle('on',x==b));document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('on',p.id==b.dataset.t))});
$('bsnd').onclick=()=>{CFG.snd=!CFG.snd;muted=!CFG.snd;saveCfg();audio();applyCfg()};
$('sfps').onclick=()=>{CFG.fps=!CFG.fps;saveCfg();applyCfg()};
$('ssens').oninput=e=>{CFG.sens=+e.target.value;SENS=CFG.sens;saveCfg()};
$('hset').onclick=()=>{$('pause').classList.add('hang');$('pause').style.display='flex'};
$('sx').onclick=()=>{if(inHangar)$('pause').style.display='none';else setPause(false)};
$('pause').addEventListener('pointerdown',e=>{if(e.target===$('pause')&&inHangar)$('pause').style.display='none'});
$('ldt').textContent=['Maus','E 100','AMX 50 B','Type 4 Heavy','FV4005','ИС-6','Jagdpanzer E 100'][Math.random()*7|0];
applyCfg();applyGfx();

/* выбор карты */
$('mpb').onclick=()=>{$('modes').classList.remove('open');$('maps').classList.toggle('open')};
document.querySelectorAll('.mpi').forEach(b=>b.onclick=()=>{loadMap(b.dataset.m);$('maps').classList.remove('open')});
$('mb').addEventListener('click',()=>$('maps').classList.remove('open'));
{let m='poly';try{m=localStorage.getItem('maus_map')||'poly'}catch(_){}loadMap(m)}

/* ===== кнопки интерфейса ангара (v39) ===== */
$('mup').onclick=()=>{const i=$('hinfo');i.classList.toggle('show');$('mup').classList.toggle('on',i.classList.contains('show'))};
document.querySelectorAll('#hside .sb,#hmods .mod[data-t],#hchat,#hfilt').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.t||'Пока недоступно')));
document.querySelectorAll('#hcur .pl').forEach(b=>b.addEventListener('click',()=>toast('Пополнение пока недоступно')));

/* ===== конец боя ===== */
var BEND=false;
function specList(){return ENEMIES.filter(e=>e.team=='A'&&e.alive)}
function specSet(t){SPEC=t;const d=$('spec');if(!t){d.classList.remove('on');document.body.classList.remove('spec');return}
 d.classList.add('on');document.body.classList.add('spec');d.querySelector('b').textContent=t.name||'Союзник';cy=t.h}
function specStep(k){const L=specList();if(!L.length)return;let i=L.indexOf(SPEC);specSet(L[(i<0?0:i+k+L.length)%L.length])}
$('sprev').onclick=()=>specStep(-1);$('snext').onclick=()=>specStep(1);
function battleCheck(T){if(BEND)return;
 const Bd=!ENEMIES.some(e=>e.team=='B'&&e.alive),Ad=!P.alive&&!specList().length;
 if(ENEMIES.some(e=>e.team=='B')&&Bd){setTimeout(()=>endBattle(true),1800);return}
 if(Ad){setTimeout(()=>endBattle(false),2200);return}
 if(T===P){setScope(false);$('chat').style.display='none';setTimeout(()=>{if(!BEND&&!P.alive)specStep(1)},1800)}
 else if(T===SPEC)setTimeout(()=>{if(!BEND&&!P.alive)specStep(1)},1200)}
function endBattle(win){if(BEND||inHangar)return;BEND=true;specSet(null);setScope(false);$('btns').style.display='none';$('chat').style.display='none';
 const cr=Math.round(DMG*1.2+kills*1000+(win?6000:1500));ECO.cr+=cr;ECO.xp=(ECO.xp||0)+Math.round(cr/2);qInit();ECO.q.k+=kills;ECO.q.b++;ECO.q.d+=Math.round(DMG);if(win)ECO.q.w++;mailAdd((win?'Победа':'Поражение')+': отчёт о бое','Урон: '+fmt(DMG)+'\nУничтожено: '+kills+'\nНаграда: '+fmt(cr)+' кр.',0);js('maus_eco2',ECO);hCredits();
 const r=$('res');r.className=win?'win':'lose';r.querySelector('.rt').textContent=win?'ПОБЕДА':'ПОРАЖЕНИЕ';
 $('rd').textContent=fmt(DMG);$('rk').textContent=kills;$('rc').textContent='+'+fmt(cr);
 r.style.display='flex';void r.offsetWidth;r.classList.add('on');if(AC)EG.gain.value=0;
 setTimeout(()=>{paused=true},700)}
$('rgo').onclick=()=>{const r=$('res');r.style.display='none';r.classList.remove('on');specSet(null);toMenu();BEND=false};

$('hshop').onclick=()=>showPanel('sh');

/* ===== панели: ветки (b), хранилище (s, заглушка), магазин (sh) ===== */
let panel='h';
function showPanel(p){if(p==panel&&p!='h')p='h';panel=p;document.querySelectorAll('.ht').forEach(x=>x.classList.toggle('on',x.dataset.p==p));$('hg').classList.toggle('shop',p!='h');if(p!='h')buildShop()}
document.querySelectorAll('.ht').forEach(b=>b.onclick=()=>showPanel(b.dataset.p));
const BRANCHES={'СССР':['ms1','bt5','bt7',null,'kv1','kv2',null,'is6',null,null]};
const NATS=[['США','fA','США'],['Германия','fG','✠'],['СССР','fS','☭'],['Великобритания','fU',''],['Япония','fJ',''],['Китай','fC','★'],['Франция','fF',''],['Европа','fE','★']];
const KI=cls=>`<svg class="ki" viewBox="0 0 24 24"><use href="#k-${KLS[cls]||'tt'}"/></svg>`;let treeNat='СССР';
function treePan(el){if(!el)return;let d=null,mv=0,v=0,lt=0,raf=0;const K=1.9;/* K — ускорение прокрутки */
 const stop=()=>cancelAnimationFrame(raf);
 el.addEventListener('pointerdown',e=>{stop();d={x:e.clientX,l:el.scrollLeft,id:e.pointerId,lx:e.clientX};mv=0;v=0;lt=performance.now()});
 el.addEventListener('pointermove',e=>{if(!d||e.pointerId!=d.id)return;const dx=e.clientX-d.x;if(!mv&&Math.abs(dx)<6)return;if(!mv){mv=1;el.classList.add('pan');try{el.setPointerCapture(d.id)}catch(_){}}
  const now=performance.now(),dt=Math.max(1,now-lt);el.scrollLeft=d.l-dx*K;el.scrollTop=0;const iv=-(e.clientX-d.lx)*K/dt*16;v=v*.6+iv*.4;d.lx=e.clientX;lt=now});
 const up=e=>{if(!d)return;d=null;el.classList.remove('pan');if(mv&&performance.now()-lt<90){const f=()=>{if(Math.abs(v)<.4)return;el.scrollLeft+=v;v*=.955;raf=requestAnimationFrame(f)};f()}};
 el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
 el.addEventListener('wheel',e=>{stop();el.scrollLeft+=(e.deltaX+e.deltaY)*K;e.preventDefault()},{passive:false});
 el.addEventListener('click',e=>{if(mv){e.stopPropagation();e.preventDefault();mv=0}},true)}
function buildShop(){
 if(panel=='sh')return buildShop0();
 if(panel=='m'||panel=='t')return infoPanel();
 const sh=$('shop'),sl='<svg class="gi"><use href="#c-silv"/></svg>';
 if(panel=='s'){const tabs=[['i','ИКОНКИ','mail'],['c','СЕРТИФИКАТЫ','cup']],own=AV.own().filter(i=>AV.get(i).r!='c'),body=sTab=='i'?(own.length?'<div class="sti">'+own.map(i=>'<button class="stic r'+AV.get(i).r+(AV.sel()==i?' on':'')+'" data-i="'+i+'">'+AV.svg(i)+'<span>'+AV.get(i).n+'</span></button>').join('')+'</div>':'<div class="emp2">Купленных иконок пока нет</div>'):'<div class="emp2">Сертификатов пока нет</div>';sh.innerHTML=navHead('ХРАНИЛИЩЕ',tabs,sTab)+'<div class="nbd">'+body+'</div>';sh.querySelector('.nhb').onclick=()=>showPanel('h');sh.querySelectorAll('.ntb').forEach(b=>b.onclick=()=>{sTab=b.dataset.t;buildShop()});sh.querySelectorAll('.stic').forEach(b=>b.onclick=()=>{AV.setSel(b.dataset.i);AV.paint();buildShop();toast('Аватарка выбрана')});return}
 const cols=[];for(let t=1;t<=10;t++)cols.push([]);
 const fc=(NATS.find(n=>n[0]==treeNat)||[])[1]||'';
 if(BRANCHES[treeNat])BRANCHES[treeNat].forEach((id,i)=>cols[i].push(id));
 else CATALOG.filter(c=>c.nat==treeNat).forEach(c=>cols[c.tier-1].push(c.id));
 cols.forEach(a=>{while(a.length<4)a.push(undefined)});/* 4 ряда веток, свободные — запас */
 const card=(id,ti)=>{if(id===undefined)return `<div class="nd resn"></div>`;if(!id)return `<div class="nd stubn"><span class="kic">${KI('ЛТ')}</span>?<small>скоро</small></div>`;const c=CATALOG.find(c=>c.id==id),own=ECO.own.includes(id),pv=chainPrev(id),can=!own&&SOVB.includes(id)&&(!pv||ECO.own.includes(pv)),pr=isPrem(c);
  return `<button class="nd ${own?'own':''}${can?' can':''}${!own&&!can&&!pr?' lock':''}${pr?' prem':''}" data-id="${id}"><i class="nfl"><svg viewBox="0 0 60 30" preserveAspectRatio="none"><use href="#f-${FLG[c.nat]||'su'}"/></svg></i><span class="ti2">${KI(c.cls)} ${ROM[c.tier]}</span>${ICONS[id]?'<img src="'+ICONS[id]+'">':''}<b>${c.name}</b>${own?'<i class="ck">✓</i>':pr?'<em class="rs gold">Магазин</em>':can?'<em class="rs">'+sl+fmt(c.rc)+'</em>':'<em class="rs dim">'+sl+fmt(c.rc)+'</em>'}</button>`};
 sh.innerHTML=`<div class="sth"><b class="ptl">Дерево танков / ${treeNat}</b><button class="sx2" aria-label="Назад">←</button></div><div class="tw"><div class="nl">${NATS.map(n=>`<button class="nf ${n[1]}${n[0]==treeNat?' on':''}" data-n="${n[0]}" aria-label="${n[0]}"><svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice"><use href="#f-${FLG[n[0]]||'su'}"/></svg></button>`).join('')}</div><div class="tt">${cols.map((a,i)=>`<div class="tc"><div class="tcb">${a.map(card).join('')}</div><div class="tcl">${ROM[i+1]}</div></div>`).join('')}</div></div>`;
 sh.querySelector('.sx2').onclick=()=>showPanel('h');
 treePan(sh.querySelector('.tt'));
 sh.querySelectorAll('.nf').forEach(b=>b.onclick=()=>{treeNat=b.dataset.n;buildShop()});
 sh.querySelectorAll('.nd[data-id]').forEach(b=>b.onclick=()=>{const id=b.dataset.id,c=CATALOG.find(c=>c.id==id);if(ECO.own.includes(id)){showPanel('h');if(typeof setPlayer=='function')setPlayer(id);return}
  if(isPrem(c)){toast('Премиум-танк: покупается в магазине за золото');return}
  const pv=chainPrev(id);if(pv&&!ECO.own.includes(pv)){toast('Сначала получите '+CATALOG.find(x=>x.id==pv).name);return}
  confirmBuy('исследование: '+c.name,ICONS[id]?'<img src="'+ICONS[id]+'">':'',sl+fmt(c.rc),()=>research(id))})}

/* ===== почта и задания ===== */
const QDEF=[['k5','Уничтожить 5 танков','k',5,5000],['k25','Уничтожить 25 танков','k',25,20000],['b3','Сыграть 3 боя','b',3,4000],['w1','Победить в бою','w',1,8000],['d5k','Нанести 5 000 урона','d',5000,6000],['d30k','Нанести 30 000 урона','d',30000,25000]];
function qInit(){if(!ECO.q)ECO.q={k:0,b:0,w:0,d:0,c:[]};if(!ECO.mail){ECO.mail=[{id:1,t:'Добро пожаловать, танкист!',b:'Командование выделило стартовый подарок. Заберите награду и выполняйте задания во вкладке «Задачи».',r:3000,rd:0,c:0}]}}
function mailAdd(t,b,r){qInit();ECO.mail.unshift({id:Date.now(),t,b,r:r||0,rd:0,c:0});ECO.mail.length=Math.min(ECO.mail.length,30);js('maus_eco2',ECO);badges()}
function badges(){qInit();const m=ECO.mail.filter(x=>!x.rd||(x.r&&!x.c)).length,t=QDEF.filter(d=>ECO.q[d[2]]>=d[3]&&!ECO.q.c.includes(d[0])).length;[['mbdg',m],['tbdg',t]].forEach(([i,n])=>{const e=$(i);if(e){e.textContent=n||'';e.style.display=n?'flex':'none'}})}
const NI={home:'<svg viewBox="0 0 24 24"><path d="M3 21V10l9-6 9 6v11h-4v-7H7v7z" fill="currentColor"/></svg>',mail:'<svg viewBox="0 0 24 24"><path d="M3 6h18v12H3zM3 6l9 7 9-7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',warn:'<svg viewBox="0 0 24 24"><path d="M12 3 2 21h20z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10v5M12 17.500v1.500" stroke="currentColor" stroke-width="2"/></svg>',cup:'<svg viewBox="0 0 24 24"><path d="M7 3h10v6a5 5 0 0 1-10 0zM7 5H3v2a4 4 0 0 0 4 4M17 5h4v2a4 4 0 0 1-4 4M12 14v4M8 21h8" fill="none" stroke="currentColor" stroke-width="1.800"/></svg>',key:'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="4" fill="none" stroke="#f0961c" stroke-width="2"/><path d="M11 11l9 9M16 16l2-2M18 18l2-2" stroke="#f0961c" stroke-width="2"/></svg>'};
const chest=c=>`<img class="chs" src="img/${c=='#3a4a7a'||c=='#6b8f3a'?'case_gold':'case_tech'}.png" alt="">`;
let mTab='u',sTab='i';
/* общая шапка как на референсе: кнопка ангара, заголовок, вкладки справа, оранжевая линия */
function navHead(title,tabs,act){return `<div class="nhd"><button class="nhb" aria-label="Ангар">${NI.home}</button><b class="nht">${title}</b><div class="nts">${tabs.map(t=>`<button class="ntb${t[0]==act?' on':''}${t[3]?' off':''}" data-t="${t[0]}">${NI[t[2]]||''}<span>${t[1]}</span></button>`).join('')}</div></div>`}
function infoPanel(){qInit();const sh=$('shop'),M=panel=='m',sl='<svg class="gi"><use href="#c-silv"/></svg>';
 if(M){const tabs=[['n','НОВОСТИ','mail'],['u','УВЕДОМЛЕНИЯ','warn']];
  const rows=mTab=='u'?(ECO.mail.length?ECO.mail.map(x=>`<div class="nrw${x.rd?'':' new'}"><div class="nri">${chest('#b8892a')}</div><div class="nrt"><span>${x.t}</span><p>${x.b.replace(/\n/g,'<br>')}</p></div>${x.r?`<button class="mqb" data-m="${x.id}" ${x.c?'disabled':''}>${x.c?'Получено':'Забрать '+sl+fmt(x.r)}</button>`:''}</div>`).join(''):'<div class="emp2">Уведомлений нет</div>'):'<div class="emp2">Новостей пока нет</div>';
  sh.innerHTML=navHead(tabs.find(t=>t[0]==mTab)[1],tabs,mTab)+'<div class="nbd">'+rows+'</div>';
  if(mTab=='u'){ECO.mail.forEach(x=>x.rd=1);js('maus_eco2',ECO)}
  sh.querySelectorAll('.ntb').forEach(b=>b.onclick=()=>{if(b.classList.contains('off'))return;mTab=b.dataset.t;infoPanel()})}
 else{const pts=ECO.q.c.length*30,TH=[30,70,100,120],mx=120,dn=Math.floor(Date.now()/864e5),di=(dn+3)%7,now=new Date(),hl=23-now.getHours(),ml=59-now.getMinutes();
  const qs=QDEF.map(d=>{const v=Math.min(ECO.q[d[2]],d[3]),dd=ECO.q.c.includes(d[0]),ok=v>=d[3];return `<div class="tqr"><b>${d[1]}</b><div class="mqp"><i style="width:${v/d[3]*100}%"></i><span>${fmt(v)} / ${fmt(d[3])}</span></div><button class="mqb" data-q="${d[0]}" ${dd||!ok?'disabled':''}>${dd?'Выполнено':ok?'Забрать '+sl+fmt(d[4]):'Награда '+fmt(d[4])}</button></div>`}).join('');
  const wk=(c,n)=>`<div class="wkc">${chest(c)}<div class="wkp"><i style="width:${Math.min(100,pts/n*100)}%"></i></div><div class="wkn">${pts} / ${n} ${NI.key}</div></div>`;
  sh.innerHTML=`<div class="nhd tkh"><button class="nhb nhr" aria-label="Назад">←</button><b class="nht">Задачи <em>/ ${ECO.q.c.length} уровень</em></b></div><div class="tk"><div class="tkm"><div class="tkc"><div class="tkd"><b>День ${di+1}</b><span>${hl}ч ${ml}м</span></div><div class="tkl"><div class="tkt"><i style="width:${Math.min(100,pts/mx*100)}%"></i></div>${TH.map(t=>`<div class="tkk" style="left:${t/mx*100}%">${chest(pts>=t?'#6b8f3a':'#8a6a3a')}<small>${t}</small><u></u></div>`).join('')}<div class="tkn" style="left:${Math.min(100,pts/mx*100)}%">${pts}</div></div></div><div class="tql">${qs}</div></div><div class="tkw"><h4>Недельная награда</h4>${wk('#5b6a7a',320)}${wk('#3a4a7a',600)}<div class="wku">До обновления:<br><b>${6-di}д ${hl}ч</b></div></div></div>`}
 const bk=sh.querySelector('.nhb');bk.onclick=()=>showPanel('h');
 sh.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const x=ECO.mail.find(m=>m.id==b.dataset.m);if(!x||x.c)return;if(ONL()){ecoOp('claimMail',{id:x.id},r=>{toast(r.msg);infoPanel()});return}x.c=1;ECO.cr+=x.r;js('maus_eco2',ECO);hCredits();toast('Получено: +'+fmt(x.r)+' кр.');infoPanel()});
 sh.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const d=QDEF.find(d=>d[0]==b.dataset.q);if(!d||ECO.q.c.includes(d[0])||ECO.q[d[2]]<d[3])return;if(ONL()){ecoOp('claimQuest',{id:d[0]},r=>{toast(r.msg);infoPanel()});return}ECO.q.c.push(d[0]);ECO.cr+=d[4];js('maus_eco2',ECO);hCredits();toast('Награда: +'+fmt(d[4])+' кр.');infoPanel()});
 badges()}
badges();
