/* ═══════════════════════════════════════════════════════
   THE LAST TRAIN HOME — complete journey
═══════════════════════════════════════════════════════ */

/* ── Audio ─────────────────────────────────────────── */
const tracks = {
  station: new Audio('assets/sounds/Avanti.mp3'),
  field:   new Audio('assets/sounds/field-ambience.mp3'),
  forest:  new Audio('assets/sounds/forest.mp3'),
  lake:    new Audio('assets/sounds/lake.mp3'),
  train:   new Audio('assets/sounds/train.mp3'),
};
Object.values(tracks).forEach(t => { t.loop = true; t.volume = 0.35; });
let currentTrack = null;
let soundOn = false;

function playTrack(name) {
  if (currentTrack) { currentTrack.pause(); currentTrack.currentTime = 0; }
  currentTrack = tracks[name];
  if (soundOn) currentTrack.play().catch(()=>{});
}

document.getElementById('soundBtn').addEventListener('click', () => {
  soundOn = !soundOn;
  document.getElementById('soundBtn').textContent = soundOn ? '♪ sound on' : '♪ sound off';
  if (soundOn && currentTrack) currentTrack.play().catch(()=>{});
  else if (!soundOn && currentTrack) currentTrack.pause();
});

/* ── Scene manager ────────────────────────────────── */
const sceneMap = { field:'fieldScene', shrine:'shrineScene', lake:'lakeScene', end:'endScene', leaving:'leavingScene' };
let activeScene = 'stationScene';

function goTo(name) {
  const nextId = sceneMap[name] || name;
  // Close any open dialogue before transitioning
  const existing = document.getElementById('dialogueBox');
  if (existing) existing.remove();
  dialogueOpen = false;

  gsap.to('#'+activeScene, {
    opacity:0, duration:2.2, ease:'power2.inOut',
    onComplete: () => {
      document.getElementById(activeScene).style.display = 'none';
      activeScene = nextId;
      const next = document.getElementById(nextId);
      next.style.display = 'block';
      next.style.pointerEvents = 'all';
      if (name==='field')  initField();
      else if (name==='shrine') initShrine();
      else if (name==='lake')   initLake();
      else if (name==='end')    initEnd();
      else if (name==='leaving') initLeaving();
    }
  });
}

function restartJourney() { location.reload(); }

/* ══════════════════════════════════════════════════
   SCENE 6 — TRAIN LEAVING (black screen + sound)
══════════════════════════════════════════════════ */
function initLeaving() {
  const scene = document.getElementById('leavingScene');
  scene.style.display       = 'block';
  scene.style.pointerEvents = 'all';

  const leaveAudio = new Audio('assets/sounds/leave.mp3');
  leaveAudio.volume = 0.7;

  gsap.to(scene, { opacity:1, duration:2.5, ease:'power2.inOut',
    onComplete: () => {
      if (soundOn || true) leaveAudio.play().catch(()=>{});

      // Text lines fade in one by one
      const lines = document.querySelectorAll('.leaving-line');
      lines.forEach((line, i) => {
        gsap.to(line, { opacity:1, y:0, duration:1.5,
          ease:'power2.out', delay: i * 2.5 + 1 });
      });

      // After all lines, show restart button
      gsap.to('#leavingBtn', { opacity:1, duration:1.5,
        ease:'power1.out', delay: lines.length * 2.5 + 2 });
    }
  });
}

/* ── Helpers ──────────────────────────────────────── */
function loadBg(id, src) {
  const el = document.getElementById(id);
  if (!el) return;
  const img = new Image();
  img.onload  = () => el.style.backgroundImage = `url('${src}')`;
  img.onerror = () => console.warn('Missing:', src);
  img.src = src;
}

function makeFireflies(id, count, color='rgba(180,255,140,0.95)', glow='rgba(160,255,120,0.6)') {
  const c = document.getElementById(id);
  if (!c) return; c.innerHTML = '';
  for (let i=0; i<count; i++) {
    const f = document.createElement('div');
    f.className = 'firefly';
    f.style.background = color;
    f.style.boxShadow  = `0 0 6px 1px ${glow}`;
    f.style.left = (8+Math.random()*84)+'%';
    f.style.top  = (40+Math.random()*45)+'%';
    c.appendChild(f);
    gsap.to(f,{x:-50+Math.random()*100,y:-40+Math.random()*80,
      duration:4+Math.random()*6,repeat:-1,yoyo:true,ease:'sine.inOut'});
    gsap.timeline({repeat:-1,delay:Math.random()*6})
      .to(f,{opacity:0.7+Math.random()*0.3,duration:0.3,ease:'power1.in'})
      .to(f,{opacity:0,duration:0.4,ease:'power1.out'})
      .to(f,{opacity:0,duration:1.5+Math.random()*5});
  }
}

