'use strict';
const { normalizeEmployees } = require('../lib/employees.cjs');
const { timingSafeEqual } = require('node:crypto');
const equal = (a,b) => {
 const left = Buffer.from(String(a||'')); const right = Buffer.from(String(b||''));
 return left.length === right.length && timingSafeEqual(left,right);
};
module.exports = async (req,res) => {
 res.setHeader('Cache-Control','private, no-store');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if (req.method !== 'GET') {res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 const token = process.env.PEOPLESIMPLE_TOKEN;
 const key = process.env.EMPLOYEE_DIRECTORY_ACCESS_KEY;
 if(!token || !key) return res.status(503).json({error:'Employee directory is not configured. Set both server-side environment variables.'});
 if(!equal(req.headers['x-directory-key'],key)) return res.status(401).json({error:'Directory access code required.'});
 try {
   const response=await fetch('https://api.peoplesimple.in/api/employees?status=ACTIVE',{
      headers:{Accept:'application/json',Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(12000)
   });
   if(response.status===401 || response.status===403) return res.status(503).json({error:'PeopleSimple access expired. Update the server token.'});
   if(!response.ok) throw Error('Upstream unavailable');
   const payload=await response.json();
   return res.status(200).json({employees:normalizeEmployees(payload)});
 }catch { return res.status(503).json({error:'Could not load employees. Please retry.'});}
};
