/* ===== бой: снаряды, попадания, урон, следы, HUD-эффекты ===== */
const VEL=130,ALL=[],shells=[];let kills=0,P,DMG=0;
CATALOG.forEach(c=>c.vel={'ТТ':850,'СТ':950,'ЛТ':1050,'ПТ':1150}[c.cls]||900);
/* что находится в точке p: земля / блок / танк (кроме owner) */
function probe(p,owner){
 if(p.y<H(p.x,p.z))return{k:'ground'};
 for(const c of cols){const dx=p.x-c.x,dz=p.z-c.z;if(Math.abs(dx)>c.r||Math.abs(dz)>c.r)continue;if(p.y<c.h&&dx*dx+dz*dz<c.r*c.r)return{k:'block',c}}
 for(const T of ALL){if(T===owner||!T.alive||(owner&&T.team===owner.team))continue;const dx=p.x-T.x,dz=p.z-T.z;if(dx*dx+dz*dz>100)continue;
  const s=Math.sin(T.h),c=Math.cos(T.h),lx=dx*c-dz*s-T.box.cx,lz=dx*s+dz*c-T.box.cz,ly=p.y-T.root.position.y;
  if(ly>T.box.y0&&ly<T.box.y1){const bh=T.box.y1-T.box.y0,kk=1-.3*cl((ly-T.box.y0-bh*.45)/(bh*.55),0,1),u=Math.pow(Math.abs(lx)/(T.box.hx*kk),3)+Math.pow(Math.abs(lz)/(T.box.hz*kk),3);if(u<1)return{k:'tank',T,lx,lz,ly}}}
 return null}
/* куда реально попадёт снаряд из ствола (для прицела) */
function impactPoint(){P.gunG.updateMatrixWorld(true);const p=V3(0,0,0);P.muz.getWorldPosition(p);const v=V3(0,0,-1).transformDirection(P.gunG.matrixWorld).multiplyScalar(1.4);let hit=null;
 for(let i=0;i<480;i++){p.addScaledVector(v,1);if(hit=probe(p,P))break}return{p,hit,v}}
/* броня в точке попадания: зона, нормаль, приведённая броня (толщина / cos угла) */
function armorInfo(T,h,v){const b=T.box,a=T.cat.arm,ax=Math.abs(h.lx/b.hx),az=Math.abs(h.lz/b.hz),mid=(b.y0+b.y1)/2,ay=Math.abs((h.ly-mid)/((b.y1-b.y0)/2)),n=V3(0,0,0);let base;
 if(ay>ax&&ay>az&&h.ly>mid){n.y=1;base=a[4]}else{if(ax>=az){n.x=Math.sign(h.lx)||1;base=a[1]}else{n.z=Math.sign(h.lz)||1;base=n.z<0?a[0]:a[2]}
  if(h.ly>b.y1*.55)base=a[3]*(ax>=az?.8:n.z<0?1:.6);else if(h.ly<b.y0+(b.y1-b.y0)*.28)base*=.3}
 const s=Math.sin(T.h),c=Math.cos(T.h),wx=n.x*c+n.z*s,wz=-n.x*s+n.z*c,d=v.clone().normalize(),cr=Math.abs(-d.x*wx-d.y*n.y-d.z*wz),cs=cl(cr,.34,1);
 return{base,eff:base/cs,ric:cr<.34&&base>=40}}