function makeParticles(id, count, color) {
  const c = document.getElementById(id);
  if (!c) return;
  for (let i=0; i<count; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;
      width:${1.5+Math.random()*2}px;height:${1.5+Math.random()*2}px;
      background:${color};left:${Math.random()*100}%;top:${20+Math.random()*65}%;opacity:0;`;
    c.appendChild(p);
    gsap.to(p,{x:-80+Math.random()*40,y:-30+Math.random()*60,
      opacity:0.1+Math.random()*0.25,duration:8+Math.random()*10,
      repeat:-1,yoyo:true,ease:'none',delay:Math.random()*8});
  }
}

function buildGrass(id, count, minH, maxH, colors) {
  const c = document.getElementById(id);
  if (!c) return; c.innerHTML = '';
  for (let i=0; i<count; i++) {
    const h=minH+Math.random()*(maxH-minH), w=2+Math.random()*5;
    const col=colors[Math.floor(Math.random()*colors.length)], lean=-10+Math.random()*20;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('width',w+8); svg.setAttribute('height',h);
    svg.style.cssText=`display:inline-block;flex-shrink:0;vertical-align:bottom;
      transform-origin:bottom center;transform:rotate(${lean}deg);
      opacity:${0.5+Math.random()*0.5};margin:0 ${Math.random()*1.5}px;overflow:visible;`;
    const cx=(w+8)/2,curve=-5+Math.random()*10;
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',`M${cx-w/2} ${h} Q${cx+curve} ${h*.5} ${cx+curve*.3} 0
      Q${cx+curve*.3+1} 0 ${cx+curve*.3+2} 0 Q${cx+curve+2} ${h*.5} ${cx+w/2+2} ${h}Z`);
    const gid='g'+i+id;
    const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
    const grad=document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
    grad.setAttribute('id',gid);grad.setAttribute('x1','0');grad.setAttribute('y1','1');
    grad.setAttribute('x2','0');grad.setAttribute('y2','0');
    const s1=document.createElementNS('http://www.w3.org/2000/svg','stop');
    s1.setAttribute('offset','0%');s1.setAttribute('stop-color',shade(col,-35));
    const s2=document.createElementNS('http://www.w3.org/2000/svg','stop');
    s2.setAttribute('offset','100%');s2.setAttribute('stop-color',shade(col,25));
    grad.appendChild(s1);grad.appendChild(s2);defs.appendChild(grad);
    path.setAttribute('fill',`url(#${gid})`);
    svg.appendChild(defs);svg.appendChild(path);c.appendChild(svg);
    gsap.to(svg,{rotation:lean+(5+Math.random()*13)*(Math.random()>.5?1:-1),
      duration:1.8+Math.random()*3,ease:'sine.inOut',yoyo:true,repeat:-1,delay:Math.random()*4});
  }
}
function shade(hex,amt){
  const n=parseInt(hex.replace('#',''),16);
  return `rgb(${Math.min(255,Math.max(0,(n>>16)+amt))},${Math.min(255,Math.max(0,((n>>8)&0xff)+amt))},${Math.min(255,Math.max(0,(n&0xff)+amt))})`;
}

function lanternFlicker(id) {
  const el=document.getElementById(id);
  if(!el)return;
  (function tick(){
    gsap.to(el,{opacity:0.5+Math.random()*0.35,duration:0.07+Math.random()*0.22,
      ease:'none',onComplete:tick});
  })();
  setInterval(()=>{
    if(Math.random()>0.65)
      gsap.to(el,{opacity:0.05,duration:0.04,
        onComplete:()=>gsap.to(el,{opacity:0.7,duration:0.1})});
  },2800);
}

/* ══════════════════════════════════════════════════
   SCENE 1 — STATION
══════════════════════════════════════════════════ */
function initStation() {
  loadBg('stationBg','assets/images/station-bg.png');
  makeFireflies('stationFireflies',10);
  lanternFlicker('lanternGlow');
  buildGrass('stationGrass',180,28,82,
    ['#2a5520','#387030','#4a8038','#2e6025','#3d7030','#224818']);
  makeParticles('stationParticles',12,'rgba(255,210,130,0.65)');
  playTrack('station');

  document.addEventListener('mousemove',e=>{
    if(activeScene!=='stationScene')return;
    const dx=(e.clientX/window.innerWidth-0.5),dy=(e.clientY/window.innerHeight-0.5);
    gsap.to('#stationBg',  {x:dx*-18,y:dy*-9, duration:2.5,ease:'power1.out'});
    gsap.to('#stationGrass',{x:dx*-32,duration:1.5,ease:'power1.out'});
    gsap.to('#lanternGlow',{x:dx*-5,y:dy*-3,duration:3,ease:'power1.out'});
  });

  gsap.to('#stationScene',{opacity:1,duration:4,ease:'power1.inOut'});
  gsap.to('#stationTitle',{opacity:1,duration:2.5,ease:'power2.out',delay:2.5});
  gsap.to('#spiritHint',  {opacity:1,duration:3,ease:'power1.out',delay:4.5});
  gsap.to('.sun-glow',    {scale:1.15,duration:6,ease:'sine.inOut',yoyo:true,repeat:-1});
  gsap.to('#stationBg',   {scale:1.04,duration:14,ease:'sine.inOut',yoyo:true,repeat:-1});
  setTimeout(()=>initStationInteractions(), 500);
}

/* ══════════════════════════════════════════════════
   SCENE 2 — FIELD
══════════════════════════════════════════════════ */
function initField() {
  loadBg('fieldBg','assets/images/field-bg.png');
  makeFireflies('fieldFireflies',18);
  buildGrass('fieldGrass',200,35,90,
    ['#4a7a28','#5a8c34','#3d6820','#6a9a3c','#4e7e2a','#2e5818']);
  makeParticles('fieldParticles',18,'rgba(255,220,140,0.6)');
  initButterfly();
  playTrack('field');

  document.addEventListener('mousemove',e=>{
    if(activeScene!=='fieldScene')return;
    const dx=(e.clientX/window.innerWidth-0.5),dy=(e.clientY/window.innerHeight-0.5);
    gsap.to('#fieldBg',   {x:dx*-22,y:dy*-10,duration:2.5,ease:'power1.out'});
    gsap.to('#fieldGrass',{x:dx*-38,duration:1.4,ease:'power1.out'});
  });

  gsap.to('#fieldScene', {opacity:1,duration:2.5,ease:'power1.inOut'});
  gsap.to('#fieldTitle', {opacity:1,duration:2,ease:'power2.out',delay:1.5});
  gsap.to('#fieldBtn',   {opacity:1,duration:1.5,ease:'power1.out',delay:3});
  gsap.to('#fieldSunGlow',{scale:1.2,duration:5,ease:'sine.inOut',yoyo:true,repeat:-1});
  gsap.to('#fieldBg',    {scale:1.04,duration:16,ease:'sine.inOut',yoyo:true,repeat:-1});
  setTimeout(()=>initFieldInteractions(), 500);
}

/* ── Butterfly — cursor follower, single instance ── */
let butterflyInit = false;
function initButterfly() {
  if (butterflyInit) return;
  butterflyInit = true;
  const bf = document.getElementById('butterfly');
  if (!bf) return;
  gsap.to('#wingLeft', {rotateY:65,duration:0.2,ease:'sine.inOut',yoyo:true,repeat:-1});
  gsap.to('#wingRight',{rotateY:-65,duration:0.2,ease:'sine.inOut',yoyo:true,repeat:-1,delay:0.1});
  gsap.set(bf,{x:window.innerWidth*0.5,y:250,opacity:0});
  gsap.to(bf,{opacity:1,duration:1.5,delay:1});
  gsap.to(bf,{y:'+=14',duration:2.5,ease:'sine.inOut',yoyo:true,repeat:-1});
  document.addEventListener('mousemove',e=>{
    if(activeScene!=='fieldScene')return;
    gsap.to(bf,{x:e.clientX-14,y:e.clientY-30,duration:1.8,ease:'power1.out'});
    gsap.to(bf,{rotation:(e.clientX/window.innerWidth-0.5)*20,duration:0.6,ease:'power1.out'});
  });
}

/* ══════════════════════════════════════════════════
   SCENE 3 — FOREST SHRINE
══════════════════════════════════════════════════ */
function initShrine() {
  loadBg('shrineBg','assets/images/forest.png');
  makeFireflies('shrineFireflies',22,'rgba(160,255,140,0.9)','rgba(120,220,100,0.55)');
  buildGrass('shrineGrass',160,30,75,
    ['#1e4018','#2a5520','#162e12','#234a1c','#1a3815']);
  makeParticles('shrineParticles',20,'rgba(160,220,140,0.4)');
  makeWindStreaks();
  makeShrineSpirits();
  makeStoneLanterns();
  playTrack('forest');

  document.addEventListener('mousemove',e=>{
    if(activeScene!=='shrineScene')return;
    const dx=(e.clientX/window.innerWidth-0.5),dy=(e.clientY/window.innerHeight-0.5);
    gsap.to('#shrineBg',   {x:dx*-15,y:dy*-8,duration:3,ease:'power1.out'});
    gsap.to('#shrineGrass',{x:dx*-28,duration:1.8,ease:'power1.out'});
  });

  gsap.to('#shrineScene',{opacity:1,duration:3,ease:'power1.inOut'});
  gsap.to('#shrineTitle',{opacity:1,duration:2,ease:'power2.out',delay:2});
  gsap.to('#shrineBtn',  {opacity:1,duration:1.5,ease:'power1.out',delay:4});
  gsap.to('#shrineBg',   {scale:1.03,duration:18,ease:'sine.inOut',yoyo:true,repeat:-1});
  setTimeout(()=>initShrineInteractions(), 500);
}

function makeWindStreaks() {
  const layer=document.getElementById('windLayer');
  if(!layer)return;
  function spawn(){
    const s=document.createElement('div');
    s.className='wind-streak';
    const w=80+Math.random()*180;
    s.style.cssText=`width:${w}px;top:${20+Math.random()*70}%;left:-${w}px;
      opacity:0;height:${Math.random()>.5?1:2}px;`;
    layer.appendChild(s);
    gsap.timeline({onComplete:()=>s.remove()})
      .to(s,{left:'110%',opacity:0.35,duration:1.8+Math.random()*1.5,ease:'power1.inOut'})
      .to(s,{opacity:0,duration:0.4},'-=0.4');
    setTimeout(spawn,400+Math.random()*1200);
  }
  spawn();
}

function makeShrineSpirits() {
  const c=document.getElementById('shrineSpirits');
  if(!c)return;
  [{left:'18%',top:'55%'},{left:'72%',top:'62%'},{left:'45%',top:'68%'},
   {left:'60%',top:'58%'},{left:'30%',top:'72%'}].forEach((pos,i)=>{
    const s=document.createElement('div');
    s.className='tiny-spirit';
    s.textContent='✦';
    s.style.left=pos.left; s.style.top=pos.top;
    s.style.color=`rgba(${180+Math.random()*40},${220+Math.random()*35},${180+Math.random()*40},0.85)`;
    s.style.fontSize=(10+Math.random()*8)+'px';
    s.style.filter='blur(0.3px) drop-shadow(0 0 5px rgba(160,255,160,0.7))';
    c.appendChild(s);
    gsap.timeline({delay:2+i*0.8})
      .to(s,{opacity:0.85,duration:1.5,ease:'power1.out'})
      .to(s,{y:-8,duration:2+Math.random(),ease:'sine.inOut',yoyo:true,repeat:-1},'-=0.5');
    gsap.to(s,{opacity:0,duration:0.3,ease:'power1.in',
      delay:5+Math.random()*8,repeat:-1,repeatDelay:2+Math.random()*4,yoyo:true});
  });
}

/* ── Stone lantern glows — match image lanterns ──── */
function makeStoneLanterns() {
  const c=document.getElementById('shrineScene');
  // Positions roughly matching the stone lanterns in the image
  [{left:'14%',top:'58%'},{left:'30%',top:'64%'},{left:'68%',top:'62%'},{left:'82%',top:'56%'}]
  .forEach(pos=>{
    const glow=document.createElement('div');
    glow.style.cssText=`
      position:absolute;left:${pos.left};top:${pos.top};
      width:28px;height:28px;border-radius:50%;
      background:radial-gradient(circle,rgba(255,180,80,0.6) 0%,transparent 70%);
      pointer-events:none;mix-blend-mode:screen;
    `;
    c.appendChild(glow);
    // Each lantern flickers independently
    (function flick(){
      gsap.to(glow,{opacity:0.5+Math.random()*0.5,
        scale:0.85+Math.random()*0.3,
        duration:0.1+Math.random()*0.25,
        ease:'none',onComplete:flick});
    })();
  });
}

/* ══════════════════════════════════════════════════
   SCENE 4 — LAKESIDE
══════════════════════════════════════════════════ */
function initLake() {
  loadBg('lakeBg','assets/images/lake.png');
  makeFireflies('lakeFireflies',28,'rgba(200,220,255,0.9)','rgba(160,190,255,0.55)');
  buildGrass('lakeGrass',170,32,78,
    ['#1a3a4a','#224858','#1c4252','#184038','#1e4848']);
  makeParticles('lakeParticles',15,'rgba(180,210,255,0.35)');
  makeTwinklingStars();
  makeMoonReflection();
  makeLakeSpirits();
  makeRaindrops('lakeScene', 30); // light mist/rain
  playTrack('lake');

  document.addEventListener('mousemove',e=>{
    if(activeScene!=='lakeScene')return;
    const dx=(e.clientX/window.innerWidth-0.5),dy=(e.clientY/window.innerHeight-0.5);
    gsap.to('#lakeBg',  {x:dx*-12,y:dy*-6,duration:3,ease:'power1.out'});
    gsap.to('#lakeGrass',{x:dx*-25,duration:2,ease:'power1.out'});
    gsap.to('#moonGlow',{x:dx*-6,y:dy*-4,duration:4,ease:'power1.out'});
  });

  gsap.to('#lakeScene', {opacity:1,duration:3,ease:'power1.inOut'});
  gsap.to('#lakeTitle', {opacity:1,duration:2.5,ease:'power2.out',delay:2});
  gsap.to('#lakeBtn',   {opacity:1,duration:1.5,ease:'power1.out',delay:4});
  gsap.to('#moonGlow',  {scale:1.12,duration:6,ease:'sine.inOut',yoyo:true,repeat:-1});
  gsap.to('#lakeBg',    {scale:1.03,duration:20,ease:'sine.inOut',yoyo:true,repeat:-1});
  setTimeout(()=>initLakeInteractions(), 500);
}

/* ── Twinkling stars ───────────────────────────────── */
function makeTwinklingStars() {
  const c=document.getElementById('lakeScene');
  for(let i=0;i<60;i++){
    const star=document.createElement('div');
    const size=1+Math.random()*2.5;
    star.style.cssText=`
      position:absolute;border-radius:50%;pointer-events:none;
      width:${size}px;height:${size}px;
      background:rgba(255,255,255,${0.5+Math.random()*0.5});
      left:${Math.random()*100}%;top:${Math.random()*45}%;
      box-shadow:0 0 ${size*2}px rgba(200,220,255,0.8);
    `;
    c.appendChild(star);
    // Each star twinkles at its own rhythm
    gsap.to(star,{
      opacity:0.1+Math.random()*0.3,
      scale:0.5+Math.random()*0.5,
      duration:0.8+Math.random()*2.5,
      ease:'sine.inOut',yoyo:true,repeat:-1,
      delay:Math.random()*4
    });
  }
}

/* ── Moon reflection shimmer on water ─────────────── */
function makeMoonReflection() {
  const c=document.getElementById('lakeScene');
  for(let i=0;i<8;i++){
    const r=document.createElement('div');
    const w=2+Math.random()*5;
    r.style.cssText=`
      position:absolute;pointer-events:none;
      width:${w}px;height:${50+Math.random()*80}px;
      bottom:${5+Math.random()*18}%;left:${44+Math.random()*12}%;
      border-radius:50%;
      background:linear-gradient(to bottom,rgba(200,220,255,0.25),transparent);
    `;
    c.appendChild(r);
    gsap.to(r,{
      scaleX:1.8+Math.random(),opacity:0.08+Math.random()*0.18,
      duration:1.5+Math.random()*2,ease:'sine.inOut',yoyo:true,repeat:-1,
      delay:Math.random()*3
    });
  }
}

/* ── Lake spirits — glowing orbs over water ──────── */
function makeLakeSpirits() {
  const c=document.getElementById('lakeSpirits');
  if(!c)return;
  [{left:'25%',top:'58%'},{left:'52%',top:'62%'},
   {left:'68%',top:'55%'},{left:'38%',top:'68%'}].forEach((pos,i)=>{
    const orb=document.createElement('div');
    orb.style.cssText=`
      position:absolute;left:${pos.left};top:${pos.top};
      width:${8+Math.random()*6}px;height:${8+Math.random()*6}px;
      border-radius:50%;opacity:0;pointer-events:none;
      background:radial-gradient(circle,rgba(200,225,255,0.9),transparent);
      box-shadow:0 0 14px 4px rgba(160,200,255,0.45);filter:blur(0.5px);
    `;
    c.appendChild(orb);
    gsap.timeline({delay:2+i*1.2})
      .to(orb,{opacity:0.9,duration:2,ease:'power1.out'})
      .to(orb,{y:-14,duration:3+Math.random(),ease:'sine.inOut',yoyo:true,repeat:-1},'-=1');
    gsap.to(orb,{x:-14+Math.random()*28,duration:5+Math.random()*4,
      ease:'sine.inOut',yoyo:true,repeat:-1,delay:Math.random()*3});
  });
}

/* ── Raindrops (lake + final station) ─────────────── */
function makeRaindrops(sceneId, count) {
  const c=document.getElementById(sceneId);
  if(!c)return;
  for(let i=0;i<count;i++){
    const drop=document.createElement('div');
    drop.style.cssText=`
      position:absolute;pointer-events:none;
      width:1px;height:${8+Math.random()*12}px;
      background:linear-gradient(to bottom,transparent,rgba(180,210,255,0.35));
      left:${Math.random()*100}%;top:-20px;
      border-radius:1px;opacity:0;
    `;
    c.appendChild(drop);
    gsap.to(drop,{
      y:window.innerHeight+30,opacity:0.4+Math.random()*0.3,
      duration:0.8+Math.random()*0.6,ease:'none',
      delay:Math.random()*4,repeat:-1,
      repeatDelay:Math.random()*3
    });
  }
}

/* ══════════════════════════════════════════════════
   SCENE 5 — FINAL STATION
══════════════════════════════════════════════════ */
function initEnd() {
  loadBg('endBg','assets/images/train.png');
  makeFireflies('endFireflies',8,'rgba(200,210,255,0.8)','rgba(160,180,255,0.5)');
  buildGrass('endGrass',160,28,75,
    ['#1a3038','#223a48','#1c3545','#183040','#1e3540']);
  makeParticles('endParticles',10,'rgba(200,210,255,0.4)');
  makeRaindrops('endScene',50);     // heavier rain at station
  makeTwinklingStarsEnd();
  makeTrainWindowGlow();
  makeFog();
  playTrack('train');

  document.addEventListener('mousemove',e=>{
    if(activeScene!=='endScene')return;
    const dx=(e.clientX/window.innerWidth-0.5),dy=(e.clientY/window.innerHeight-0.5);
    gsap.to('#endBg',   {x:dx*-14,y:dy*-7,duration:2.5,ease:'power1.out'});
    gsap.to('#endGrass',{x:dx*-28,duration:1.5,ease:'power1.out'});
  });

  gsap.to('#endScene',{opacity:1,duration:3,ease:'power1.inOut'});

  // Farewell text appears
  gsap.to('#farewellBlock',{opacity:1,duration:2.5,ease:'power2.out',delay:2.5});
  setTimeout(()=>initEndInteractions(), 500);
}

/* ── Stars at night station ──────────────────────── */
function makeTwinklingStarsEnd() {
  const c=document.getElementById('endScene');
  for(let i=0;i<40;i++){
    const star=document.createElement('div');
    const size=0.8+Math.random()*2;
    star.style.cssText=`
      position:absolute;border-radius:50%;pointer-events:none;
      width:${size}px;height:${size}px;
      background:rgba(255,255,255,${0.4+Math.random()*0.6});
      left:${Math.random()*100}%;top:${Math.random()*40}%;
      box-shadow:0 0 ${size*2}px rgba(200,220,255,0.7);
    `;
    c.appendChild(star);
    gsap.to(star,{opacity:0.05+Math.random()*0.25,
      duration:1+Math.random()*2,ease:'sine.inOut',yoyo:true,repeat:-1,delay:Math.random()*5});
  }
}

/* ── Warm glow from train windows ────────────────── */
function makeTrainWindowGlow() {
  const c=document.getElementById('endScene');
  // Warm amber glow from the train interior
  [{left:'48%',top:'45%'},{left:'58%',top:'44%'},{left:'66%',top:'45%'}]
  .forEach(pos=>{
    const glow=document.createElement('div');
    glow.style.cssText=`
      position:absolute;left:${pos.left};top:${pos.top};
      width:40px;height:30px;
      background:radial-gradient(ellipse,rgba(255,200,100,0.3) 0%,transparent 70%);
      pointer-events:none;mix-blend-mode:screen;border-radius:4px;
    `;
    c.appendChild(glow);
    gsap.to(glow,{opacity:0.6+Math.random()*0.4,
      duration:0.15+Math.random()*0.3,ease:'none',yoyo:true,repeat:-1,delay:Math.random()*2});
  });
}

/* ── Fog / smoke drifting across station ─────────── */
function makeFog() {
  // Create a dedicated fog layer above everything except text
  const layer = document.createElement('div');
  layer.style.cssText = `
    position:absolute; inset:0;
    pointer-events:none; overflow:hidden;
    z-index:5;
  `;
  document.getElementById('endScene').appendChild(layer);

  function spawnFog() {
    const fog  = document.createElement('div');
    const w    = 350 + Math.random() * 300;
    const h    = 70  + Math.random() * 70;
    const fromRight = Math.random() > 0.5;
    const startX    = fromRight ? window.innerWidth + 50 : -w - 50;
    const endX      = fromRight ? -w - 50 : window.innerWidth + 50;
    const topPct    = 35 + Math.random() * 40;

    fog.style.cssText = `
      position:absolute;
      width:${w}px;
      height:${h}px;
      border-radius:50%;
      background:radial-gradient(ellipse at center,
        rgba(200,215,230,0.18) 0%,
        rgba(180,200,220,0.08) 50%,
        transparent 100%);
      filter:blur(22px);
      top:${topPct}%;
      left:0px;
      pointer-events:none;
      opacity:0;
      will-change:transform;
    `;
    layer.appendChild(fog);

    const dur = 14 + Math.random() * 12;
    gsap.set(fog, { x: startX });
    gsap.timeline({ onComplete: () => fog.remove() })
      .to(fog, { opacity: 1, duration: dur * 0.2, ease: 'power1.in' })
      .to(fog, { x: endX, y: -10 + Math.random()*20,
        duration: dur, ease: 'none' }, 0)
      .to(fog, { opacity: 0, duration: dur * 0.25, ease: 'power1.out' },
        `-=${dur * 0.25}`);

    setTimeout(spawnFog, 1200 + Math.random() * 2500);
  }

  spawnFog();
  setTimeout(spawnFog, 600);
  setTimeout(spawnFog, 1800);
  setTimeout(spawnFog, 3200);
}

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
window.addEventListener('load',()=>{
  const station=document.getElementById('stationScene');
  station.style.display='block';
  station.style.pointerEvents='all';
  initStation();
  window.addEventListener('resize',()=>{
    buildGrass('stationGrass',180,28,82,
      ['#2a5520','#387030','#4a8038','#2e6025','#3d7030','#224818']);
  });
});

/* ═══════════════════════════════════════════════════════
   INTERACTIONS — The Last Train Home
   Handles all clickable objects, dialogue, collectibles
═══════════════════════════════════════════════════════ */

/* ── Memory fragment system ───────────────────────── */
const memories = {
  bench:   { collected: false, text: "You used to wait here every evening. Someone always came." },
  flower:  { collected: false, text: "She pressed wildflowers in old books. You never told her you kept one." },
  spirit:  { collected: false, text: "Some places remember you even after you forget yourself." },
  lake:    { collected: false, text: "You made a promise by this water once. The lake still holds it." },
};

let dialogueOpen = false;

/* ── Dialogue box ─────────────────────────────────── */
function showDialogue(lines, onClose) {
  if (dialogueOpen) return;
  dialogueOpen = true;

  const box = document.createElement('div');
  box.id = 'dialogueBox';
  box.style.cssText = `
    position:fixed; bottom:60px; left:50%; transform:translateX(-50%);
    width:min(580px, 88vw);
    background:rgba(8,5,2,0.82);
    border:1px solid rgba(255,220,170,0.18);
    border-radius:4px; padding:22px 28px;
    font-family:'Georgia',serif; color:rgba(255,235,200,0.9);
    font-size:14px; line-height:1.8; letter-spacing:0.5px;
    z-index:1000; opacity:0; cursor:pointer;
    backdrop-filter:blur(6px);
    text-align:center;
  `;

  let lineIndex = 0;

  function showLine() {
    box.innerHTML = `
      <p style="opacity:0.7;font-size:11px;letter-spacing:3px;margin-bottom:10px;color:rgba(255,210,150,0.5);">
        — click to continue —
      </p>
      <p>${lines[lineIndex]}</p>
    `;
    gsap.fromTo(box, { opacity:0, y:10 }, { opacity:1, y:0, duration:0.5, ease:'power2.out' });
  }

  box.addEventListener('click', () => {
    lineIndex++;
    if (lineIndex >= lines.length) {
      gsap.to(box, { opacity:0, y:10, duration:0.4, ease:'power2.in',
        onComplete: () => {
          box.remove();
          dialogueOpen = false;
          if (onClose) onClose();
        }
      });
    } else {
      gsap.fromTo(box, { opacity:0.3 }, { opacity:1, duration:0.3 });
      showLine();
    }
  });

  document.body.appendChild(box);
  showLine();
}

/* ── Memory fragment pickup ───────────────────────── */
function showMemoryPickup(key, x, y) {
  if (memories[key].collected) return;
  memories[key].collected = true;

  // Flash effect at click position
  const flash = document.createElement('div');
  flash.style.cssText = `
    position:fixed; left:${x}px; top:${y}px;
    width:6px; height:6px; border-radius:50%;
    background:rgba(255,240,180,0.95);
    box-shadow:0 0 20px 8px rgba(255,220,140,0.6);
    transform:translate(-50%,-50%);
    pointer-events:none; z-index:999;
  `;
  document.body.appendChild(flash);
  gsap.to(flash, { scale:4, opacity:0, duration:0.8, ease:'power2.out',
    onComplete:()=>flash.remove() });

  // Memory counter update
  updateMemoryCounter();

  // Show the memory text
  showDialogue(['✦ Memory found', memories[key].text]);
}

/* ── Memory counter (top right) ───────────────────── */
function updateMemoryCounter() {
  const count = Object.values(memories).filter(m => m.collected).length;
  let counter = document.getElementById('memoryCounter');
  if (!counter) {
    counter = document.createElement('div');
    counter.id = 'memoryCounter';
    counter.style.cssText = `
      position:fixed; top:20px; right:22px; z-index:9998;
      font-family:'Georgia',serif; font-size:11px; letter-spacing:3px;
      color:rgba(255,220,150,0.45); pointer-events:none;
      transition:color 0.5s ease;
    `;
    document.body.appendChild(counter);
  }
  counter.textContent = `memories  ${count} / ${Object.keys(memories).length}`;
  gsap.fromTo(counter, { color:'rgba(255,220,150,0.9)' },
    { color:'rgba(255,220,150,0.45)', duration:2, ease:'power2.out' });

  if (count === Object.keys(memories).length) {
    setTimeout(showAllMemories, 1000);
  }
}

function showAllMemories() {
  showDialogue([
    '✦ All memories recovered.',
    'The station. The field. The shrine. The lake.',
    'You remember now why you came here.',
    'Some journeys are not about where you are going.',
    'They are about what you were carrying all along.',
    'The train is waiting.',
  ]);
}

/* ── Ripple effect on click ───────────────────────── */
function makeRipple(x, y, color='rgba(180,210,255,0.5)') {
  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position:fixed; left:${x}px; top:${y}px;
    width:10px; height:10px; border-radius:50%;
    border:1px solid ${color};
    transform:translate(-50%,-50%);
    pointer-events:none; z-index:100;
  `;
  document.body.appendChild(ripple);
  gsap.to(ripple, { scale:12, opacity:0, duration:1.2, ease:'power2.out',
    onComplete:()=>ripple.remove() });
}

/* ── Floating text ────────────────────────────────── */
function floatText(text, x, y, color='rgba(255,235,200,0.8)') {
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed; left:${x}px; top:${y}px;
    font-family:'Georgia',serif; font-size:12px;
    letter-spacing:2px; font-style:italic;
    color:${color}; pointer-events:none; z-index:500;
    transform:translate(-50%,-50%);
    text-shadow:0 2px 8px rgba(0,0,0,0.8);
  `;
  el.textContent = text;
  document.body.appendChild(el);
  gsap.fromTo(el,
    { opacity:0, y:0 },
    { opacity:1, y:-40, duration:2, ease:'power1.out',
      onComplete:()=>gsap.to(el,{opacity:0,duration:1,onComplete:()=>el.remove()}) });
}

/* ══════════════════════════════════════════════════
   STATION INTERACTIONS
══════════════════════════════════════════════════ */
function initStationInteractions() {

  // Clickable bench area
  const bench = document.createElement('div');
  bench.style.cssText = `
    position:absolute; left:32%; top:52%; width:14%; height:18%;
    cursor:pointer; z-index:50;
  `;
  bench.title = 'the bench';
  document.getElementById('stationScene').appendChild(bench);
  bench.addEventListener('click', e => {
    makeRipple(e.clientX, e.clientY, 'rgba(255,200,120,0.4)');
    showDialogue([
      'The bench is cold.',
      'But the wood remembers warmth. Palms pressed here, shoulders leaning close, the quiet that felt like enough.',
      'You sit for a moment anyway.',
    ], () => showMemoryPickup('bench', e.clientX, e.clientY));
  });

  // Clickable clock
  const clock = document.createElement('div');
  clock.style.cssText = `
    position:absolute; left:36%; top:28%; width:7%; height:16%;
    cursor:pointer; z-index:50;
  `;
  clock.title = 'the clock';
  document.getElementById('stationScene').appendChild(clock);
  clock.addEventListener('click', e => {
    makeRipple(e.clientX, e.clientY, 'rgba(255,220,170,0.4)');
    floatText('tick.', e.clientX, e.clientY - 30);
    chimeSound();
    showDialogue([
      'The clock says 5:47.',
      'It has said 5:47 for as long as you can remember.',
      'Some things stop moving and nobody notices.',
    ]);
  });
}

/* ── Clock chime sound ────────────────────────────── */
function chimeSound() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = [523.3, 659.3, 783.9, 1046.5];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      env.gain.setValueAtTime(0, ctx.currentTime + i*0.3);
      env.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i*0.3 + 0.05);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.3 + 2.5);
      osc.connect(env); env.connect(ctx.destination);
      osc.start(ctx.currentTime + i*0.3);
      osc.stop(ctx.currentTime + i*0.3 + 2.5);
    });
    setTimeout(()=>ctx.close(), 4000);
  } catch(e) {}
}

