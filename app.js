'use strict';
const DATA = window.PORTFOLIO;
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (n,min,max)=>Math.min(max,Math.max(min,n));
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isLocalLink = s=> typeof s==='string' && (s.startsWith('#') || s.startsWith('./') || s.startsWith('assets/'));
const usableLink = s => typeof s==='string' && (/^https?:\/\//.test(s)||isLocalLink(s));

// --- Personalization (all editable content lives in data.js) ---
document.title = `${DATA.name} — Portfolio`;
$('#nav-name').textContent = DATA.name;
$('#footer-name').textContent = DATA.name;
$('#loader-name').textContent = DATA.name;
$('#year').textContent = new Date().getFullYear();
$('#profile-image').src = DATA.profilePhoto;
$('#profile-record').innerHTML = DATA.details.map(([label,value]) => `<div class="record-row"><span class="record-key">${escapeHTML(label)}</span><span class="record-sep">:</span><span class="record-value">${escapeHTML(value)}</span></div>`).join('');
$('#about-summary').textContent = DATA.about;
$('#email-link').href = `mailto:${DATA.email}`;
$('#github-link').href = DATA.github;
if(DATA.linkedin && /^https:\/\//.test(DATA.linkedin)) $('#linkedin-link').href = DATA.linkedin;
else $('#linkedin-link').remove();
const heroTagline = $('#hero-tagline');
if(heroTagline) heroTagline.textContent = DATA.professionalTitle || '';

// Animated per-character serif introduction.
const nameText = DATA.name.trim() || 'Your Name';
$('#hero-name').setAttribute('aria-label',nameText);
$('#hero-name').innerHTML = [...nameText].map((ch,i) => ch===' ' ? '<span class="glyph space" aria-hidden="true">&nbsp;</span>' : `<span class="glyph" style="--delay:${0.2+i*0.065}s" aria-hidden="true">${escapeHTML(ch)}</span>`).join('');

// Entry preloader, deliberately short so content remains accessible.
const loader = $('#loader');
const fill = $('#loader-fill');
const pct = $('#loader-pct');
const status = $('#loader-status');
if(reduceMotion){ loader.classList.add('done'); }
else {
  let started=performance.now();
  function animateLoading(now){
    const v=clamp((now-started)/1120,0,1);
    const eased=1-Math.pow(1-v,1.6);
    fill.style.width=`${Math.round(eased*100)}%`;
    pct.textContent=String(Math.round(eased*100)).padStart(2,'0');
    status.textContent=v>.8?'READY FOR ORBIT':v>.43?'LOADING SYSTEMS':'SYSTEMS CHECK';
    if(v<1) requestAnimationFrame(animateLoading);
    else {setTimeout(()=>{loader.classList.add('done');setTimeout(()=>loader.remove(),900)},250);}
  }
  requestAnimationFrame(animateLoading);
}

// Responsive menu.
const mobileMenu=$('#nav-links');
$('#menu-toggle').addEventListener('click',()=>{
  const open=mobileMenu.classList.toggle('open');
  $('#menu-toggle').setAttribute('aria-expanded',open);
  $('#menu-toggle').setAttribute('aria-label',open?'Close navigation':'Open navigation');
  $('#menu-toggle').textContent=open?'✕':'☰';
});
$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{
  mobileMenu.classList.remove('open');
  $('#menu-toggle').textContent='☰';
  $('#menu-toggle').setAttribute('aria-expanded','false');
}));

// Cursor target reticle.
if(matchMedia('(hover:hover) and (pointer:fine)').matches && !reduceMotion){
  document.body.classList.add('pointer-on');
  const dot=$('#cursor-dot'), reticle=$('#reticle');
  let x=-60,y=-60,rx=-60,ry=-60;
  window.addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;},{passive:true});
  document.addEventListener('pointerover',e=>{reticle.classList.toggle('hover',!!e.target.closest('a,button,.planet-card'));});
  function tickCursor(){rx+=(x-rx)*.18;ry+=(y-ry)*.18;dot.style.left=`${x}px`;dot.style.top=`${y}px`;reticle.style.left=`${rx}px`;reticle.style.top=`${ry}px`;requestAnimationFrame(tickCursor);}
  tickCursor();
}

