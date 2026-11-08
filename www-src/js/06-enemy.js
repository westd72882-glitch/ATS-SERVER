/* ===== враги: такие же Maus, ездят и стреляют по игроку ===== */
const ENEMIES=[],VMAX=7,TURN=.62;
function spawnPos(team){let x,z,n=0;const sd=team=='B'?-1:1;do{x=(Math.random()-.5)*300;z=sd*(110+Math.random()*(window.SPAWN_SPAN||75))}while(n++<50&&(cols.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+6)||ALL.some(t=>t.alive&&Math.hypot(t.x-x,t.z-z)<14)));return{x,z}}
function newWP(e){let x,z,n=0;do{x=(Math.random()-.5)*340;z=(Math.random()-.5)*340}while(n++<30&&cols.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+5));e.wx=x;e.wz=z;e.wt=15+Math.random()*10}
function resetEnemy(e){const p=spawnPos(e.team);Object.assign(e,{x:p.x,z:p.z,h:(e.team=='B'?Math.PI:0)+(Math.random()-.5)*.5,v:0,w:0,ty:0,gp:0,hp:e.maxhp,alive:true,dead:0,rl:3+Math.random()*4,stuck:0});trackFix(e);
 e.decals.forEach(d=>e.body.remove(d));e.decals.length=0;e.tur.rotation.y=0;e.root.position.set(e.x,H(e.x,e.z),e.z);newWP(e)}
let MODE=1;
function makeBots(team,n){for(let i=0;i<n;i++){const pool=CATALOG.filter(c=>Math.abs(c.tier-P.tier)<=1),cat=(pool.length?pool:CATALOG)[Math.floor(Math.random()*(pool.length||CATALOG.length))],e=buildTank(cat.id);e.team=team;e.tag=document.createElement('div');e.tag.className='tag'+(team=='A'?' ally':'');e.tier=cat.tier;e.tag.innerHTML=cat.name+'<span class=hpt></span><i><b></b></i>';document.body.appendChild(e.tag);
 ALL.push(e);ENEMIES.push(e);resetEnemy(e)}}
function makeEnemies(n){P.team='A';makeBots('A',n-1);makeBots('B',n)}
function hullCircles(T){const b=T.box,r=Math.max(.8,b.hx*.92),L=Math.max(0,b.hz-r),n=Math.max(2,Math.ceil(L*2/(r*1.3))+1),s=Math.sin(T.h),c=Math.cos(T.h),o=[];for(let i=0;i<n;i++){const lz=b.cz-L+2*L*i/(n-1),lx=b.cx;o.push({x:T.x+lx*c+lz*s,z:T.z-lx*s+lz*c,r})}return o}
function ramDmg(X,d,by){if(!X.alive||d<=0)return;const f=X.team===by.team;X.hp=Math.max(f?1:0,X.hp-d);if(X===P){$('dmg').style.opacity=1;S.shake=.5;popup('-'+d,innerWidth/2-20,innerHeight*.62,true)}else if(by===P&&!f){popup('-'+d,innerWidth/2,innerHeight*.4)}if(X.hp<=0)kill(X,by)}
function collide(T,dt){if(T.cd>0)T.cd-=dt;const C=hullCircles(T);
 for(const ci of C)for(const c of cols){const dx=ci.x-c.x,dz=ci.z-c.z;if(Math.abs(dx)>c.r+ci.r+1||Math.abs(dz)>c.r+ci.r+1)continue;const d=Math.hypot(dx,dz),m=c.r+ci.r;if(d<m&&d>.01){const o=m-d;T.x+=dx/d*o;T.z+=dz/d*o;ci.x+=dx/d*o;ci.z+=dz/d*o;T.v*=1-Math.min(1,dt*6)}}
 for(const O of ALL){if(O===T||!O.alive||Math.abs(O.x-T.x)>18||Math.abs(O.z-T.z)>18)continue;const CO=hullCircles(O);let best=0,nx=0,nz=0;
  for(const a of C)for(const b of CO){const dx=a.x-b.x,dz=a.z-b.z,d=Math.hypot(dx,dz),m=a.r+b.r;if(d<m&&d>.01&&m-d>best){best=m-d;nx=dx/d;nz=dz/d}}
  if(best>0){const mT=T.cat.hp,mO=O.cat.hp,sh=mO/(mT+mO);T.x+=nx*best*sh;T.z+=nz*best*sh;
   const vx=-Math.sin(T.h)*T.v+Math.sin(O.h)*O.v,vz=-Math.cos(T.h)*T.v+Math.cos(O.h)*O.v,cs=-(vx*nx+vz*nz);
   if(cs>0)T.v*=1-Math.min(1,dt*5);
   if(cs>2.2&&!(T.cd>0)&&!(O.cd>0)){const k=cs-2.2;T.cd=O.cd=.9;ramDmg(T,Math.round(k*56*mO/(mT+mO)),O);ramDmg(O,Math.round(k*56*mT/(mT+mO)),T);if(T===P||O===P)S.shake=Math.max(S.shake||0,.6)}}}
 T.x=cl(T.x,-193,193);T.z=cl(T.z,-193,193)}
