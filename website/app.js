import {versions, pcbViews} from './data.js';
import {quantize, SEGMENTS, REFERENCE} from './adc.js';
const $ = id => document.getElementById(id);
const url = path => path.split('/').map(encodeURIComponent).join('/');
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
function link(path, label, className='') {
  const node = el('a', className, label); node.href=url(path); return node;
}
function drawDisplay(node, digit) {
  node.querySelectorAll('.seg').forEach(segment => {
    segment.classList.toggle('on', [...segment.classList].some(c=>c.length===1 && SEGMENTS[digit].includes(c)));
  });
}
const motion = matchMedia('(prefers-reduced-motion: reduce)');
// Bring a strip item into view by scrolling only the strip itself, never the page.
// Element.scrollIntoView() also scrolls every ancestor, which is what used to drag the whole
// page down to the PCB section as soon as it loaded.
function revealInStrip(item, instant = false) {
  const strip = item?.parentElement;
  if (!strip || strip.scrollWidth <= strip.clientWidth + 1) return;
  const s = strip.getBoundingClientRect(), r = item.getBoundingClientRect();
  const left = strip.scrollLeft + (r.left - s.left) - (s.width - r.width) / 2;
  strip.scrollTo({left, behavior: instant || motion.matches ? 'auto' : 'smooth'});
}
let heroPaused = motion.matches, heroDigit = 0;
function setHeroPaused(paused) {
  heroPaused=paused;
  $('hero-animation').setAttribute('aria-pressed', String(paused));
  $('hero-animation').textContent=paused?'Play display animation':'Pause display animation';
}
function renderVoltage() {
  const result=quantize($('voltage').value);
  $('voltage').style.setProperty('--p', (result.voltage / REFERENCE).toFixed(5)); // 0-1 fill ratio, read by the slider track
  $('voltage-readout').textContent=`${result.voltage.toFixed(4)} V`;
  $('voltage').setAttribute('aria-valuetext', `${result.voltage.toFixed(4)} volts, level ${result.level}`);
  document.querySelectorAll('.threshold-row').forEach((row,i)=>{
    row.classList.toggle('crossed', result.crossed[i]);
    row.querySelector('.state').textContent=result.crossed[i]?'ON':'OFF';
    row.setAttribute('aria-label',`Threshold ${i+1}, ${row.dataset.threshold} volts; LED ${result.crossed[i]?'on':'off'}`);
  });
  $('output-live').textContent=`Output level ${result.level}; binary ${result.binary}; ${result.level} threshold${result.level===1?'':'s'} crossed.`;
  [2,1,0].forEach((bit,i)=>{
    const node = $(`bit-${bit}`);
    node.textContent = result.binary[i];
    node.closest('.bit')?.classList.toggle('active', result.binary[i] === '1');
  });
  drawDisplay($('lab-display'), result.level);
  heroDigit=result.level; drawDisplay($('hero-display'), heroDigit);
  document.querySelectorAll('[data-level]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.level)===result.level)));
}
for(let level=0;level<8;level++) {
  const button=el('button','subtle-button',String(level)); button.type='button'; button.dataset.level=level;
  button.setAttribute('aria-label',`Set input to level ${level} lower boundary`);
  button.addEventListener('click',()=>{setHeroPaused(true);$('voltage').value=level*REFERENCE/8;renderVoltage();});
  $('level-presets').append(button);
}
$('voltage').addEventListener('input',()=>{setHeroPaused(true);renderVoltage();});
$('reset-voltage').addEventListener('click',()=>{setHeroPaused(true);$('voltage').value=0;renderVoltage();$('voltage').focus();});
$('hero-animation').addEventListener('click',()=>setHeroPaused(!heroPaused));
motion.addEventListener('change',()=>{if(motion.matches)setHeroPaused(true);});
setHeroPaused(heroPaused); renderVoltage();
setInterval(()=>{if(!heroPaused&&!document.hidden){heroDigit=(heroDigit+1)%8;drawDisplay($('hero-display'),heroDigit);}},1550);

// Native modal dialog supplies focus containment, Escape and background inertness.
let lightboxItems=[], lightboxIndex=0, lightboxTrigger;
function showLightboxItem() {
  const item=lightboxItems[lightboxIndex];
  $('lightbox-image').src=url(item.full||item.path); $('lightbox-image').alt=item.caption;
  $('lightbox-caption').textContent=`${lightboxIndex+1} / ${lightboxItems.length} · ${item.caption}`;
  $('lightbox-original').href=url(item.full||item.path);
  $('lightbox-prev').disabled=$('lightbox-next').disabled=lightboxItems.length<2;
}
function openLightbox(items,index,trigger) {
  lightboxItems=items.filter(item=>item.kind!=='video');
  lightboxIndex=lightboxItems.indexOf(items[index]); lightboxTrigger=trigger;
  showLightboxItem(); $('lightbox').showModal(); document.body.classList.add('modal-open'); $('lightbox-close').focus();
}
function moveLightbox(delta) {lightboxIndex=(lightboxIndex+delta+lightboxItems.length)%lightboxItems.length;showLightboxItem();}
$('lightbox-close').addEventListener('click',()=>$('lightbox').close());
$('lightbox-prev').addEventListener('click',()=>moveLightbox(-1));
$('lightbox-next').addEventListener('click',()=>moveLightbox(1));
$('lightbox').addEventListener('close',()=>{document.body.classList.remove('modal-open');lightboxTrigger?.focus();});
$('lightbox').addEventListener('click',event=>{if(event.target===$('lightbox'))$('lightbox').close();});
$('lightbox').addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();moveLightbox(event.key==='ArrowRight'?1:-1);}});
$('hero-image').addEventListener('click',()=>openLightbox(versions[7].gallery,0,$('hero-image')));

