/* ===== танк: загрузка GLB (текстуры внутри) и сборка экземпляров ===== */
let ITEMS=null;const BOX={cx:0,cz:0,hx:1.9,hz:5,y0:0,y1:3};      /* габариты корпуса, уточняются после загрузки */
/* Модели: хранятся на устройстве ЗАШИФРОВАННЫМИ (IndexedDB), ключи выдаёт сервер по токену сессии; расшифровка в памяти при загрузке танка */
const GLB_SES=()=>{try{return JSON.parse(localStorage.getItem('maus_session'))}catch(_){return null}};
const GLB_H=()=>{const s=GLB_SES();if(!(window.API_URL&&s&&s.token&&!s.guest))throw new Error('Нужен вход в аккаунт');return{Authorization:'Bearer '+s.token,'X-App-Version':window.APP_VERSION||'0'}};
const GLB_DB=()=>GLB_DB.p||(GLB_DB.p=new Promise((ok,bad)=>{const r=indexedDB.open('ats_assets',1);r.onupgradeneeded=()=>r.result.createObjectStore('m');r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error)}));
const GLB_IDB=(mode,fn)=>GLB_DB().then(d=>new Promise((ok,bad)=>{const t=d.transaction('m',mode),q=fn(t.objectStore('m'));t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>bad(t.error);t.onabort=()=>bad(t.error)}));
let GLB_A=null;const GLB_DL={};
const glbAssets=()=>GLB_A||(GLB_A=fetch(window.API_URL+'/api/assets',{headers:GLB_H()}).then(r=>r.json().then(j=>{if(!r.ok)throw new Error(j.error||('assets: '+r.status));return j})).catch(e=>{GLB_A=null;throw e}));
const glbBlob=(id,m)=>GLB_DL[id]||(GLB_DL[id]=(async()=>{let rec=null;try{rec=await GLB_IDB('readonly',s=>s.get(id))}catch(_){}
 if(rec&&rec.h===m.h&&rec.b&&rec.b.byteLength===m.s+16)return rec.b;
 const r=await fetch(window.API_URL+'/api/model/'+id,{headers:GLB_H()});if(!r.ok)throw new Error('model '+id+': '+r.status);
 const b=await r.arrayBuffer();if(b.byteLength!==m.s+16)throw new Error('model '+id+': повреждена загрузка');
 try{await GLB_IDB('readwrite',s=>s.put({h:m.h,b},id))}catch(_){}return b})().finally(()=>{delete GLB_DL[id]}));
const getGlb=async id=>{const A=await glbAssets(),m=A.m[id],k=A.k[id];if(!m||!k)throw new Error('model '+id+': нет в манифесте');
 const b=await glbBlob(id,m),key=await crypto.subtle.importKey('raw',new Uint8Array(k.match(/../g).map(x=>parseInt(x,16))),'AES-CTR',false,['decrypt']);
 return crypto.subtle.decrypt({name:'AES-CTR',counter:new Uint8Array(b,0,16),length:64},key,new Uint8Array(b,16))};
function loadModel(){
 return getGlb('maus').then(buf=>new Promise((ok,bad)=>new THREE.GLTFLoader().parse(buf,'',g=>{g.scene.updateMatrixWorld(true);const items=[];
  g.scene.traverse(o=>{if(!o.isMesh)return;const gm=o.geometry.clone();gm.applyMatrix4(o.matrixWorld);gm.computeBoundingBox();items.push({g:gm,bb:gm.boundingBox,n:gm.attributes.position.count,mat:o.material})});
  const h=items.find(i=>i.n==4560).bb;BOX.cx=(h.max.x+h.min.x)/2;BOX.cz=(h.max.z+h.min.z)/2;BOX.hx=(h.max.x-h.min.x)/2;BOX.hz=(h.max.z-h.min.z)/2;BOX.y0=Math.min(0,h.min.y);BOX.y1=h.max.y+.6;ok(items)},bad)))}
