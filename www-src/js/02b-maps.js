/* ===== карты: Полигон (по умолчанию), Луга и поля, Проток =====
   Земля плоская у всех. Препятствия — круги в массиве cols (по ним танки сталкиваются, снаряды и видимость блокируются).
   Вся застройка склеена в 1–2 меша или рисуется инстансами, чтобы не плодить вызовы отрисовки. */
const MAPS=[{id:'poly',name:'Полигон',sky:0x8d9aa2},{id:'meadow',name:'Луга и поля',sky:0x9cc3e2},{id:'protok',name:'Проток',sky:0x9fb6bf}];
const MAPG=new THREE.Group();scene.add(MAPG);let curMap='';
function mapTex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return t}
function speck(x,w,h,n,cols,s){for(let i=0;i<n;i++){x.fillStyle=cols[Math.random()*cols.length|0];x.fillRect(Math.random()*w,Math.random()*h,s,s)}}
function mapRng(s){let a=s;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function clearMap(){MAPG.children.slice().forEach(o=>{MAPG.remove(o);if(o.geometry)o.geometry.dispose();[].concat(o.material||[]).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})});cols.length=0}
function mapMesh(g,m,shadow){const o=new THREE.Mesh(g,m);o.castShadow=shadow!==false;o.receiveShadow=true;MAPG.add(o);return o}
function flat(w,d,x,z,mat,off){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),mat);m.position.set(x,.02,z);m.receiveShadow=true;mat.polygonOffset=true;mat.polygonOffsetFactor=mat.polygonOffsetUnits=-(off||2);MAPG.add(m);return m}
function mergeG(list){let n=0;list.forEach(g=>n+=g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2),C=new Float32Array(n*3);let o=0;
 list.forEach(g=>{P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);U.set(g.attributes.uv.array,o*2);C.set(g.attributes.color.array,o*3);o+=g.attributes.position.count});
 const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.BufferAttribute(P,3));r.setAttribute('normal',new THREE.BufferAttribute(N,3));r.setAttribute('uv',new THREE.BufferAttribute(U,2));r.setAttribute('color',new THREE.BufferAttribute(C,3));return r}
function paint(g,col){const c=new THREE.Color(col).convertSRGBToLinear(),n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b}g.setAttribute('color',new THREE.BufferAttribute(a,3))}
/* дом: стены с окнами (UV по размерам стены) + пирамидальная крыша */
function house(W,Rf,cx,cz,w,d,h,wc,rc,roof){const g=new THREE.BoxGeometry(w,h,d).toNonIndexed(),fl=Math.max(1,Math.round(h/3.6)),uv=g.attributes.uv,nr=g.attributes.normal;
 for(let i=0;i<uv.count;i++){const ny=Math.abs(nr.getY(i)),nx=Math.abs(nr.getX(i));if(ny>.5)uv.setXY(i,uv.getX(i)*w/6,uv.getY(i)*d/6);else uv.setXY(i,uv.getX(i)*(nx>.5?d:w)/4,uv.getY(i)*fl)}
 g.translate(cx,h/2,cz);paint(g,wc);W.push(g);
 if(roof!==false){const rh=Math.min(w,d)*.38+1,r=new THREE.ConeGeometry(.7071,1,4,1).rotateY(Math.PI/4).toNonIndexed();r.scale(w*1.08,rh,d*1.08);r.translate(cx,h+rh/2,cz);paint(r,rc);Rf.push(r)}
 /* круглые препятствия вдоль длинной стороны */
 const rr=Math.min(w,d)/2+.5,long=w>=d,L=(long?w:d)-rr*2,n=Math.max(1,Math.ceil(L/(rr*1.4))+1);for(let i=0;i<n;i++){const t=n==1?0:-L/2+L*i/(n-1);cols.push({x:cx+(long?t:0),z:cz+(long?0:t),r:rr,h:h})}}
