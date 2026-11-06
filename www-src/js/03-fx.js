/* ===== эффекты: частицы, звук, вспышка выстрела ===== */
function PS(n,add){const g=new THREE.BufferGeometry(),P=new Float32Array(n*3),C=new Float32Array(n*4),S=new Float32Array(n);
 g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('c',new THREE.BufferAttribute(C,4));g.setAttribute('s',new THREE.BufferAttribute(S,1));
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,uniforms:{k:{value:1}},
 vertexShader:'attribute vec4 c;attribute float s;varying vec4 v;uniform float k;void main(){v=c;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=min(s*k/-p.z,k*.16);v.a*=smoothstep(1.,4.,-p.z);gl_Position=projectionMatrix*p;}',
 fragmentShader:'varying vec4 v;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(v.rgb,v.a*(1.-d*d));}'});
 const pts=new THREE.Points(g,mat);pts.frustumCulled=false;scene.add(pts);const L=Array.from({length:n},()=>({l:0}));let ix=0;
 const o={mat,emit(x,y,z,vx,vy,vz,life,s,gr,rgb,a){o.hot=Math.max(o.hot||0,life+.05);const p=L[ix=(ix+1)%n];Object.assign(p,{x,y,z,vx,vy,vz,l:life,L:life,s,gr,rgb,a})},
 update(dt){if(!(o.hot>0))return;o.hot-=dt;for(let i=0;i<n;i++){const p=L[i];if(p.l>0){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vx*=1-1.2*dt;p.vz*=1-1.2*dt;p.vy*=1-.6*dt;p.s+=p.gr*dt;const f=Math.max(0,p.l/p.L);
  P[i*3]=p.x;P[i*3+1]=p.y;P[i*3+2]=p.z;C[i*4]=p.rgb[0];C[i*4+1]=p.rgb[1];C[i*4+2]=p.rgb[2];C[i*4+3]=p.a*f;S[i]=p.s}else C[i*4+3]=0}
  g.attributes.position.needsUpdate=g.attributes.c.needsUpdate=g.attributes.s.needsUpdate=true}};ps.push(o);return o}
const smoke=PS(700,false),fire=PS(250,true);
/* звук */
let AC,E1,E2,EF,EG,NB,MG;
function audio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}MG=AC.createGain();MG.gain.value=window.muted?0:1;MG.connect(AC.destination);
 E1=AC.createOscillator();E2=AC.createOscillator();E1.type='sawtooth';E2.type='square';EF=AC.createBiquadFilter();EF.type='lowpass';EG=AC.createGain();EG.gain.value=0;
 E1.connect(EF);E2.connect(EF);EF.connect(EG);EG.connect(MG);EG.gain.value=0;E1.start();E2.start();NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
function bang(v,f0){if(!AC||v<.02)return;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime;s.buffer=NB;f.type='lowpass';f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(60,t+.9);
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+1);s.connect(f);f.connect(g);g.connect(MG);s.start()}
/* яркая вспышка дула: спрайт-звезда */
const flareTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#fff');g.addColorStop(.18,'#ffe9a0');g.addColorStop(.45,'rgba(255,140,40,.55)');g.addColorStop(1,'rgba(255,90,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
 x.translate(64,64);x.fillStyle='rgba(255,230,160,.75)';for(let i=0;i<8;i++){x.rotate(Math.PI/4);x.beginPath();x.moveTo(0,-3);x.lineTo(62,0);x.lineTo(0,3);x.fill()}return new THREE.CanvasTexture(c)})();
function makeFlare(parent){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:flareTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false,opacity:0}));s.scale.setScalar(9);parent.add(s);return s}