function mk(g,m,p){const o=new THREE.Mesh(g,m);o.castShadow=o.receiveShadow=true;if(p)o.position.copy(p);return o}
function makeTank(items,name){
 const T={own:[],ownGeo:true,name,root:new THREE.Group(),body:new THREE.Group(),wheels:[],tracks:[],decals:[],hp:1200,maxhp:1200,alive:true,x:0,z:0,h:0,v:0,w:0,ty:0,gp:0,rec:0,rl:0,fl:0};
 T.root.add(T.body);scene.add(T.root);let tg,gg;
 items.forEach(({g,bb,n,mat})=>{const c=bb.getCenter(V3(0,0,0));g=g.clone();
  if(n==4560)T.body.add(mk(g,mat));else if(n==1197)tg={g,c};else if(n==1110)gg={g,bb,c};
  else if(n==324){const m=mat.clone();m.map=mat.map.clone();m.map.needsUpdate=true;T.body.add(mk(g,m));T.own.push(m,m.map);T.tracks.push({t:m.map,side:c.x<0?-1:1})}
  else{g.translate(-c.x,-c.y,-c.z);const m=mk(g,mat,c);T.body.add(m);T.wheels.push({m,r:(bb.max.y-bb.min.y)/2,side:c.x<0?-1:1,a:0})}});
 T.tur=new THREE.Group();T.tur.position.set(tg.c.x,0,tg.c.z);tg.g.translate(-tg.c.x,0,-tg.c.z);T.tur.add(mk(tg.g,items[0].mat));
 const hm=items.find(i=>i.n==4560).mat;T.tur.children[0].material=hm;T.body.add(T.tur);
 const P=V3(gg.c.x,gg.c.y,gg.bb.max.z-.1);gg.g.translate(-P.x,-P.y,-P.z);T.gunG=new THREE.Group();T.gunG.position.set(P.x-T.tur.position.x,P.y,P.z-T.tur.position.z);
 T.gunM=mk(gg.g,hm);T.gunG.add(T.gunM);T.muz=new THREE.Object3D();T.muz.position.set(gg.c.x-P.x,gg.c.y-P.y,gg.bb.min.z-P.z);T.gunG.add(T.muz);T.tur.add(T.gunG);
 T.flare=makeFlare(T.muz);return T}
function animTracks(T,dt){const vs={'-1':T.v-T.w*1.4,'1':T.v+T.w*1.4};
 T.wheels.forEach(w=>{if(w.sg){w.a+=vs[w.side]*dt/w.r;w.m.rotation.x=w.a}else{w.a-=vs[w.side]*dt/w.r;w.m.rotation.x=w.a}});
 T.tracks.forEach(t=>{t.t.offset.y-=(t.r||.3)*vs[t.side]*dt});
 if(T.links)T.links.forEach(l=>{const s=vs[l.side];l.d+=s*dt/T.k;if(Math.abs(s)>.01||l.dirty){if(T.vis!==false){trackPose(l);l.dirty=false}else l.dirty=true}})}

