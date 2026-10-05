import {icon, categoryStyles} from '../../js/icons.js';
import {matchesSearch} from '../../js/search.js';

// One metadata source and interaction layer; each concept has its own layout.
const variant = document.body.dataset.concept;
const area = document.querySelector('#tools');
const input = document.querySelector('#search');
const categories = ['Knowledge','Materials','Calculators','Workflow','Standards','Project Data'];
const store = {favorites:'cae-hub:concepts:favorites:v1',recent:'cae-hub:concepts:recent:v1'};
const read = key => {try {const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(x=>typeof x==='string'):[];} catch{return [];}};
const save = (key,value) => {try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Browsing still works if local storage is unavailable. */}};
const favorites = new Set(read(store.favorites));
let recent = read(store.recent).slice(0,12);
let tools = [];
const state = {query:'',category:'',status:'',view:'all',selected:''};
const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = status => status==='Preview'?'preview-status':status==='In Development'?'development':'active-status';
const status = t => `<span class="status ${slug(t.status)}">${escape(t.status)}</span>`;
const style = t => {const s=categoryStyles[t.category]||{icon:'cube',accent:'#456078',tint:'#edf2f7'};return `style="--accent:${s.accent};--tint:${s.tint}"`;};
const symbol = t => `<span class="tool-symbol">${icon((categoryStyles[t.category]||{}).icon||'cube')}</span>`;
const url = value => {try{const u=new URL(value,document.baseURI);return ['https:','http:'].includes(u.protocol)?escape(u.href):'#';}catch{return '#';}};
const preview = t => {
  // Concept-only illustrations replace the baseline previews without altering its data.
  const known = new Set(['knowledge-base','material-library','shock-pulse','center-of-gravity','pre-run-checklist','standard-finder','weight-manager']);
  const src=known.has(t.id)?new URL(`visuals/${t.id}.svg`,import.meta.url).href:t.image?new URL(`../../${t.image}`,import.meta.url).href:new URL('visuals/default.svg',import.meta.url).href;
  return `<img src="${escape(src)}" alt="" loading="lazy">`;
};
const star = t => `<button class="favorite" data-star="${escape(t.id)}" aria-label="Favorite ${escape(t.name)}" aria-pressed="${favorites.has(t.id)}" title="${favorites.has(t.id)?'Remove favorite':'Add favorite'}">${icon('star')}</button>`;
const launch = (t,compact=false) => `<a class="launch${compact?' compact-launch':''}" data-open="${escape(t.id)}" href="${url(t.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escape(t.name)} in a new tab">${compact?'<span class="visually-hidden">Open Tool</span>':'Open Tool'} ${icon('arrow')}</a>`;
const tags = t => `<div class="tags"><span>${escape(t.category)}</span>${(t.tags||[]).slice(0,2).map(x=>`<span>${escape(x)}</span>`).join('')}</div>`;
const card = (t,feature=false) => `<article class="tool-card${feature?' featured-card':''}" data-tool="${escape(t.id)}" ${style(t)}><div class="preview">${preview(t)}${status(t)}</div><div class="tool-body"><div class="tool-heading">${symbol(t)}<h3>${escape(t.name)}</h3></div><p class="description">${escape(t.description)}</p>${tags(t)}<div class="card-actions">${launch(t)}${star(t)}</div></div></article>`;
const row = t => `<article class="tool-row" data-tool="${escape(t.id)}" ${style(t)}><div class="row-preview">${preview(t)}</div><div class="row-copy"><h3>${escape(t.name)}</h3><p class="description">${escape(t.description)}</p></div><span class="row-category">${escape(t.category)}</span>${status(t)}${star(t)}${launch(t)}</article>`;
const result = t => `<article class="search-result" data-tool="${escape(t.id)}" ${style(t)}><div class="result-symbol">${symbol(t)}</div><div class="result-copy"><div class="result-topline"><span class="result-category">${escape(t.category)}</span>${status(t)}</div><h3>${escape(t.name)}</h3><p class="description">${escape(t.description)}</p></div><div class="result-actions">${star(t)}${launch(t,true)}</div></article>`;
const groupRow = t => `<article class="group-tool" data-tool="${escape(t.id)}" ${style(t)}><div class="group-preview">${preview(t)}</div><div class="group-copy"><h3>${escape(t.name)}</h3><p class="description">${escape(t.description)}</p><div class="group-actions">${status(t)}${star(t)}${launch(t,true)}</div></div></article>`;
const selectedRow = t => `<article class="navigator-row${state.selected===t.id?' selected':''}" data-tool="${escape(t.id)}" ${style(t)}><button class="inspect-tool" data-inspect="${escape(t.id)}" aria-label="Inspect ${escape(t.name)}" aria-pressed="${state.selected===t.id}">${symbol(t)}<span><strong>${escape(t.name)}</strong><small>${escape(t.category)} · ${escape(t.status)}</small></span></button>${launch(t,true)}</article>`;

