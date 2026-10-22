#!/usr/bin/env node
// Internet 4 ALL: Esri Living Atlas FCC provider inventory research.
// Creates a manifest first. Does not silently guess provider IDs.
import {mkdir,writeFile} from 'node:fs/promises';
const itemId='e1343efcefc344709057260ee57290a0';
const base='https://www.arcgis.com/sharing/rest/content/items/'+itemId;
const out='data/broadband-research';
async function read(url,params={}) {
 const u=new URL(url);for(const [k,v] of Object.entries({...params,f:'json'}))u.searchParams.set(k,v);
 let error;
 for(let i=0;i<4;i++){try{const r=await fetch(u,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('HTTP '+r.status);const j=await r.json();if(j.error)throw Error(JSON.stringify(j.error));return j}catch(e){error=e;await new Promise(res=>setTimeout(res,1000*(i+1)))}}
 throw error;
}
async function main(){
 await mkdir(out,{recursive:true});
 const item=await read(base);if(!item.url)throw Error('ArcGIS item has no service URL');
 const u=new URL(item.url);if(!u.hostname.endsWith('.arcgis.com'))throw Error('Unexpected source host '+u.hostname);
 const service=await read(item.url);
 const manifest={itemId,itemTitle:item.title,service:item.url,readAt:new Date().toISOString(),layers:service.layers||[],tables:service.tables||[],note:'Discovery only; source is FCC/Esri-based, not verified retail plan availability. Provider IDs require validation.'};
 await writeFile(out+'/source-manifest.json',JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify(manifest,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