/* ══════════════════════════════════════════════════
   FIELD INTERACTIONS
══════════════════════════════════════════════════ */
function initFieldInteractions() {
  const scene = document.getElementById('fieldScene');

  // Click anywhere in field to bloom flowers
  scene.addEventListener('click', e => {
    if (dialogueOpen) return;
    // Bloom burst at cursor
    for (let i = 0; i < 5; i++) {
      const petal = document.createElement('div');
      const angle = (i/5)*360;
      const dist  = 20 + Math.random()*20;
      petal.style.cssText = `
        position:fixed; left:${e.clientX}px; top:${e.clientY}px;
        font-size:${12+Math.random()*8}px; pointer-events:none; z-index:200;
        transform:translate(-50%,-50%);
      `;
      petal.textContent = ['🌸','✿','❀','🌼','✦'][i];
      document.body.appendChild(petal);
      gsap.to(petal, {
        x: Math.cos(angle*Math.PI/180)*dist,
        y: Math.sin(angle*Math.PI/180)*dist - 30,
        opacity:0, duration:1.2+Math.random()*0.5,
        ease:'power2.out', onComplete:()=>petal.remove()
      });
    }
  });

  // Hidden memory fragment — glowing spot in lower center
  const fragment = document.createElement('div');
  fragment.style.cssText = `
    position:absolute; bottom:20%; left:52%;
    width:14px; height:14px; border-radius:50%;
    background:rgba(255,240,180,0.6);
    box-shadow:0 0 16px 6px rgba(255,220,120,0.35);
    cursor:pointer; z-index:50;
    animation:fragmentPulse 3s ease-in-out infinite;
  `;
  scene.appendChild(fragment);

  // Add pulse keyframe
  if (!document.getElementById('fragmentStyle')) {
    const style = document.createElement('style');
    style.id = 'fragmentStyle';
    style.textContent = `
      @keyframes fragmentPulse {
        0%,100%{ opacity:0.4; transform:scale(1); }
        50%    { opacity:0.9; transform:scale(1.3); }
      }
    `;
    document.head.appendChild(style);
  }

  fragment.addEventListener('click', e => {
    gsap.to(fragment, { scale:0, opacity:0, duration:0.4, onComplete:()=>fragment.remove() });
    showMemoryPickup('flower', e.clientX, e.clientY);
  });
}