function filtered(){
  let list=tools.filter(t=>matchesSearch(t,state.query)&&(!state.category||t.category===state.category)&&(!state.status||t.status===state.status)&&(state.view!=='favorites'||favorites.has(t.id))&&(state.view!=='recent'||recent.includes(t.id)));
  if(state.view==='recent')list.sort((a,b)=>recent.indexOf(a.id)-recent.indexOf(b.id));
  return list;
}
function renderNav(){
  document.querySelectorAll('[data-categories]').forEach(container=>{
    const chips=container.classList.contains('category-chips');
    container.innerHTML=(chips?['',...categories]:categories).map(c=>`<button class="${chips?'':'nav-item '}${state.category===c?'active':''}" data-category="${escape(c)}" aria-pressed="${state.category===c}">${chips?'':icon((categoryStyles[c]||{}).icon||'grid')}<span>${escape(c||'All categories')}</span> <span class="nav-count">${c?tools.filter(t=>t.category===c).length:tools.length}</span></button>`).join('');
  });
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===state.view&&!state.category);b.setAttribute('aria-pressed',String(b.dataset.view===state.view&&!state.category));});
  const select=document.querySelector('#category');if(select)select.value=state.category;
  const heading=document.querySelector('[data-view-heading]');if(heading)heading.textContent=state.category||({all:variant==='b'?'Engineering workbench':variant==='e'?'Browse by category':'All tools',favorites:'Favorites',recent:'Recently used'})[state.view];
  const hero=document.querySelector('.hero');if(hero)hero.hidden=state.view!=='all'||!!state.category||!!state.query||!!state.status;
}
function render(){
  const list=filtered();renderNav();
  document.querySelector('#count').textContent=`${list.length} ${list.length===1?'tool':'tools'}${list.length!==tools.length?` / ${tools.length}`:''}`;
  if(!list.length){area.innerHTML=`<div class="empty"><h2>${state.view==='favorites'&&!favorites.size?'No favorites yet':state.view==='recent'&&!recent.length?'No recently used tools':'No matching tools'}</h2><p>${state.view==='favorites'&&!favorites.size?'Star a tool to keep it here.':state.view==='recent'&&!recent.length?'Tools you open will appear here.':'Try another term, category, or status.'}</p><button data-reset>Browse all tools</button></div>`;return;}
  if(variant==='b')area.innerHTML=`<div class="row-head" aria-hidden="true"><span>Tool / purpose</span><span>Category</span><span>Status</span><span>Launch</span></div><div class="tool-list">${list.map(row).join('')}</div>`;
  else if(variant==='c')area.innerHTML=`<div class="search-results">${list.map(result).join('')}</div>`;
  else if(variant==='e')area.innerHTML=`<div class="category-groups">${categories.filter(c=>list.some(t=>t.category===c)).map(c=>`<section class="category-group"><header><span>${icon((categoryStyles[c]||{}).icon||'cube')}<h2>${escape(c)}</h2></span><small>${list.filter(t=>t.category===c).length} ${list.filter(t=>t.category===c).length===1?'tool':'tools'}</small></header>${list.filter(t=>t.category===c).map(groupRow).join('')}</section>`).join('')}</div>`;
  else if(variant==='f'){
    if(!list.some(t=>t.id===state.selected))state.selected=list[0].id;
    const t=list.find(t=>t.id===state.selected);
    area.innerHTML=`<div class="navigator-layout"><section class="tool-index" aria-label="Tool index">${list.map(selectedRow).join('')}</section><section class="tool-detail" aria-label="Selected tool" ${style(t)}><div class="detail-preview">${preview(t)}<span class="detail-label">ENGINEERING TOOL / ${escape(t.category).toUpperCase()}</span></div><div class="detail-content"><div class="detail-top">${symbol(t)}${status(t)}</div><h2>${escape(t.name)}</h2><p class="description">${escape(t.description)}</p>${tags(t)}<div class="detail-actions">${launch(t)}${star(t)}</div><p class="detail-note">Opens the independent application in a new tab.</p></div></section></div>`;
  }else area.innerHTML=`<div class="tool-grid">${list.map((t,i)=>card(t,variant==='d'&&i===0&&t.featured&&!state.query&&!state.category)).join('')}</div>`;
}
function reset(){state.query='';state.category='';state.status='';state.view='all';input.value='';document.querySelector('#status').value='';render();}
input.addEventListener('input',()=>{state.query=input.value;render();});
document.querySelector('#status').addEventListener('change',event=>{state.status=event.target.value;render();});
document.querySelector('#category')?.addEventListener('change',event=>{state.category=event.target.value;render();});
document.addEventListener('click',event=>{
  const target=event.target.closest('button,a');if(!target)return;
  if(target.hasAttribute('data-category')){state.category=target.dataset.category;state.view='all';render();}
  if(target.hasAttribute('data-view')){state.view=target.dataset.view;state.category='';render();}
  if(target.hasAttribute('data-reset'))reset();
  if(target.hasAttribute('data-clear')){state.category='';state.status='';document.querySelector('#status').value='';render();}
  if(target.hasAttribute('data-star')){
    const id=target.dataset.star;favorites.has(id)?favorites.delete(id):favorites.add(id);save(store.favorites,[...favorites]);
    // Preserve keyboard focus when starring re-renders the result list.
    const restore=document.activeElement===target;render();if(restore)(area.querySelector(`[data-star="${CSS.escape(id)}"]`)||area.querySelector('[data-star]')||input).focus();
  }
  if(target.hasAttribute('data-open')){const id=target.dataset.open;recent=[id,...recent.filter(x=>x!==id)].slice(0,12);save(store.recent,recent);}
  if(target.hasAttribute('data-inspect')){state.selected=target.dataset.inspect;render();area.querySelector(`[data-inspect="${CSS.escape(state.selected)}"]`)?.focus();if(matchMedia('(max-width:760px)').matches)area.querySelector('.tool-detail')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
  if(target.hasAttribute('data-menu')){const nav=document.querySelector('.sidebar');const open=nav.classList.toggle('is-open');target.setAttribute('aria-expanded',String(open));}
});
document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();input.focus();input.select();}
  if(event.key==='Escape'&&document.activeElement===input){input.value='';state.query='';render();}
  if(variant==='c'&&['ArrowDown','ArrowUp','Enter'].includes(event.key)){
    const links=[...area.querySelectorAll('[data-open]')];const current=links.indexOf(document.activeElement);
    if(document.activeElement===input&&links.length){event.preventDefault();if(event.key==='Enter')links[0].click();else links[0].focus();}
    else if(current>=0&&event.key!=='Enter'){event.preventDefault();links[(current+(event.key==='ArrowDown'?1:-1)+links.length)%links.length].focus();}
  }
});
try{
  const response=await fetch(new URL('../../data/tools.json',import.meta.url));if(!response.ok)throw new Error('Tool data unavailable');
  tools=await response.json();if(!Array.isArray(tools))throw new Error('Invalid tool data');
  for(const t of tools)if(!categories.includes(t.category))categories.push(t.category);
  const select=document.querySelector('#category');if(select)select.innerHTML='<option value="">All categories</option>'+categories.map(c=>`<option>${escape(c)}</option>`).join('');
  render();
}catch{area.innerHTML='<div class="load-error"><h2>Unable to load the tool catalog</h2><p>Serve the repository over HTTP, then refresh this page.</p></div>';document.querySelector('#count').textContent='Catalog unavailable';}
