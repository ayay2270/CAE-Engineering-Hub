import {icon,categoryStyles} from './icons.js';
export const statuses=['Active','Preview','In Development'];
export async function loadTools(){
  const response=await fetch('data/tools.json',{cache:'no-store'});
  if(!response.ok)throw new Error('Unable to load data/tools.json.');
  const tools=await response.json();
  if(!Array.isArray(tools))throw new Error('tools.json must contain an array.');
  const ids=new Set();
  for(const tool of tools){
    if(!tool||typeof tool.id!=='string'||!tool.id.trim()||ids.has(tool.id))throw new Error('Each tool needs a unique, nonempty id.');
    ids.add(tool.id);
    for(const field of ['name','category','description','url'])if(typeof tool[field]!=='string'||!tool[field].trim())throw new Error(`Tool ${tool.id} needs ${field}.`);
    if(!statuses.includes(tool.status))throw new Error(`Unsupported status on ${tool.id}.`);
    if(!Array.isArray(tool.tags)||tool.tags.some(tag=>typeof tag!=='string'))throw new Error(`Tool ${tool.id} needs a tags array of strings.`);
    if(!safeLink(tool.url))throw new Error(`Tool ${tool.id} needs an HTTP or HTTPS URL.`);
  }
  return tools;
}
function safeLink(value){try{return ['https:','http:'].includes(new URL(value).protocol);}catch{return false;}}
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
export function renderCard(tool,favorited){
  const style=categoryStyles[tool.category]||{icon:'cube',accent:'#2869b5',tint:'#eaf3fc'};
  const card=element('article','tool-card');card.dataset.toolId=tool.id;card.style.setProperty('--tool-accent',style.accent);card.style.setProperty('--tool-tint',style.tint);
  const preview=element('div','card-preview');
  const img=element('img');img.alt='';img.loading='lazy';img.width=600;img.height=240;
  img.src=tool.image||'assets/images/default.svg';img.addEventListener('error',()=>{if(!img.dataset.fallback){img.dataset.fallback='true';img.src='assets/images/default.svg';}});
  preview.append(img);
  const badge=element('span',`status-badge status-${tool.status==='Active'?'active':tool.status==='Preview'?'preview':'development'}`);
  badge.append(element('span','status-dot'),document.createTextNode(tool.status));preview.append(badge);
  const content=element('div','card-content');const heading=element('div','card-heading');const toolIcon=element('span','tool-icon');toolIcon.innerHTML=icon(style.icon);heading.append(toolIcon,element('h3','',tool.name));
  const tags=element('div','card-tags');tags.append(element('span','tag tag-category',tool.category));for(const tag of tool.tags)tags.append(element('span','tag',tag));
  const actions=element('div','card-actions');const open=element('a','open-tool');open.href=tool.url;open.target='_blank';open.rel='noopener noreferrer';open.dataset.openTool=tool.id;open.setAttribute('aria-label',`Open ${tool.name} in a new tab`);open.append(document.createTextNode('Open Tool'),Object.assign(element('span'),{innerHTML:icon('arrow')}));
  const favorite=element('button','favorite-button');favorite.type='button';favorite.dataset.favorite=tool.id;favorite.setAttribute('aria-pressed',String(favorited));favorite.setAttribute('aria-label',`${favorited?'Remove':'Add'} ${tool.name} ${favorited?'from':'to'} favorites`);favorite.title=favorited?'Remove from favorites':'Add to favorites';favorite.innerHTML=icon('star');
  actions.append(open,favorite);content.append(heading,tags,element('p','card-description',tool.description),actions);card.append(preview,content);return card;
}
