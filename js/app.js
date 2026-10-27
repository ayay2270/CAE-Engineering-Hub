import {icon} from './icons.js';
import {loadTools,renderCard,element} from './tools.js';
import {getCategories,filterTools} from './filters.js';
import {enableSearchShortcut} from './search.js';
import {loadFavorites,toggleFavorite,FAVORITES_KEY} from './favorites.js';
import {loadRecent,recordRecent,RECENT_KEY} from './recent.js';
import {onStorageFailure} from './storage.js';
const $=id=>document.getElementById(id);
let noticeTimer,storageWarningShown=false;
function notify(message){$('notice').textContent=message;$('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').hidden=true,5000);}
onStorageFailure(()=>{if(!storageWarningShown){notify('瀏覽器儲存空間無法使用，收藏與最近使用僅保留於本次工作階段。');storageWarningShown=true;}});
const state={tools:[],view:'home',category:'',status:'',query:'',favorites:loadFavorites(),recent:loadRecent()};
let categories=[];
document.querySelectorAll('[data-icon]').forEach(node=>node.innerHTML=icon(node.dataset.icon));
if(/Mac|iPhone|iPad/.test(navigator.platform))$('search-shortcut').textContent='⌘ K';
enableSearchShortcut($('tool-search'));
function navigationLink(label,glyph,href,count,current){const link=element('a','nav-link');link.href=href;link.innerHTML=icon(glyph);link.append(element('span','',label));if(count!==undefined)link.append(element('span','nav-count',String(count)));if(current)link.setAttribute('aria-current','page');return link;}
function renderNavigation(){
  $('main-navigation').replaceChildren(navigationLink('HOME','home','#home',undefined,state.view==='home'),navigationLink('全部工具','grid','#all-tools',state.tools.length,state.view==='all-tools'));
  $('category-navigation').replaceChildren(...categories.map(category=>navigationLink(category,category==='CAE'?'cube':category==='Utilities'?'link':'calculator',`#category/${encodeURIComponent(category)}`,state.tools.filter(tool=>tool.category===category).length,state.view==='category'&&state.category===category)));
  $('personal-navigation').replaceChildren(navigationLink('我的收藏','star','#favorites',state.tools.filter(tool=>state.favorites.has(tool.id)).length,state.view==='favorites'),navigationLink('最近使用','clock','#recent',state.tools.filter(tool=>state.recent.some(item=>item.id===tool.id)).length,state.view==='recent'));
}
function applyRoute(){
  if(location.hash==='#workspace')return;
  const previousDetails=$('tool-groups').querySelector('details');if(previousDetails)previousDetails.open=false;
  const hash=location.hash.slice(1);state.view=['all-tools','favorites','recent'].includes(hash)?hash:'home';state.category='';
  if(hash.startsWith('category/')){let category='';try{category=decodeURIComponent(hash.slice(9));}catch{}if(categories.includes(category)){state.view='category';state.category=category;}}
  state.status='';state.query='';$('status-filter').value='';$('tool-search').value='';render();
}
const subtitles={'CAE':'分析流程、材料與技術知識','Engineering Tools':'計算、測試標準與工程資料','Utilities':'日常工作的小幫手'};
function group(title,tools,index){const section=element('section','group');const heading=element('div','group-heading');const label=element('div');label.append(element('h2','',title));if(subtitles[title])label.append(element('p','',subtitles[title]));heading.append(element('span','group-index',String(index).padStart(2,'0')),label,element('span','group-total',`${tools.length} 個工具`));const grid=element('div','tool-grid');grid.append(...tools.map(tool=>renderCard(tool,state.favorites.has(tool.id))));section.append(heading,grid);return section;}
function render(){
  const filtered=filterTools(state.tools,state);const activeFilter=Boolean(state.query.trim()||state.category||state.status);
  const titles={home:'Engineering Tools','all-tools':'全部工具',favorites:'我的收藏',recent:'最近使用',category:state.category};
  const descriptions={home:'從材料與分析，到工程計算。找到工具，開始工作。','all-tools':'所有工具與版本，集中查看。',favorites:'將常用工具收藏在這裡，隨時快速開啟。',recent:'依開啟時間排序，接續最近的工作。',category:subtitles[state.category]};
  $('page-title').textContent=titles[state.view];$('page-description').textContent=descriptions[state.view];$('breadcrumb-current').textContent=state.view==='home'?'HOME':titles[state.view];
  document.querySelector('.directory-stat>strong').textContent=state.tools.length;
  document.querySelector('.directory-stat small').textContent=`${state.tools.filter(t=>t.url).length} 個線上 · ${state.tools.filter(t=>!t.url).length} 個本機`;
  $('tool-count').textContent=`顯示 ${filtered.length} / ${state.tools.length} 個工具${state.view==='home'&&!activeFilter?`（含 ${state.tools.filter(tool=>tool.variant).length} 個舊版與預覽）`:''}`;
  const container=$('tool-groups');const oldDetails=container.querySelector('details');const detailsOpen=oldDetails?.open;container.replaceChildren();
  if(state.view==='recent'){if(filtered.length)container.append(group('最近開啟',filtered,1));}
  else {
    const primary=filtered.filter(tool=>!tool.variant);let index=0;
    categories.forEach(category=>{const items=primary.filter(tool=>tool.category===category);if(items.length)container.append(group(category,items,++index));});
    const variants=filtered.filter(tool=>tool.variant);
    if(variants.length){const details=element('details','variants');details.open=Boolean(detailsOpen||activeFilter||state.view!=='home');const summary=element('summary','',`舊版與預覽 · ${variants.length}`);summary.append(element('span','','保留原版操作與獨立預覽入口'));const grid=element('div','tool-grid');grid.append(...variants.map(tool=>renderCard(tool,state.favorites.has(tool.id))));details.append(summary,grid);container.append(details);}
  }
  container.setAttribute('aria-busy','false');$('empty-state').hidden=filtered.length!==0;$('empty-reset').hidden=!activeFilter;
  if(!filtered.length){let title='找不到符合的工具';let description='試試其他關鍵字，或清除使用方式篩選。';if(!activeFilter&&state.view==='favorites'){title='收藏你的常用工具';description='點選工具卡片上的星號，收藏就會出現在這裡。';}else if(!activeFilter&&state.view==='recent'){title='從開啟一個工具開始';description='最近開啟的 12 個線上工具會記錄在這裡，僅保存在此瀏覽器。';}$('empty-title').textContent=title;$('empty-description').textContent=description;}
  renderNavigation();document.title=`${state.view==='home'?'HOME':titles[state.view]} · CAE Engineering Hub`;
}
function resetFilters(){state.query='';state.status='';$('tool-search').value='';$('status-filter').value='';render();}
$('tool-search').addEventListener('input',()=>{state.query=$('tool-search').value;render();});
$('status-filter').addEventListener('change',()=>{state.status=$('status-filter').value;render();});
$('clear-filters').addEventListener('click',resetFilters);$('empty-reset').addEventListener('click',resetFilters);
$('tool-groups').addEventListener('click',event=>{
  const favorite=event.target.closest('button[data-favorite]');
  if(favorite){const id=favorite.dataset.favorite;toggleFavorite(state.favorites,id);const added=state.favorites.has(id);if(state.view==='favorites'){render();$('personal-navigation').querySelector('[aria-current]')?.focus();}else{favorite.setAttribute('aria-pressed',String(added));favorite.setAttribute('aria-label',`${added?'取消收藏':'收藏'} ${state.tools.find(tool=>tool.id===id).name}`);renderNavigation();}if(!storageWarningShown)notify(added?'已加入收藏':'已取消收藏');return;}
  recordLaunch(event);
});
function recordLaunch(event){const link=event.target.closest('a[data-open-tool]');if(link){state.recent=recordRecent(state.recent,link.dataset.openTool);renderNavigation();}}
$('tool-groups').addEventListener('auxclick',event=>{if(event.button===1)recordLaunch(event);});
window.addEventListener('hashchange',applyRoute);
window.addEventListener('storage',event=>{if([FAVORITES_KEY,RECENT_KEY,null].includes(event.key)){state.favorites=loadFavorites();state.recent=loadRecent();render();}});
try{state.tools=await loadTools();categories=getCategories(state.tools);applyRoute();}
catch(error){$('tool-groups').setAttribute('aria-busy','false');$('tool-count').textContent='工具目錄無法載入';$('empty-state').hidden=false;$('empty-title').textContent='暫時無法載入工具';$('empty-description').textContent=`${error.message} 請重新整理，或確認網站伺服器與 data/tools.json。`;$('empty-reset').hidden=true;renderNavigation();}
