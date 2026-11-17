#!/usr/bin/env node
'use strict';
/*
 * One-time employee directory snapshot.
 * PEOPLESIMPLE_TOKEN=... node scripts/fetch-employees-once.cjs
 * Never commit .private/employee-directory.json to a public repository.
 * Copy the file's JSON value into Vercel's encrypted EMPLOYEE_DIRECTORY_JSON
 * production environment variable.
 */
const fs=require('node:fs');
const path=require('node:path');
const {normalizeEmployees}=require('../lib/employees.cjs');
const token=process.env.PEOPLESIMPLE_TOKEN;
if(!token){console.error('Set PEOPLESIMPLE_TOKEN securely before running this script.');process.exit(1);}
(async()=>{
  const response=await fetch('https://api.peoplesimple.in/api/employees?status=ACTIVE',{
    headers:{Accept:'application/json',Authorization:'Bearer '+token},
    signal:AbortSignal.timeout(15000)
  });
  if(!response.ok)throw Error('PeopleSimple returned HTTP '+response.status);
  const payload=await response.json();
  const raw=Array.isArray(payload)?payload:payload?.data?.employees||payload?.data||payload?.employees;
  const employees=normalizeEmployees(raw);
  const dest=path.join(process.cwd(),'.private','employee-directory.json');
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,JSON.stringify({employees},null,2)+'\n',{mode:0o600});
  console.log('Saved '+employees.length+' active employees to .private/employee-directory.json (gitignored).');
})().catch(e=>{console.error('Employee import failed:',e.message);process.exitCode=1;});