function wallTex(){return mapTex(64,64,(x,w,h)=>{x.fillStyle='#f4f1ea';x.fillRect(0,0,w,h);speck(x,w,h,160,['#0000000d','#ffffff18'],2);x.fillStyle='#d2cabb';x.fillRect(18,10,28,44);x.fillStyle='#232a31';x.fillRect(21,13,22,38);x.fillStyle='#d2cabb';x.fillRect(31,13,2,38);x.fillRect(21,29,22,2);x.fillStyle='#b9b0a0';x.fillRect(16,54,32,3)})}
function trees(pts,pal,sc){const n=pts.length,tg=new THREE.CylinderGeometry(.22,.34,3.4,6).translate(0,1.7,0),cg=new THREE.IcosahedronGeometry(1,1),
 tr=new THREE.InstancedMesh(tg,new THREE.MeshLambertMaterial({color:0x5b4631}),n),cr=new THREE.InstancedMesh(cg,new THREE.MeshLambertMaterial({flatShading:true}),n),o=new THREE.Object3D(),R_=mapRng(11);
 pts.forEach((p,i)=>{const s=(sc||1)*(.8+R_()*.55);o.position.set(p[0],0,p[1]);o.rotation.y=R_()*6;o.scale.setScalar(s);o.updateMatrix();tr.setMatrixAt(i,o.matrix);
  o.position.y=3.6*s;o.scale.set(s*2.3,s*2.9,s*2.3);o.updateMatrix();cr.setMatrixAt(i,o.matrix);cr.setColorAt(i,new THREE.Color(pal[R_()*pal.length|0]).convertSRGBToLinear());cols.push({x:p[0],z:p[1],r:.9*s,h:11*s})});
 [tr,cr].forEach(m=>{m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;MAPG.add(m)})}
function blobs(pts,geo,mat,rad,h,colr){const m=new THREE.InstancedMesh(geo,mat,pts.length),o=new THREE.Object3D(),R_=mapRng(5);pts.forEach((p,i)=>{o.position.set(p[0],p[3]||0,p[1]);o.rotation.y=R_()*6;o.scale.set(p[2],p[2]*(p[4]||1),p[2]);o.updateMatrix();m.setMatrixAt(i,o.matrix);if(colr)m.setColorAt(i,new THREE.Color(colr[R_()*colr.length|0]).convertSRGBToLinear());cols.push({x:p[0],z:p[1],r:rad*p[2],h:h*p[2]})});m.castShadow=m.receiveShadow=true;m.frustumCulled=false;MAPG.add(m)}
function hedge(a,x1,z1,x2,z2,st){const l=Math.hypot(x2-x1,z2-z1),n=Math.floor(l/st);for(let i=0;i<=n;i++)a.push([x1+(x2-x1)*i/n,z1+(z2-z1)*i/n])}
function ring(a,cx,cz,r,n,R_){for(let i=0;i<n;i++){const an=R_()*6.283,d=Math.sqrt(R_())*r;a.push([cx+Math.cos(an)*d,cz+Math.sin(an)*d])}}

