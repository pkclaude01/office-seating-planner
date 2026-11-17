import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAssignments, assignEmployee, matchesEmployee } from '../main-office/assignments.mjs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { normalizeEmployees } = require('../lib/employees.cjs');
const seats = ['T1-top-0','T1-top-1','T2-top-0'];
const a={id:'person-a',employeeCode:'E100',name:'Alex Smith'};
const b={id:'person-b',employeeCode:'E200',name:'Sam Rao'};
test('employee assignments persist IDs and preserve legacy names',()=>{
  assert.deepEqual(normalizeAssignments({[seats[0]]:'Legacy Name'},seats)[seats[0]],{id:'',employeeCode:'',name:'Legacy Name'});
  const result=assignEmployee({},a,seats[0],seats);
  assert.deepEqual(normalizeAssignments(JSON.parse(JSON.stringify(result)),seats)[seats[0]],a);
});
test('moving and swapping keep one seat per employee',()=>{
  const current={[seats[0]]:a,[seats[1]]:b};
  const moved=assignEmployee(current,a,seats[2],seats);
  assert.equal(moved[seats[0]],undefined);assert.deepEqual(moved[seats[2]],a);assert.deepEqual(moved[seats[1]],b);
  assert.throws(()=>assignEmployee(current,a,seats[1],seats),/occupied/);
  const swapped=assignEmployee(current,a,seats[1],seats,true);
  assert.deepEqual(swapped[seats[0]],b);assert.deepEqual(swapped[seats[1]],a);
  assert.deepEqual(current[seats[0]],a);
});
test('invalid seats, duplicate employees, search by names and IDs',()=>{
  assert.throws(()=>assignEmployee({},a,'unknown',seats));
  const result=assignEmployee({[seats[0]]:a,[seats[1]]:a},a,seats[2],seats);
  assert.equal(Object.values(result).filter(x=>x.id===a.id).length,1);
  for(const q of ['alex','Smith','e100','PERSON-A'])assert.ok(matchesEmployee(a,q));
  assert.ok(!matchesEmployee(a,'not-in-directory'));
});
test('directory excludes inactive people and private fields',()=>{
  const items=normalizeEmployees([{id:1,employeeCode:'007',firstName:'Alex',lastName:'Smith',status:'ACTIVE',salary:42,email:'private'},{id:2,status:'INACTIVE',firstName:'Nope'}]);
  assert.deepEqual(items,[{id:'1',employeeCode:'007',name:'Alex Smith'}]);
});
test('employee API requires credentials and access code before calling PeopleSimple',async()=>{
  const handler=require('../api/employees.js');
  const priorToken=process.env.PEOPLESIMPLE_TOKEN,priorKey=process.env.EMPLOYEE_DIRECTORY_ACCESS_KEY,priorFetch=globalThis.fetch;
  const response=()=>({setHeader(){},status(n){this.code=n;return this;},json(v){this.body=v;return this;}});
  try{
    delete process.env.PEOPLESIMPLE_TOKEN;delete process.env.EMPLOYEE_DIRECTORY_ACCESS_KEY;
    let res=response();await handler({method:'GET',headers:{}},res);assert.equal(res.code,503);
    process.env.PEOPLESIMPLE_TOKEN='placeholder';process.env.EMPLOYEE_DIRECTORY_ACCESS_KEY='directory-test-code';
    res=response();await handler({method:'GET',headers:{}},res);assert.equal(res.code,401);
    globalThis.fetch=async()=>({ok:true,json:async()=>[{id:1,status:'ACTIVE',firstName:'Alex',lastName:'Smith',email:'private'}]});
    res=response();await handler({method:'GET',headers:{'x-directory-key':'directory-test-code'}},res);
    assert.equal(res.code,200);assert.deepEqual(res.body.employees,[{id:'1',employeeCode:'',name:'Alex Smith'}]);
    globalThis.fetch=async()=>({ok:false,status:401});
    res=response();await handler({method:'GET',headers:{'x-directory-key':'directory-test-code'}},res);
    assert.equal(res.code,503);
  }finally{
    if(priorToken===undefined)delete process.env.PEOPLESIMPLE_TOKEN;else process.env.PEOPLESIMPLE_TOKEN=priorToken;
    if(priorKey===undefined)delete process.env.EMPLOYEE_DIRECTORY_ACCESS_KEY;else process.env.EMPLOYEE_DIRECTORY_ACCESS_KEY=priorKey;
    globalThis.fetch=priorFetch;
  }
});
