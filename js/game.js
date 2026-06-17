// ===== Dance Promo — игровая логика =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const S = CONFIG.canvas.size;
const CX = S / 2, CY = S / 2;
const root = document.documentElement;

const el = {
  scoreVal:   document.getElementById('scoreVal'),
  bestVal:    document.getElementById('bestVal'),
  comboBox:   document.getElementById('comboBox'),
  comboCount: document.getElementById('comboCount'),
  dancer:     document.getElementById('dancer'),
  dancerImg:  document.getElementById('dancerImg'),
  judgment:   document.getElementById('judgment'),
  floaters:   document.getElementById('floaters'),
  progressBar:document.getElementById('progressBar'),
  overlay:    document.getElementById('overlay'),
  startModal: document.getElementById('startModal'),
  endModal:   document.getElementById('endModal'),
  endTitle:   document.getElementById('endTitle'),
  endStory:   document.getElementById('endStory'),
  finalScore: document.getElementById('finalScore'),
};

const DIRS = ['up', 'down', 'left', 'right'];
const startDist = S / 2 + CONFIG.arrow.size;
const PERFECT_WINDOW = 14; // |d-R| для «Perfect»

let state, effects;

// --- Спрайты танцора: предзагрузка кадров и анимация ---
const dancerFrames = {};   // mood -> [Image, ...]
let curMood = 'idle', frameIdx = 0, frameAcc = 0, lastDancerT = 0;

function pad3(n) { return String(n).padStart(3, '0'); }
function preloadDancer() {
  const { basePath, sprites } = CONFIG.dancer;
  for (const mood in sprites) {
    dancerFrames[mood] = [];
    for (let i = 1; i <= sprites[mood].frames; i++) {
      const img = new Image();
      img.src = `${basePath}/${mood}/dancer_${mood}_${pad3(i)}.png`;
      dancerFrames[mood].push(img);
    }
  }
}

function setDancerMood(mood) {
  if (mood === curMood) return;
  curMood = mood;
  frameIdx = 0; frameAcc = 0;
  el.dancer.dataset.mood = mood;
}

function animateDancer(now) {
  const dt = lastDancerT ? (now - lastDancerT) / 1000 : 0;
  lastDancerT = now;
  const frames = dancerFrames[curMood];
  if (frames && frames.length) {
    frameAcc += dt;
    const spf = 1 / CONFIG.dancer.sprites[curMood].fps;
    while (frameAcc >= spf) { frameAcc -= spf; frameIdx = (frameIdx + 1) % frames.length; }
    const src = frames[frameIdx].src;
    if (el.dancerImg.src !== src) el.dancerImg.src = src;
  }
  requestAnimationFrame(animateDancer);
}

function freshState() {
  return {
    running: false, score: 0, combo: 0, maxCombo: 0,
    arrows: [], spawnInterval: CONFIG.spawn.start,
    lastSpawn: 0, startTime: 0, lastFrame: 0,
  };
}
state = freshState();
effects = { pulses: [], particles: [], shake: 0 };

// --- Спавн ---
function spawnArrow() {
  const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
  state.arrows.push({ dir, d: startDist, hit: false, dead: false });
}

function arrowPos(a) {
  switch (a.dir) {
    case 'up':    return { x: CX,       y: CY - a.d };
    case 'down':  return { x: CX,       y: CY + a.d };
    case 'left':  return { x: CX - a.d, y: CY };
    case 'right': return { x: CX + a.d, y: CY };
  }
}

// --- Ввод ---
function pressDir(dir) {
  flashButton(dir);
  if (!state.running) return;
  const R = CONFIG.target.radius;
  let best = null, bestErr = Infinity;
  for (const a of state.arrows) {
    if (a.dir !== dir || a.hit || a.dead) continue;
    const err = Math.abs(a.d - R);
    if (err <= CONFIG.hitWindow && err < bestErr) { best = a; bestErr = err; }
  }
  if (best) {
    best.hit = true; best.dead = true;
    registerHit(best, bestErr);
  }
}

