'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { timingSafeEqual } = require('node:crypto');
const equal = (a,b) => {
  const left=Buffer.from(String(a||'')); const right=Buffer.from(String(b||''));
  return left.length===right.length && timingSafeEqual(left,right);
};
let cacheValue,cacheSource;
function readStaticDirectory(){
  // Prefer a private Vercel env variable: no roster appears in the public GitHub repository.
  const fromEnv=process.env.EMPLOYEE_DIRECTORY_JSON;
  const file=path.join(process.cwd(),'.private','employee-directory.json');
  const source=fromEnv ? 'environment' : file;
  if(cacheSource===source && cacheValue) return cacheValue;
  if(!fromEnv && !fs.existsSync(file)) throw Error('Employee JSON snapshot is not configured.');
  const parsed=JSON.parse(fromEnv || fs.readFileSync(file,'utf8'));
  const rows=Array.isArray(parsed)?parsed:parsed?.employees;
  if(!Array.isArray(rows)) throw Error('Employee JSON must contain an employees array.');
  const employees=rows.map(row=>({
    id:String(row?.id||'').trim(),employeeCode:String(row?.employeeCode||'').trim(),
    name:String(row?.name||'').trim()
  })).filter(row=>row.id && row.name).slice(0,25000);
  cacheSource=source;cacheValue=employees;return employees;
}
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const key=process.env.EMPLOYEE_DIRECTORY_ACCESS_KEY;
  if(!key)return res.status(503).json({error:'Employee directory access is not configured.'});
  if(!equal(req.headers['x-directory-key'],key))return res.status(401).json({error:'Directory access code required.'});
  try{return res.status(200).json({employees:readStaticDirectory()});}
  catch(e){console.error('Static directory unavailable:',e.message);return res.status(503).json({error:'Employee JSON snapshot missing. Import the directory once and configure EMPLOYEE_DIRECTORY_JSON.'});}
};