/* ===== каталог и ангар: Maus + модели из GLB (Hull > Turret > Gun) ===== */
const MODELS={},CATALOG=[
 {id:'maus',kmh:20,tier:10,len:9.6,name:'Maus',nat:'Германия',hp:2200,dmg:400,pen:250,rel:7.0,price:1600000,cls:'ТТ',arm:[320,200,180,320,70]},
 {id:'amx40',kmh:55,tier:6,len:7.2,name:'AMX 40',nat:'Франция',hp:1000,dmg:220,pen:175,rel:3.2,price:90000,cls:'ЛТ',arm:[60,40,30,60,20],raw:{gun:/Gun/,tur:/Turret/}},
 {id:'amx50b',kmh:55,tier:10,len:9.2,name:'AMX 50 B',nat:'Франция',hp:1500,dmg:240,pen:258,rel:28,clip:{n:5,gap:2.2},price:1100000,cls:'СТ',arm:[120,50,40,120,30],raw:{gun:/Gun/,tur:/Turret/,gp:.25}},
 {id:'type4',tier:10,kmh:25,len:10.0,name:'Type 4 Heavy',nat:'Япония',hp:2100,dmg:400,pen:260,rel:5.8,price:1200000,cls:'ТТ',arm:[260,130,100,300,60],raw:{gun:/Gun/,tur:/Turret/}},
 {id:'oho',kmh:30,tier:7,len:8.9,name:'O-Ho',nat:'Япония',hp:1250,dmg:280,pen:190,rel:4.2,price:180000,cls:'ТТ',arm:[110,70,50,120,30],raw:{gun:/^0001(_|$)/,tur:/^(0003|1002)(_|$)/}},
 {id:'oi',kmh:38,tier:5,len:8.6,name:'O-I Experimental',nat:'Япония',hp:900,dmg:190,pen:150,rel:3.6,price:40000,cls:'ТТ',arm:[70,50,40,70,25],raw:{gun:/^0001(_|$)/,tur:/^0003(_|$)/}},
 {id:'e100',kmh:24,tier:10,len:10.4,name:'Jagdpanzer E 100',nat:'Германия',hp:1900,dmg:650,pen:290,rel:9.5,price:1500000,cls:'ПТ',arm:[270,160,110,220,45],lim:.14,raw:{gun:/Gun/,tur:/(?!)/,wm:()=>false}},
 {id:'e100h',kmh:34,tier:10,len:10.2,name:'E 100',nat:'Германия',hp:2150,dmg:420,pen:260,rel:6.4,price:1500000,cls:'ТТ',arm:[280,170,120,300,50],raw:{gun:/^0001(_|$)/,tur:/^0004(_|$)/,gp:.03,fix:1,wm:()=>false}},
 {id:'fv4005',kmh:32,tier:10,len:9.6,name:'FV4005',nat:'Великобритания',hp:1350,dmg:300,pen:280,rel:30,clip:{n:4,gap:2.0},price:1300000,cls:'ПТ',arm:[76,50,35,230,25],raw:{gun:/^gun_01/,tur:/^Turret_01/,flip:1,gp:.03}},
 {id:'ms1',kmh:18,tier:1,len:4.4,name:'МС-1',nat:'СССР',hp:250,dmg:45,pen:40,rel:2.4,price:0,cls:'ЛТ',arm:[18,16,16,16,16],raw:{gun:/^Object_(60|124)$/,tur:/^Object_(62|66|126|132|134)$/,off:[.3,3.6],yaw:-Math.PI/2,gp:.05,wm:g=>{const b=g.boundingBox,dx=b.max.x-b.min.x,dy=b.max.y-b.min.y,dz=b.max.z-b.min.z;return g.attributes.position.count<400&&dx<.35&&dy>.1&&dy<1&&Math.abs(dy-dz)<.1}}},
 {id:'bt5',kmh:72,tier:2,len:5.8,name:'БТ-5',nat:'СССР',hp:350,dmg:60,pen:55,rel:2.6,price:6000,cls:'ЛТ',arm:[13,13,13,15,15],raw:{gun:/^Object_3$/,tur:/^Object_2$/,gp:.1}},
 {id:'bt7',kmh:68,tier:3,len:5.7,name:'БТ-7',nat:'СССР',hp:480,dmg:75,pen:70,rel:2.8,price:12000,cls:'ЛТ',arm:[22,15,15,20,15],raw:{gun:/^Object_6$/,tur:/^Object_2$/,gp:.1}},
 {id:'kv1',kmh:35,tier:5,len:6.8,name:'КВ-1',nat:'СССР',hp:1000,dmg:140,pen:110,rel:4.0,price:120000,cls:'ТТ',arm:[75,75,70,75,75],raw:{gun:/^Object_2$/,tur:/^Object_3$/,gp:.1}},
 {id:'kv2',kmh:25,tier:6,len:6.8,name:'КВ-2',nat:'СССР',hp:1300,dmg:520,pen:120,rel:11,price:200000,cls:'ТТ',arm:[75,75,70,75,75],raw:{gun:/^Object_2$/,tur:/^Object_7$/,gp:.1}},
 {id:'is6',kmh:35,tier:8,len:8.6,name:'ИС-6',nat:'СССР',hp:1500,dmg:330,pen:215,rel:4.4,price:350000,cls:'ТТ',arm:[150,100,70,220,40],raw:{gun:/^gun_0Shape1_group_0/,tur:/^vertices_group_0_1(_|$)/,flip:1,off:[0,.0163],gp:.05}},
 {id:'govnotank',kmh:35,tier:8,len:10.6,name:'GOVNOTANK AERO',nat:'Европа',hp:1550,dmg:330,pen:215,rel:4.3,price:0,gold:1000,cls:'ТТ',arm:[150,100,70,220,40],raw:{gun:/Gun/,tur:/Turret|Cupola/,pg:[-.214,1.835,1.5],pt:[-.214,.256],trk:{x:1.3,yt:.96,yb:-.05,F:3.38,B:-3.4,w:.64,th:.15,pl:.155,n:89}}}];