function registerHit(arrow, err) {
  const perfect = err <= PERFECT_WINDOW;
  state.combo += 1;
  state.maxCombo = Math.max(state.maxCombo, state.combo);

  const tier = CONFIG.scoreTiers.find(t => state.combo <= t.combo);
  const pts = Math.round(tier.points * (perfect ? 1 : 0.6));
  state.score += pts;

  const color = CONFIG.dirColors[arrow.dir];
  const p = arrowPos({ dir: arrow.dir, d: CONFIG.target.radius });
  effects.pulses.push({ color, t: 0 });
  spawnParticles(p.x, p.y, color, perfect ? 10 : 6);
  showJudgment(perfect ? 'perfect' : 'good', perfect ? 'PERFECT' : 'GOOD');
  spawnFloater('+' + pts, perfect ? '#6effb0' : '#ffd166', p.x, p.y);

  if (state.combo > 1 && state.combo % 10 === 0) effects.shake = 8; // тряска на круглых комбо

  updateHud();
  updateDancer();
}

function registerMiss() {
  state.combo = 0;
  showJudgment('miss', 'МИМО');
  updateHud();
  setDancerMood('miss');
  setTimeout(() => { if (state.running) updateDancer(); }, 400);
}

// --- HUD / танцор ---
function updateHud() {
  el.scoreVal.textContent = state.score;
  el.bestVal.textContent = state.maxCombo;
  if (state.combo > 1) {
    el.comboBox.classList.remove('hidden');
    el.comboCount.textContent = state.combo;
    el.comboBox.classList.remove('bump'); void el.comboBox.offsetWidth;
    el.comboBox.classList.add('bump');
  } else {
    el.comboBox.classList.add('hidden');
  }
  // энергия танцпола 0..1 по комбо (насыщается к 40)
  root.style.setProperty('--energy', Math.min(1, state.combo / 40).toFixed(3));
}

function updateDancer() {
  let mood = 'idle';
  for (const m of CONFIG.moods) if (state.combo >= m.combo) mood = m.mood;
  setDancerMood(mood);
}

let judgeTimer;
function showJudgment(cls, text) {
  el.judgment.textContent = text;
  el.judgment.className = '';
  void el.judgment.offsetWidth;
  el.judgment.className = cls + ' show';
}

function spawnFloater(text, color, x, y) {
  const f = document.createElement('div');
  f.className = 'floater';
  f.textContent = text;
  f.style.color = color;
  f.style.left = (x / S * 100) + '%';
  f.style.top = (y / S * 100) + '%';
  el.floaters.appendChild(f);
  setTimeout(() => f.remove(), 750);
}

function flashButton(dir) {
  const btn = document.querySelector(`.dirBtn[data-dir="${dir}"]`);
  if (!btn) return;
  btn.classList.add('active');
  setTimeout(() => btn.classList.remove('active'), 110);
}

// --- Партиклы ---
function spawnParticles(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 60 + Math.random() * 140;
    effects.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 1, color, size: 2 + Math.random() * 3,
    });
  }
}

// --- Отрисовка ---
function drawTargets() {
  const R = CONFIG.target.radius;
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.stroke();
  for (const dir of DIRS) {
    const p = arrowPos({ dir, d: R });
    drawArrowGlyph(p.x, p.y, dir, CONFIG.dirColors[dir], 0.28);
  }
}

