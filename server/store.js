// Хранилище: PostgreSQL (DATABASE_URL). Таблица kv(coll,k,v jsonb). В памяти — кэш, изменённые ключи пишутся в БД пакетом (upsert).
// Без DATABASE_URL (локальная отладка) — файл users.json.
const fs=require('fs'),path=require('path');
const COLL=['users','sessions','saves','eco','promos','battles'];
module.exports=function(db){
 const url=process.env.DATABASE_URL,dirty=new Map(),snap={};COLL.forEach(c=>{db[c]=db[c]||{};snap[c]=new Set()});
 let pool=null,busy=Promise.resolve();
 try{fs.mkdirSync(process.env.DATA_DIR||__dirname,{recursive:true})}catch(_){}
 const FILE=path.join(process.env.DATA_DIR||__dirname,'users.json');
 const mark=(c,k)=>{if(!dirty.has(c))dirty.set(c,new Set());dirty.get(c).add(k)};
 async function load(){
  if(!url){try{if(fs.existsSync(FILE))Object.assign(db,JSON.parse(fs.readFileSync(FILE)))}catch(e){console.error('БД-файл повреждён',e);process.exit(1)}COLL.forEach(c=>db[c]=db[c]||{});console.warn('DATABASE_URL не задан: режим файла (только для отладки)');return}
  const {Pool}=require('pg');pool=new Pool({connectionString:url,max:5,ssl:/\.render\.com/.test(url)||process.env.PGSSL=='1'?{rejectUnauthorized:false}:false});
  if(process.env.RESET_DB==='YES'){await pool.query('DROP TABLE IF EXISTS kv');console.warn('RESET_DB=YES: ВСЕ данные удалены. Удалите эту переменную!')}
  await pool.query('CREATE TABLE IF NOT EXISTS kv(coll text NOT NULL,k text NOT NULL,v jsonb NOT NULL,updated timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(coll,k))');
  const r=await pool.query('SELECT coll,k,v FROM kv');for(const x of r.rows)if(db[x.coll]){db[x.coll][x.k]=x.v;snap[x.coll].add(x.k)}
  console.log('PostgreSQL: загружено записей',r.rowCount)}
 function flush(){busy=busy.then(async()=>{
  if(!dirty.size)return;const batch=[...dirty].map(([c,s])=>[c,[...s]]);dirty.clear();
  if(!pool){const t=FILE+'.tmp';fs.writeFileSync(t,JSON.stringify(db));fs.renameSync(t,FILE);return}
  const cn=await pool.connect();try{await cn.query('BEGIN');
   for(const[c,keys]of batch){const up=[],del=[];for(const k of keys){if(db[c][k]===undefined)del.push(k);else up.push(k)}
    if(up.length)await cn.query("INSERT INTO kv(coll,k,v) SELECT $1,x.k,x.v::jsonb FROM unnest($2::text[],$3::text[]) AS x(k,v) ON CONFLICT(coll,k) DO UPDATE SET v=EXCLUDED.v,updated=now()",[c,up,up.map(k=>JSON.stringify(db[c][k]))]);
    if(del.length)await cn.query('DELETE FROM kv WHERE coll=$1 AND k=ANY($2)',[c,del])}
   await cn.query('COMMIT')}
  catch(e){await cn.query('ROLLBACK').catch(()=>{});for(const[c,keys]of batch)keys.forEach(k=>mark(c,k));console.error('БД: ошибка записи',e.message)}
  finally{cn.release()}}).catch(e=>console.error(e));return busy}
 return{load,mark,flush}};
