import {icon,categoryStyles} from './icons.js';
import {loadTools,renderCard} from './tools.js';
import {getCategories,filterTools} from './filters.js';
import {enableSearchShortcut} from './search.js';
import {loadFavorites,toggleFavorite,FAVORITES_KEY} from './favorites.js';
import {loadRecent,recordRecent,RECENT_KEY} from './recent.js';
import {onStorageFailure} from './storage.js';
const $=id=>document.getElementById(id);
let noticeTimer;let storageWarningShown=false;
function notify(message){$('notice').textContent=message;$('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').hidden=true,4500);}
onStorageFailure(()=>{if(!storageWarningShown){notify('Browser storage is unavailable. Favorites and recent tools will last only for this session.');storageWarningShown=true;}});
const state={tools:[],view:'home',category:'',status:'',query:'',favorites:loadFavorites(),recent:loadRecent()};
let categories=[];
$('search-icon').innerHTML=icon('search');$('menu-button').innerHTML=icon('menu');$('hero-cube').innerHTML=icon('cube');$('empty-icon').innerHTML=icon('search');
if(/Mac|iPhone|iPad/.test(navigator.platform))$('search-shortcut').textContent='⌘ K';
enableSearchShortcut($('tool-search'));
function navigationLink(label,glyph,href,count){const link=document.createElement('a');link.href=href;link.className='nav-link';link.innerHTML=icon(glyph);const text=document.createElement('span');text.textContent=label;link.append(text);if(count!==undefined){const badge=document.createElement('span');badge.className='nav-count';badge.textContent=count;link.append(badge);}if(location.hash===href||(!location.hash&&href==='#home'))link.setAttribute('aria-current','page');return link;}
function renderNavigation(){
  $('main-navigation').replaceChildren(navigationLink('Home','home','#home'),navigationLink('All Tools','grid','#all-tools',state.tools.length));
  $('category-navigation').replaceChildren(...categories.map(category=>navigationLink(category,categoryStyles[category]?.icon||'cube',`#category/${encodeURIComponent(category)}`,state.tools.filter(tool=>tool.category===category).length)));
  $('personal-navigation').replaceChildren(navigationLink('Favorites','star','#favorites',state.tools.filter(tool=>state.favorites.has(tool.id)).length),navigationLink('Recently Used','clock','#recent',state.tools.filter(tool=>state.recent.some(item=>item.id===tool.id)).length));
}
function closeNavigation(restoreFocus=false){document.body.classList.remove('nav-open');$('sidebar').inert=window.matchMedia('(max-width:760px)').matches;$('nav-scrim').hidden=true;$('menu-button').setAttribute('aria-expanded','false');$('menu-button').setAttribute('aria-label','Open navigation');$('menu-button').innerHTML=icon('menu');if(restoreFocus)$('menu-button').focus();}
function applyRoute(){
  const hash=location.hash.slice(1);state.view=['all-tools','favorites','recent'].includes(hash)?hash:'home';state.category='';
  if(hash.startsWith('category/')){let category='';try{category=decodeURIComponent(hash.slice(9));}catch{}if(categories.includes(category)){state.view='category';state.category=category;}}
  state.status='';state.query='';$('status-filter').value='';$('category-filter').value=state.category;$('tool-search').value='';const wasOpen=document.body.classList.contains('nav-open');closeNavigation();render();if(wasOpen)$('workspace').focus({preventScroll:true});
}
function render(){
  const filtered=filterTools(state.tools,state);const activeFilter=Boolean(state.query.trim()||state.category||state.status);
  $('hero').hidden=state.view!=='home';
  const titles={home:'Your engineering tools','all-tools':'All Tools',favorites:'Favorites',recent:'Recently Used',category:state.category};
  const eyebrows={home:'THE TOOL COLLECTION','all-tools':'THE TOOL COLLECTION',favorites:'YOUR SAVED TOOLS',recent:'LAST OPENED, FIRST',category:'BROWSE BY CATEGORY'};
  $('view-title').textContent=titles[state.view];$('view-title').setAttribute('aria-level',state.view==='home'?'2':'1');$('view-eyebrow').textContent=eyebrows[state.view];
  $('tool-count').textContent=`${filtered.length} ${filtered.length===1?'tool':'tools'}${activeFilter?` of ${state.tools.length}`:''}`;
  $('tool-grid').replaceChildren(...filtered.map(tool=>renderCard(tool,state.favorites.has(tool.id))));$('tool-grid').setAttribute('aria-busy','false');
  $('empty-state').hidden=filtered.length!==0;$('empty-reset').hidden=!activeFilter;
  if(filtered.length===0){let title='No matching tools';let description='Try another search, or reset the category and status filters.';
    if(!activeFilter&&state.view==='favorites'){title='Keep your go-to tools close';description='Select the star on any tool to save it here. Favorites are stored in this browser.';}
    else if(!activeFilter&&state.view==='recent'){title='Your recently opened tools appear here';description='Open a tool to start your recent history. The last 12 tools are stored in this browser.';}
    else if(!activeFilter){title='No tools yet';description='Add a tool to data/tools.json to make it available here.';}
    $('empty-title').textContent=title;$('empty-description').textContent=description;
  }
  renderNavigation();document.title=`${state.view==='home'?'Home':titles[state.view]} · CAE Engineering Hub`;
}
function resetFilters(){state.query='';state.category='';state.status='';$('tool-search').value='';$('category-filter').value='';$('status-filter').value='';if(state.view==='category'){location.hash='all-tools';}else render();}
$('tool-search').addEventListener('input',()=>{state.query=$('tool-search').value;render();});
$('category-filter').addEventListener('change',()=>{state.category=$('category-filter').value;render();});
$('status-filter').addEventListener('change',()=>{state.status=$('status-filter').value;render();});
$('clear-filters').addEventListener('click',resetFilters);$('empty-reset').addEventListener('click',resetFilters);
$('tool-grid').addEventListener('click',event=>{
  const favorite=event.target.closest('button[data-favorite]');
  if(favorite){const id=favorite.dataset.favorite;toggleFavorite(state.favorites,id);const added=state.favorites.has(id);const focusedInFavorites=state.view==='favorites';if(focusedInFavorites)render();else{favorite.setAttribute('aria-pressed',String(added));const tool=state.tools.find(tool=>tool.id===id);favorite.setAttribute('aria-label',`${added?'Remove':'Add'} ${tool.name} ${added?'from':'to'} favorites`);favorite.title=added?'Remove from favorites':'Add to favorites';renderNavigation();}if(!storageWarningShown)notify(added?'Added to favorites':'Removed from favorites');return;}
  const link=event.target.closest('a[data-open-tool]');if(link){state.recent=recordRecent(state.recent,link.dataset.openTool);renderNavigation();}
});
$('tool-grid').addEventListener('auxclick',event=>{if(event.button===1){const link=event.target.closest('a[data-open-tool]');if(link){state.recent=recordRecent(state.recent,link.dataset.openTool);renderNavigation();}}});
$('menu-button').addEventListener('click',()=>{const open=!document.body.classList.contains('nav-open');if(!open){closeNavigation();return;}document.body.classList.add('nav-open');$('sidebar').inert=false;$('nav-scrim').hidden=false;$('menu-button').setAttribute('aria-expanded','true');$('menu-button').setAttribute('aria-label','Close navigation');$('menu-button').innerHTML=icon('close');});
$('nav-scrim').addEventListener('click',()=>closeNavigation(true));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('nav-open'))closeNavigation(true);});
document.addEventListener('focusin',event=>{if(document.body.classList.contains('nav-open')&&(!$('sidebar').contains(event.target)&&event.target!==$('menu-button')))closeNavigation();});
window.addEventListener('hashchange',applyRoute);
window.addEventListener('storage',event=>{if([FAVORITES_KEY,RECENT_KEY,null].includes(event.key)){state.favorites=loadFavorites();state.recent=loadRecent();render();}});
window.matchMedia('(max-width:760px)').addEventListener('change',()=>closeNavigation());
try{
  state.tools=await loadTools();categories=getCategories(state.tools);
  for(const category of categories){const option=document.createElement('option');option.value=category;option.textContent=category;$('category-filter').append(option);}
  applyRoute();
}catch(error){$('tool-grid').setAttribute('aria-busy','false');$('tool-count').textContent='Tools unavailable';$('empty-state').hidden=false;$('empty-title').textContent='The tool collection could not be loaded';$('empty-description').textContent=`${error.message} Serve this folder over local HTTP and check the JSON format.`;renderNavigation();}
