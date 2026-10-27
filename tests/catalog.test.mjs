import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateTools,safeLink} from '../js/tools.js';
import {filterTools} from '../js/filters.js';
const tools=JSON.parse(await readFile(new URL('../data/tools.json',import.meta.url),'utf8'));
const state={category:'',status:'',query:'',view:'home',favorites:new Set(),recent:[]};
test('catalog covers 12 tools, excludes requested repositories and the hub itself',()=>{
  assert.equal(validateTools(tools).length,12);assert.equal(new Set(tools.map(t=>t.repository)).size,12);
  const excluded=['FRU-Packaging-Database','L10-Packaging-Finder','Tesla-Charge','Commute-Tracker','Weight-UI-Previews','singapore-trip','CAE-Engineering-Hub'];
  assert.ok(tools.every(t=>!excluded.includes(t.repository)));assert.equal(tools.filter(t=>t.variant).length,3);
});
test('only verified online tools have launch URLs; checklist points to instructions',()=>{
  assert.equal(tools.filter(t=>t.url).length,11);assert.ok(tools.filter(t=>t.url).every(t=>t.httpStatus===200));
  const local=tools.find(t=>t.id==='pre-run-checklist');assert.equal(local.url,null);assert.equal(local.hasPages,false);
  assert.equal(tools.find(t=>t.id==='material-library').repository,'CAE-Material-Library');
  assert.equal(tools.find(t=>t.id==='knowledge-base').url,'https://ayay2270.github.io/CAE-Knowledge-Base/');
  assert.equal(tools.find(t=>t.id==='center-of-gravity').url,'https://ayay2270.github.io/Center-of-Gravity-Calculator/');
});
test('search covers exact repository, Chinese purpose, and multiple terms',()=>{
  assert.equal(filterTools(tools,{...state,query:'Shock-Pulse-Initial-Velocity-Calculator-V2'})[0].id,'shock-pulse');
  assert.equal(filterTools(tools,{...state,query:'棧板 重心'})[0].id,'center-of-gravity');
  assert.equal(filterTools(tools,{...state,query:'absent-tool'}).length,0);
});
test('category, local/online, favorites and recency combine correctly',()=>{
  assert.equal(filterTools(tools,{...state,category:'CAE'}).length,5);
  assert.equal(filterTools(tools,{...state,status:'local'}).length,1);
  assert.equal(filterTools(tools,{...state,category:'Utilities',status:'local'}).length,0);
  assert.deepEqual(filterTools(tools,{...state,view:'favorites',favorites:new Set(['shock-pulse-v1'])}).map(t=>t.id),['shock-pulse-v1']);
  assert.deepEqual(filterTools(tools,{...state,view:'recent',recent:[{id:'url-shortcut'},{id:'material-library'}]}).map(t=>t.id),['url-shortcut','material-library']);
});
test('unsafe links and malformed registry entries are rejected',()=>{
  assert.equal(safeLink('javascript:alert(1)'),false);assert.equal(safeLink('https://example.com'),true);
  assert.throws(()=>validateTools([...tools,tools[0]]));
  assert.throws(()=>validateTools([{...tools[0],url:'javascript:alert(1)'}]));
  assert.throws(()=>validateTools([{...tools[0],url:null}]));
});
