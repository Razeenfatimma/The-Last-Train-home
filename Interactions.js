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
    position:absolute; left:37%; top:12%; width:6%; height:16%;
    cursor:pointer; z-index:50;
  `;
  clock.title = 'the clock';
  document.getElementById('stationScene').appendChild(clock);
  clock.addEventListener('click', e => {
    makeRipple(e.clientX, e.clientY, 'rgba(255,220,170,0.4)');
    floatText('tick.', e.clientX, e.clientY - 30);
    // Clock chime — using Web Audio
    chimeSound();
    showDialogue([
      'The clock says 5:47.',
      'It has said 5:47 for as long as you can remember.',
      'Some things stop moving and nobody notices.',
    ]);
  });

  // Cat appears after 12 seconds of no movement
  let idleTimer = null;
  let catShown  = false;

  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(showCat, 12000);
  }

  function showCat() {
    if (catShown || activeScene !== 'stationScene') return;
    catShown = true;
    const cat = document.createElement('div');
    cat.style.cssText = `
      position:absolute; bottom:28%; left:-60px;
      font-size:28px; z-index:50; cursor:pointer;
      filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    `;
    cat.textContent = '🐱';
    document.getElementById('stationScene').appendChild(cat);
    gsap.to(cat, { x:80, duration:3, ease:'power1.inOut' });
    setTimeout(()=> {
      gsap.to(cat, { opacity:1 });
      // Cat sits and blinks
      gsap.to(cat, { y:-4, duration:1.5, ease:'sine.inOut', yoyo:true, repeat:-1 });
    }, 3000);

    cat.addEventListener('click', e => {
      floatText('...', e.clientX, e.clientY - 20, 'rgba(255,220,200,0.7)');
      showDialogue(["The cat looks at you.", "It knows something you don't.", "It always does."]);
    });

    document.removeEventListener('mousemove', resetIdle);
  }

  document.addEventListener('mousemove', resetIdle);
  resetIdle();
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
window.StationInteractions = initStationInteractions;
window.FieldInteractions   = initFieldInteractions;
window.ShrineInteractions  = initShrineInteractions;
window.LakeInteractions    = initLakeInteractions;
window.EndInteractions     = initEndInteractions;