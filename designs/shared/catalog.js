import {icon} from './icons.js';
export function safeLink(value){try{return ['https:','http:'].includes(new URL(value).protocol);}catch{return false;}}
export function validateTools(tools){
  if(!Array.isArray(tools))throw new Error('工具目錄格式錯誤。');
  const ids=new Set();
  for(const tool of tools){
    if(!tool||typeof tool.id!=='string'||!tool.id.trim()||ids.has(tool.id))throw new Error('工具 ID 必須唯一。');
    ids.add(tool.id);
    for(const field of ['name','repository','category','description','status','note'])if(typeof tool[field]!=='string'||!tool[field].trim())throw new Error(`工具 ${tool.id} 缺少 ${field}。`);
    if(!Array.isArray(tool.tags)||tool.tags.some(tag=>typeof tag!=='string'))throw new Error('工具標籤格式錯誤。');
    if(!safeLink(tool.repo)||!(tool.url===null||safeLink(tool.url)))throw new Error('工具網址必須使用 HTTP 或 HTTPS。');
    if(tool.url===null&&tool.status!=='本機工具')throw new Error('缺少線上工具網址。');
  }
  return tools;
}
export async function loadTools(){const response=await fetch('data/tools.json',{cache:'no-store'});if(!response.ok)throw new Error('無法載入工具目錄。');return validateTools(await response.json());}
export function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
export function renderCard(tool,favorited){
  const card=element('article','tool-card');card.dataset.toolId=tool.id;
  const top=element('div','card-top');const glyph=element('span','tool-icon');glyph.innerHTML=icon(tool.icon);
  const badge=element('span',`status-badge ${!tool.url?'status-local':tool.status==='預覽版'?'status-preview':''}`,tool.status);
  const favorite=element('button','favorite-button');favorite.type='button';favorite.dataset.favorite=tool.id;favorite.setAttribute('aria-pressed',String(favorited));favorite.setAttribute('aria-label',`${favorited?'取消收藏':'收藏'} ${tool.name}`);favorite.innerHTML=icon('star');top.append(glyph,badge,favorite);
  const tags=element('div','card-tags');tool.tags.forEach(tag=>tags.append(element('span','tag',tag)));
  const actions=element('div','card-actions');const open=element('a','open-tool',tool.url?'開啟工具':'本機啟動說明');open.href=tool.url||`${tool.repo}#readme`;open.target='_blank';open.rel='noopener noreferrer';if(tool.url)open.dataset.openTool=tool.id;open.setAttribute('aria-label',`${tool.url?'開啟':'查看本機啟動說明：'} ${tool.name}（新分頁）`);const arrow=element('span');arrow.innerHTML=icon('external');open.append(arrow);
  const repo=element('a','repo-link','Repository');repo.href=tool.repo;repo.target='_blank';repo.rel='noopener noreferrer';repo.setAttribute('aria-label',`${tool.repository} 原始碼（新分頁）`);actions.append(open,repo);
  card.append(top,element('h3','',tool.name),element('p','card-description',tool.description),tags,element('p','card-note',tool.note),actions);return card;
}