function shoot(T,spread){if(CDN>0)return;
 if(!T.alive||T.rl>0)return;{const k=T.cat.clip;let r=T.cat.rel;if(k){if(T.am==null)T.am=k.n;T.am--;if(T.am<=0){T.am=k.n}else r=k.gap}T.rlm=r;T.rl=T===P?r:r*(1.25+Math.random()*.5)}T.rec=1;T.fl=.14;
 T.gunG.updateMatrixWorld(true);const p=V3(0,0,0);T.muz.getWorldPosition(p);const d=V3(0,0,-1).transformDirection(T.gunG.matrixWorld);
 if(T===P&&P.disp)spread=P.disp;
 if(spread){const rt=V3(-d.z,0,d.x).normalize(),up=V3().crossVectors(d,rt).normalize(),a=Math.random()*6.2832,r=spread*Math.sqrt(Math.random());d.addScaledVector(rt,Math.cos(a)*r).addScaledVector(up,Math.sin(a)*r).normalize()}
 if(T===P)P.disp=Math.min(.04,(P.disp||.0045)+.01);
 shells.push({p:p.clone(),v:d.clone().multiplyScalar(T.cat.vel),o:T,m:null});
 const dist=T===P?0:p.distanceTo(P.root.position);
 if(T===P){flash.position.copy(p);flash.intensity=18;S.shake=.4;S.bpv-=1.2;fo=.06}
 bang(T===P?.9:cl(40/(dist+15),0,.7),1600);
 for(let i=0;i<7;i++)fire.emit(p.x,p.y,p.z,R2()*4+d.x*(8+Math.random()*14),R2()*4+d.y*(8+Math.random()*14),R2()*4+d.z*(8+Math.random()*14),.2+Math.random()*.12,1+Math.random()*1.4,3,[1,.72,.35],.7);
 for(let i=0;i<5;i++)smoke.emit(p.x,p.y,p.z,R2()*4+d.x*8,R2()*3+d.y*9+1,R2()*5+d.z*9,2.4,1.8,4,[.72,.72,.72],.55)}
const shellGlow=new THREE.SpriteMaterial({map:flareTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}),shellGeo=new THREE.CylinderGeometry(.11,.11,1.6,6).rotateX(Math.PI/2),shellMat=new THREE.MeshBasicMaterial({color:0xfff0b0,fog:false});
function boom(p,big){const dist=Math.hypot(p.x-P.x,p.z-P.z);const n=big?4:3;
 for(let i=0;i<n;i++)fire.emit(p.x,p.y+.5,p.z,R2()*5,Math.random()*3,R2()*4,.3,.4+Math.random()*.6,1.2,[1,.55,.2],.8);
 for(let i=0;i<n*1.6;i++)smoke.emit(p.x,p.y+.5,p.z,R2()*3,Math.random()*2+.5,R2()*3,1+Math.random()*.5,.6,1,big?[.25,.24,.22]:[.5,.45,.38],.5);
 S.shake=Math.max(S.shake,big?.12*Math.min(1,20/(dist+1)):.05)}
function popup(txt,x,y,me){const e=document.createElement('div');e.className='pop'+(me?' me':'');e.textContent=txt;e.style.transform=`translate(${x}px,${y}px)`;document.body.appendChild(e);setTimeout(()=>e.remove(),1250)}
const SV=(id)=>`<svg class="fi"><use href="#${id}"/></svg>`;
function feedK(a,b){const d=document.createElement('div'),n=t=>{const e=document.createElement('span');e.textContent=t;return e.outerHTML};d.innerHTML=n(a)+SV('i-arrow')+n(b)+SV('i-boom');$('feed').appendChild(d);setTimeout(()=>d.remove(),4000)}
function feed(t){const d=document.createElement('div');d.textContent=t;$('feed').appendChild(d);setTimeout(()=>d.remove(),4000)}
function say(t){const b=$('big');b.textContent=t;b.style.opacity=1;clearTimeout(say.t);say.t=setTimeout(()=>b.style.opacity=0,1800)}
function impact(s,h){
 const p=s.p;
 if(h.k=='tank'){const T=h.T,n=V3(0,0,0),ax=Math.abs(h.lx/T.box.hx),az=Math.abs(h.lz/T.box.hz),ay=Math.abs((h.ly-(T.box.y0+T.box.y1)/2)/((T.box.y1-T.box.y0)/2));
  if(ax>=az&&ax>=ay)n.x=Math.sign(h.lx);else if(az>=ay)n.z=Math.sign(h.lz);else n.y=Math.sign(h.ly-(T.box.y0+T.box.y1)/2)||1;
  tankDecal(T,V3(h.lx+T.box.cx,h.ly,h.lz+T.box.cz),n);boom(p,false);if(window.NET&&NET.on)return;   /* сетевой бой: урон/броню/гусеницы считает сервер */
  {const bh=T.box.y1-T.box.y0;if(h.ly<T.box.y0+bh*.36&&Math.abs(h.lx)>T.box.hx*.55&&Math.abs(h.lz)>T.box.hz*.6){trackHit(T,Math.sign(h.lx)||1,Math.sign(h.lz)||1,p);return}}
  const ai=armorInfo(T,h,s.v),pn=s.o.cat.pen*(.85+Math.random()*.3);
  if(ai.ric||ai.eff>pn){const tx=ai.ric?'Рикошет':'Не пробил';if(T===P)popup(tx,innerWidth/2-40,innerHeight*.62,false);else if(s.o===P){const q=toScreen(p);popup(tx,q.x,q.y)}return}
  const dmg=Math.round(s.o.cat.dmg*(.85+Math.random()*.3));if(T.net&&s.o!==P)return;T.hp=Math.max(0,T.hp-dmg);if(s.o===P&&T.team!==P.team)DMG+=dmg;
  if(T===P){$('dmg').style.opacity=1;S.shake=.7;const q=toScreen(p);popup('-'+dmg,innerWidth/2-20,innerHeight*.62,true)}
  else if(s.o===P){const q=toScreen(p);popup('-'+dmg,q.x,q.y);$('ret').animate([{transform:$('ret').style.transform+' scale(1.7)'},{transform:$('ret').style.transform+' scale(1)'}],160)}
  if(T.hp<=0)kill(T,s.o)}
 else{const n=h.k=='ground'?V3(0,1,0):V3(-s.v.x,0,-s.v.z).normalize();if(h.k=='ground')p.y=0;worldDecal(p,n,.2+Math.random()*.12);boom(p,true)}}