// Scroll progress and sticky hero transformation.
let scrollProgress=0;
function onScroll(){
 const max=document.documentElement.scrollHeight-window.innerHeight;
 scrollProgress=max>0?window.scrollY/max:0;
 $('#scroll-fill').style.width=`${Math.round(scrollProgress*10000)/100}%`;
 const budget=Math.max(1,$('#home').offsetHeight-window.innerHeight);
 const progress=clamp(window.scrollY/budget,0,1);
 $('#hero-inner').style.setProperty('--hero-progress', reduceMotion?0:progress);
}
window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('resize',onScroll,{passive:true});
onScroll();

// Scroll reveal, with no hidden content when IntersectionObserver is unavailable.
if('IntersectionObserver' in window && !reduceMotion){
 const obs = new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');obs.unobserve(e.target)}}),{threshold:.09,rootMargin:'0px 0px -24px 0px'});
 $$('.reveal').forEach(el=>obs.observe(el));
}else $$('.reveal').forEach(el=>el.classList.add('show'));

// Canvas starfield — custom, original, no WebGL dependencies. Stars slowly drift as camera scrolls.
const sky=$('#sky');
const ctx=sky.getContext('2d');
let skyW=0,skyH=0,stars=[],pointerX=0,pointerY=0;
function seedStars(){
  const dpr=Math.min(devicePixelRatio||1,2);
  skyW=window.innerWidth;skyH=window.innerHeight;
  sky.width=Math.round(skyW*dpr);sky.height=Math.round(skyH*dpr);
  sky.style.width=skyW+'px';sky.style.height=skyH+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const amount=clamp(Math.floor(skyW*skyH/2700),165,550);
  stars=Array.from({length:amount},(_,i)=>({x:Math.random()*skyW,y:Math.random()*skyH,r:Math.random()*.95+.18,a:Math.random()*.48+.12,phase:Math.random()*6.28,depth:Math.random()*.8+.15}));
}
seedStars();
window.addEventListener('resize',()=>{seedStars();renderFormation();resetSphere();},{passive:true});
window.addEventListener('pointermove',e=>{pointerX=(e.clientX/window.innerWidth-.5)*13;pointerY=(e.clientY/window.innerHeight-.5)*9;},{passive:true});
let starFrame=0;
function drawSky(time=0){
 if(!ctx) return;
 ctx.clearRect(0,0,skyW,skyH);
 const t=time*.00042;
 for(const s of stars){
  const alpha=s.a*(.83+.17*Math.sin(t*1.4+s.phase));
  const x=(s.x+pointerX*s.depth+skyW*4)%skyW;
  const y=(s.y+pointerY*s.depth-scrollProgress*90*s.depth+skyH*5)%skyH;
  ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(227,239,255,${alpha})`;ctx.fill();
 }
 if(!reduceMotion){starFrame=requestAnimationFrame(drawSky);}
}
drawSky();

// A planet is an actual project link; description expands on hover/focus.
const projectSystem=$('#planet-system');
projectSystem.innerHTML=DATA.projects.map((p,i)=>{
 const link=usableLink(p.url)?p.url:'#reports';
 const ext=/^https?:/.test(link);
 const title=escapeHTML(p.title), desc=escapeHTML(p.description);
 return `<a class="planet-card reveal" href="${escapeHTML(link)}" ${ext?'target="_blank" rel="noopener noreferrer"':''} aria-label="${title}, ${desc}" style="--planet-size:${p.size||145}px;--float-duration:${(6.2+i*.7).toFixed(1)}s">
 <div class="planet-holder"><div class="planet-visual planet-${escapeHTML(p.planet||'teal')} ${i===0||i===4?'ringed':''}"><span class="planet-ring"></span></div></div><h3 class="planet-title">${title}</h3><div class="planet-readout"><div class="planet-drop"></div><p class="planet-desc">${desc}</p><span class="planet-cta">${escapeHTML(p.cta||'View project')}</span></div></a>`;
}).join('');
// Dynamically created elements also get the reveal observer.
if('IntersectionObserver' in window && !reduceMotion){
 const o=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');o.unobserve(e.target)}}),{threshold:.1});
 $$('.planet-card').forEach(el=>o.observe(el));
}else $$('.planet-card').forEach(el=>el.classList.add('show'));

// Reports with tiny deterministic signal traces; no dummy download URL is offered.
$('#packet-count').textContent=String(DATA.reports.length).padStart(2,'0');
const makeWave = i => {
 const points=[];
 for(let x=0;x<=120;x+=3){const v=11+Math.sin(x*.2+i*2.1)*2+Math.cos(x*.74+i)*((x+i*17)%23<5?6:1.2);points.push(`${x},${v.toFixed(1)}`)}
 return `<svg class="wave" viewBox="0 0 120 22" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points.join(' ')}" /></svg>`;
};
$('#reports-list').innerHTML=DATA.reports.map((r,i)=>{
 const active=usableLink(r.link);
 const action=active?`<a class="report-action" href="${escapeHTML(r.link)}" ${/^https?:/.test(r.link)?'target="_blank" rel="noopener noreferrer"':''}>View credential ↗</a>`:`<span class="report-action disabled" title="Credential link not added">DETAILS ON REQUEST</span>`;
 return `<article class="report-row"><span class="report-id">TX-${String(i+1).padStart(3,'0')}</span><div><h3 class="report-title">${escapeHTML(r.title)}</h3><p class="report-description">${escapeHTML(r.description)}</p></div>${makeWave(i)}<span class="report-signal"><span class="signal-meter"><i style="width:${clamp(Number(r.signal)||50,0,100)}%"></i></span><span class="report-format">${escapeHTML(r.format)}</span></span>${action}</article>`;
}).join('');

