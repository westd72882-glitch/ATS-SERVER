/* Загрузчик игры (единственный код, который лежит в APK).
 * 1) берёт у сервера подписанный манифест (/api/bundle) и проверяет подпись встроенным публичным ключом (ECDSA P-256);
 * 2) скачивает файлы игры, проверяя SHA-256 каждого файла по манифесту; хранит их в IndexedDB (качаются один раз, дальше только изменённые);
 * 3) при каждом запуске заново проверяет хэши файлов из кэша — подмена файла в кэше обнаруживается и файл качается заново;
 * 4) только после успешной проверки выполняет код игры.
 * ВАЖНО: загрузчик сам лежит в APK. Тот, кто пересоберёт APK, может обойти проверку — настоящая защита от читов это авторитетный сервер. */
(function () {
  'use strict';
  var C = window.ATS_CFG || {}, LV = 1, enc = new TextEncoder(), dec = new TextDecoder('utf-8');
  var $ = function (i) { return document.getElementById(i); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function say(t, p) { var s = $('bs'), b = $('bb'); if (s) s.textContent = t; if (b && p != null) b.style.width = Math.round(p * 100) + '%'; }
  function fatal(t) { say(t); var b = $('bb'); if (b) b.style.background = '#d9482a'; var e = new Error(t); e.fatal = 1; throw e; }
  var hex = function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); };
  var sha = function (b) { return crypto.subtle.digest('SHA-256', b).then(hex); };
  var b64 = function (s) { var r = atob(s), a = new Uint8Array(r.length); for (var i = 0; i < r.length; i++) a[i] = r.charCodeAt(i); return a; };

  var DB = null;
  function db() { return DB || (DB = new Promise(function (ok, bad) { var r = indexedDB.open('ats_code', 1); r.onupgradeneeded = function () { r.result.createObjectStore('f'); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { bad(r.error); }; })); }
  function idbGet(k) { return db().then(function (d) { return new Promise(function (ok, bad) { var q = d.transaction('f').objectStore('f').get(k); q.onsuccess = function () { ok(q.result); }; q.onerror = function () { bad(q.error); }; }); }); }
  function idbPut(k, v) { return db().then(function (d) { return new Promise(function (ok, bad) { var t = d.transaction('f', 'readwrite'); t.objectStore('f').put(v, k); t.oncomplete = ok; t.onerror = function () { bad(t.error); }; }); }); }

  async function getBundle() {
    var t0 = Date.now();
    for (;;) {
      try { var r = await fetch(C.api + '/api/bundle', { cache: 'no-store' }); if (r.ok) return await r.json(); } catch (e) { /* сервер просыпается / нет сети */ }
      var s = Math.round((Date.now() - t0) / 1000);
      say(navigator.onLine === false ? 'Нет подключения к интернету…' : s < 5 ? 'Подключение к серверу…' : 'Сервер запускается, подождите… ' + s + ' с');
      await sleep(1500);
    }
  }

  async function load() {
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }
    if (!C.api || !C.pub) fatal('Приложение собрано без адреса сервера или ключа проверки');
    say('Подключение к серверу…', 0);
    var b = await getBundle();
    var key = await crypto.subtle.importKey('spki', b64(C.pub), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    var ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64(b.sig), enc.encode(b.body));
    if (!ok) fatal('Проверка целостности не пройдена: ответ сервера не подписан. Переустановите приложение из официального источника.');
    var m = JSON.parse(b.body);
    if (m.minLoader > LV) fatal('Требуется обновление приложения (новая версия загрузчика).');
    var names = Object.keys(m.files), total = 0, got = 0, data = {};
    names.forEach(function (n) { total += m.files[n].s; });
    for (var i = 0; i < names.length; i++) {
      var n = names[i], f = m.files[n], buf = null;
      try { var rec = await idbGet(n); if (rec && rec.h === f.h && rec.b && await sha(rec.b) === f.h) buf = rec.b; } catch (e) { }
      if (!buf) {
        say('Загрузка файлов игры… ' + (i + 1) + '/' + names.length, got / total);
        var r = await fetch(C.api + '/api/game/' + encodeURI(n), { cache: 'no-store' });
        if (!r.ok) fatal('Не удалось загрузить «' + n + '» (' + r.status + ')');
        buf = await r.arrayBuffer();
        if (buf.byteLength !== f.s || await sha(buf) !== f.h) fatal('Файл «' + n + '» не прошёл проверку целостности');
        try { await idbPut(n, { h: f.h, b: buf }); } catch (e) { }
      }
      got += f.s; data[n] = dec.decode(buf);
    }
    say('Запуск…', 1);
    return { m: m, data: data };
  }

  function run(x) {
    var m = x.m, data = x.data, boot = m.boot;
    window.APP_VERSION = m.v; window.API_URL = C.api;
    document.documentElement.lang = boot.htmlLang || 'ru';
    if (boot.bodyClass) document.body.className = boot.bodyClass;
    var bs = $('boot'); if (bs) bs.remove();
    boot.parts.forEach(function (p) {
      if (p.h) document.body.insertAdjacentHTML('beforeend', data[p.h]);
      else if (p.c) { var st = document.createElement('style'); st.textContent = data[p.c]; document.head.appendChild(st); }
      else if (p.s) { var el = document.createElement('script'); el.textContent = data[p.s]; document.head.appendChild(el); el.remove(); }
    });
    document.dispatchEvent(new Event('DOMContentLoaded'));  // как при обычной загрузке страницы (часть кода ждёт это событие)
  }

  window.ATS_LOADER = { load: load, run: run };
  if (!window.ATS_NOBOOT) load().then(run).catch(function (e) { if (!e || !e.fatal) say('Ошибка запуска: ' + (e && e.message || e)); });
})();
