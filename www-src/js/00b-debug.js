/* Отладка: кнопка LOG в правом верхнем углу. Перехватывает console, ошибки, fetch, WebSocket, этапы загрузки. */
(function(){
if(window.__dbg)return;
var LOG=[],MAX=1500,T0=Date.now(),panel=null,body=null;
function ts(){var d=((Date.now()-T0)/1000).toFixed(2);return d+'s'}
function fmt(a){return Array.prototype.map.call(a,function(x){try{if(x instanceof Error)return x.name+': '+x.message+(x.stack?'\n'+String(x.stack).split('\n').slice(0,4).join('\n'):'');if(typeof x==='object')return JSON.stringify(x);return String(x)}catch(e){return String(x)}}).join(' ')}
function add(lv,msg){var l=ts()+' ['+lv+'] '+msg;LOG.push(l);if(LOG.length>MAX)LOG.shift();if(body&&panel.style.display!=='none'){body.textContent=LOG.join('\n');body.scrollTop=body.scrollHeight}}
window.__dbg=add;window.dbg=function(m){add('STEP',m)};
['log','info','warn','error'].forEach(function(k){var o=console[k];console[k]=function(){try{add(k.toUpperCase(),fmt(arguments))}catch(e){}return o.apply(console,arguments)}});
addEventListener('error',function(e){add('ERROR',(e.message||'')+' @'+(e.filename||'').split('/').pop()+':'+e.lineno+':'+e.colno+(e.error&&e.error.stack?'\n'+String(e.error.stack).split('\n').slice(0,4).join('\n'):''))},true);
addEventListener('unhandledrejection',function(e){add('REJECT',fmt([e.reason]))});
/* fetch: лог + таймаут (сервер на Render «просыпается» до ~60 с) */
var of=window.fetch;
if(of)window.fetch=function(u,o){var url=String(u&&u.url||u),short=url.length>90?url.slice(0,90)+'…':url,t=Date.now(),api=url.indexOf('/api/')>=0,ms=api?60000:30000;
 o=o||{};var ac=null,tm=null;if(!o.signal&&typeof AbortController!=='undefined'){ac=new AbortController();o=Object.assign({},o,{signal:ac.signal});tm=setTimeout(function(){add('NET','ТАЙМАУТ '+(ms/1000)+'с '+short);ac.abort()},ms)}
 add('NET','→ '+((o&&o.method)||'GET')+' '+short);
 return of.call(window,u,o).then(function(r){clearTimeout(tm);add('NET','← '+r.status+' '+short+' '+(Date.now()-t)+'мс');return r},function(e){clearTimeout(tm);add('NET','✗ '+short+' '+(e&&e.name)+': '+(e&&e.message)+' '+(Date.now()-t)+'мс');throw e})};
/* WebSocket */
var OW=window.WebSocket;
if(OW){window.WebSocket=function(u,p){var s=p?new OW(u,p):new OW(u),q=String(u).replace(/token=[^&]*/,'token=***');add('WS','open '+q);
 s.addEventListener('open',function(){add('WS','connected')});s.addEventListener('close',function(e){add('WS','close code='+e.code+' '+(e.reason||''))});s.addEventListener('error',function(){add('WS','error')});return s};
 window.WebSocket.prototype=OW.prototype;['CONNECTING','OPEN','CLOSING','CLOSED'].forEach(function(k){window.WebSocket[k]=OW[k]})}
/* информация об окружении */
function env(){var C=window.Capacitor;add('ENV','ver='+window.APP_VERSION+' api='+(window.API_URL||'(пусто)')+' native='+!!(C&&C.isNativePlatform&&C.isNativePlatform())+' plugins='+(C&&C.Plugins?Object.keys(C.Plugins).join(','):'-')+' AssetKey='+!!(C&&C.Plugins&&C.Plugins.AssetKey)+' crypto.subtle='+!!(window.crypto&&crypto.subtle)+' online='+navigator.onLine+' ua='+navigator.userAgent);
 try{add('ENV','session='+(localStorage.getItem('maus_session')?'есть':'нет')+' screen='+innerWidth+'x'+innerHeight+' dpr='+devicePixelRatio)}catch(e){}}
function ui(){
 var b=document.createElement('div');b.textContent='LOG';
 b.style.cssText='position:fixed;top:6px;right:6px;z-index:2147483646;background:#000b;color:#7fff7f;font:700 13px monospace;padding:6px 10px;border:1px solid #7fff7f;border-radius:6px;opacity:.8';
 panel=document.createElement('div');panel.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#000e;color:#ddd;display:none;flex-direction:column;font:11px/1.35 monospace';
 var bar=document.createElement('div');bar.style.cssText='display:flex;gap:8px;padding:8px;background:#111;flex:0 0 auto';
 function btn(t,f){var x=document.createElement('button');x.textContent=t;x.style.cssText='flex:1;padding:8px;font:700 13px system-ui;background:#2a3a2a;color:#fff;border:1px solid #7fff7f;border-radius:6px';x.onclick=f;bar.appendChild(x)}
 btn('Копировать',function(){var s=LOG.join('\n');try{navigator.clipboard.writeText(s).then(function(){add('LOG','скопировано')},fb)}catch(e){fb()}function fb(){var ta=document.createElement('textarea');ta.value=s;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');add('LOG','скопировано')}catch(e){}ta.remove()}});
 btn('Поделиться',function(){if(navigator.share)navigator.share({title:'ATS log',text:LOG.join('\n')}).catch(function(){})});
 btn('Очистить',function(){LOG.length=0;body.textContent=''});
 btn('Закрыть',function(){panel.style.display='none'});
 body=document.createElement('pre');body.style.cssText='flex:1;overflow:auto;margin:0;padding:8px;white-space:pre-wrap;word-break:break-all;user-select:text;-webkit-user-select:text';
 panel.appendChild(bar);panel.appendChild(body);
 b.onclick=function(){env();panel.style.display='flex';body.textContent=LOG.join('\n');body.scrollTop=body.scrollHeight};
 document.body.appendChild(b);document.body.appendChild(panel)}
if(document.body)ui();else addEventListener('DOMContentLoaded',ui);
addEventListener('DOMContentLoaded',env);
add('STEP','debug готов');
})();
