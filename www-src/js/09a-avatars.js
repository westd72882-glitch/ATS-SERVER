/* Процедурные аватарки: SVG генерируется кодом (без эмодзи и картинок). Редкость: обычная / редкая / эпическая / легендарная */
(function(){
const R={c:{n:'Обычная',a:'#8593a0',b:'#27323b',h:'#d6dee4'},r:{n:'Редкая',a:'#3f93ee',b:'#0b2650',h:'#a6d6ff',p:400},e:{n:'Эпическая',a:'#b05cf5',b:'#26104a',h:'#e6bcff',p:1200},l:{n:'Легендарная',a:'#ffc22e',b:'#4d2504',h:'#fff1b0',p:3500}};
const DB=[{id:'a0',r:'c',e:'star',s:11,n:'Звезда'},{id:'a1',r:'c',e:'chev',s:12,n:'Сержант'},
{id:'r1',r:'r',e:'shield',s:21,n:'Страж'},{id:'r2',r:'r',e:'cross',s:22,n:'Снайпер'},{id:'r3',r:'r',e:'tank',s:23,n:'Бронебой'},
{id:'e1',r:'e',e:'bolt',s:31,n:'Молния'},{id:'e2',r:'e',e:'wing',s:32,n:'Крылья'},{id:'e3',r:'e',e:'gear',s:33,n:'Механик'},
{id:'l1',r:'l',e:'crown',s:41,n:'Император'},{id:'l2',r:'l',e:'skull',s:42,n:'Мрачный жнец'},{id:'l3',r:'l',e:'medal',s:43,n:'Герой'}];
const rng=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
const PT=(cx,cy,r,n,k,rot)=>{let o=[];for(let i=0;i<n*2;i++){const q=i%2?r*k:r,a=rot+i*Math.PI/n;o.push((cx+Math.cos(a)*q).toFixed(1)+','+(cy+Math.sin(a)*q).toFixed(1))}return o.join(' ')};
const f1=v=>v.toFixed(1);
function emb(t,d){const F='fill="url(#e'+d+')" stroke="#0009" stroke-width="1.4" stroke-linejoin="round"',D='fill="#1b1209" opacity=".85"';
switch(t){
case'star':return'<polygon '+F+' points="'+PT(50,53,31,5,.45,-Math.PI/2)+'"/>';
case'chev':return[40,54,68].map(y=>'<path '+F+' d="M24 '+y+'L50 '+(y-15)+'L76 '+y+'V'+(y+9)+'L50 '+(y-6)+'L24 '+(y+9)+'Z"/>').join('');
case'shield':return'<path '+F+' d="M50 14L80 24V50C80 70 66 82 50 88C34 82 20 70 20 50V24Z"/><polygon '+D+' points="'+PT(50,50,17,5,.45,-Math.PI/2)+'"/>';
case'cross':return'<g fill="none" stroke="url(#e'+d+')" stroke-width="5" stroke-linecap="round"><circle cx="50" cy="50" r="26"/><circle cx="50" cy="50" r="7"/><path d="M50 12V32M50 68V88M12 50H32M68 50H88"/></g>';
case'tank':return'<rect '+F+' x="18" y="60" width="64" height="15" rx="7.5"/><path '+F+' d="M24 60L31 49H71L78 60Z"/><path '+F+' d="M37 49L42 38H61L66 49Z"/><rect '+F+' x="60" y="41" width="26" height="4.5" rx="2"/><g '+D+'><circle cx="30" cy="67.5" r="3.4"/><circle cx="50" cy="67.5" r="3.4"/><circle cx="70" cy="67.5" r="3.4"/></g>';
case'bolt':return'<polygon '+F+' points="58,12 28,55 46,55 38,89 73,42 54,42"/>';
case'wing':{let s='';[-80,-60,-40,-20,20,40,60,80].forEach((a,i)=>{const L=i<4?a:a;s+='<ellipse '+F+' cx="0" cy="-23" rx="5.2" ry="'+(f1(21-Math.abs(a)/9))+'" transform="translate(50 68) rotate('+a+')"/>'});return s+'<polygon '+F+' points="50,32 58,60 50,80 42,60"/>'}
case'gear':return'<polygon '+F+' points="'+PT(50,50,34,10,.8,0)+'"/><circle cx="50" cy="50" r="22" fill="none" stroke="#0007" stroke-width="2"/><circle cx="50" cy="50" r="10" '+D+'/>';
case'crown':return'<path '+F+' d="M20 70L18 34L36 50L50 26L64 50L82 34L80 70Z"/><rect '+F+' x="20" y="70" width="60" height="9" rx="2"/><g fill="#d4163c" stroke="#0009" stroke-width="1"><circle cx="50" cy="60" r="4.5"/><circle cx="32" cy="62" r="3.2"/><circle cx="68" cy="62" r="3.2"/></g>';
case'skull':return'<path '+F+' d="M50 17C30 17 21 31 23 46C24 54 30 58 32 62V76H68V62C70 58 76 54 77 46C79 31 70 17 50 17Z"/><g '+D+'><circle cx="39" cy="46" r="7.5"/><circle cx="61" cy="46" r="7.5"/><path d="M50 53L45 63H55Z"/></g><path d="M41 76V68M50 76V68M59 76V68" stroke="#1b1209" stroke-width="2.4"/>';
case'medal':return'<polygon '+F+' points="'+PT(50,50,38,12,.72,-Math.PI/2)+'"/><circle cx="50" cy="50" r="19" fill="#2a1704" stroke="url(#e'+d+')" stroke-width="2.4"/><polygon fill="url(#e'+d+')" points="'+PT(50,51,13,5,.45,-Math.PI/2)+'"/>';
}return''}
let U=0;
function svg(id){const a=DB.find(x=>x.id==id)||DB[0],C=R[a.r],q=rng(a.s*7919),d=++U;
let bg='';
if(a.r=='r'){for(let i=-4;i<8;i++)bg+='<path d="M'+(i*16)+' 100L'+(i*16+60)+' 0" stroke="#fff" stroke-opacity=".10" stroke-width="7"/>'}
if(a.r=='e'){[22,34,46].forEach(r=>bg+='<circle cx="50" cy="50" r="'+r+'" fill="none" stroke="'+C.h+'" stroke-opacity=".16" stroke-width="1.4"/>');for(let i=0;i<14;i++)bg+='<circle cx="'+f1(q()*100)+'" cy="'+f1(q()*100)+'" r="'+f1(.6+q()*1.4)+'" fill="'+C.h+'" opacity=".6"/>'}
if(a.r=='l'){for(let i=0;i<20;i++){const t=i*Math.PI/10,t2=t+.12;bg+='<polygon fill="#fff3a0" opacity=".17" points="50,50 '+f1(50+Math.cos(t)*80)+','+f1(50+Math.sin(t)*80)+' '+f1(50+Math.cos(t2)*80)+','+f1(50+Math.sin(t2)*80)+'"/>'}bg+='<circle cx="50" cy="50" r="30" fill="url(#h'+d+')"/>';for(let i=0;i<12;i++)bg+='<path d="M'+f1(q()*100)+' '+f1(q()*100)+'m-2 0h4m-2 -2v4" stroke="#fff" stroke-width=".9" opacity=".8"/>'}
const E=emb(a.e,d);
const DM=(k)=>{const c=50,o=k;return c+','+(c-o)+' '+(c+o)+','+c+' '+c+','+(c+o)+' '+(c-o)+','+c},ring=a.r=='l'?'<polygon points="'+DM(47.6)+'" fill="none" stroke="'+C.a+'" stroke-width="1.6"/><polygon points="'+DM(44)+'" fill="none" stroke="url(#e'+d+')" stroke-width="3"/>'+[[50,3],[97,50],[50,97],[3,50]].map(p=>'<rect x="-2" y="-2" width="4" height="4" fill="#fff3b0" stroke="#5a3306" stroke-width=".6" transform="translate('+p[0]+' '+p[1]+') rotate(45)"/>').join(''):'<polygon points="'+DM(46.4)+'" fill="none" stroke="url(#e'+d+')" stroke-width="'+(a.r=='e'?3.6:a.r=='r'?3:2.4)+'" stroke-linejoin="miter"/>';
return'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="b'+d+'" cx=".5" cy=".3" r=".85"><stop offset="0" stop-color="'+C.a+'"/><stop offset="1" stop-color="'+C.b+'"/></radialGradient><linearGradient id="e'+d+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.h+'"/><stop offset="1" stop-color="'+(a.r=='c'?'#8b98a3':C.a)+'"/></linearGradient><radialGradient id="h'+d+'"><stop offset="0" stop-color="#fff6c0" stop-opacity=".7"/><stop offset="1" stop-color="#fff6c0" stop-opacity="0"/></radialGradient><clipPath id="c'+d+'"><polygon points="50,4 96,50 50,96 4,50"/></clipPath></defs><polygon points="50,4 96,50 50,96 4,50" fill="url(#b'+d+')"/><g clip-path="url(#c'+d+')">'+bg+'<g transform="translate(50 52) scale(.64) translate(-50 -50)" opacity=".4">'+E.replace(/url\(#e\d+\)/g,'#000')+'</g><g transform="translate(50 50) scale(.64) translate(-50 -50)">'+E+'</g></g>'+ring+'</svg>'}
const J=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(_){return null}},W=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
const get=id=>DB.find(x=>x.id==id)||DB[0];
const own=()=>{const b=(J('maus_avown')||[]).filter(i=>DB.some(x=>x.id==i&&x.r!='c'));return DB.filter(x=>x.r=='c'||b.includes(x.id)).map(x=>x.id)};
const has=id=>own().includes(id);
const sel=()=>{const s=J('maus_ava2');return s&&has(s)?s:'a0'};
window.AV={R,DB,svg,get,own,has,sel,setSel:id=>{if(has(id))W('maus_ava2',id)},add:id=>{const b=J('maus_avown')||[];if(!b.includes(id)){b.push(id);W('maus_avown',b)}},
 paint:()=>document.querySelectorAll('[data-av]').forEach(e=>e.innerHTML=svg(sel()))};
})();
