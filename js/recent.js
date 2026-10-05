import {readLocal,writeLocal} from './storage.js';
export const RECENT_KEY = 'cae-engineering-hub:recent:v1';
export const RECENT_LIMIT = 12;
export function loadRecent(){const saved=readLocal(RECENT_KEY,[]);return Array.isArray(saved)?saved.filter(item=>item&&typeof item.id==='string'&&Number.isFinite(item.openedAt)).slice(0,RECENT_LIMIT):[];}
export function recordRecent(recent,id){const next=[{id,openedAt:Date.now()},...recent.filter(item=>item.id!==id)].slice(0,RECENT_LIMIT);writeLocal(RECENT_KEY,next);return next;}