function gallery(host, items, name, viewLabels) {
  host.replaceChildren();
  const stage=el('div','media-stage'), caption=el('p','gallery-caption'), toolbar=el('div','media-toolbar'), thumbs=el('div','thumbs');
  const previous=el('button','','← Previous'), next=el('button','','Next →'), count=el('span');
  previous.type=next.type='button'; previous.setAttribute('aria-label',`Previous ${name} image`);next.setAttribute('aria-label',`Next ${name} image`);
  caption.setAttribute('aria-live','polite'); thumbs.setAttribute('aria-label',`${name} gallery thumbnails`);
  let current=0, shown=false;
  const buttons=items.map((item,i)=>{
    const button=el('button','thumb');button.type='button';button.setAttribute('aria-label',`Show ${item.caption}`);
    const image=el('img');image.src=url(item.poster||item.path);image.alt='';image.loading='lazy';
    button.append(image,el('span','',viewLabels?.[i]||String(i+1).padStart(2,'0')));
    button.addEventListener('click',()=>show(i));thumbs.append(button);return button;
  });
  function show(index) {
    stage.querySelector('video')?.pause(); current=(index+items.length)%items.length;
    const item=items[current];stage.replaceChildren();
    if(item.kind==='video') {
      const video=el('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.poster=url(item.poster);video.src=url(item.path);video.setAttribute('aria-label',item.caption);
      video.append(link(item.path,'Download original recording'));stage.append(video);
    } else {
      const button=el('button','image-button');button.type='button';button.setAttribute('aria-label',`Enlarge ${item.caption}`);
      const image=el('img');image.src=url(item.path);image.alt=item.caption;image.loading='lazy';image.decoding='async';
      button.append(image);button.addEventListener('click',()=>openLightbox(items,current,button));stage.append(button);
    }
    caption.textContent=item.caption;count.textContent=`${current+1} / ${items.length}`;
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));
    revealInStrip(buttons[current], !shown); shown=true;
  }
  previous.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));
  previous.disabled=next.disabled=items.length<2;
  host.tabIndex=0; host.setAttribute('aria-label',`${name} gallery`);
  host.addEventListener('keydown',event=>{
    if(event.target.tagName!=='BUTTON'&&event.target.tagName!=='A'){
      if(event.key==='ArrowLeft'){event.preventDefault();show(current-1);}
      else if(event.key==='ArrowRight'){event.preventDefault();show(current+1);}
    }
  });
  toolbar.append(previous,count,next);host.append(stage,caption,toolbar,thumbs);show(0);
}