/* «сырые» модели (без узлов Hull>Turret>Gun): разбираем меши по именам, запекаем в мировые координаты и собираем нужную иерархию */
/* колёса, вшитые в общий меш (AMX 40, O-Ho, O-I): делим меш на несвязные острова, круглые и тонкие по X — отдельные колёса */
function splitWheels(g,mn){const pos=g.attributes.position,n=pos.count,ix=g.index?g.index.array:null,tn=(ix?ix.length:n)/3|0,vid=new Int32Array(n),mp=new Map();
 for(let i=0;i<n;i++){const key=((Math.round(pos.getX(i)*200)+8192)*16384+(Math.round(pos.getY(i)*200)+8192))*16384+(Math.round(pos.getZ(i)*200)+8192);let id=mp.get(key);if(id===undefined){id=mp.size;mp.set(key,id)}vid[i]=id}
 const par=new Int32Array(mp.size).map((_,i)=>i),fd=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x},T=(t,k)=>ix?ix[t*3+k]:t*3+k;
 for(let t=0;t<tn;t++){const a=fd(vid[T(t,0)]),b=fd(vid[T(t,1)]),c=fd(vid[T(t,2)]);par[b]=a;par[fd(c)]=a}
 const bb=new Map();for(let i=0;i<n;i++){const r=fd(vid[i]);let b=bb.get(r);if(!b){b={x0:1e9,x1:-1e9,y0:1e9,y1:-1e9,z0:1e9,z1:-1e9};bb.set(r,b)}
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);b.x0=Math.min(b.x0,x);b.x1=Math.max(b.x1,x);b.y0=Math.min(b.y0,y);b.y1=Math.max(b.y1,y);b.z0=Math.min(b.z0,z);b.z1=Math.max(b.z1,z)}
 let zmin=1e9,zmax=-1e9;bb.forEach(b=>{zmin=Math.min(zmin,b.z0);zmax=Math.max(zmax,b.z1)});const thr=.05*(zmax-zmin),isW=new Map();let cnt=0;
 bb.forEach((b,r)=>{const dx=b.x1-b.x0,dy=b.y1-b.y0,dz=b.z1-b.z0,q=dy/Math.max(1e-6,dz);const w=dy>=thr&&dz>=thr&&q>.8&&q<1.25&&dx<.8*Math.max(dy,dz);isW.set(r,w);if(w)cnt++});
 if(cnt<(mn||1))return null;
 const tris=new Map(),rest=[];for(let t=0;t<tn;t++){const r=fd(vid[T(t,0)]);if(isW.get(r)){let a=tris.get(r);if(!a)tris.set(r,a=[]);a.push(t)}else rest.push(t)}
 const attrs=['position','normal','uv'].filter(a=>g.attributes[a]),build=ts=>{const rm=new Map(),out=new THREE.BufferGeometry(),idx=[],cp={};attrs.forEach(a=>cp[a]=[]);
  ts.forEach(t=>{for(let k=0;k<3;k++){const o=T(t,k);let ni=rm.get(o);if(ni===undefined){ni=rm.size;rm.set(o,ni);attrs.forEach(a=>{const A=g.attributes[a];for(let c=0;c<A.itemSize;c++)cp[a].push(A.array[o*A.itemSize+c])})}idx.push(ni)}});
  attrs.forEach(a=>out.setAttribute(a,new THREE.BufferAttribute(new Float32Array(cp[a]),g.attributes[a].itemSize)));out.setIndex(idx);out.computeBoundingBox();return out};
 return{rest:build(rest),wheels:[...tris.values()].map(build)}}