/* ===== сбитая гусеница: попадание в нижнюю часть борта у носа или кормы; 7 с ремонта, танк не едет и не поворачивает =====
   Новых моделей нет: сама гусеница чуть «раскручивается» вперёд/назад, расходится наружу и провисает у места попадания */
const TRK_T=7,_tm4=new THREE.Matrix4(),_tw=new THREE.Matrix4(),_tb=new THREE.Box3(),_tv=new THREE.Vector3(),_te=new THREE.Euler();
function trkMeshes(T){if(T._tm)return T._tm;const l=[];T.root.traverse(m=>{if(!m.isMesh||(m.userData&&m.userData.hl))return;if((m.userData&&m.userData.tr)||(T.links&&T.links.some(k=>k.im===m))||(T.tracks&&T.tracks.some(t=>m.material&&m.material.map===t.t)))l.push(m)});return T._tm=l}
function trkWarp(T,k){const b=T.box,R=T.root,side=T.tks,end=T.tke;R.updateMatrixWorld(true);const Wi=_tm4.copy(R.matrixWorld).invert().clone();
 trkMeshes(T).forEach(m=>{if(!m._b)m._b=[m.position.clone(),m.quaternion.clone(),m.scale.clone()];
  m.position.copy(m._b[0]);m.quaternion.copy(m._b[1]);m.scale.copy(m._b[2]);m.updateMatrix();if(k<=0)return;m.parent.updateWorldMatrix(true,false);m.updateWorldMatrix(false,false);
  let c;const L=T.links&&T.links.find(q=>q.im===m);if(L)c=m.localToWorld(_tv.set(L.x,.5,0).clone());else{_tb.setFromObject(m);c=_tb.getCenter(_tv.clone())}
  c=R.worldToLocal(c);if(Math.sign(c.x-b.cx)!==side||Math.abs(c.x-b.cx)<b.hx*.3)return;
  const D=new THREE.Matrix4().makeTranslation(0,-.04*k,end*.9*k).multiply(new THREE.Matrix4().makeTranslation(c.x,c.y,c.z)).multiply(new THREE.Matrix4().makeRotationFromEuler(_te.set(end*.07*k,end*side*.14*k,0))).multiply(new THREE.Matrix4().makeScale(1,1,1+.08*k)).multiply(new THREE.Matrix4().makeTranslation(-c.x,-c.y,-c.z));
  const W=new THREE.Matrix4().copy(R.matrixWorld).multiply(D).multiply(Wi).multiply(m.matrixWorld),Pi=new THREE.Matrix4().copy(m.parent.matrixWorld).invert();
  Pi.multiply(W).decompose(m.position,m.quaternion,m.scale)});T.tkk=k}
