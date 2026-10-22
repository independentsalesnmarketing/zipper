#!/usr/bin/env node
/**
 * Discover and extract ALL FCC/Esri provider offerings for state-level geographies.
 * Public research dataset, NOT exact-address serviceability or retail price data.
 * Requires Node 22; no dependencies or keys. Writes source schema and exact raw
 * attributes to JSONL, and deduplicated provider-name candidate list to CSV.
 * Does not claim a complete import if a page of source records was skipped.
 */
import { mkdir, writeFile, open } from 'node:fs/promises';
import path from 'node:path';
const ITEM='e1343efcefc344709057260ee57290a0';
const OUT=process.env.BROADBAND_OUT||'data/broadband-research';
const LIMIT=Number(process.env.MAX_PROVIDER_ROWS||'350000');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function get(base,params={}){
 const u=new URL(base);
 for(const [key,val] of Object.entries({...params,f:'json'}))u.searchParams.set(key,String(val));
 let last;
 for(let attempt=0;attempt<5;attempt++){
  try{
   const r=await fetch(u,{signal:AbortSignal.timeout(45000)});
   if(!r.ok)throw Error('HTTP '+r.status+' '+u.pathname);
   const data=await r.json();
   if(data.error)throw Error(JSON.stringify(data.error));
   return data;
  }catch(e){last=e;if(attempt<4)await sleep(1200*2**attempt);}
 }
 throw last;
}
function esc(value){const s=String(value??'');return /[,\r\n"]/.test(s)?'"'+s.replaceAll('"','""')+'"':s}
function fieldMatching(names,preferred){
 for(const pattern of preferred){const f=names.find(n=>pattern.test(n));if(f)return f;}
 return null;
}
function fccFields(fields){
 const names=fields.map(f=>f.name);
 return {
  provider_name:fieldMatching(names,[/^(provider_name|providername|isp_name|ispname|brand_name|brandname)$/i,/provider.*name/i,/brand.*name/i]),
  provider_id:fieldMatching(names,[/^(provider_id|providerid|fcc_provider_id|fccproviderid)$/i,/provider.*id/i]),
  technology:fieldMatching(names,[/^(technology|tech|technology_code|technologycode|technology_type)$/i,/technology/i]),
  locations:fieldMatching(names,[/^(total_bsl|bsls|bsl_count|locations|location_count|total_locations|total_passed)$/i,/bsl.*count/i,/locations.*served/i,/total.*bsl/i])
 };
}
function layerChoice(service){
 const tables=service.tables||[];
 let table=tables.find(t=>/^(bdc records for states|providers.*states|states.*providers|states.*isp|isp.*states)$/i.test((t.name||'').trim()));
 if(!table)table=tables.find(t=>/state/i.test(t.name||'')&&/record|provider|isp|offer/i.test(t.name||''));
 if(!table){
  // Esri's six related provider tables may be named generically.
  const states=(service.layers||[]).find(l=>/^(states?|us states)$/i.test((l.name||'').trim()));
  if(states){const same=tables.find(t=>t.id===(states.id+1));if(same)table=same}
 }
 return table||null;
}
async function main(){
 await mkdir(OUT,{recursive:true});
 const item=await get('https://www.arcgis.com/sharing/rest/content/items/'+ITEM);
 if(!item.url)throw Error('No ArcGIS service URL in official item');
 const serviceUrl=item.url.replace(/\/$/,'');
 const u=new URL(serviceUrl);
 if(u.protocol!=='https:'||!u.hostname.endsWith('.arcgis.com'))throw Error('Unexpected source host: '+u.hostname);
 const svc=await get(serviceUrl);
 const brief={source_item:ITEM,item_title:item.title,source_url:serviceUrl,source_date:item.modified,extracted_at:new Date().toISOString(),layers:svc.layers,tables:svc.tables,complete:false};
 const selected=layerChoice(svc);
 if(!selected){brief.error='No state-level ISP related table could be resolved';await writeFile(path.join(OUT,'import-manifest.json'),JSON.stringify(brief,null,2));throw Error(brief.error);}
 const turl=serviceUrl+'/'+selected.id;
 const md=await get(turl);
 brief.selected_table={id:selected.id,name:selected.name};
 brief.fields=md.fields||[];
 const match=fccFields(md.fields||[]);
 brief.mapped_fields=match;
 await writeFile(path.join(OUT,'schema.json'),JSON.stringify({table:brief.selected_table,fields:brief.fields,matched:match},null,2)+'\n');
 if(!match.provider_name)throw Error('Cannot identify provider name field; schema.json saved for inspection');
 const count=await get(turl+'/query',{where:'1=1',returnCountOnly:true});
 const total=count.count;
 brief.expected_records=total;
 if(!Number.isInteger(total)||total<0)throw Error('Invalid source count');
 if(total>LIMIT)throw Error('Safety limit: '+total+' rows; MAX_PROVIDER_ROWS='+LIMIT+' (raise after reviewing schema)');
 const idField=md.objectIdField||md.fields?.find(f=>f.type==='esriFieldTypeOID')?.name;
 if(!idField)throw Error('No Object ID field in related table');
 const raw=await open(path.join(OUT,'state_provider_offerings.jsonl'),'w');
 const names=new Map();let rows=0;let offset=0;const batch=Math.min(1000,md.maxRecordCount||1000);
 try{
  while(offset<total){
   const p=await get(turl+'/query',{where:'1=1',outFields:'*',returnGeometry:false,orderByFields:idField+' ASC',resultOffset:offset,resultRecordCount:Math.min(batch,total-offset)});
   const a=p.features||[];
   if(!a.length)throw Error('Missing page at offset '+offset+' of '+total);
   for(const f of a){
    const attrs=f.attributes||{};
    await raw.write(JSON.stringify(attrs)+'\n');
    rows++;
    const n=attrs[match.provider_name];
    if(n===null||n===undefined||String(n).trim()==='')continue;
    const name=String(n).trim(),id=match.provider_id?String(attrs[match.provider_id]??''):'';
    names.set(name.toLowerCase()+'|'+id,{provider_name:name,fcc_provider_id:id,source_table:selected.name});
   }
   offset+=a.length;
   if(offset%10000<batch)console.log('Processed '+offset+'/'+total+' provider offerings');
  }
 }finally{await raw.close();}
 if(rows!==total)throw Error('Count mismatch: '+rows+' expected '+total);
 const providers=[...names.values()].sort((a,b)=>a.provider_name.localeCompare(b.provider_name));
 if(!providers.length)throw Error('No provider names found');
 await writeFile(path.join(OUT,'national_provider_inventory.csv'),[
  'provider_name,fcc_provider_id,source_table',
  ...providers.map(p=>[p.provider_name,p.fcc_provider_id,p.source_table].map(esc).join(','))
 ].join('\n')+'\n');
 brief.records=rows;brief.providers=providers.length;brief.complete=true;
 await writeFile(path.join(OUT,'import-manifest.json'),JSON.stringify(brief,null,2)+'\n');
 console.log('FINISHED '+JSON.stringify({rows,providers:providers.length,source:brief.source_url,table:brief.selected_table}));
}
main().catch(async e=>{
 console.error('IMPORT FAILED: '+(e.stack||e));
 process.exitCode=1;
});
