'use strict';
function readStaticDirectory() {
  const text = process.env.EMPLOYEE_DIRECTORY_JSON;
  if (!text) throw new Error('Employee directory not configured');
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.employees)) throw new Error('Invalid employee directory');
  return parsed.employees.filter(e => typeof e.name === 'string' && typeof e.id === 'string').map(e => ({
    id:e.id, name:e.name, employeeCode:e.employeeCode || e.id
  }));
}
module.exports=async(req,res)=>{
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  try {return res.status(200).json({employees:readStaticDirectory()});}
  catch(error){console.error('Employee directory unavailable:',error.message);return res.status(503).json({error:'Employee directory unavailable'});}
};