/* ══════════════════════════════════════════════════
   SHRINE INTERACTIONS
══════════════════════════════════════════════════ */
function initShrineInteractions() {
  const scene = document.getElementById('shrineScene');

  // Spirit whispers — click anywhere dark in scene
  const spiritLines = [
    "you were expected.",
    "the shrine remembers every name.",
    "leave something. take something. the balance holds.",
    "do not be afraid of what watches.",
    "you have been here before. in another life. in a dream.",
  ];
  let spiritIndex = 0;

  scene.addEventListener('click', e => {
    if (dialogueOpen) return;
    floatText(spiritLines[spiritIndex % spiritLines.length],
      e.clientX, e.clientY, 'rgba(180,255,180,0.7)');
    spiritIndex++;
    // After 3 clicks show memory
    if (spiritIndex === 3) {
      setTimeout(()=>{
        showDialogue([
          'The spirits have noticed you.',
          'One drifts close. You feel it more than see it.',
          '"Some places remember you," it says, "even after you forget yourself."',
        ], () => showMemoryPickup('spirit', e.clientX, e.clientY));
      }, 800);
    }
  });

  // Clickable lantern areas — brighten on click
  [{left:'14%',top:'55%'},{left:'82%',top:'53%'}].forEach(pos => {
    const lanternHit = document.createElement('div');
    lanternHit.style.cssText = `
      position:absolute; left:${pos.left}; top:${pos.top};
      width:60px; height:80px; cursor:pointer; z-index:50;
      transform:translate(-50%,-50%);
    `;
    scene.appendChild(lanternHit);
    lanternHit.addEventListener('click', e => {
      makeRipple(e.clientX, e.clientY, 'rgba(255,180,80,0.5)');
      floatText('warm.', e.clientX, e.clientY - 20, 'rgba(255,200,120,0.8)');
      // Pulse bright
      const glow = document.createElement('div');
      glow.style.cssText = `
        position:fixed; left:${e.clientX}px; top:${e.clientY}px;
        width:80px; height:80px; border-radius:50%; pointer-events:none; z-index:100;
        background:radial-gradient(circle,rgba(255,180,80,0.6),transparent);
        transform:translate(-50%,-50%);
      `;
      document.body.appendChild(glow);
      gsap.to(glow, { scale:2, opacity:0, duration:1.5, ease:'power2.out',
        onComplete:()=>glow.remove() });
    });
  });
}