function trackFix(T){T.tk=0;if(T.tkk>0)trkWarp(T,0);if(T===P)$('trk').style.display='none'}
function trackHit(T,side,end,p){
 if(!(T.tk>0)){T.tks=side;T.tke=end;T.tkt=0}
 T.tk=TRK_T;
 for(let i=0;i<10;i++)fire.emit(p.x,p.y,p.z,R2()*6,Math.random()*4,R2()*6,.3,.5+Math.random()*.6,2,[1,.7,.3],.9);
 for(let i=0;i<6;i++)smoke.emit(p.x,p.y,p.z,R2()*3,Math.random()*2+.5,R2()*3,1.2,.8,1.4,[.45,.4,.33],.5);
 if(T===P){$('dmg').style.opacity=1;say('Гусеница сбита!');$('trk').style.display='block'}
 else{const q=toScreen(p);popup('Гусеница!',q.x,q.y)}}
function trackTick(T,dt){T.tk-=dt;T.tkt=(T.tkt||0)+dt;
 if(T===P){const e=$('trk');e.firstChild.textContent='ГУСЕНИЦА СБИТА · '+Math.max(0,T.tk).toFixed(1)+' с';e.lastChild.firstChild.style.width=(100-Math.max(0,T.tk)/TRK_T*100)+'%'}
 if(T.tk<=0){trackFix(T);if(T===P)feed('Гусеница восстановлена');return}
 const e=x=>x*x*(3-2*x),k=e(Math.min(1,T.tkt/.35,T.tk/.5));if(Math.abs(k-(T.tkk||0))>.004)trkWarp(T,k)}
function kill(T,by){T.alive=false;T.dead=7;T.flare.material.opacity=0;if(T.tag)T.tag.style.display='none';
 const c=T.root.position;for(let i=0;i<2;i++)boom(V3(c.x+R2()*3,c.y+1+i,c.z+R2()*3),true);T.tur.rotation.y+=R2()*.8;T.gunG.rotation.x=-.12;
 if(T===P){P.dead=4;say('Уничтожен!')}
 else if(by===P){kills++;$('kills').textContent=kills;say('Уничтожен!')}
 feedK(by===P?'Вы':by.name,T===P?'Вы':T.name);if(typeof battleCheck=='function')battleCheck(T)}
function updateShells(dt){
 for(let i=shells.length-1;i>=0;i--){const s=shells[i];if(!s.m){s.m=new THREE.Mesh(shellGeo,shellMat);const g=new THREE.Sprite(shellGlow);g.scale.setScalar(2.6);s.m.add(g);scene.add(s.m)}
  let hit=null;const nn=Math.min(80,Math.ceil(s.o.cat.vel*dt/.5));for(let k=0;k<nn&&!hit;k++){const h=dt/nn;s.p.addScaledVector(s.v,h);hit=probe(s.p,s.o)}
  s.m.position.copy(s.p);s.m.lookAt(s.p.clone().add(s.v));
  fire.emit(s.p.x,s.p.y,s.p.z,0,0,0,.25,.7,-1,[1,.8,.4],.7);smoke.emit(s.p.x,s.p.y,s.p.z,0,0,0,.7,.6,.9,[.9,.9,.9],.25);
  if(hit)impact(s,hit);if(hit||s.p.length()>600){scene.remove(s.m);shells.splice(i,1)}}}

