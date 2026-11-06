/* ===== карты: Полигон (по умолчанию), Луга и поля, Химмельсдорф =====
   Земля плоская у всех. Препятствия — круги в массиве cols (по ним танки сталкиваются, снаряды и видимость блокируются).
   Вся застройка склеена в 1–2 меша или рисуется инстансами, чтобы не плодить вызовы отрисовки. */
const MAPS=[{id:'poly',name:'Полигон',sky:0x8d9aa2},{id:'meadow',name:'Луга и поля',sky:0x9cc3e2},{id:'himmel',name:'Химмельсдорф',sky:0xa9afb2}];
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

function buildHimmel(){const R_=mapRng(7),G=GRND.material;
 const gt=mapTex(256,256,(x,w,h)=>{x.fillStyle='#7d786b';x.fillRect(0,0,w,h);speck(x,w,h,5000,['#716c60','#8a8577','#6a665b','#7a7a6a'],2)},[70,70]);gt.anisotropy=POLYTEX.anisotropy;G.map=gt;G.needsUpdate=true;window.GTEX=gt;
 const as=mapTex(64,64,(x,w,h)=>{x.fillStyle='#4a4b4c';x.fillRect(0,0,w,h);speck(x,w,h,300,['#3f4041','#58595a','#505152'],2)});
 const a1=as.clone();a1.needsUpdate=true;a1.repeat.set(60,2.4);flat(240,16,0,0,new THREE.MeshLambertMaterial({map:a1}),3);const a2=as.clone();a2.needsUpdate=true;a2.repeat.set(2.4,60);flat(16,240,0,0,new THREE.MeshLambertMaterial({map:a2}),4);
 const wc=[0xdcc9a0,0xcfae72,0xb9c2a2,0xe6e0d2,0xb06a4c,0xc9b48a],rc=[0x8a3b2b,0x6e3a2a,0x7a4a32,0x4a4f55,0x9a4a30],W=[],Rf=[];
 const base=[[36,36,18,12,8],[64,34,22,12,10],[96,38,16,12,7],[38,68,12,20,9],[68,72,20,14,8],[100,78,16,16,11],[40,102,14,14,8],[74,104,18,12,7]];
 [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([sx,sz],qi)=>base.forEach(([x,z,w,d,h],bi)=>{if(qi==3&&bi==0)return;if(R_()<.13){ /* руины */
   const g=new THREE.BoxGeometry(w*.8,2.6,1.1).toNonIndexed();g.translate(sx*(x+(R_()-.5)*4),1.3,sz*(z+(R_()-.5)*4));paint(g,0x8f887c);Rf.push(g);const cx=sx*x,cz=sz*z;for(let i=-1;i<=1;i++)cols.push({x:cx+i*w*.3,z:cz,r:1.4,h:2.6});return}
   const jw=w+Math.round((R_()-.5)*4),jd=d+Math.round((R_()-.5)*3),jh=h+Math.round(R_()*3);house(W,Rf,sx*x+(R_()-.5)*4,sz*z+(R_()-.5)*4,jw,jd,jh,wc[R_()*wc.length|0],rc[R_()*rc.length|0])}));
 /* церковь с колокольней */
 house(W,Rf,-34,-34,14,26,11,0xe2dccb,0x5d5f63);{const g=new THREE.BoxGeometry(6,28,6).toNonIndexed();g.translate(-34,14,-52);const uv=g.attributes.uv,nr=g.attributes.normal;for(let i=0;i<uv.count;i++){if(Math.abs(nr.getY(i))<.5)uv.setXY(i,uv.getX(i)*1.5,uv.getY(i)*7)}paint(g,0xd9d0b8);W.push(g);const r=new THREE.ConeGeometry(4.6,10,4,1).rotateY(Math.PI/4).toNonIndexed();r.translate(-34,33,-52);paint(r,0x4a4f55);Rf.push(r);cols.push({x:-34,z:-52,r:4.4,h:28})}
 const wm=new THREE.MeshLambertMaterial({map:wallTex(),vertexColors:true}),rm=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});mapMesh(mergeG(W),wm);mapMesh(mergeG(Rf),rm);
 /* окраины: деревья и валуны */
 const T=[];for(let i=0;i<46;i++){const x=(R_()-.5)*380,z=(R_()-.5)*380;if(Math.abs(x)<130&&Math.abs(z)<130)continue;T.push([x,z])}
 trees(T,[0x59673a,0x66713f,0x4d5c35,0x7a7a45],1.1);
 const B=[];for(let i=0;i<26;i++){const x=(R_()-.5)*380,z=(R_()-.5)*380;if(Math.abs(x)<125&&Math.abs(z)<125)continue;B.push([x,z,1.8+R_()*1.8,.6,.7])}
 /* несколько баррикад на улицах */
 [[-22,6],[24,-6],[6,26],[-6,-24]].forEach(([x,z])=>B.push([x,z,1.8,.4,.8]));
 blobs(B,new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({flatShading:true,color:0x8c8a84}),.95,1.6)}

function loadMap(id){const M=MAPS.find(m=>m.id==id)||MAPS[0];if(curMap==M.id)return;curMap=M.id;clearMap();const G=GRND.material;
 G.map=POLYTEX;window.GTEX=POLYTEX;G.needsUpdate=true;
 scene.background.setHex(M.sky);scene.fog.color.setHex(M.sky);
 if(M.id=='meadow')buildMeadow();else if(M.id=='himmel')buildHimmel();
 try{localStorage.setItem('maus_map',M.id)}catch(_){}
 const an=typeof CFG!='undefined'&&CFG.hd?R.capabilities.getMaxAnisotropy():1;if(window.GTEX){GTEX.anisotropy=an;GTEX.needsUpdate=true}
 const b=document.getElementById('mpt');if(b)b.textContent=M.name;document.querySelectorAll('.mpi').forEach(x=>x.classList.toggle('sel',x.dataset.m==M.id))}