function buildMeadow(){const R_=mapRng(21),G=GRND.material;
 const gt=mapTex(256,256,(x,w,h)=>{x.fillStyle='#6a9a45';x.fillRect(0,0,w,h);speck(x,w,h,5000,['#5f8f3d','#78a74f','#6f9a42','#86ad58'],2)},[70,70]);gt.anisotropy=POLYTEX.anisotropy;G.map=gt;G.needsUpdate=true;window.GTEX=gt;
 const stripe=(a,b)=>mapTex(64,64,(x,w,h)=>{x.fillStyle=a;x.fillRect(0,0,w,h);x.fillStyle=b;for(let i=0;i<8;i+=2)x.fillRect(i*8,0,8,h);speck(x,w,h,120,['#00000010','#ffffff10'],2)}),
  TX={w:['#cdae4a','#bf9c37'],g:['#5a9a35','#4d8a2c'],p:['#6e4c30','#5d3f27'],s:['#b9a83a','#a89a2e']};
 [[-90,-40,70,60,'w'],[-90,40,70,60,'g'],[-10,-95,80,50,'s'],[70,-60,60,70,'g'],[75,45,70,60,'w'],[-20,50,60,70,'p'],[-150,-125,60,50,'g'],[140,120,50,60,'p']].forEach(([x,z,w,d,t])=>{const tx=stripe(TX[t][0],TX[t][1]);tx.repeat.set(w/6,d/6);tx.anisotropy=2;flat(w,d,x,z,new THREE.MeshLambertMaterial({map:tx}),2)});
 const dirt=mapTex(64,64,(x,w,h)=>{x.fillStyle='#8d7650';x.fillRect(0,0,w,h);speck(x,w,h,250,['#7b6644','#9c8560','#6f5b3c'],2)});
 const d1=dirt.clone();d1.needsUpdate=true;d1.repeat.set(70,2);flat(400,12,0,0,new THREE.MeshLambertMaterial({map:d1}),3);
 const d2=dirt.clone();d2.needsUpdate=true;d2.repeat.set(2,70);flat(12,400,35,0,new THREE.MeshLambertMaterial({map:d2}),4);
 /* хутор */
 const W=[],Rf=[],wt=wallTex();
 house(W,Rf,-26,-42,15,9,6.5,0xe6d9bc,0x8a4a32);house(W,Rf,-4,-54,12,9,6,0xd8c7a0,0x6e3a2a);house(W,Rf,16,-40,22,11,7.5,0x9a6b4a,0x5c3a2a);
 house(W,Rf,125,-12,14,9,6,0xe2d6b6,0x7a4a32);house(W,Rf,-135,100,14,10,6.5,0xd4c9a8,0x8a4a32);
 const wm=new THREE.MeshLambertMaterial({map:wt,vertexColors:true}),rm=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});mapMesh(mergeG(W),wm);mapMesh(mergeG(Rf),rm);
 /* деревья: рощи и живые изгороди */
 const T=[];[[-160,25,18,26],[130,-140,22,30],[0,-155,15,16],[150,60,16,20],[-70,-155,14,14],[-45,150,18,20],[-170,-60,10,10]].forEach(([x,z,r,n])=>ring(T,x,z,r,n,R_));
 hedge(T,-125,-71,-55,-71,5.5);hedge(T,42,-96,100,-96,5.5);hedge(T,-55,12,-55,72,5.5);hedge(T,112,15,112,75,5.5);
 const ok=T.filter(p=>!(Math.abs(p[1])<8)&&!(Math.abs(p[0]-35)<8)&&Math.abs(p[0])<192&&Math.abs(p[1])<192);trees(ok,[0x3f7a2c,0x4a8a33,0x35682a,0x568f3a]);
 /* стога */
 const hay=[];for(let i=0;i<16;i++){const f=[[-90,-40],[-90,40],[75,45],[70,-60],[-20,50]][i%5];hay.push([f[0]+(R_()-.5)*50,f[1]+(R_()-.5)*40,1])}
 hay.push([-12,-30,1.1],[22,-52,1.1],[-36,-58,1]);blobs(hay.map(h=>[h[0],h[1],h[2]*1.0,0,1]),new THREE.CylinderGeometry(1.2,1.7,2.2,9).translate(0,1.1,0),new THREE.MeshLambertMaterial({color:0xc9a24a,flatShading:true}),1.7,2.3)}