const FLIP=new THREE.Matrix4().makeRotationY(Math.PI);   /* модели, смотрящие в -Z: разворот на 180° при сборке */
function adaptModel(sc,sp){sc.updateMatrixWorld(true);let named=false;sc.traverse(m=>{if(m.isMesh&&/WHEEL/i.test(m.name||''))named=true});const parts={Hull:[],Turret:[],Gun:[]},bb={Turret:new THREE.Box3(),Gun:new THREE.Box3()};
 sc.traverse(m=>{if(!m.isMesh)return;const nm=[];for(let o=m;o&&o!==sc;o=o.parent)nm.push(o.name||'');
  const k=nm.some(n=>sp.gun.test(n))?'Gun':nm.some(n=>sp.tur.test(n))?'Turret':'Hull';
  const g=m.geometry.clone();g.applyMatrix4(m.matrixWorld);if(sp.flip)g.applyMatrix4(FLIP);if(sp.off)g.translate(sp.off[0],0,sp.off[1]);if(sp.yaw)g.applyMatrix4(new THREE.Matrix4().makeRotationY(sp.yaw));g.computeBoundingBox();const it={g,m:m.material};
  if(k=='Hull'&&/WHEEL/i.test(nm[0]))it.wh=1;if(k=='Hull'&&sp.wm&&sp.wm(g))it.wh=1;   /* sp.wm: отдельные меши-колёса, которые не надо делить на острова */
  const uv=g.attributes.uv;if(k=='Hull'&&uv&&m.material.map){let a=1e9,b=-1e9;for(let i=0;i<uv.count;i++){const v=uv.getY(i);if(v<a)a=v;if(v>b)b=v}
   if(b-a>3){const bx=g.boundingBox,yb=bx.min.y+(bx.max.y-bx.min.y)*.06,Q=g.attributes.position,ar=[];   /* скорость прокрутки текстуры: медиана dV/dZ по нижней (плоской) ветке гусеницы */
    for(let i=0;i<Q.count;i++)if(Q.getY(i)<=yb)ar.push([Q.getZ(i),uv.getY(i)]);ar.sort((p,q)=>p[0]-q[0]);const sl=[];
    for(let i=0;i<ar.length;i++)for(let j=1;j<=3&&i+j<ar.length;j++){const dz=ar[i+j][0]-ar[i][0];if(dz>.05)sl.push((ar[i+j][1]-ar[i][1])/dz)}
    sl.sort((p,q)=>p-q);it.tk={slope:sl.length?sl[sl.length>>1]:0,side:(bx.min.x+bx.max.x)<0?1:-1}}}
  if(k=='Hull'&&!it.tk&&!it.wh&&!named&&!sp.wm&&g.attributes.position.count<60000){const sp2=splitWheels(g,g.attributes.position.count>=14000?4:1);if(sp2){parts.Hull.push({g:sp2.rest,m:m.material});sp2.wheels.forEach(w=>parts.Hull.push({g:w,m:m.material,wh:1}));return}}
  parts[k].push(it);if(bb[k])bb[k].union(g.boundingBox)});
 if(bb.Gun.isEmpty())throw new Error('в модели не найдено орудие');
 const gb=bb.Gun,tb=bb.Turret,pG=sp.pg?V3(sp.pg[0],sp.pg[1],sp.pg[2]):V3((gb.min.x+gb.max.x)/2,(gb.min.y+gb.max.y)/2,gb.min.z+(gb.max.z-gb.min.z)*(sp.gp||.1)),
  pT=sp.pt?V3(sp.pt[0],tb.min.y,sp.pt[1]):tb.isEmpty()?V3(pG.x,gb.min.y,pG.z):V3((tb.min.x+tb.max.x)/2,tb.min.y,(tb.min.z+tb.max.z)/2);
 const grp=(n,o)=>{const g=new THREE.Group();g.name=n;let wi=0;parts[n].forEach(p=>{let c=null;if(p.wh){c=p.g.boundingBox.getCenter(V3(0,0,0))}p.g.translate(-o.x-(c?c.x:0),-o.y-(c?c.y:0),-o.z-(c?c.z:0));
  const ms=new THREE.Mesh(p.g,p.m);if(c){ms.name='Wheel_'+wi++;ms.position.copy(c);p.g.computeBoundingBox();ms.userData.r=Math.max(.15,(p.g.boundingBox.max.y-p.g.boundingBox.min.y)/2)}
  if(p.tk)ms.userData.tr=p.tk;g.add(ms)});return g};
 const root=new THREE.Group(),hh=grp('Hull',V3(0,0,0)),tu=grp('Turret',pT),gu=grp('Gun',pG);
 if(sp.trk)hh.userData.trk=sp.trk;tu.position.copy(pT);gu.position.copy(pG).sub(pT);tu.add(gu);hh.add(tu);root.add(hh);return root}
