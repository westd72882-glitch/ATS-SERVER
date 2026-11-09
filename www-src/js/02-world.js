/* ===== мир: плоский полигон, бетонные блоки, стены, следы попаданий ===== */
let MAPHF=null;                                  /* карта высот (GLB-карта), null = ровная земля */
const H=(x,z)=>MAPHF&&!inHangar?MAPHF(x,z):0;
const cols=[];                                   /* круглые препятствия {x,z,r,h} */
(function(){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#76735f';x.fillRect(0,0,256,256);
 for(let i=0;i<5000;i++){const v=100+Math.random()*50|0;x.fillStyle=`rgba(${v},${v-3},${v-18},.5)`;x.fillRect(Math.random()*256,Math.random()*256,2,2)}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(70,70);t.encoding=THREE.sRGBEncoding;try{t.anisotropy=R.capabilities.getMaxAnisotropy()}catch(e){t.anisotropy=1}window.GTEX=t;
 const g=new THREE.Mesh(new THREE.PlaneGeometry(440,440).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:t}));g.receiveShadow=true;scene.add(g);window.GRND=g;window.POLYTEX=t;
 const wm=new THREE.MeshStandardMaterial({color:0x8d8b84,roughness:1});
 [[0,-200,400,1],[0,200,400,1],[-200,0,1,400],[200,0,1,400]].forEach(([px,pz,sx,sz])=>{const w=new THREE.Mesh(new THREE.BoxGeometry(sx+(sx<2?1:0),4,sz+(sz<2?1:0)),wm);w.position.set(px,2,pz);w.castShadow=w.receiveShadow=true;scene.add(w)});
 })();
/* текстура следа попадания: тёмное пятно с мягким краем */
const decalTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,31);
 g.addColorStop(0,'rgba(8,6,4,.95)');g.addColorStop(.45,'rgba(14,11,8,.8)');g.addColorStop(.75,'rgba(40,32,24,.35)');g.addColorStop(1,'rgba(40,32,24,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const decalMat=new THREE.MeshBasicMaterial({map:decalTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,side:THREE.DoubleSide});
const decalGeo=new THREE.CircleGeometry(.8,16),ZZ=V3(0,0,1);
const worldDecals=new THREE.InstancedMesh(decalGeo,decalMat,120);worldDecals.frustumCulled=false;scene.add(worldDecals);let wdi=0;
{const o=new THREE.Object3D();o.position.set(0,-99,0);o.updateMatrix();for(let i=0;i<120;i++)worldDecals.setMatrixAt(i,o.matrix)}
function worldDecal(p,n,s){const o=new THREE.Object3D();o.position.copy(p).addScaledVector(n,.04);o.quaternion.setFromUnitVectors(ZZ,n);o.rotateZ(Math.random()*6);o.scale.setScalar(s||1);o.updateMatrix();
 worldDecals.setMatrixAt(wdi=(wdi+1)%120,o.matrix);worldDecals.instanceMatrix.needsUpdate=true}
/* след на корпусе танка (крепится к body, едет вместе с ним) */
function tankDecal(T,lp,n){const m=new THREE.Mesh(decalGeo,decalMat);m.position.copy(lp).addScaledVector(n,.05);m.quaternion.setFromUnitVectors(ZZ,n);m.rotateZ(Math.random()*6);m.scale.setScalar(.15+Math.random()*.1);
 T.body.add(m);T.decals.push(m);if(T.decals.length>[3,8,14][TQ])T.body.remove(T.decals.shift())}

/* вода: три пруда, качество = материал и анимация */
