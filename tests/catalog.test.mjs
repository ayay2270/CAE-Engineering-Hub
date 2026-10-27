import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateTools,safeLink} from '../js/tools.js';
import {filterTools} from '../js/filters.js';
const tools=JSON.parse(await readFile(new URL('../data/tools.json',import.meta.url),'utf8'));
const state={category:'',status:'',query:'',view:'home',favorites:new Set(),recent:[]};
test('verified catalog retains all 12 tools and excludes requested repos',()=>{
 assert.equal(validateTools(tools).length,12);
 const excluded=['FRU-Packaging-Database','L10-Packaging-Finder','Tesla-Charge','Commute-Tracker','Weight-UI-Previews','singapore-trip','CAE-Engineering-Hub'];
 assert.ok(tools.every(t=>!excluded.includes(t.repository)));
 assert.equal(new Set(tools.map(t=>t.id)).size,12);
});
test('corrected URLs and local checklist survive UI restoration',()=>{
 assert.equal(tools.filter(t=>t.url).length,11);
 assert.equal(tools.find(t=>t.id==='pre-run-checklist').status,'Local');
 assert.equal(tools.find(t=>t.id==='pre-run-checklist').url,null);
 assert.equal(tools.find(t=>t.id==='knowledge-base').url,'https://ayay2270.github.io/CAE-Knowledge-Base/');
 assert.equal(tools.find(t=>t.id==='center-of-gravity').url,'https://ayay2270.github.io/Center-of-Gravity-Calculator/');
});
test('search and original category/status filters work',()=>{
 assert.equal(filterTools(tools,{...state,query:'棧板 重心'})[0].id,'center-of-gravity');
 assert.equal(filterTools(tools,{...state,query:'Shock-Pulse-Initial-Velocity-Calculator-V2'})[0].id,'shock-pulse');
 assert.equal(filterTools(tools,{...state,category:'Materials'}).length,2);
 assert.equal(filterTools(tools,{...state,status:'Local'}).length,1);
});
test('unsafe URLs and malformed catalog are rejected',()=>{
 assert.equal(safeLink('javascript:alert(1)'),false);
 assert.throws(()=>validateTools([...tools,tools[0]]));
 assert.throws(()=>validateTools([{...tools[0],url:null}]));
});
