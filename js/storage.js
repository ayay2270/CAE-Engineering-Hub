let failureHandler = () => {};
export function onStorageFailure(handler){failureHandler = handler;}
export function readLocal(key, fallback){
  try{const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value);}
  catch{failureHandler(); return fallback;}
}
export function writeLocal(key,value){
  try{localStorage.setItem(key,JSON.stringify(value));}
  catch{failureHandler();}
}
