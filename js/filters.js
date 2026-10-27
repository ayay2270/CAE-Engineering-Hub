import {matchesSearch} from './search.js';
export const baseCategories=['Knowledge','Materials','Calculators','Workflow','Standards','Project Data'];
export function getCategories(tools){return [...new Set([...baseCategories,...tools.map(tool=>tool.category)])];}
export function filterTools(tools,state){
  let result=tools.filter(tool=>(!state.category||tool.category===state.category)&&(!state.status||tool.status===state.status)&&matchesSearch(tool,state.query));
  if(state.view==='favorites')result=result.filter(tool=>state.favorites.has(tool.id));
  if(state.view==='recent'){const order=new Map(state.recent.map((item,index)=>[item.id,index]));result=result.filter(tool=>order.has(tool.id)).sort((a,b)=>order.get(a.id)-order.get(b.id));}
  return result;
}