function los(a,b){for(const c of cols){if(c.h<1.8)continue;const dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz||1,t=cl(((c.x-a.x)*dx+(c.z-a.z)*dz)/l2,0,1),px=a.x+dx*t-c.x,pz=a.z+dz*t-c.z;if(px*px+pz*pz<c.r*c.r)return false}return true}
function target(e){let b=null,bs=1e9;for(const t of ALL){if(t.team===e.team||!t.alive)continue;const d=Math.hypot(t.x-e.x,t.z-e.z);if(d>230)continue;const s=d*(.55+.6*t.hp/t.maxhp)+(los(e,t)?0:60)-(t===e.tg?25:0);if(s<bs){bs=s;b=t}}return b}
function coverPt(e,tg){let best=null,bd=75;for(const c of cols){if(c.h<2)continue;const d=Math.hypot(c.x-e.x,c.z-e.z);if(d<bd){const ux=c.x-tg.x,uz=c.z-tg.z,l=Math.hypot(ux,uz)||1;bd=d;best={x:c.x+ux/l*(c.r+5),z:c.z+uz/l*(c.r+5)}}}return best}
function aiUpdate(e,dt){
 if(!e.alive)return;
 e.wt-=dt;e.tl=(e.tl||0)-dt;if(e.tl<=0||!e.tg||!e.tg.alive){e.tg=target(e);e.tl=1.2}const tg=e.tg,lim=e.cat&&e.cat.lim,cls=e.cat.cls,hpf=e.hp/e.maxhp;
 e.sdt=(e.sdt||0)-dt;if(e.sdt<=0){e.sdt=2.5+Math.random()*3;e.sd=Math.random()<.5?-1:1}
 e.ph=e.ph||Math.random()*6;let hd=e.h,tv=0,pd=1e9,bear=e.h;
 if(tg){const px=tg.x-e.x,pz=tg.z-e.z;pd=Math.hypot(px,pz);bear=Math.atan2(-px,-pz);const des=cls=='ЛТ'?55:cls=='ПТ'?95:75,cp=(!lim&&(hpf<.4||(e.rl>2.2&&pd<170)))?coverPt(e,tg):null;
  if(lim){hd=bear;tv=pd<45?0:e.vm*.7}
  else if(cp&&Math.hypot(cp.x-e.x,cp.z-e.z)>3){hd=Math.atan2(-(cp.x-e.x),-(cp.z-e.z));tv=e.vm*.9}
  else if(cp){hd=bear+e.sd*.5;tv=0}
  else if(pd>des+30){hd=bear;tv=e.vm*.85}
  else if(pd<des-25){hd=bear+e.sd*.5;tv=-e.vm*.5}
  else if(cls=='ЛТ'||cls=='СТ'){hd=bear+e.sd*1.25;tv=e.vm*.8}
  else{hd=bear+e.sd*.6;tv=Math.sin(S.t*.5+e.ph)>0?e.vm*.25:-e.vm*.25}}
 else{let dx=e.wx-e.x,dz=e.wz-e.z;if(Math.hypot(dx,dz)<8||e.wt<=0)newWP(e);hd=Math.atan2(-(e.wx-e.x),-(e.wz-e.z));tv=e.vm*.7}
 let err=wrap(hd-e.h);const fx=-Math.sin(e.h),fz=-Math.cos(e.h),dr=tv>=0?1:-1;
 for(const c of cols){const rx=c.x-e.x,rz=c.z-e.z,al=(rx*fx+rz*fz)*dr;if(al>0&&al<c.r+14){const lat=-rx*Math.cos(e.h)+rz*Math.sin(e.h);if(Math.abs(lat)<c.r+5){err-=Math.sign(lat||1)*1.1;tv*=.65}}}
 tv=tv>=0?tv*Math.max(0,1-Math.abs(err)/1.3):tv*.6;
 if(e.tk>0)e.v*=1-Math.min(1,dt*4);else e.v+=cl(tv-e.v,-2*dt,1.5*dt);const tw=e.tk>0?0:cl(err*1.4,-TURN,TURN)*(1-.3*Math.abs(e.v)/e.vm);e.w+=cl(tw-e.w,-1.6*dt,1.6*dt);
 e.h+=e.w*dt;e.x+=-Math.sin(e.h)*e.v*dt;e.z+=-Math.cos(e.h)*e.v*dt;collide(e,dt);
 if(!(e.tk>0)&&Math.abs(tv)>2&&Math.abs(e.v)<.6){e.stuck+=dt;if(e.stuck>2){newWP(e);e.stuck=0;e.v=-2;e.sd=-e.sd}}else e.stuck=0;
 if(tg){const tvx=-Math.sin(tg.h)*tg.v,tvz=-Math.cos(tg.h)*tg.v,t=pd/(e.cat.vel*.95),ax=tg.x+tvx*t-e.x,az=tg.z+tvz*t-e.z,dist=Math.hypot(ax,az),want=wrap(Math.atan2(-ax,-az)-e.h);
  e.ty=wrap(e.ty+cl(wrap(want-e.ty),-.6*dt,.6*dt));
  const pit=-Math.atan(1.3/dist);e.gp+=cl(cl(pit,-.13,.6)-e.gp,-.4*dt,.4*dt);
  const sp=.003+.006*Math.min(1,Math.abs(e.v)/e.vm)+.004*Math.min(1,Math.abs(e.w));
  if(e.rl<=0&&Math.abs(wrap(want-e.ty))<.03&&dist>15&&los(e,tg))shoot(e,sp)}
 else{e.ty=wrap(e.ty+cl(wrap(-e.ty),-.3*dt,.3*dt));e.gp+=cl(-e.gp,-.2*dt,.2*dt)}
 if(lim)e.ty=cl(e.ty,-lim,lim);e.tur.rotation.y=e.ty;e.gunG.rotation.x=e.gp;
 e.root.position.set(e.x,H(e.x,e.z),e.z);e.root.rotation.y=e.h;animTracks(e,dt)}
