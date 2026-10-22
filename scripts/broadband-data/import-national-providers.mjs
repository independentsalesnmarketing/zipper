#!/usr/bin/env node
/**
 * National FCC/Esri provider offerings importer.
 * For all reported fixed providers, download STATE or COUNTY geographic
 * offerings. Network access required for the live import. No paid API.
 * Output: exact source JSONL, provider registry CSV, geographic offerings CSV,
 * source manifest with row-count checks. NOT street address eligibility.
 *
 * Usage:
 *   node scripts/broadband-data/import-national-providers.mjs --level states
 *   node scripts/broadband-data/import-national-providers.mjs --level counties
 *   node scripts/broadband-data/import-national-providers.mjs --fixture tests/fixtures/bdc-state.json
 */
import {mkdir,writeFile,readFile,open} from 'node:fs/promises';
import path from 'node:path';

const ITEM='e1343efcefc344709057260ee57290a0';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function arg(name,fallback){const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1];}
const level=arg('level','states');
const fixture=arg('fixture',null);
const output=arg('out', 'data/broadband-research/'+level);
const maxRows=Number(arg('max-rows','2000000'));
if(!['states','counties'].includes(level))throw Error('--level must be states or counties');
if(!Number.isInteger(maxRows)||maxRows<1)throw Error('--max-rows must be a positive integer');
function csv(x){const s=String(x??'');return /[\r\n,"]/.test(s)?'"'+s.replaceAll('"','""')+'"':s}
function urlOk(raw){try{const u=new URL(raw);return u.protocol==='https:'&&/\.arcgis\.com$/i.test(u.hostname)}catch{return false}}
async function json(url,params={}){
 if(!urlOk(url))throw Error('Untrusted source URL: '+url);
 const u=new URL(url);for(const [key,value] of Object.entries({...params,f:'json'}))u.searchParams.set(key,String(value));
 let err;for(let t=0;t<5;t++){
  try{
   const r=await fetch(u,{headers:{accept:'application/json','user-agent':'internet4all-fcc-research/1.0'},signal:AbortSignal.timeout(60000)});
   if(!r.ok)throw Error('HTTP '+r.status+' '+u.pathname);
   const data=await r.json();if(data.error)throw Error('ArcGIS: '+JSON.stringify(data.error));
   return data;
  }catch(e){err=e;if(t<4)await pause(1200*(t+1));}
 }
 throw err;
}
function getField(fields,possibles,required=true){
 const v=fields.find(f=>possibles.some(p=>p.toLowerCase()===f.name.toLowerCase()));
 if(required&&!v)throw Error('Missing required field among '+possibles.join(', '));
 return v?.name;
}
function schema(md){
 const fs=md.fields||[];
 return {
  objectid:getField(fs,['OBJECTID','ObjectId','FID']),
  geoid:getField(fs,['GEOID','geoid']),
  name:getField(fs,['ProviderName','Provider_Name','ISPName']),
  frn:getField(fs,['FRN','FCCRegistrationNumber'],false),
  tech:getField(fs,['Technology','Tech']),
  total:getField(fs,['TotalBSLs','TotalBSL','BSL_Count']),
  served:getField(fs,['ServedBSLs'],false),
  underserved:getField(fs,['UnderservedBSLs'],false),
  unserved:getField(fs,['UnservedBSLs'],false)
 };
}
function normalize(f,m){
 const a=f.attributes||f;
 const str=k=>String(a[m[k]]??'').trim();
 const integer=k=>{const val=a[m[k]];return val==null?'':Number(val)};
 const row={geoid:str('geoid'),provider_name:str('name'),frn:m.frn?str('frn'):'',technology_code:str('tech'),
  total_bsls:integer('total'),served_bsls:m.served?integer('served'):'',underserved_bsls:m.underserved?integer('underserved'):'',unserved_bsls:m.unserved?integer('unserved'):''};
 if(!/^\d{2}$/.test(row.geoid)&&!/^\d{5}$/.test(row.geoid))throw Error('Invalid geographic GEOID '+row.geoid);
 if(!row.provider_name)throw Error('Missing provider name in source row');
 if(!Number.isInteger(row.total_bsls)||row.total_bsls<0)throw Error('Invalid location count: '+row.total_bsls);
 for(const key of ['served_bsls','underserved_bsls','unserved_bsls'])if(row[key]!==''&&(!Number.isInteger(row[key])||row[key]<0||row[key]>row.total_bsls))throw Error('Invalid '+key);
 return row;
}
const cols=['geoid','provider_name','frn','technology_code','total_bsls','served_bsls','underserved_bsls','unserved_bsls'];
async function main(){
 await mkdir(output,{recursive:true});
 let source,meta,md,features,total;const now=new Date().toISOString();
 if(fixture){
  const v=JSON.parse(await readFile(fixture,'utf8'));
  source={title:'OFFLINE FIXTURE (not national FCC data)',url:'fixture:'+fixture,modified:null};
  meta=v.meta;md=v.table;features=v.features;total=features.length;
 }else{
  const item=await json('https://www.arcgis.com/sharing/rest/content/items/'+ITEM);
  if(!urlOk(item.url))throw Error('Official item missing supported service URL');
  const base=item.url.replace(/\/$/,'');
  const service=await json(base);
  const wanted=level==='states'?'BDC Records for States':'BDC Records for Counties';
  const table=(service.tables||[]).find(x=>x.name?.trim().toLowerCase()===wanted.toLowerCase());
  if(!table)throw Error('Missing table '+wanted+'; discovered '+JSON.stringify(service.tables));
  const url=base+'/'+table.id;
  md=await json(url);
  source={title:item.title,url:base,modified:item.modified,table_name:table.name,table_id:table.id};
  const count=await json(url+'/query',{where:'1=1',returnCountOnly:'true'});
  total=count.count;
  if(!Number.isInteger(total)||total<0||total>maxRows)throw Error('Count '+total+' outside expected range 0..'+maxRows);
  meta={service_url:base,table:table.name};
  features=null;
 }
 const m=schema(md);if(!features&&total===0)features=[];
 const manifest={imported_at:now,item_id:ITEM,reported_vintage:source.title,source_url:source.url,source_modified:source.modified,level,table_name:source.table_name||meta.table||'fixture',fields:m,expected_rows:total,complete:false};
 await writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 const fp=await open(path.join(output,'source_rows.jsonl'),'w');
 const cp=await open(path.join(output,'provider_offerings.csv'),'w');
 const providers=new Map(),seenIds=new Set();
 let got=0;
 try{
  await cp.write(cols.join(',')+'\n');
  const writeRows=async data=>{
   for(const f of data){
    const row=normalize(f,m),a=f.attributes||f;
    const id=a[m.objectid];
    if(id!=null){if(seenIds.has(String(id)))throw Error('Duplicate source object ID '+id);seenIds.add(String(id))}
    await fp.write(JSON.stringify(a)+'\n');
    await cp.write(cols.map(k=>csv(row[k])).join(',')+'\n');
    const k=(row.frn||'unknown')+'|'+row.provider_name.toLowerCase();
    providers.set(k,{provider_name:row.provider_name,frn:row.frn});
    got++;
   }
  };
  if(features)await writeRows(features);
  else{
   const base=source.url+'/'+source.table_id;
   const batch=Math.min(1000,Math.max(10,md.maxRecordCount||1000));
   for(let offset=0;offset<total;){
    const q=await json(base+'/query',{where:'1=1',outFields:'*',returnGeometry:'false',orderByFields:m.objectid+' ASC',resultOffset:offset,resultRecordCount:Math.min(batch,total-offset)});
    if(!q.features?.length)throw Error('Incomplete page at offset '+offset);
    await writeRows(q.features);
    offset+=q.features.length;
    if(offset%10000<batch)console.log(level+' '+offset+'/'+total);
   }
  }
 }finally{await fp.close();await cp.close();}
 if(got!==total)throw Error('Incomplete import '+got+'/'+total);
 const entities=[...providers.values()].sort((a,b)=>a.provider_name.localeCompare(b.provider_name)||a.frn.localeCompare(b.frn));
 await writeFile(path.join(output,'provider_registry.csv'),'provider_name,frn\n'+entities.map(x=>[csv(x.provider_name),csv(x.frn)].join(',')).join('\n')+'\n');
 manifest.complete=true;manifest.rows=got;manifest.unique_name_frn_pairs=entities.length;
 await writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log('DONE '+JSON.stringify({level,rows:got,providers:entities.length,output}));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