/* ══════════════════════════════════════════════════
   LAKE INTERACTIONS
══════════════════════════════════════════════════ */
function initLakeInteractions() {
  const scene = document.getElementById('lakeScene');

  // Click water area → ripples
  scene.addEventListener('click', e => {
    if (dialogueOpen) return;
    // Only ripple in lower half (water area)
    if (e.clientY < window.innerHeight * 0.45) return;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => makeRipple(e.clientX, e.clientY,
        `rgba(${160+i*20},${190+i*15},255,${0.4-i*0.1})`), i*200);
    }
  });

  // Click moon reflection (upper center) → shatters and reforms
  const moonHit = document.createElement('div');
  moonHit.style.cssText = `
    position:absolute; top:8%; left:45%; width:12%; height:18%;
    cursor:pointer; z-index:50;
  `;
  scene.appendChild(moonHit);
  moonHit.addEventListener('click', e => {
    floatText('the moon remembers.', e.clientX, e.clientY,
      'rgba(200,220,255,0.8)');
    makeRipple(e.clientX, e.clientY, 'rgba(200,220,255,0.6)');
    // Shatter flash
    gsap.to('#moonGlow', { scale:0.3, opacity:0.1, duration:0.3, ease:'power3.in',
      onComplete:()=> gsap.to('#moonGlow',{scale:1,opacity:1,duration:1.5,ease:'elastic.out(1,0.5)'}) });
  });

  // Hidden memory fragment in reeds (left side)
  const fragment = document.createElement('div');
  fragment.style.cssText = `
    position:absolute; bottom:25%; left:18%;
    width:12px; height:12px; border-radius:50%;
    background:rgba(180,210,255,0.7);
    box-shadow:0 0 14px 5px rgba(160,190,255,0.4);
    cursor:pointer; z-index:50;
    animation:fragmentPulse 3s ease-in-out infinite;
  `;
  scene.appendChild(fragment);
  fragment.addEventListener('click', e => {
    gsap.to(fragment,{scale:0,opacity:0,duration:0.4,onComplete:()=>fragment.remove()});
    showDialogue([
      'The water is very still.',
      'You kneel at the edge.',
      'Your reflection looks older than you expected.',
      'Or perhaps just more honest.',
    ], () => showMemoryPickup('lake', e.clientX, e.clientY));
  });
}

