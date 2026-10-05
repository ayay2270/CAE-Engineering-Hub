import {readLocal,writeLocal} from './storage.js';
export const FAVORITES_KEY = 'cae-engineering-hub:favorites:v1';
export function loadFavorites(){const saved=readLocal(FAVORITES_KEY,[]);return new Set(Array.isArray(saved)?saved.filter(id=>typeof id==='string'):[]);}
export function toggleFavorite(favorites,id){if(favorites.has(id))favorites.delete(id);else favorites.add(id);writeLocal(FAVORITES_KEY,[...favorites]);}
