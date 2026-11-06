/* ===== ядро: рендерер, сцена, свет, утилиты ===== */
const $=i=>document.getElementById(i),V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)),R2=()=>Math.random()-.5;
const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:(()=>{try{const q=JSON.parse(localStorage.getItem('maus_cfg4')||'{}');return String(q.aa)!=='0'}catch(_){return true}})(),powerPreference:'high-performance'});
let inHangar=true,SENS=1;let PRMAX=Math.min(window.devicePixelRatio||1,2.5);let PR=PRMAX;R.setPixelRatio(PR);   /* авто-подстройка разрешения под FPS */
let _ft=0,_fn=0;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.85;
const SKY=0x8d9aa2,scene=new THREE.Scene();scene.background=new THREE.Color(SKY);scene.fog=new THREE.Fog(SKY,90,330);
const cam=new THREE.PerspectiveCamera(55,1,.3,700);
scene.add(new THREE.HemisphereLight(0xcfd8e0,0x55524a,.8));                 /* мягкий свет, без пересвета */
const sun=new THREE.DirectionalLight(0xfff4e4,1.5);sun.position.set(14,110,10);sun.castShadow=true;
sun.shadow.mapSize.set(1536,1536);Object.assign(sun.shadow.camera,{left:-34,right:34,top:34,bottom:-34,near:1,far:260});sun.shadow.bias=-.0008;sun.shadow.normalBias=.06;
scene.add(sun,sun.target);{const f=new THREE.DirectionalLight(0xdde8ff,.45);f.position.set(-50,60,-40);scene.add(f)}
const flash=new THREE.PointLight(0xffa040,0,60);scene.add(flash);
let PK=1;const ps=[];
function resize(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();PK=h*R.getPixelRatio()*.5/Math.tan(cam.fov*Math.PI/360);ps.forEach(p=>p.mat.uniforms.k.value=PK)}
const _p=V3(0,0,0);
function toScreen(v){_p.copy(v).project(cam);return{x:(_p.x*.5+.5)*innerWidth,y:(-_p.y*.5+.5)*innerHeight,vis:_p.z<1}}
let seed=7;const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let TQ=2,FXK=1;const GL={l:0,m:1,h:2};

const FR=new THREE.Frustum(),_pm=new THREE.Matrix4(),_sp=new THREE.Sphere();

let CDN=0;