/* подсветка брони цели: красный — не пробить, жёлтый — 50/50, нет цвета — пробьёшь; считается по зонам брони прямо в шейдере */
let hlT=null;const HL={};
const HU={uT:{value:new THREE.Vector4()},uB:{value:new THREE.Vector4()},uY:{value:new THREE.Vector3()},uA:{value:new THREE.Vector4()},uA4:{value:0},uPen:{value:250},uOC:{value:new THREE.Color(0xff2a20)}};
const hlMat=new THREE.ShaderMaterial({uniforms:HU,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,
 vertexShader:'varying vec3 vW;varying vec3 vN;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}',
 fragmentShader:`uniform vec4 uT,uB,uA;uniform vec3 uY;uniform float uA4,uPen;varying vec3 vW;varying vec3 vN;
void main(){float dx=vW.x-uT.x,dz=vW.z-uT.y,s=uT.z,c=uT.w;float lx=dx*c-dz*s-uB.x,lz=dx*s+dz*c-uB.y,ly=vW.y-uY.z;
float ax=abs(lx/uB.z),az=abs(lz/uB.w),mid=(uY.x+uY.y)*.5,ay=abs((ly-mid)/((uY.y-uY.x)*.5));vec3 n=vec3(0.);float base;
if(ay>ax&&ay>az&&ly>mid){n.y=1.;base=uA4;}else{if(ax>=az){n.x=lx<0.?-1.:1.;base=uA.y;}else{n.z=lz<0.?-1.:1.;base=n.z<0.?uA.x:uA.z;}
 if(ly>uY.y*.55)base=uA.w*(ax>=az?.8:(n.z<0.?1.:.6));else if(ly<uY.x+(uY.y-uY.x)*.28)base*=.3;}
float wx=n.x*c+n.z*s,wz=-n.x*s+n.z*c;vec3 d=normalize(vW-cameraPosition);float cr=abs(-d.x*wx-d.y*n.y-d.z*wz);float cs=clamp(cr,.34,1.);
float q=(cr<.34&&base>=40.)?9.:base/cs/uPen;float k=smoothstep(.78,.92,q);if(k<.01)discard;float mr=smoothstep(1.08,1.22,q);
float f=1.-abs(dot(normalize(vN),-d));vec3 col=mix(vec3(.98,.78,.2),vec3(1.,.16,.12),mr);float a=mix(.36+f*.25,.42+min(.2,(q-1.15)*.25)+f*.28,mr)*k;
gl_FragColor=vec4(col,a);}`});
const hlOut=new THREE.ShaderMaterial({uniforms:HU,side:THREE.BackSide,depthWrite:false,transparent:true,
 vertexShader:'void main(){vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);vec3 nr=normalize(normalMatrix*normal);vec2 o=(projectionMatrix*vec4(nr,0.)).xy;if(length(o)>1e-4)p.xy+=normalize(o)*.006*p.w;gl_Position=p;}',
 fragmentShader:'uniform vec3 uOC;void main(){gl_FragColor=vec4(uOC,.95);}'});
function hlShow(T,v,o){if(T&&T.hl){T.hl.forEach(x=>x.visible=v);T.hlo.forEach(x=>x.visible=v&&o)}}
function hlSet(T,st){if(hlT&&hlT!==T)hlShow(hlT,false);hlT=T||null;if(!T)return;
 if(!T.hl){T.hl=[];T.hlo=[];const L=[];T.root.traverse(m=>{if(m.isMesh&&!m.isInstancedMesh&&!m.userData.hl&&m.material!==decalMat)L.push(m)});
  L.forEach(m=>{[[hlMat,T.hl,3],[hlOut,T.hlo,1]].forEach(([mt,arr,ro])=>{const o=new THREE.Mesh(m.geometry,mt);o.userData.hl=1;o.visible=false;o.castShadow=o.receiveShadow=false;o.renderOrder=ro;m.add(o);arr.push(o)})})}
 const b=T.box,a=T.cat.arm;HU.uT.value.set(T.x,T.z,Math.sin(T.h),Math.cos(T.h));HU.uB.value.set(b.cx,b.cz,b.hx,b.hz);HU.uY.value.set(b.y0,b.y1,T.root.position.y);
 HU.uA.value.set(a[0],a[1],a[2],a[3]);HU.uA4.value=a[4];HU.uPen.value=P.cat.pen;HU.uOC.value.setHex(st==2?0xff2a20:0xf0c030);hlShow(T,true,st>0)}
/* прогрев: компилируем шейдеры заранее, чтобы не было подвисаний на первом выстреле и первом прицеливании */
function warm(){try{const tmp=[],a=new THREE.Mesh(shellGeo,shellMat);a.add(new THREE.Sprite(shellGlow));a.position.set(0,-60,0);scene.add(a);tmp.push(a);
 const d=new THREE.Mesh(decalGeo,decalMat);d.position.set(0,-60,0);scene.add(d);tmp.push(d);
 ALL.forEach(T=>{if(T!==P)hlSet(T,2)});R.compile(scene,cam);tmp.forEach(o=>scene.remove(o));ALL.forEach(T=>hlShow(T,false));hlT=null}catch(e){console.error(e)}}