function buildProtok(){const R_=mapRng(31),G=GRND.material,K=.78;
 const gt=mapTex(256,256,(x,w,h)=>{x.fillStyle='#4b5a2d';x.fillRect(0,0,w,h);speck(x,w,h,5000,['#43522a','#58693a','#3d4b26','#5f6b3b'],2);speck(x,w,h,350,['#6b5a3a','#7a6a46'],2)},[70,70]);gt.anisotropy=POLYTEX.anisotropy;G.map=gt;G.needsUpdate=true;window.GTEX=gt;
 /* русло: извилистая линия, концы закруглены (заводи) */
 const XE=190*K,cyf=x=>(-30+60*Math.sin(x/K/170)+20*Math.sin(x/K/61+1))*K,dcy=x=>60/170*Math.cos(x/K/170)+20/61*Math.cos(x/K/61+1);
 const pts=[];for(let x=-XE;x<=XE+.01;x+=3)pts.push([x,cyf(x)]);
 const rdist=(x,z)=>{let m=1e9;for(let i=0;i<pts.length;i++){const d=Math.hypot(pts[i][0]-x,pts[i][1]-z);if(d<m)m=d}return m};
 function ribbon(hw,rep){const n=pts.length,P=new Float32Array(n*6),U=new Float32Array(n*4),I=[];let ds=0;
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),nx=-dz/l,nz=dx/l;if(i)ds+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
   P.set([pts[i][0]+nx*hw,0,pts[i][1]+nz*hw,pts[i][0]-nx*hw,0,pts[i][1]-nz*hw],i*6);U.set([ds/rep,0,ds/rep,1],i*4);if(i<n-1){const k=i*2;I.push(k,k+1,k+2,k+1,k+3,k+2)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('uv',new THREE.BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();return g}
 const decal=(g,m,y,off)=>{const o=new THREE.Mesh(g,m);o.position.y=y;o.receiveShadow=true;m.polygonOffset=true;m.polygonOffsetFactor=m.polygonOffsetUnits=-off;MAPG.add(o);return o};
 const mud=mapTex(64,64,(x,w,h)=>{x.fillStyle='#5a4a35';x.fillRect(0,0,w,h);speck(x,w,h,300,['#4b3d2b','#6a5840','#3f3426'],2)});
 const mm=new THREE.MeshLambertMaterial({map:mud,side:THREE.DoubleSide}),wm=new THREE.MeshLambertMaterial({color:0x2c5f70,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide});
 decal(ribbon(11.5,8),mm,.02,2);decal(ribbon(8.2,8),wm,.03,5);
 [pts[0],pts[pts.length-1]].forEach(p=>{decal(new THREE.CircleGeometry(14,28).rotateX(-Math.PI/2).translate(p[0],0,p[1]),mm,.02,2);decal(new THREE.CircleGeometry(10.8,28).rotateX(-Math.PI/2).translate(p[0],0,p[1]),wm,.03,5)});
 /* мост */
 const Lb=34,Wd=7.2,bxg=30*K,bzg=cyf(bxg),d0=dcy(bxg),tl=Math.hypot(1,d0),t0=1/tl,t1=d0/tl,nx=-t1,nz=t0,rot=Math.atan2(-nz,nx);
 const WP=(lx,lz)=>[bxg+lx*nx-lz*nz,bzg+lx*nz+lz*nx];
 const stoneT=mapTex(64,64,(x,w,h)=>{x.fillStyle='#6d6a62';x.fillRect(0,0,w,h);for(let r=0;r<4;r++){const o=(r%2)*16;for(let c=-1;c<4;c++){const v=96+Math.random()*34|0;x.fillStyle=`rgb(${v},${v-3},${v-10})`;x.fillRect(c*32+o+1,r*16+1,30,14)}}speck(x,w,h,160,['#00000018','#ffffff14'],1)}),
  concT=mapTex(64,64,(x,w,h)=>{x.fillStyle='#8a8983';x.fillRect(0,0,w,h);speck(x,w,h,500,['#7a7973','#99988f','#6e6d67'],2);x.fillStyle='#5d5c57';x.fillRect(0,0,w,1);x.fillRect(0,0,1,h)}),
  asphT=mapTex(128,64,(x,w,h)=>{x.fillStyle='#3b3b3d';x.fillRect(0,0,w,h);speck(x,w,h,900,['#303032','#47474a','#2b2b2d'],1);x.fillStyle='#c9b24a';x.fillRect(0,h/2-2,w*.55,4);x.fillStyle='#d8d6cc';x.fillRect(0,4,w,3);x.fillRect(0,h-7,w,3)},[Lb/7,1]);
 const SG=[],CG=[],KG=[];
 const bxx=(L,w,h,d,x,y,z,col,list,rep)=>{const g=new THREE.BoxGeometry(w,h,d).toNonIndexed(),uv=g.attributes.uv,nr=g.attributes.normal;for(let i=0;i<uv.count;i++){const ny=Math.abs(nr.getY(i)),nxa=Math.abs(nr.getX(i));let a=uv.getX(i),b=uv.getY(i);if(ny>.5){a*=w/rep;b*=d/rep}else if(nxa>.5){a*=d/rep;b*=h/rep}else{a*=w/rep;b*=h/rep}uv.setXY(i,a,b)}g.translate(x,y,z);paint(g,col);list.push(g)};
 bxx(0,Lb,.36,Wd,0,0,0,0xffffff,CG,3);
 for(const s of[-1,1]){const lz=s*(Wd/2-.18);
  bxx(0,Lb,.3,.9,0,.15,s*(Wd/2-.9),0xffffff,CG,3);
  bxx(0,Lb,.6,.34,0,.5,lz,0xffffff,CG,3);bxx(0,Lb+.2,.12,.5,0,.86,lz,0xffffff,CG,3);
  for(let i=0;i<=16;i++)bxx(0,.09,.8,.09,-Lb/2+.6+i*(Lb-1.2)/16,1.2,lz,0x30343a,KG,1);
  bxx(0,Lb-.4,.07,.07,0,1.62,lz,0x30343a,KG,1);bxx(0,Lb-.4,.06,.06,0,1.2,lz,0x30343a,KG,1);
  for(let i=0;i<=4;i++){bxx(0,.7,1.7,.8,-Lb/2+.5+i*(Lb-1)/4,.85,s*(Wd/2-.3),0xffffff,SG,2);bxx(0,.9,.14,1.0,-Lb/2+.5+i*(Lb-1)/4,1.77,s*(Wd/2-.3),0xffffff,CG,2)}
  for(const e of[-1,1]){bxx(0,.8,3.0,.8,e*(Lb/2-2.2),1.5,s*(Wd/2-.1),0xffffff,SG,2);const lx=e*(Lb/2-2.2);bxx(0,.14,4.6,.14,lx,2.3,lz,0x30343a,KG,1);bxx(0,.14,.1,1.3,lx,4.55,lz-s*.65,0x30343a,KG,1);bxx(0,.34,.14,.5,lx,4.45,lz-s*1.3,0xf2e8b0,KG,1);
   bxx(0,3.0,1.0,5.4,e*(Lb/2+2.6),.5,s*(Wd/2+.9),0xffffff,SG,2)}}
 [-1,1].forEach(e=>bxx(0,3.4,.5,Wd+2.2,e*(Lb/2+.2),.25,0,0xffffff,SG,2));
 const mk=(list,mat)=>{const m=mapMesh(mergeG(list),mat);m.position.set(bxg,0,bzg);m.rotation.y=rot;return m};
 mk(SG,new THREE.MeshLambertMaterial({map:stoneT,vertexColors:true}));mk(CG,new THREE.MeshLambertMaterial({map:concT,vertexColors:true}));mk(KG,new THREE.MeshLambertMaterial({vertexColors:true}));
 {const ap=new THREE.Mesh(new THREE.PlaneGeometry(Lb-.4,Wd-1.8).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:asphT}));ap.position.set(bxg,.19,bzg);ap.rotation.y=rot;ap.receiveShadow=true;MAPG.add(ap)}
 for(const s of[-1,1])for(let lx=-Lb/2+.6;lx<=Lb/2-.5;lx+=1){const q=WP(lx,s*(Wd/2-.18));cols.push({x:q[0],z:q[1],r:.6,h:1.3})}
 /* подъезд к мосту: грунтовая дорога */
 const dirt=mapTex(64,64,(x,w,h)=>{x.fillStyle='#8a7550';x.fillRect(0,0,w,h);speck(x,w,h,250,['#796540','#9a8560','#6a5836'],2)}),dm=new THREE.MeshLambertMaterial({map:dirt});
 [-1,1].forEach(e=>{const len=70,q=WP(e*(Lb/2+len/2),0),m=new THREE.Mesh(new THREE.PlaneGeometry(len,7.4).rotateX(-Math.PI/2),dm);dm.map.repeat.set(len/6,1.2);m.position.set(q[0],.02,q[1]);m.rotation.y=rot;m.receiveShadow=true;dm.polygonOffset=true;dm.polygonOffsetFactor=dm.polygonOffsetUnits=-3;MAPG.add(m)});
 /* подбитые танки */
 const WK=[],spots=[...[-1,1].map(e=>[...WP(e*(Lb/2+16),e*2.5),e*1.9]),[-120,-95],[-55,95],[45,-115],[100,105],[150,-25],[-160,45],[-30,-60],[70,60]].map(a=>a.length==3?a:[a[0]*K,a[1]*K,R_()*6.28]).filter(p=>rdist(p[0],p[1])>17&&Math.abs(p[0])<185&&Math.abs(p[1])<185);
 const wcol=[0x3a3a34,0x2d2c28,0x45382c],M4=new THREE.Matrix4(),E4=new THREE.Euler();
 spots.forEach(([x,z,yw],k)=>{const tilt=(R_()-.5)*.14,add=(g,c,px,py,pz,rz)=>{g=g.toNonIndexed();paint(g,c);M4.makeRotationFromEuler(E4.set(0,0,0));g.applyMatrix4(new THREE.Matrix4().makeTranslation(px,py,pz).multiply(new THREE.Matrix4().makeRotationZ(rz||0)));g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(tilt,yw,tilt*.6)));g.translate(x,0,z);WK.push(g)};
  const c0=wcol[k%3];add(new THREE.BoxGeometry(6.2,1.3,3.0),c0,0,1.15,0);add(new THREE.BoxGeometry(6.5,.9,.7),0x25241f,0,.6,1.75);add(new THREE.BoxGeometry(6.5,.9,.7),0x25241f,0,.6,-1.75);
  add(new THREE.BoxGeometry(2.8,.95,2.4),c0,-.4,2.25,0,.05);add(new THREE.CylinderGeometry(.17,.2,3.8,8).rotateZ(Math.PI/2+.25),0x2a2925,2.3,2.5+(k%2)*.3,.1);
  const sc=new THREE.CylinderGeometry(4.3,4.3,.02,18).toNonIndexed();paint(sc,0x1c1b18);sc.translate(x,.04,z);WK.push(sc);
  cols.push({x,z,r:2.7,h:2.6})});
 if(WK.length)mapMesh(mergeG(WK),new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}));
 /* деревья: рощи и одиночные */
 const T=[];for(let n=0;n<5000&&T.length<150;n++){const x=(R_()-.5)*376,z=(R_()-.5)*376;if(rdist(x,z)<17)continue;const dl=(x-bxg)*t0+(z-bzg)*t1,al=(x-bxg)*nx+(z-bzg)*nz;if(Math.abs(dl)<8&&Math.abs(al)<75)continue;if(spots.some(p=>Math.hypot(p[0]-x,p[1]-z)<9))continue;const cl=.5+.5*Math.sin(x/37)*Math.sin(z/29+1);if(R_()>.3+.7*cl)continue;T.push([x,z])}
 trees(T,[0x2f5a24,0x3a6a2b,0x2a4f22,0x436f2e],1.1)}

