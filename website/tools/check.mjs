import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {versions,pcbViews} from '../data.js';
import {quantize,THRESHOLDS,SEGMENTS} from '../adc.js';
const root=fileURLToPath(new URL('../../',import.meta.url));
let checks=0;
const check=(condition,message)=>{assert.ok(condition,message);checks++;};
const digits=['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc'];
THRESHOLDS.forEach((threshold,i)=>{
  check(quantize(threshold-0.0001).level===i,`Below T${i+1}`);
  check(quantize(threshold).level===i+1,`At T${i+1}`);
  check(quantize(threshold+0.0001).level===i+1,`Above T${i+1}`);
});
for(let n=0;n<=25000;n++) {
 const voltage=n/10000, result=quantize(voltage), expected=Math.min(7,Math.floor(voltage/0.3125));
 check(result.level===expected,`Wrong code at ${voltage}`);
 check(result.crossed.filter(Boolean).length===expected,`Wrong LED count at ${voltage}`);
 check(result.binary===expected.toString(2).padStart(3,'0'),`Wrong bits at ${voltage}`);
 check(result.segments===digits[expected],`Wrong digit at ${voltage}`);
}
check(quantize(-1).level===0&&quantize(9).level===7,'Saturation');
check(SEGMENTS.length===8,'Eight display states');
const inventory=JSON.parse(fs.readFileSync(path.join(root,'website/inventory.json'),'utf8'));
const tracked=new Set(execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).trim().split('\n'));
const paths=new Set(['index.html','website/styles.css','website/app.js','website/data.js','website/adc.js','website/favicon.svg','website/inventory.json','website/inventory.csv']);
for(const file of inventory){check(fs.statSync(path.join(root,file.path)).size===file.bytes,`Inventory size: ${file.path}`);if(file.deployable){check(tracked.has(file.path),`Not tracked: ${file.path}`);paths.add(file.path);}}
for(const version of versions){check(version.gallery.length>0,`Missing V${version.id} gallery`);for(const item of version.gallery){for(const key of ['path','full','poster'])if(item[key])paths.add(item[key]);}}
for(const id of Object.keys(pcbViews)){const version=versions.find(v=>v.id===id);for(const view of pcbViews[id])check(!!version.gallery[view.index],`Missing ${id} view`);}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);check(new Set(ids).size===ids.length,'Duplicate IDs');
for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
 const value=match[1];if(value.startsWith('#'))check(ids.includes(value.slice(1)),`Broken anchor ${value}`);
 else if(!value.startsWith('http'))paths.add(decodeURIComponent(value.split('#')[0]));
}
for(const file of paths){
 check(fs.existsSync(path.join(root,file)),`Missing ${file}`);
 check(tracked.has(file)||file==='index.html'||file.startsWith('website/'),`Would not deploy: ${file}`);
 // Enforce exact filename case even when the host filesystem is case-insensitive.
 let parent=root;for(const component of file.split('/')){check(fs.readdirSync(parent).includes(component),`Case mismatch: ${file}`);parent=path.join(parent,component);}
}
check(!/canva|_sdk|tailwind|lucide|api.github|raw.githubusercontent/.test(html+fs.readFileSync(path.join(root,'website/app.js'),'utf8')),'Unwanted external dependency');
const base=process.argv[2];
if(base){
 const results=[];
 const pending=[...paths];
 for(let offset=0;offset<pending.length;offset+=4)results.push(...await Promise.all(pending.slice(offset,offset+4).map(async file=>{
  const response=await fetch(new URL(file.split('/').map(encodeURIComponent).join('/'),base),{method:'HEAD'});
  check(response.ok,`HTTP ${response.status}: ${file}`);return file;
 })));
 console.log(`${results.length} local site/media/document URLs resolved under ${base}`);
}
console.log(`${checks} assertions passed: ADC boundaries, every slider value, 8 galleries, inventory, exact filename case, and page links.`);
