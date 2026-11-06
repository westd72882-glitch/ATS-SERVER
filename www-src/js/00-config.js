/* одноразовый полный сброс локальных сохранений и входа (поменяйте номер, чтобы сбросить снова) */
try{if(localStorage.getItem('ats_reset')!=='1'){localStorage.clear();sessionStorage.clear();localStorage.setItem('ats_reset','1')}}catch(e){}
window.APP_VERSION='1.0.0';window.API_URL='';