/* ══════════════════════════════════════════════════
   FINAL STATION INTERACTIONS
══════════════════════════════════════════════════ */
function initEndInteractions() {
  const scene = document.getElementById('endScene');

  // Train door — clickable after memories collected
  const door = document.createElement('div');
  door.style.cssText = `
    position:absolute; left:52%; top:35%; width:8%; height:28%;
    cursor:pointer; z-index:50;
    border:1px solid rgba(255,220,170,0); transition:border-color 0.5s;
  `;
  scene.appendChild(door);

  door.addEventListener('mouseenter', () => {
    door.style.borderColor = 'rgba(255,220,170,0.2)';
    floatText('board the train', 
      door.getBoundingClientRect().left + 40,
      door.getBoundingClientRect().top - 10,
      'rgba(255,220,170,0.6)');
  });
  door.addEventListener('mouseleave', () => {
    door.style.borderColor = 'rgba(255,220,170,0)';
  });
  door.addEventListener('click', e => {
    makeRipple(e.clientX, e.clientY, 'rgba(255,220,170,0.4)');
    const collected = Object.values(memories).filter(m=>m.collected).length;
    if (collected < Object.keys(memories).length) {
      showDialogue([
        `You found ${collected} of 4 memories.`,
        'The train will wait a little longer.',
        'Go back and look more carefully.',
      ]);
    } else {
      showDialogue([
        'You step onto the train.',
        'The doors close behind you.',
        'Through the window, you watch the station grow small.',
        'The field. The shrine. The lake.',
        'You carry all of it now.',
        'That is enough.',
      ]);
    }
  });
}

/* ══════════════════════════════════════════════════
   EXPORT — called from main.js scene inits
══════════════════════════════════════════════════ */