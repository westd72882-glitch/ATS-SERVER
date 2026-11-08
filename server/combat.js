// Серверный бой (авторитетный): позиции, перезарядка, выстрелы, броня/пробитие, урон, смерти, итог боя и награды считает ТОЛЬКО сервер.
// Клиент шлёт лишь ввод: положение (st), выстрел (shot: углы башни/орудия), выход (leave).
const crypto=require('crypto'),{WebSocketServer}=require('ws'),TANKS=require('./tanks.json');
const ARENA=196,SPREAD=+process.env.SPREAD||.005,MAXT=15*60e3,SPAWNWAIT=90e3,TRK=7000,MAPS=['poly','meadow','protok'];
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),num=v=>Number.isFinite(+v)?+v:0;
const box=t=>({hx:t.len*.2,hz:t.len/2,y0:0,y1:Math.max(2.2,t.len*.31)});
module.exports=function(server,{VERSION,authToken,ownedTank,onEnd}){
const wss=new WebSocketServer({noServer:true,maxPayload:1024}),queues={1:[],5:[],10:[]},rooms=new Map();
server.on('upgrade',(req,sock,head)=>{const u=new URL(req.url,'http://x');const bad=c=>{sock.write('HTTP/1.1 '+c+'\r\n\r\n');sock.destroy()};
 if(u.pathname!=='/ws')return bad('404 Not Found');if(u.searchParams.get('v')!==VERSION)return bad('426 Upgrade Required');
 const nick=authToken(u.searchParams.get('token'));if(!nick)return bad('401 Unauthorized');
 wss.handleUpgrade(req,sock,head,ws=>{ws.nick=nick;ws.id=crypto.randomBytes(4).toString('hex');ws.hb=true;
  wss.clients.forEach(c=>{if(c!==ws&&c.nick===ws.nick)c.close()});wss.emit('connection',ws)})});
const J=(w,o)=>{if(w.readyState===1)w.send(JSON.stringify(o))},bc=(r,o,skip)=>{const s=JSON.stringify(o);r.players.forEach(w=>{if(w!==skip&&w.readyState===1)w.send(s)})};
function stat(){const q={};for(const m in queues)q[m]={n:queues[m].length,need:2*m,tiers:queues[m].map(w=>w.tier).sort((a,b)=>b-a)};
 const msg=JSON.stringify({t:'online',n:wss.clients.size,q});wss.clients.forEach(c=>c.readyState===1&&c.send(msg))}
const unqueue=w=>{for(const m in queues){const i=queues[m].indexOf(w);if(i>=0)queues[m].splice(i,1)}};
/* ---- матч ---- */
function tryMatch(m){const need=2*m,qu=queues[m];if(qu.length<need)return;
 const g=qu.splice(0,need).sort((a,b)=>b.tier-a.tier),id=crypto.randomBytes(6).toString('hex'),map=MAPS[Math.random()*MAPS.length|0];
 const r={id,mode:m,map,t0:Date.now(),over:false,players:new Set(g)};rooms.set(id,r);
 g.forEach((w,i)=>{Object.assign(w,{team:[0,3].includes(i%4)?'A':'B',room:r,st:TANKS[w.tank],hp:TANKS[w.tank].hp,alive:true,spawned:false,x:0,z:0,h:0,ty:0,gp:0,lt:0,hist:[],rl:0,am:null,tk:0,dmg:0,kills:0,done:false,cs:0})});
 const players=g.map(w=>({id:w.id,nick:w.nick,tank:w.tank,tier:w.tier,team:w.team,hp:w.hp}));
 g.forEach(w=>J(w,{t:'match',mode:m,map,id:w.id,team:w.team,players}))}
function dropPlayer(w,why){const r=w.room;if(!r)return;if(w.alive&&!r.over){w.alive=false;bc(r,{t:'dead',id:w.id,by:''},null)}
 if(!w.done&&!r.over)finish(w,false);r.players.delete(w);w.room=null;if(!r.over)check(r);if(!r.players.size)rooms.delete(r.id)}
const side=(r,tm)=>[...r.players].filter(w=>w.team==tm);
const live=(r,tm)=>side(r,tm).some(w=>w.alive);
function check(r,timeout){if(r.over)return;let win=null;
 if(timeout){const f=tm=>side(r,tm).reduce((s,w)=>s+(w.alive?w.hp/w.st.hp:0),0),a=f('A'),b=f('B');win=a>b?'A':b>a?'B':'';}
 else{const a=live(r,'A'),b=live(r,'B');if(a&&b)return;win=a?'A':b?'B':''}
 r.over=true;r.players.forEach(w=>{if(!w.done)finish(w,win&&w.team==win)});rooms.delete(r.id)}
async function finish(w,win){w.done=true;const res={win:!!win,dmg:Math.round(w.dmg),kills:w.kills,tank:w.tank,mode:w.room?w.room.mode:1,map:w.room?w.room.map:''};
 try{const o=await onEnd(w.nick,res);J(w,Object.assign({t:'end',win:!!win,dmg:res.dmg,kills:res.kills},o))}catch(e){console.error('end',e);J(w,{t:'end',win:!!win,err:1})}}
/* ---- выстрел: луч от орудия против прямоугольников танков (с перемоткой на задержку), зоны брони как на клиенте ---- */
function posAt(t,tm){const h=t.hist;for(let i=h.length-1;i>=0;i--)if(h[i].t<=tm)return h[i];return h.length?h[0]:{x:t.x,z:t.z,h:t.h}}
function rayBox(t,p,o,d,range){const b=box(t.st),s=Math.sin(p.h),c=Math.cos(p.h),rx=o.x-p.x,rz=o.z-p.z,pad=.98;
 const ox=rx*c-rz*s,oz=rx*s+rz*c,dx=d.x*c-d.z*s,dz=d.x*s+d.z*c;let t0=0,t1=range;
 for(const[oo,dd,lo,hi]of[[ox,dx,-b.hx*pad,b.hx*pad],[oz,dz,-b.hz*pad,b.hz*pad],[o.y,d.y,b.y0,b.y1]]){
  if(Math.abs(dd)<1e-9){if(oo<lo||oo>hi)return null}else{let a=(lo-oo)/dd,e=(hi-oo)/dd;if(a>e)[a,e]=[e,a];t0=Math.max(t0,a);t1=Math.min(t1,e);if(t0>t1)return null}}
 return{t:t0,b,lx:ox+dx*t0,lz:oz+dz*t0,ly:o.y+d.y*t0,dl:{x:dx,y:d.y,z:dz}}}
function armor(st,b,h,dl){const a=st.arm,ax=Math.abs(h.lx/b.hx),az=Math.abs(h.lz/b.hz),mid=(b.y0+b.y1)/2,ay=Math.abs((h.ly-mid)/((b.y1-b.y0)/2));let nx=0,ny=0,nz=0,base;
 if(ay>ax&&ay>az&&h.ly>mid){ny=1;base=a[4]}else{if(ax>=az){nx=Math.sign(h.lx)||1;base=a[1]}else{nz=Math.sign(h.lz)||1;base=nz<0?a[0]:a[2]}
  if(h.ly>b.y1*.55)base=a[3]*(ax>=az?.8:nz<0?1:.6);else if(h.ly<b.y0+(b.y1-b.y0)*.28)base*=.3}
 const L=Math.hypot(dl.x,dl.y,dl.z)||1,cr=Math.abs((dl.x*nx+dl.y*ny+dl.z*nz)/L);return{eff:base/cl(cr,.34,1),ric:cr<.34&&base>=40}}
function fire(w,now){const r=w.room,st=w.st;
 let g=st.rel;if(st.clip){if(w.am==null)w.am=st.clip.n;w.am--;if(w.am<=0)w.am=st.clip.n;else g=st.clip.gap}
 w.rl=now+g*1000*.88;
 const a=w.h+w.ty,gp=cl(w.gp,-.5,.5),sp=Math.random()*6.2832,sr=SPREAD*Math.sqrt(Math.random());
 let d={x:-Math.cos(gp)*Math.sin(a),y:Math.sin(gp),z:-Math.cos(gp)*Math.cos(a)};
 const rt={x:-d.z,y:0,z:d.x},rl=Math.hypot(rt.x,rt.z)||1;rt.x/=rl;rt.z/=rl;const up={x:d.y*rt.z,y:d.z*rt.x-d.x*rt.z,z:-d.y*rt.x};
 d={x:d.x+rt.x*Math.cos(sp)*sr+up.x*Math.sin(sp)*sr,y:d.y+up.y*Math.sin(sp)*sr,z:d.z+rt.z*Math.cos(sp)*sr+up.z*Math.sin(sp)*sr};const dl=Math.hypot(d.x,d.y,d.z);d.x/=dl;d.y/=dl;d.z/=dl;
 const o={x:w.x+d.x*st.len*.45,y:1.9,z:w.z+d.z*st.len*.45},rew=now-cl(100+(w.rtt||80)/2,0,350);
 let best=null;for(const t of r.players){if(t===w||!t.alive||!t.spawned||t.team===w.team)continue;const p=posAt(t,rew);
  const h=rayBox(t,p,o,d,600);if(h&&(!best||h.t<best.h.t))best={t,h,p}}
 if(!best)return;const{t,h,p}=best,b=h.b;
 if(h.ly<b.y0+(b.y1-b.y0)*.36&&Math.abs(h.lx)>b.hx*.55&&Math.abs(h.lz)>b.hz*.6){t.tk=now+TRK;bc(r,{t:'hit',v:t.id,by:w.id,d:0,hp:t.hp,r:'trk',side:Math.sign(h.lx)||1,end:Math.sign(h.lz)||1});return}
 const ai=armor(t.st,b,h,h.dl),pn=st.pen*(.85+Math.random()*.3);
 if(ai.ric||ai.eff>pn){bc(r,{t:'hit',v:t.id,by:w.id,d:0,hp:t.hp,r:ai.ric?'r':'n',e:Math.round(ai.eff),p:Math.round(pn)});return}
 const dm=Math.round(st.dmg*(.85+Math.random()*.3)),real=Math.min(dm,t.hp);t.hp-=real;w.dmg+=real;
 bc(r,{t:'hit',v:t.id,by:w.id,d:real,hp:t.hp,r:'p'});
 if(t.hp<=0){t.alive=false;w.kills++;bc(r,{t:'dead',id:t.id,by:w.id});check(r)}}
/* ---- ввод игрока ---- */
function onState(w,m,now){const r=w.room;if(!r||!w.alive||r.over)return;const st=w.st,x=num(m.x),z=num(m.z),h=num(m.h);
 if(!w.spawned){const sd=w.team=='B'?-1:1;let ok=Math.abs(x)<=165&&z*sd>=100&&z*sd<=ARENA;
  if(!ok){const sx=(Math.random()-.5)*200,sz=sd*(120+Math.random()*50);w.x=sx;w.z=sz;w.h=sd<0?Math.PI:0;J(w,{t:'corr',x:sx,z:sz,h:w.h})}else{w.x=x;w.z=z;w.h=h}
  w.spawned=true;w.lt=now;w.hist=[{t:now,x:w.x,z:w.z,h:w.h}];return}
 const dt=cl((now-w.lt)/1000,.02,1.2);w.lt=now;let dx=x-w.x,dz=z-w.z;const d=Math.hypot(dx,dz);
 const lim=w.tk>now?.3:(st.kmh/3.6)*1.45*dt+.8;let bad=false;
 if(d>lim){dx*=lim/d;dz*=lim/d;bad=true}
 let nx=cl(w.x+dx,-ARENA,ARENA),nz=cl(w.z+dz,-ARENA,ARENA);if(nx!==w.x+dx||nz!==w.z+dz)bad=true;
 w.x=nx;w.z=nz;w.h=h;w.ty=num(m.ty);w.gp=cl(num(m.gp),-.5,.5);w.v=cl(num(m.v),-60,60);w.w=cl(num(m.w),-6,6);
 w.hist.push({t:now,x:w.x,z:w.z,h:w.h});while(w.hist.length&&w.hist[0].t<now-1200)w.hist.shift();
 if(bad&&now-w.cs>400){w.cs=now;J(w,{t:'corr',x:w.x,z:w.z,h:w.h})}
 bc(r,{t:'st',id:w.id,x:w.x,z:w.z,h:w.h,ty:w.ty,gp:w.gp,v:w.v,w:w.w},w)}
wss.on('connection',ws=>{ws.on('pong',()=>{ws.hb=true;if(ws.pt)ws.rtt=Date.now()-ws.pt});ws.mc=0;
 J(ws,{t:'hello',id:ws.id,nick:ws.nick});stat();
 ws.on('message',raw=>{if(++ws.mc>50){ws.terminate();return}let m;try{m=JSON.parse(raw)}catch(_){return}const now=Date.now();
  if(m.t==='queue'){const mode=+m.mode,tk=String(m.tank||'');if(!queues[mode])return;
   if(!TANKS[tk]||!ownedTank(ws.nick,tk))return J(ws,{t:'err',e:'Этот танк вам не принадлежит'});
   unqueue(ws);dropPlayer(ws);ws.tank=tk;ws.tier=TANKS[tk].tier;queues[mode].push(ws);tryMatch(mode);stat();return}
  if(m.t==='cancel'){unqueue(ws);stat();return}
  if(m.t==='leave'){dropPlayer(ws);return}
  if(m.t==='st')return onState(ws,m,now);
  if(m.t==='shot'){const r=ws.room;if(!r||r.over||!ws.alive||!ws.spawned||now<ws.rl)return;ws.ty=num(m.ty);ws.gp=cl(num(m.gp),-.5,.5);
   bc(r,{t:'shot',id:ws.id,ty:ws.ty,gp:ws.gp},ws);fire(ws,now)}});
 ws.on('close',()=>{unqueue(ws);dropPlayer(ws);stat()})});
setInterval(()=>{wss.clients.forEach(w=>w.mc=0)},1000);
setInterval(()=>{const now=Date.now();rooms.forEach(r=>{if(r.over)return;
 if(now-r.t0>MAXT)return check(r,true);
 if(now-r.t0>SPAWNWAIT)r.players.forEach(w=>{if(!w.spawned&&w.alive){w.alive=false;bc(r,{t:'dead',id:w.id,by:''});check(r)}})})},2000);
setInterval(()=>wss.clients.forEach(w=>{if(!w.hb)return w.terminate();w.hb=false;w.pt=Date.now();w.ping()}),5000);
};
