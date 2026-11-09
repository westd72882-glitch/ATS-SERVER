/* ===== игрок: управление, физика, подвеска, камера, башня ===== */
var SPEC=null;let jx=0,jy=0,cy=0,cp=.3,fo=0,scope=false;const SFOV=13;function setScope(v){scope=v;$('scope').style.display=v?'block':'none';$('cdot').style.display=v?'none':'';if(!v&&P&&P.root){P.root.visible=true;cam.fov=55;cam.updateProjectionMatrix()}}
const ptr={},base=$('base'),knob=$('knob'),K={};
/* камера: 3 дальности — близко / средне / далеко */
const CDS=[8,13,21];let CDi=1,CD=13,CDt=13;try{CDi=Math.min(2,Math.max(0,+localStorage.getItem('maus_cam')||1));CD=CDt=CDS[CDi]}catch(_){}
const S={bp2:0,bp:0,bpv:0,br:0,brv:0,by:0,byv:0,shake:0,mark:0,dust:0,t:0};
addEventListener('pointerdown',e=>{audio();if(AC&&AC.state=='suspended'&&!muted)AC.resume();
 if(inHangar||paused||e.target.closest('button,input,#pause'))return;
 const stick=e.clientX<innerWidth*.45&&e.clientY>innerHeight*.35&&e.pointerType!='mouse';
 ptr[e.pointerId]={t:stick?'s':'l',ox:e.clientX,oy:e.clientY,x:e.clientX,y:e.clientY};
 if(stick){base.style.left=e.clientX+'px';base.style.top=e.clientY+'px';base.classList.add('on')}});
addEventListener('pointermove',e=>{const p=ptr[e.pointerId];if(!p)return;
 if(p.t=='s'){let dx=(e.clientX-p.ox)/55,dy=(e.clientY-p.oy)/55;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}jx=Math.abs(dx)<.12?0:dx;jy=Math.abs(dy)<.12?0:dy;knob.style.transform=`translate(${dx*base.offsetWidth*.26}px,${dy*base.offsetWidth*.26}px)`}
 else{const sn=scope?.3:1;cy-=(e.clientX-p.x)*.0035*sn*SENS;cp=cl(cp+(e.clientY-p.y)*.0028*sn*SENS,-.55,.85);p.x=e.clientX;p.y=e.clientY}});
const up=e=>{const p=ptr[e.pointerId];if(!p)return;if(p.t=='s'){jx=jy=0;base.style.left=base.style.top='';knob.style.transform='';base.classList.remove('on')}delete ptr[e.pointerId]};
addEventListener('pointerup',up);addEventListener('pointercancel',up);
addEventListener('keydown',e=>{audio();K[e.code]=1;if(e.code=='Space')shoot(P);if(e.code=='KeyQ'||e.code=='ShiftLeft')setScope(!scope)});addEventListener('keyup',e=>K[e.code]=0);
$('bscope').addEventListener('pointerdown',e=>{e.preventDefault();setScope(!scope)});$('fire').addEventListener('pointerdown',e=>{e.preventDefault();audio();shoot(P)});
addEventListener('contextmenu',e=>e.preventDefault());
/* следы гусениц */
const marks=new THREE.InstancedMesh(new THREE.PlaneGeometry(.5,.9).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x2a2218,transparent:true,opacity:.35,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),500);
marks.frustumCulled=false;scene.add(marks);let mi=0;const dm=new THREE.Object3D();for(let i=0;i<500;i++){dm.position.set(0,-99,0);dm.updateMatrix();marks.setMatrixAt(i,dm.matrix)}
/* точка, куда смотрит камера (центр экрана) */
function aimPoint(){const o=cam.position,d=V3(0,0,-1).transformDirection(cam.matrixWorld),q=V3(0,0,0);let prev=8;
 for(let t=8;t<450;t+=2){q.copy(o).addScaledVector(d,t);if(probe(q,P)){let a=prev,b=t;for(let i=0;i<6;i++){const m=(a+b)/2;q.copy(o).addScaledVector(d,m);probe(q,P)?b=m:a=m}return o.clone().addScaledVector(d,b)}prev=t}
 return o.clone().addScaledVector(d,450)}
