/* одноразовый полный сброс локальных сохранений и входа (поменяйте номер, чтобы сбросить снова) */
try{if(localStorage.getItem('ats_reset')!=='1'){localStorage.clear();sessionStorage.clear();localStorage.setItem('ats_reset','1')}}catch(e){}
window.APP_VERSION='1.0.0';window.API_URL='';
/* Нет настроенного сервера (локальная сборка/тест) — модели и аватары берём из папки models/ рядом с игрой, а не с защищённого сервера. */
window.ATS_LOCAL=!window.API_URL;