const _lm=new Map();
function litify(sc){sc.traverse(o=>{if(!o.isMesh)return;const f=m=>{if(!m.isMeshBasicMaterial)return m;let n=_lm.get(m);if(!n){n=new THREE.MeshStandardMaterial({map:m.map,color:m.color.clone().multiplyScalar(.85),roughness:.85,metalness:.1,side:m.side,transparent:m.transparent,opacity:m.opacity,alphaTest:m.alphaTest});_lm.set(m,n)}return n};
 o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)})}
/* E 100: в файле два набора деталей (две версии) со смещением по X — оставляем один и ставим его в центр */
function fixE100(sc){const d=sc.getObjectByName('0008');if(d)d.parent.remove(d);const g=sc.getObjectByName('0003');if(g)g.position.x=0}
function loadGlb(id){return getGlb(id).then(buf=>new Promise((ok,bad)=>new THREE.GLTFLoader().parse(buf,'',g=>{g.scene.updateMatrixWorld(true);const c=CATALOG.find(c=>c.id==id);if(c.raw&&c.raw.fix)fixE100(g.scene);litify(g.scene);MODELS[id]=c.raw?adaptModel(g.scene,c.raw):g.scene;ok()},bad)))}
function ownPart(n){const g=new THREE.Group();if(n.isMesh)g.add(new THREE.Mesh(n.geometry,n.material));n.children.forEach(c=>{if(c.name!=='Turret'&&c.name!=='Gun')g.add(c.clone(true))});return g}
function makeGlbTank(id,name,hp){
 const sc=MODELS[id],N=n=>sc.getObjectByName(n),H=N('Hull'),Tu=N('Turret'),Gu=N('Gun');
 const T={own:[],ownGeo:false,name,root:new THREE.Group(),body:new THREE.Group(),wheels:[],tracks:[],decals:[],hp,maxhp:hp,alive:true,x:0,z:0,h:0,v:0,w:0,ty:0,gp:0,rec:0,rl:0,fl:0};
 T.root.add(T.body);scene.add(T.root);
 const hg=ownPart(H),tg=ownPart(Tu),gg=ownPart(Gu),bh=new THREE.Box3().setFromObject(hg),bg=new THREE.Box3().setFromObject(gg),ba=new THREE.Box3().setFromObject(sc);
 const k=8/(bh.max.z-bh.min.z);T.k=k;const off=-ba.min.y*k;   /* длина корпуса ~8 м; модели смотрят в +Z, игра — в -Z, поэтому поворот на 180° */
 const wrap=o=>{const w=new THREE.Group();w.rotation.y=Math.PI;w.scale.setScalar(k);w.add(o);o.traverse(m=>{if(m.isMesh)m.castShadow=m.receiveShadow=true});return w};
 const hw=wrap(hg);hw.position.y=off;T.body.add(hw);
 T.tur=new THREE.Group();T.tur.position.set(-Tu.position.x*k,off+Tu.position.y*k,-Tu.position.z*k);T.tur.add(wrap(tg));T.body.add(T.tur);
 T.gunG=new THREE.Group();T.gunG.position.set(-Gu.position.x*k,Gu.position.y*k,-Gu.position.z*k);T.gunM=wrap(gg);T.gunG.add(T.gunM);T.tur.add(T.gunG);
 T.muz=new THREE.Object3D();T.muz.position.set(-(bg.min.x+bg.max.x)/2*k,(bg.min.y+bg.max.y)/2*k,-bg.max.z*k);T.gunG.add(T.muz);
 T.box={cx:-(bh.min.x+bh.max.x)/2*k,cz:-(bh.min.z+bh.max.z)/2*k,hx:(bh.max.x-bh.min.x)/2*k,hz:(bh.max.z-bh.min.z)/2*k,y0:0,y1:ba.max.y*k+off+.4};
 T.flare=makeFlare(T.muz);
 /* колёса: узлы Wheel_* вращаются вокруг оси X; гусеницы: цепочка траков бегает по замкнутому контуру */
 hg.traverse(o=>{if(o.name&&o.name.startsWith('Wheel_'))T.wheels.push({m:o,r:(o.userData.r||17)*k,side:o.position.x<0?1:-1,a:0,sg:1})});
 hg.traverse(o=>{const tr=o.isMesh&&o.userData&&o.userData.tr;if(tr){const m=o.material.clone();m.map=m.map.clone();m.map.needsUpdate=true;o.material=m;T.own.push(m,m.map);T.tracks.push({t:m.map,side:tr.side,r:-tr.slope/k})}});
 const tp=H.userData.trk;if(tp){const R=(tp.yt-tp.yb)/2,yc=(tp.yt+tp.yb)/2,zf=tp.F-R,zr=tp.B+R,Lb=zf-zr,L=2*Lb+2*Math.PI*R,N=tp.n||Math.round(L/6.2);
  const path=s=>{s=((s%L)+L)%L;let z,y,a;
   if(s<Lb){z=zf-s;y=tp.yb;a=Math.PI}else if((s-=Lb)<Math.PI*R){const t=-Math.PI/2-s/R;z=zr+R*Math.cos(t);y=yc+R*Math.sin(t);a=t-Math.PI/2}
   else if((s-=Math.PI*R)<Lb){z=zr+s;y=tp.yt;a=0}else{s-=Lb;const t=Math.PI/2-s/R;z=zf+R*Math.cos(t);y=yc+R*Math.sin(t);a=t-Math.PI/2}
   return[z,y,a]};
  const mt=new THREE.MeshStandardMaterial({color:0x3a3d33,roughness:.9,metalness:.3}),gm=new THREE.BoxGeometry(tp.w,tp.th||2.6,tp.pl||5.2);
  T.links=[-1,1].map(sx=>{const im=new THREE.InstancedMesh(gm,mt,N);im.frustumCulled=false;im.castShadow=im.receiveShadow=true;hg.add(im);return{im,N,L,path,x:sx*tp.x,side:sx<0?1:-1,d:0,sp:L/N}});
  T.links.forEach(l=>trackPose(l))}
 return T}
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_tp=new THREE.Vector3(),_s=new THREE.Vector3(1,1,1),_ax=new THREE.Vector3(1,0,0);
function trackPose(l){for(let i=0;i<l.N;i++){const[z,y,a]=l.path(i*l.sp+l.d);_q.setFromAxisAngle(_ax,-a);_tp.set(l.x,y,z);_m.compose(_tp,_q,_s);l.im.setMatrixAt(i,_m)}l.im.instanceMatrix.needsUpdate=true}
function buildTank(id){const c=CATALOG.find(c=>c.id==id);let T;
 if(id=='maus'){T=makeTank(ITEMS,'Maus');T.box=Object.assign({},BOX);T.hp=T.maxhp=c.hp}else T=makeGlbTank(id,c.name,c.hp);
 T.cat=c;T.vm=c.kmh/3.6;T.root.traverse(m=>{if(m.isMesh)m.castShadow=TQ>0});if(id=='is6')T.root.traverse(m=>{if(!m.isMesh)return;m.receiveShadow=false;(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>{if(x&&x.roughness!==undefined){x.roughness=1;x.metalness=0;x.needsUpdate=true}})});let nat=8;if(id=='maus')nat=2*BOX.hz;else{T.root.updateMatrixWorld(true);const gv=T.gunG.visible;T.gunG.visible=false;const bb=new THREE.Box3();T.body.traverse(m=>{if(m.isMesh&&m.visible&&!(m.userData&&m.userData.hl)&&m.geometry){m.geometry.boundingBox||m.geometry.computeBoundingBox();bb.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld))}});T.gunG.visible=gv;const zl=bb.max.z-bb.min.z;if(zl>1&&zl<80)nat=zl/(T.body.scale.x||1)}const s=c.len/nat;T.cs=c.len/8;T.body.scale.setScalar(s);
 const b=T.box;['cx','cz','hx','hz','y0','y1'].forEach(k=>b[k]*=s);T.wheels.forEach(w=>w.r*=s);T.tracks.forEach(x=>x.r=(x.r||.3)/s);if(T.k)T.k*=s;return T}