function drawArrowGlyph(x, y, dir, color, alpha) {
  const s = CONFIG.arrow.size;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  const rot = { up: Math.PI, down: 0, left: Math.PI / 2, right: -Math.PI / 2 }[dir];
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.4);
  ctx.lineTo(-s * 0.38, -s * 0.28);
  ctx.lineTo(s * 0.38, -s * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawEffects(dt) {
  const R = CONFIG.target.radius;
  // пульсы кольца
  effects.pulses = effects.pulses.filter(p => p.t < 1);
  for (const p of effects.pulses) {
    p.t += dt * 2.4;
    ctx.save();
    ctx.globalAlpha = (1 - p.t) * 0.8;
    ctx.lineWidth = 3;
    ctx.strokeStyle = p.color;
    ctx.beginPath();
    ctx.arc(CX, CY, R + p.t * 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // партиклы
  effects.particles = effects.particles.filter(pt => pt.life > 0);
  for (const pt of effects.particles) {
    pt.x += pt.vx * dt; pt.y += pt.vy * dt;
    pt.vx *= 0.94; pt.vy *= 0.94;
    pt.life -= dt * 1.8;
    ctx.save();
    ctx.globalAlpha = Math.max(0, pt.life);
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function render(dt) {
  ctx.clearRect(0, 0, S, S);
  drawTargets();
  for (const a of state.arrows) {
    if (a.dead) continue;
    const p = arrowPos(a);
    drawArrowGlyph(p.x, p.y, a.dir, CONFIG.dirColors[a.dir], 1);
  }
  drawEffects(dt);
}

// --- Тряска ---
function applyShake() {
  if (effects.shake > 0.2) {
    effects.shake *= 0.86;
    root.style.setProperty('--shake', ((Math.random() - 0.5) * effects.shake).toFixed(2) + 'px');
  } else {
    root.style.setProperty('--shake', '0px');
  }
}

// --- Главный цикл ---
function loop(now) {
  if (!state.running) return;
  const dt = Math.min(0.05, (now - state.lastFrame) / 1000);
  state.lastFrame = now;

  if (now - state.lastSpawn >= state.spawnInterval) {
    spawnArrow();
    state.lastSpawn = now;
    state.spawnInterval = Math.max(CONFIG.spawn.min, state.spawnInterval * CONFIG.spawn.ramp);
  }

  const R = CONFIG.target.radius;
  for (const a of state.arrows) {
    if (a.dead) continue;
    a.d -= CONFIG.arrow.speed * dt;
    if (a.d < R - CONFIG.hitWindow) { a.dead = true; registerMiss(); }
  }
  state.arrows = state.arrows.filter(a => !a.dead);

  render(dt);
  applyShake();

  const elapsed = now - state.startTime;
  el.progressBar.style.width = Math.min(100, elapsed / CONFIG.trackDuration * 100) + '%';
  if (elapsed >= CONFIG.trackDuration) { endGame(); return; }
  requestAnimationFrame(loop);
}

// --- Жизненный цикл ---
function startGame() {
  state = freshState();
  state.running = true;
  const t = performance.now();
  state.lastSpawn = t; state.startTime = t; state.lastFrame = t;
  effects = { pulses: [], particles: [], shake: 0 };
  root.style.setProperty('--energy', '0');
  el.floaters.innerHTML = '';
  el.overlay.classList.add('hidden');
  el.startModal.classList.add('hidden');
  el.endModal.classList.add('hidden');
  updateHud();
  updateDancer();
  requestAnimationFrame(loop);
}

function endGame() {
  state.running = false;
  root.style.setProperty('--energy', '0');
  root.style.setProperty('--shake', '0px');
  const e = CONFIG.endings.slice().reverse().find(x => state.score >= x.min) || CONFIG.endings[0];
  el.endTitle.textContent = e.title;
  el.endStory.textContent = e.story;
  el.finalScore.innerHTML = `Очки: <b>${state.score}</b> · макс. комбо: <b>${state.maxCombo}</b>`;
  el.overlay.classList.remove('hidden');
  el.endModal.classList.remove('hidden');
}

// --- Слушатели ---
document.getElementById('startBtn').onclick = startGame;
document.getElementById('againBtn').onclick = startGame;

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const dir = CONFIG.keyMap[e.key];
  if (dir) { e.preventDefault(); pressDir(dir); }
});

document.querySelectorAll('.dirBtn').forEach(btn => {
  const dir = btn.dataset.dir;
  const fire = (ev) => { ev.preventDefault(); pressDir(dir); };
  btn.addEventListener('touchstart', fire, { passive: false });
  btn.addEventListener('mousedown', fire);
});

preloadDancer();
updateDancer();
requestAnimationFrame(animateDancer);
render(0);