const versionButtons=versions.map((version,index)=>{
  const button=el('button','version-button');button.type='button';button.id=`version-tab-${version.id.replace('.','-')}`;
  button.setAttribute('role','tab');button.setAttribute('aria-controls','version-panel');
  button.append(el('span','',`V${version.id}`),el('small','',version.short));
  button.addEventListener('click',()=>selectVersion(index));
  button.addEventListener('keydown',event=>{
    let next=index;
    if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%versions.length;
    else if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index+versions.length-1)%versions.length;
    else if(event.key==='Home')next=0;else if(event.key==='End')next=versions.length-1;else return;
    event.preventDefault();selectVersion(next);versionButtons[next].focus();
  });
  $('version-nav').append(button);return button;
});
let versionsShown=false;
function selectVersion(index) {
  $('version-panel').querySelector('video')?.pause();
  const version=versions[index];const panel=$('version-panel');panel.replaceChildren();panel.dataset.version=version.id;
  panel.setAttribute('aria-labelledby',versionButtons[index].id);
  versionButtons.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
  revealInStrip(versionButtons[index], !versionsShown); versionsShown=true;
  panel.append(el('p','eyebrow',`V${version.id} / ${version.stage}`),el('h3','version-title',version.title));
  const host=el('div','version-gallery');panel.append(host);gallery(host,version.gallery,`V${version.id}`);
  const history=el('dl','history');
  [['Objective','objective'],['Design changes','changes'],['Engineering focus','challenge'],['Outcome','outcome']].forEach(([label,key])=>{
    const group=el('div');group.append(el('dt','',label),el('dd','',version[key]));history.append(group);
  });
  panel.append(history,el('p','notice',version.note));
  const links=el('div','resource-links');
  // Local README links remain usable in a plain HTTP preview and Pages.
  links.append(link('README.md',`Read V${version.id} documentation ↗`));
  const resources=el('a','',`Browse V${version.id} source files ↓`);resources.href='#downloads';
  resources.addEventListener('click',()=>{$('download-version').value=version.id;$('download-type').value='all';$('download-search').value='';renderDownloads();});links.append(resources);panel.append(links);
}
selectVersion(7);

function renderPCB() {
  const id=$('pcb-version').value, version=versions.find(v=>v.id===id), current=id==='2.1';
  $('pcb-specs').replaceChildren();
  for(const [value,label] of (current?[['80 × 41 mm','Board outline'],['2.5 V','Sensor / reference'],['39 + 17','SMT + THT parts'],['Not fabricated','Hardware status']]:[['Through-hole','Construction'],['3.3 V','Sensor / reference'],['41','BOM components'],['Not fabricated','Hardware status']])) {
    const spec=el('div');spec.append(el('strong','',value),el('span','',label));$('pcb-specs').append(spec);
  }
  gallery($('pcb-gallery'),pcbViews[id].map(v=>version.gallery[v.index]),`V${id} PCB`,pcbViews[id].map(v=>v.label));
  $('pcb-note').textContent=version.note;
  $('pcb-links').replaceChildren();
  const base=`Version_${id}/TriBitLux_V${id.replace('.','_')}/TriBitLux_V${id.replace('.','_')}`;
  [['.kicad_pro','KiCad project'],['.kicad_pcb','PCB source'],['.kicad_sch','Schematic source']].forEach(([suffix,label])=>$('pcb-links').append(link(base+suffix,label+' ↗')));
}
$('pcb-version').addEventListener('change',renderPCB);renderPCB();