function setPlayer(id){if(P){const i=ALL.indexOf(P);if(i>=0)ALL.splice(i,1);disposeTank(P)}
 P=buildTank(id);P.tier=CATALOG.find(c=>c.id==id).tier;P.isP=true;P.rl=0;ALL.push(P);respawnPlayer();P.x=0;P.z=0;P.h=0;cy=0;updatePlayer(.016);
 document.querySelectorAll('.hc').forEach(b=>b.classList.toggle('sel',b.dataset.id==id))}
const ROM=['','I','II','III','IV','V','VI','VII','VIII','IX','X'];
const FLG={'Германия':'de','СССР':'su','Франция':'fr','Япония':'jp','Великобритания':'gb','США':'us','Китай':'cn','Европа':'eu'},KLS={'ТТ':'tt','СТ':'st','ЛТ':'lt','ПТ':'td'};
function buildHangar(){const h=$('hangar');h.innerHTML='';CATALOG.slice().sort((a,b)=>a.tier-b.tier||(a.nat=='СССР')-(b.nat=='СССР')||a.name.localeCompare(b.name)).filter(c=>ECO.own.includes(c.id)).forEach(c=>{const b=document.createElement('button');b.className='hc'+(c.nat!='СССР'?' prem':'');b.dataset.id=c.id;b.innerHTML=`<i class="fl"><svg viewBox="0 0 60 30" preserveAspectRatio="none"><use href="#f-${FLG[c.nat]||'su'}"/></svg></i><u><svg><use href="#k-${KLS[c.cls]||'tt'}"/></svg>${ROM[c.tier]}</u><b>${c.name}</b>`;b.onclick=()=>setPlayer(c.id);h.appendChild(b)});if(typeof addIcons=='function')addIcons();if(P)document.querySelectorAll('.hc').forEach(b=>b.classList.toggle('sel',b.dataset.id==P.cat.id))}
function disposeTank(T){T.root.parent&&T.root.parent.remove(T.root);T.root.traverse(o=>{if(T.ownGeo&&o.geometry)o.geometry.dispose();if(o.isInstancedMesh)o.dispose()});
 T.own.forEach(x=>x.dispose&&x.dispose());T.own.length=0;if(T.flare)T.flare.material.dispose();T.decals.length=0;if(T.tag){T.tag.remove();T.tag=null}}
function clearEnemies(){ENEMIES.splice(0).forEach(e=>{const i=ALL.indexOf(e);if(i>=0)ALL.splice(i,1);disposeTank(e)})}
function hangarCam(ts){const a=ts/3000,r=17,y=P.root.position.y;cam.position.set(P.x+Math.sin(a)*r,y+5,P.z+Math.cos(a)*r);cam.lookAt(P.x,y+1.6,P.z)}