function respawnPlayer(){const p=spawnPos('A');Object.assign(P,{x:p.x,z:p.z,h:(Math.random()-.5)*.5,v:0,w:0,ty:0,gp:0,hp:P.maxhp,alive:true,rl:1});trackFix(P);P.decals.forEach(d=>P.body.remove(d));P.decals.length=0;P.tur.rotation.y=0;cy=P.h;S.by=0;S.byv=0}
const tmp=V3(0,0,0),FWD=()=>V3(-Math.sin(P.h),0,-Math.cos(P.h));
function updatePlayer(dt){
 let ix=0,iy=0;if(P.alive&&!(CDN>0)){ix=cl(jx+((K.KeyD||K.ArrowRight)?1:0)-((K.KeyA||K.ArrowLeft)?1:0),-1,1);iy=cl(-jy+((K.KeyW||K.ArrowUp)?1:0)-((K.KeyS||K.ArrowDown)?1:0),-1,1)}
 else{P.dead-=dt}
 const tgt=P.tk>0?0:iy>0?iy*P.vm:iy*3.2,a=(Math.abs(tgt)>Math.abs(P.v)&&tgt*P.v>=0)||P.v==0?1.7:(iy==0?2.2:6);
 P.v+=cl(tgt-P.v,-a*dt,a*dt);if(P.tk>0)P.v*=1-Math.min(1,dt*4);P.v-=9.8*Math.sin(S.bp)*dt*.7;
 const tw=P.tk>0?0:-ix*TURN*(Math.abs(iy)<.1?1:1-.35*Math.abs(P.v)/P.vm);P.w+=cl(tw-P.w,-1.6*dt,1.6*dt);
 P.h+=P.w*dt;const f=FWD();P.x+=f.x*P.v*dt;P.z+=f.z*P.v*dt;collide(P,dt);
 /* подвеска */
 const r=V3(Math.cos(P.h),0,-Math.sin(P.h)),hF=H(P.x+f.x*3.6,P.z+f.z*3.6),hR=H(P.x-f.x*3.6,P.z-f.z*3.6),hRt=H(P.x+r.x*1.6,P.z+r.z*1.6),hL=H(P.x-r.x*1.6,P.z-r.z*1.6);
 const gy=Math.max((hF+hR+hRt+hL)/4,H(P.x,P.z)-.3),pT=cl(Math.atan2(hF-hR,7.2),-.5,.5),rT=cl(Math.atan2(hRt-hL,3.2),-.4,.4),acc=cl((tgt-P.v)*.0025,-.025,.025);
 S.bp=pT;const pt=cl(pT+acc,-.5,.5)+Math.sin(S.t*38)*.0006*(1+Math.abs(P.v)*.3),rt=cl(rT-P.w*P.v*.004,-.4,.4);
 S.bpv+=(-(S.bp2-pt)*70-S.bpv*9)*dt;S.bp2+=S.bpv*dt;S.brv+=(-(S.br-rt)*70-S.brv*9)*dt;S.br+=S.brv*dt;
 S.byv+=((gy-S.by)*90-S.byv*12)*dt;S.by+=S.byv*dt;S.bp2=cl(S.bp2,pT-.05,pT+.05);S.br=cl(S.br,rT-.05,rT+.05);S.by=cl(S.by,gy-.02,gy+.15);
 const lift=(Math.abs(Math.sin(S.bp2))*P.box.hz+Math.abs(Math.sin(S.br))*P.box.hx)*.1;
 P.root.position.set(P.x,gy+(S.by-gy)*.6+lift+.03,P.z);P.root.rotation.y=P.h;P.body.rotation.set(S.bp2,0,S.br);animTracks(P,dt);
 /* камера */
 CD+=(CDt-CD)*Math.min(1,dt*8);const F=SPEC&&SPEC.alive?SPEC:P,T=V3(F.x,F.root.position.y+3.6+(CD-13)*.12,F.z);cam.position.set(T.x+Math.sin(cy)*Math.cos(cp)*CD,T.y+Math.sin(cp)*CD+1,T.z+Math.cos(cy)*Math.cos(cp)*CD);
 cam.position.y=Math.max(cam.position.y,H(cam.position.x,cam.position.z)+1.4);
 const sf=scope?SFOV:55;if(cam.fov!=sf){cam.fov=sf;cam.updateProjectionMatrix()}P.root.visible=!(scope&&P.alive);
 if(S.shake>0){S.shake=Math.max(0,S.shake-dt*1.5);0   /* тряска отключена */}
 if(scope&&P.alive){P.tur.getWorldPosition(tmp);const k=Math.cos(cp);cam.position.set(tmp.x-Math.sin(cy)*k*2,tmp.y+1.3-Math.sin(cp)*2,tmp.z-Math.cos(cy)*k*2)}
 {const k=Math.cos(cp)*30;cam.lookAt(cam.position.x-Math.sin(cy)*k,cam.position.y-Math.sin(cp)*30,cam.position.z-Math.cos(cy)*k)};cam.updateMatrixWorld(true);
 /* башня и орудие следуют за камерой */
 if(P.alive){const ap=aimPoint();P.tur.getWorldPosition(tmp);const ang=Math.atan2(-(ap.x-tmp.x),-(ap.z-tmp.z));
  P.ty=wrap(P.ty+cl(wrap(ang-P.h-P.ty),-1.3*dt,1.3*dt));if(P.cat.lim)P.ty=cl(P.ty,-P.cat.lim,P.cat.lim);P.tur.rotation.y=P.ty;
  P.gunG.getWorldPosition(tmp);const dx=ap.x-tmp.x,dz=ap.z-tmp.z,dd=Math.max(1,Math.hypot(dx,dz)),dy=ap.y-tmp.y,g=9.8,v2=P.cat.vel*P.cat.vel,disc=v2*v2-g*(g*dd*dd+2*dy*v2);
  const e=Math.atan2(dy,dd),tilt=S.bp2*Math.cos(P.ty)-S.br*Math.sin(P.ty);
  P.gp+=cl(cl(e-tilt,-.13,.6)-P.gp,-1.2*dt,1.2*dt);P.gunG.rotation.x=P.gp}
 P.rec=Math.max(0,P.rec-dt*1.1);P.gunM.position.z=Math.pow(P.rec,2)*.9;
 sun.position.set(P.x+14,110,P.z+10);sun.target.position.set(P.x,0,P.z);
 /* пыль, выхлоп, следы */
 const sp2=Math.abs(P.v)+Math.abs(P.w)*2;S.dust+=sp2*dt;S.mark+=Math.abs(P.v)*dt+Math.abs(P.w)*dt*1.4;
 if(S.dust>.25&&sp2>.8){S.dust=0;[-1,1].forEach(s=>{tmp.set(s*1.3,.2,P.v>=0?4:-4);P.body.localToWorld(tmp);smoke.emit(tmp.x,tmp.y,tmp.z,R2()*1.5,.8+Math.random(),R2()*1.5,1.6,1.4,2.6,[.55,.5,.42],.3)});
  tmp.set(.6,2.1,4.2);P.body.localToWorld(tmp);smoke.emit(tmp.x,tmp.y,tmp.z,0,1.6,0,1.4,.8,1.6,[.25,.25,.25],.35)}
 if(S.mark>.8){S.mark=0;[-1,1].forEach(s=>{tmp.set(s*1.15,0,0);P.body.localToWorld(tmp);dm.position.set(tmp.x,.05,tmp.z);dm.rotation.set(S.bp2,P.h,S.br,'YXZ');dm.updateMatrix();marks.setMatrixAt(mi=(mi+1)%500,dm.matrix)});marks.instanceMatrix.needsUpdate=true}
 if(AC){const rpm=cl(.2+Math.abs(P.v)/P.vm*.5+Math.abs(iy)*.25+Math.abs(P.w)*.3,0,1);E1.frequency.value=34+rpm*48;E2.frequency.value=17+rpm*24;EF.frequency.value=160+rpm*420;EG.gain.value=0}}