/* ===== Проток из GLB-модели (protok_map): рельеф, мост, вода, подбитые танки, деревья, трава ===== */
let MAPTOK=0;
async function buildProtokGLB(tok){
 const buf=await getGlb('protok_map'),gl=await new Promise((ok,bad)=>new THREE.GLTFLoader().parse(buf,'',ok,bad)),sc=gl.scene;sc.updateMatrixWorld(true);
 const meshes=[];sc.traverse(o=>{if(o.isMesh)meshes.push(o)});
 let terr=null,water=null;const anc=o=>{for(let a=o;a;a=a.parent)if(a.name&&/^(terrain|water|bridge_|wreck\d|tree)/.test(a.name))return a.name;return''};
 /* высоты: сетка рельефа 257x257 */
 meshes.forEach(m=>{if(anc(m)=='terrain')terr=m;else if(anc(m)=='water')water=m});
 if(!terr)throw new Error('в protok_map нет terrain');
 const pa=terr.geometry.attributes.position,n=pa.count,N=Math.round(Math.sqrt(n)),HT=new Float32Array(n),v=new THREE.Vector3();let x0=0,z0=0,dx=1,dz=1;
 for(let i=0;i<n;i++){v.fromBufferAttribute(pa,i).applyMatrix4(terr.matrixWorld);HT[i]=v.y;if(i==0){x0=v.x;z0=v.z}if(i==1)dx=v.x-x0;if(i==N)dz=v.z-z0}
 const OLD=HT.slice(),LV=2.4,rip=(x,z)=>.12*Math.sin(x*.05+1)*Math.cos(z*.043)+.08*Math.sin((x+z)*.11);
 for(let i=0;i<n;i++){const x=x0+(i%N)*dx,z=z0+((i/N)|0)*dz;HT[i]=Math.max(HT[i],LV)+rip(x,z)}
 const gh=(A,x,z)=>{let fx=(x-x0)/dx,fz=(z-z0)/dz;fx=Math.max(0,Math.min(N-1.001,fx));fz=Math.max(0,Math.min(N-1.001,fz));const ix=fx|0,iz=fz|0,tx=fx-ix,tz=fz-iz,a=A[iz*N+ix],b=A[iz*N+ix+1],c=A[(iz+1)*N+ix],d=A[(iz+1)*N+ix+1];return(a*(1-tx)+b*tx)*(1-tz)+(c*(1-tx)+d*tx)*tz},dT=(x,z)=>gh(HT,x,z)-gh(OLD,x,z);
 const terH=(x,z)=>{let fx=(x-x0)/dx,fz=(z-z0)/dz;fx=Math.max(0,Math.min(N-1.001,fx));fz=Math.max(0,Math.min(N-1.001,fz));const ix=fx|0,iz=fz|0,tx=fx-ix,tz=fz-iz,a=HT[iz*N+ix],b=HT[iz*N+ix+1],c=HT[(iz+1)*N+ix],d=HT[(iz+1)*N+ix+1];return(a*(1-tx)+b*tx)*(1-tz)+(c*(1-tx)+d*tx)*tz};
 const hf=terH;
 /* материалы -> Lambert (легче для телефона) */
 const MC=new Map(),lam=m=>{let r=MC.get(m);if(!r){r=new THREE.MeshLambertMaterial({map:m.map||null,color:m.color?m.color.clone():0xffffff,side:m.side,transparent:m.transparent,opacity:m.opacity,alphaTest:m.alphaTest||0,vertexColors:!!m.vertexColors});MC.set(m,r)}return r};
 const wcols=[],out=[],groups=new Map(),box=new THREE.Box3(),wr={};
 meshes.forEach(m=>{const a=anc(m);
  if(a=='water'||/^bridge_/.test(a))return;                 /* реки и моста нет */
  if(a=='terrain'){const S2=2,M=(N-1)/S2+1,pos=new Float32Array(M*M*3),uv=new Float32Array(M*M*2),col=new Float32Array(M*M*3),id=[],fl=dz>0;
   for(let r=0;r<M;r++)for(let c=0;c<M;c++){const o=r*M+c,ii=r*S2*N+c*S2;pos[o*3]=x0+c*S2*dx;pos[o*3+1]=HT[ii];pos[o*3+2]=z0+r*S2*dz;uv[o*2]=pos[o*3]/12;uv[o*2+1]=pos[o*3+2]/12;const px=pos[o*3],pz=pos[o*3+2],k=.8+.3*(.5+.5*Math.sin(px*.031)*Math.cos(pz*.027))+Math.random()*.06;col[o*3]=k*.92;col[o*3+1]=k;col[o*3+2]=k*.85}
   for(let r=0;r<M-1;r++)for(let c=0;c<M-1;c++){const a0=r*M+c,b0=a0+1,c0=a0+M,d0=c0+1;if(fl)id.push(a0,c0,b0,b0,c0,d0);else id.push(a0,b0,c0,b0,d0,c0)}
   const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(pos,3));tg.setAttribute('uv',new THREE.BufferAttribute(uv,2));tg.setAttribute('color',new THREE.BufferAttribute(col,3));tg.setIndex(id);tg.computeVertexNormals();
   const gt=mapTex(256,256,(x,w,h)=>{x.fillStyle='#2c4a1f';x.fillRect(0,0,w,h);speck(x,w,h,2600,['#24401a','#365a25','#2a4720','#3f6330','#1f3818'],2);x.lineWidth=1;for(let q=0;q<500;q++){x.strokeStyle=['#35582a','#1e3716','#2d4f22'][q%3];const bx=Math.random()*w,by=Math.random()*h;x.beginPath();x.moveTo(bx,by);x.lineTo(bx+Math.random()*3-1.5,by-3-Math.random()*4);x.stroke()}});
   if(typeof CFG!='undefined'&&CFG.hd)gt.anisotropy=R.capabilities.getMaxAnisotropy();
   const tmt=new THREE.MeshLambertMaterial({map:gt,vertexColors:true});const tm=new THREE.Mesh(tg,tmt);tm.receiveShadow=true;tm.castShadow=false;out.push(tm);return}
  if(/^wreck/.test(a)){m.material=lam(m.material);m.castShadow=m.receiveShadow=true;(wr[a]=wr[a]||new THREE.Box3()).union(box.setFromObject(m));m.userData.w=a;out.push(m);return}
  /* деревья и трава: одинаковые меши -> InstancedMesh */
  const k=m.geometry.uuid+'|'+m.material.uuid;let g=groups.get(k);if(!g)groups.set(k,g={m,list:[],tree:a=='tree'});g.list.push(m.matrixWorld.clone())});
 const IM=[],hd=typeof CFG!='undefined'&&CFG.hd,TF=hd?.45:.28,GF=hd?.8:.5;
 groups.forEach(g=>{g.list=g.list.filter((_,i)=>((i*.6180339)%1)<(g.tree?TF:GF));if(!g.list.length)return;g.list.forEach(mx=>{const e=mx.elements;e[13]+=dT(e[12],e[14])});const im=new THREE.InstancedMesh(g.m.geometry,lam(g.m.material),g.list.length);g.list.forEach((mx,i)=>im.setMatrixAt(i,mx));im.castShadow=false;im.receiveShadow=false;im.frustumCulled=false;IM.push(im);
  if(g.tree){g.m.geometry.computeBoundingBox();const bb=g.m.geometry.boundingBox,p=new THREE.Vector3(),s=new THREE.Vector3(),q=new THREE.Quaternion();
   g.list.forEach(mx=>{mx.decompose(p,q,s);const ht=(bb.max.y-bb.min.y)*s.y,r=Math.max(.45,Math.min(1.3,ht*.035));wcols.push({x:p.x,z:p.z,r,h:p.y+ht*.85})})}});
 /* подбитые танки: круглые коллайдеры вдоль корпуса */
 const wd={};Object.keys(wr).forEach(k=>{const b=wr[k],sx=b.max.x-b.min.x,sz=b.max.z-b.min.z,r=Math.max(1,Math.min(sx,sz)/2),L=Math.max(sx,sz),cn=Math.max(1,Math.round(L/(r*1.6))),cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2,d=dT(cx,cz);wd[k]=d;b.max.y+=d;
  for(let i=0;i<cn;i++){const t=cn==1?0:(i/(cn-1)-.5)*(L-2*r);wcols.push({x:sx>=sz?cx+t:cx,z:sx>=sz?cz:cz+t,r,h:b.max.y})}});
 if(tok!==MAPTOK)return;                      /* карту успели сменить */
 out.forEach(o=>{MAPG.attach(o);if(o.userData.w)o.position.y+=wd[o.userData.w]});IM.forEach(o=>MAPG.add(o));wcols.forEach(c=>cols.push(c));
 MAPHF=hf;GRND.visible=false;window.SPAWN_SPAN=40;
 }

function loadMap(id){const M=MAPS.find(m=>m.id==id)||MAPS[0];if(curMap==M.id)return;curMap=M.id;clearMap();MAPHF=null;GRND.visible=true;window.SPAWN_SPAN=75;const tok=++MAPTOK,G=GRND.material;
 G.map=POLYTEX;window.GTEX=POLYTEX;G.needsUpdate=true;
 scene.background.setHex(M.sky);scene.fog.color.setHex(M.sky);
 if(M.id=='meadow')buildMeadow();else if(M.id=='protok')buildProtokGLB(tok).catch(e=>{console.warn('protok GLB:',e);if(tok===MAPTOK&&curMap=='protok'){clearMap();buildProtok()}});
 try{localStorage.setItem('maus_map',M.id)}catch(_){}
 const an=typeof CFG!='undefined'&&CFG.hd?R.capabilities.getMaxAnisotropy():1;if(window.GTEX){GTEX.anisotropy=an;GTEX.needsUpdate=true}
 const b=document.getElementById('mpt');if(b)b.textContent=M.name;document.querySelectorAll('.mpi').forEach(x=>x.classList.toggle('sel',x.dataset.m==M.id))}