// The five celestial formations use independent normalized coordinates.
const formations=[
 {name:'Orion',points:[[.13,.12],[.72,.17],[.57,.44],[.46,.52],[.33,.62],[.24,.87],[.86,.85]],lines:[[0,1],[0,4],[1,2],[2,3],[3,4],[4,5],[2,6]],jobs:[0,1,2,3,4]},
 {name:'Cassiopeia',points:[[.12,.18],[.33,.67],[.51,.30],[.68,.76],[.88,.24]],lines:[[0,1],[1,2],[2,3],[3,4]],jobs:[0,1,2,3,4]},
 {name:'Ursa Major',points:[[.12,.15],[.18,.5],[.38,.66],[.50,.48],[.68,.58],[.79,.71],[.91,.90]],lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,0]],jobs:[0,1,2,3,4]},
 {name:'Perseus',points:[[.85,.13],[.59,.31],[.34,.53],[.79,.84],[.14,.86]],lines:[[0,1],[1,2],[2,4],[1,3]],jobs:[0,1,2,3,4]},
 {name:'Leo',points:[[.85,.14],[.67,.36],[.72,.86],[.35,.35],[.13,.75]],lines:[[0,1],[1,2],[1,3],[3,4],[4,2]],jobs:[0,1,2,3,4]}
];
let formationIndex=0;
const stage=$('#constellation-stage'),dots=$('#constellation-dots');
const starsLayer=$('#constellation-stars'),svg=$('#constellation-svg');
const makeSVGElement = type => document.createElementNS('http://www.w3.org/2000/svg',type);
function renderFormation(){
 if(!stage||!svg) return;
 const f=formations[formationIndex];
 const width=stage.clientWidth,height=stage.clientHeight;
 // Reduce usable region on small screens so side labels do not clip.
 const paddingX=width<650?width*.16:width*.17;
 const paddingY=width<650?height*.20:height*.13;
 const points=f.points.map(([x,y])=>[paddingX+x*(width-paddingX*2),paddingY+y*(height-paddingY*2)]);
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
 svg.replaceChildren();
 f.lines.forEach(([a,b])=>{
  const line=makeSVGElement('line');line.setAttribute('x1',points[a][0]);line.setAttribute('y1',points[a][1]);line.setAttribute('x2',points[b][0]);line.setAttribute('y2',points[b][1]);svg.appendChild(line);
 });
 starsLayer.replaceChildren();
 const placements=[];
 DATA.experience.slice(0,5).forEach((job,j)=>{
  const idx=f.jobs[j]??j%f.points.length;
  const [x,y]=points[idx];
  const node=document.createElement('div');
  node.className='constellation-star';
  node.style.left=x+'px';node.style.top=y+'px';
  node.innerHTML=`<span class="star-point"></span><span class="star-info"><strong>${escapeHTML(job.organization)}</strong><em>${escapeHTML(job.title)}</em><small>${escapeHTML(job.date)}</small></span>`;
  node.addEventListener('pointerenter',()=>node.classList.add('on'));
  node.addEventListener('pointerleave',()=>node.classList.remove('on'));
  starsLayer.appendChild(node);
  placements.push({node,x,y});
 });
 // Place each label independently, avoiding overlaps on narrow and wide screens.
 // The constellation points stay fixed; just the labels move to their nearest free space.
 const placed=[];
 placements.forEach(({node,x,y},i)=>{
  const label=node.querySelector('.star-info');
  const box=label.getBoundingClientRect();
  const lw=box.width||145, lh=Math.max(45,box.height||65);
  const gap=width<600?13:22;
  const offsets=[-.5,-1.6,.6,-2.6,1.65,-3.6,2.7];
  const sides=x>width*.56?['left','right']:['right','left'];
  const choices=[];
  for(const side of sides){
    for(const n of offsets){
      choices.push({left:side==='right'?x+gap:x-lw-gap,top:y+lh*n,side});
    }
  }
  for(const n of [-2.2,1.2,2.4]) choices.push({left:x-lw/2,top:y+lh*n,side:'above'});
  let best=null,lowest=Infinity;
  for(const c of choices){
    const r={x:c.left,y:c.top,w:lw,h:lh};
    const over=placed.reduce((a,p)=>{
      const ow=Math.max(0,Math.min(r.x+r.w,p.x+p.w)-Math.max(r.x,p.x));
      const oh=Math.max(0,Math.min(r.y+r.h,p.y+p.h)-Math.max(r.y,p.y));
      return a+ow*oh;
    },0);
    const overflow=Math.max(0,10-r.x)+Math.max(0,r.x+lw-(width-10))+Math.max(0,10-r.y)+Math.max(0,r.y+lh-(height-10));
    const distance=Math.abs(c.top+lh*.5-y)+Math.abs(c.left+lw*.5-x)*.4;
    const score=over*20+overflow*110+distance*.6;
    if(score<lowest){lowest=score;best=r;}
  }
  label.style.left=(best.x-x)+'px';label.style.top=(best.y-y)+'px';
  label.style.right='auto';label.style.bottom='auto';
  placed.push(best);
 });
 $('#constellation-name').textContent=f.name;
 $('#constellation-number').textContent=`${formationIndex+1} of ${formations.length}`;
 [...dots.children].forEach((el,i)=>{el.classList.toggle('selected',i===formationIndex);el.setAttribute('aria-pressed',String(i===formationIndex));});
}
function changeFormation(next){formationIndex=(next+formations.length)%formations.length;renderFormation();}
formations.forEach((f,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Show ${f.name}`);b.addEventListener('click',()=>changeFormation(i));dots.appendChild(b);});
$('#prev-const').addEventListener('click',()=>changeFormation(formationIndex-1));
$('#next-const').addEventListener('click',()=>changeFormation(formationIndex+1));
stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();changeFormation(formationIndex-1)} if(e.key==='ArrowRight'){e.preventDefault();changeFormation(formationIndex+1)}});
let swipeX=0;
stage.addEventListener('touchstart',e=>{swipeX=e.touches[0].clientX},{passive:true});
stage.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-swipeX;if(Math.abs(dx)>55)changeFormation(formationIndex+(dx<0?1:-1));},{passive:true});
renderFormation();
const missionLog = $('#mission-log');
if(missionLog) missionLog.innerHTML = '<div class="mission-log-heading"><span>FIELD NOTES</span><span>EXPERIENCE / 05</span></div>' + DATA.experience.map((job,i)=>`<article class="mission-log-row"><span class="mission-log-no">${String(i+1).padStart(2,'0')}</span><div><h3>${escapeHTML(job.organization)}</h3><p>${escapeHTML(job.title)}</p><p class="mission-log-detail">${escapeHTML(job.description || '')}</p></div><time>${escapeHTML(job.date)}</time></article>`).join('');

// Drag-to-spin 3D globe: tags projected from points on a spherical Fibonacci lattice.
const skillColors={'Languages':'#e2f1ff','App Development':'#a9deff','Infrastructure':'#b5e1cd','Design & Tools':'#ffd8d3'};
const skillFilters=$('#skills-filters'),sphere=$('#skills-sphere'),skillStage=$('#skills-stage');
let filter='All', skillNodes=[],rotationX=-.19,rotationY=.25,dragging=false,lastX=0,lastY=0,spinVelocity=0;
function buildFilters(){
 const categories=['All',...Object.keys(DATA.skills)];
 skillFilters.innerHTML=categories.map((cat,i)=>`<button type="button" class="${cat===filter?'active':''}" data-filter="${escapeHTML(cat)}" aria-pressed="${cat===filter}">${i?`<i class="filter-dot" style="--dot-color:${skillColors[cat]}"></i>`:''}${escapeHTML(cat)}</button>`).join('');
 $$('.skills-filters button').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;buildFilters();buildSphere();}));
}
function buildSphere(){
 const entries=Object.entries(DATA.skills).flatMap(([category,items])=>items.map(label=>({label,category}))).filter(v=>filter==='All'||v.category===filter);
 sphere.replaceChildren();
 const n=entries.length;
 skillNodes=entries.map((v,i)=>{
  const t=i+.5;
  const y=1-(t/n)*2;
  const radius=Math.sqrt(Math.max(0,1-y*y));
  const phi=i*Math.PI*(3-Math.sqrt(5));
  const x=Math.cos(phi)*radius,z=Math.sin(phi)*radius;
  const el=document.createElement('span');
  el.className='skill-tag';
  el.textContent=v.label;
  el.style.setProperty('--tag-color',skillColors[v.category]);
  el.title=v.category;
  sphere.appendChild(el);
  return {x,y,z,el};
 });
 renderSphere();
}
function renderSphere(){
 if(!sphere||!skillNodes.length) return;
 const w=skillStage.clientWidth,h=skillStage.clientHeight;
 const sphereRadius=Math.min(w*.38,h*.43,225);
 const sX=Math.sin(rotationX),cX=Math.cos(rotationX),sY=Math.sin(rotationY),cY=Math.cos(rotationY);
 for(const p of skillNodes){
  const ax=p.x*cY+p.z*sY,az=-p.x*sY+p.z*cY;
  const ay=p.y*cX-az*sX,bz=p.y*sX+az*cX;
  const perspective=(2.65/(2.65-bz*.4));
  const scale=(.7+(bz+1)*.23)*perspective;
  p.el.style.transform=`translate(-50%, -50%) translate(${(ax*sphereRadius).toFixed(1)}px,${(ay*sphereRadius).toFixed(1)}px) scale(${scale.toFixed(3)})`;
  p.el.style.opacity=(.28+(bz+1)*.36).toFixed(2);
  p.el.style.zIndex=String(Math.round((bz+1)*100));
 }
}
function resetSphere(){renderSphere()}
skillStage.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;spinVelocity=0;skillStage.setPointerCapture(e.pointerId)});
skillStage.addEventListener('pointermove',e=>{if(!dragging)return;rotationY+=(e.clientX-lastX)*.007;rotationX=clamp(rotationX+(e.clientY-lastY)*.007,-1.25,1.25);spinVelocity=(e.clientX-lastX)*.003;lastX=e.clientX;lastY=e.clientY;renderSphere()});
function endDrag(){dragging=false}
skillStage.addEventListener('pointerup',endDrag);skillStage.addEventListener('pointercancel',endDrag);
skillStage.addEventListener('lostpointercapture',endDrag);
buildFilters();buildSphere();
let lastTick=0;
function rotateSphere(now){
 const dt=clamp((now-lastTick)/16.67||1,0,2);lastTick=now;
 if(!dragging){rotationY+=((reduceMotion?0:.002)+spinVelocity)*dt;spinVelocity*=.92;renderSphere()}
 if(!reduceMotion)requestAnimationFrame(rotateSphere);
}
if(!reduceMotion)requestAnimationFrame(rotateSphere);

// Keep selected navigation linked to scroll position.
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
 if(!e.isIntersecting)return;
 $$('.nav-links a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${e.target.id}`));
}),{rootMargin:'-22% 0px -57% 0px',threshold:0});
$$('main>section[id]:not(#home)').forEach(sec=>sectionObserver.observe(sec));