let inventory=[];
versions.forEach(v=>{const option=el('option','',`V${v.id} · ${v.short}`);option.value=v.id;$('download-version').append(option);});
function size(bytes){return bytes<1024?`${bytes} B`:bytes<1048576?`${(bytes/1024).toFixed(0)} KB`:`${(bytes/1048576).toFixed(1)} MB`;}
function renderDownloads() {
  const version=$('download-version').value,type=$('download-type').value,query=$('download-search').value.toLowerCase().trim();
  const files=inventory.filter(file=>file.deployable&&(version==='all'||file.version===version)&&(type==='all'||file.category===type)&&`${file.path} ${file.category}`.toLowerCase().includes(query));
  $('download-count').textContent=`${files.length} verified file${files.length===1?'':'s'}`;
  $('download-list').replaceChildren();
  if(!files.length){$('download-list').append(el('p','notice','No matching files. Try another version, resource type or search.'));return;}
  [...versions].reverse().forEach(v=>{
    const group=files.filter(f=>f.version===v.id);if(!group.length)return;
    const details=el('details','download-group');details.open=version!=='all'||!!query||type!=='all'||v.id==='2.1';
    const summary=el('summary','',`V${v.id} · ${v.short} `);summary.append(el('span','',`${group.length} files`));details.append(summary);
    const list=el('ul','download-files');
    group.forEach(file=>{
      const item=el('li'),info=el('div','download-info');
      info.append(link(file.path,file.filename),el('small','',`${file.category} · ${file.type.toUpperCase()} · ${size(file.bytes)}`));
      if(file.note)info.append(el('p','file-note',file.note));
      if(file.type==='heic')info.append(el('p','file-note','HEIC original · download for a compatible photo viewer. JPEG preview available in the version gallery.'));
      const download=link(file.path,'↓','download-button');download.download=file.filename;download.setAttribute('aria-label',`Download ${file.filename}`);
      item.append(info,download);list.append(item);
    });details.append(list);$('download-list').append(details);
  });
}
['download-version','download-type'].forEach(id=>$(id).addEventListener('change',renderDownloads));
$('download-search').addEventListener('input',renderDownloads);
fetch(new URL('./inventory.json',import.meta.url)).then(response=>{if(!response.ok)throw Error('Inventory unavailable');return response.json();}).then(data=>{inventory=data;renderDownloads();}).catch(()=>{
  $('download-count').textContent='Resource listing could not load. Reload this page or use the inventory download below.';
});

const menu=$('menu-toggle'),nav=$('site-nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
// The menu button disappears once the links fit inline (decided in CSS); reset its state then.
addEventListener('resize',()=>{if(getComputedStyle(menu).display==='none')closeMenu();});
function setTheme(light) {
  document.body.classList.toggle('light',light);$('theme-toggle').setAttribute('aria-pressed',String(light));$('theme-toggle').setAttribute('aria-label',light?'Switch to dark theme':'Switch to light theme');
  document.querySelector('meta[name="theme-color"]').content=light?'#f1f5f0':'#0b1112';
}
try{setTheme(localStorage.getItem('tribit-theme')==='light');}catch{/* Storage can be unavailable in private previews. */}
$('theme-toggle').addEventListener('click',()=>{const light=!document.body.classList.contains('light');setTheme(light);try{localStorage.setItem('tribit-theme',light?'light':'dark');}catch{}});
const navLinks=[...nav.querySelectorAll('a[href^="#"]')];
let scrollPending=false;
function updateScroll(){
  const available=document.documentElement.scrollHeight-innerHeight;
  $('scroll-progress').style.width=`${available>0?Math.min(100,scrollY/available*100):0}%`;
  document.querySelector('.site-header')?.classList.toggle('scrolled',scrollY>15);
  // A section is "current" once its top passes a line just below the sticky header.
  const line=document.querySelector('.site-header').offsetHeight+Math.min(innerHeight*.1,100);
  let active=0;navLinks.forEach((a,i)=>{if(document.querySelector(a.getAttribute('href')).getBoundingClientRect().top<=line)active=i;});
  navLinks.forEach((a,i)=>{a.classList.toggle('active',i===active);if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});scrollPending=false;
}
addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateScroll);}},{passive:true});addEventListener('resize',updateScroll);updateScroll();
