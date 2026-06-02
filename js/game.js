// ===== Dance Promo — игровая логика =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const S = CONFIG.canvas.size;
const CX = S / 2, CY = S / 2;

const el = {
  score:      document.getElementById('score'),
  combo:      document.getElementById('combo'),
  comboCount: document.getElementById('comboCount'),
  dancer:     document.getElementById('dancer'),
  feedback:   document.getElementById('hitFeedback'),
  overlay:    document.getElementById('overlay'),
  startModal: document.getElementById('startModal'),
  endModal:   document.getElementById('endModal'),
  endTitle:   document.getElementById('endTitle'),
  endStory:   document.getElementById('endStory'),
  finalScore: document.getElementById('finalScore'),
};

const DIRS = ['up', 'down', 'left', 'right'];
const startDist = S / 2 + CONFIG.arrow.size; // стартовое расстояние от центра (за кадром)

let state = {
  running: false,
  score: 0,
  combo: 0,
  maxCombo: 0,
  arrows: [],
  spawnInterval: CONFIG.spawn.start,
  lastSpawn: 0,
  startTime: 0,
  lastFrame: 0,
};

// --- Спавн стрелок ---
function spawnArrow() {
  const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
  state.arrows.push({ dir, d: startDist, hit: false, dead: false });
}

// Координаты стрелки по её направлению и расстоянию d от центра
function arrowPos(a) {
  switch (a.dir) {
    case 'up':    return { x: CX,     y: CY - a.d };
    case 'down':  return { x: CX,     y: CY + a.d };
    case 'left':  return { x: CX - a.d, y: CY };
    case 'right': return { x: CX + a.d, y: CY };
  }
}

// --- Ввод ---
function pressDir(dir) {
  if (!state.running) return;
  const R = CONFIG.target.radius;
  // ближайшая нестукнутая стрелка нужного направления в окне попадания
  let best = null;
  for (const a of state.arrows) {
    if (a.dir !== dir || a.hit || a.dead) continue;
    if (Math.abs(a.d - R) <= CONFIG.hitWindow) {
      if (!best || Math.abs(a.d - R) < Math.abs(best.d - R)) best = a;
    }
  }
  if (best) {
    best.hit = true;
    best.dead = true;
    registerHit();
  }
  flashButton(dir);
}

function registerHit() {
  state.combo += 1;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  // очки по тиру комбо
  const tier = CONFIG.scoreTiers.find(t => state.combo <= t.combo);
  state.score += tier.points;
  showFeedback('+' + tier.points, true);
  updateHud();
  updateDancer();
}

function registerMiss() {
  state.combo = 0;
  showFeedback('мимо', false);
  updateHud();
  updateDancer();
  el.dancer.dataset.mood = 'miss';
  setTimeout(() => { if (state.running) updateDancer(); }, 350);
}

// --- HUD / танцор ---
function updateHud() {
  el.score.textContent = 'Очки: ' + state.score;
  if (state.combo > 1) {
    el.combo.classList.remove('hidden');
    el.comboCount.textContent = state.combo;
  } else {
    el.combo.classList.add('hidden');
  }
}

function updateDancer() {
  let mood = 'idle';
  for (const m of CONFIG.moods) if (state.combo >= m.combo) mood = m.mood;
  el.dancer.dataset.mood = mood;
  el.dancer.textContent = CONFIG.dancerSprite[mood];
}

let feedbackTimer;
function showFeedback(text, good) {
  el.feedback.textContent = text;
  el.feedback.className = good ? 'good show' : 'bad show';
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => el.feedback.classList.remove('show'), 400);
}

function flashButton(dir) {
  const btn = document.querySelector(`.dirBtn[data-dir="${dir}"]`);
  if (!btn) return;
  btn.classList.add('active');
  setTimeout(() => btn.classList.remove('active'), 120);
}

// --- Отрисовка ---
function drawTargets() {
  const R = CONFIG.target.radius;
  // кольцо-зона
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.stroke();
  // метки приёмников по 4 сторонам
  for (const dir of DIRS) {
    const p = arrowPos({ dir, d: R });
    drawArrowGlyph(p.x, p.y, dir, CONFIG.dirColors[dir], 0.35);
  }
}

function drawArrowGlyph(x, y, dir, color, alpha) {
  const s = CONFIG.arrow.size;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  // повернуть треугольник остриём к центру
  const rot = { up: Math.PI, down: 0, left: Math.PI / 2, right: -Math.PI / 2 }[dir];
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.4);
  ctx.lineTo(-s * 0.4, -s * 0.3);
  ctx.lineTo(s * 0.4, -s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, S, S);
  drawTargets();
  for (const a of state.arrows) {
    const p = arrowPos(a);
    drawArrowGlyph(p.x, p.y, a.dir, CONFIG.dirColors[a.dir], 1);
  }
}

// --- Главный цикл ---
function loop(now) {
  if (!state.running) return;
  const dt = (now - state.lastFrame) / 1000;
  state.lastFrame = now;

  // спавн
  if (now - state.lastSpawn >= state.spawnInterval) {
    spawnArrow();
    state.lastSpawn = now;
    state.spawnInterval = Math.max(CONFIG.spawn.min, state.spawnInterval * CONFIG.spawn.ramp);
  }

  // движение + промахи
  const R = CONFIG.target.radius;
  for (const a of state.arrows) {
    if (a.dead) continue;
    a.d -= CONFIG.arrow.speed * dt;
    if (a.d < R - CONFIG.hitWindow) { // проскочила зону
      a.dead = true;
      registerMiss();
    }
  }
  state.arrows = state.arrows.filter(a => !a.dead || a.d > R - CONFIG.hitWindow - 4);
  state.arrows = state.arrows.filter(a => a.d > -CONFIG.arrow.size);

  render();

  if (now - state.startTime >= CONFIG.trackDuration) { endGame(); return; }
  requestAnimationFrame(loop);
}

// --- Управление жизненным циклом ---
function startGame() {
  state = {
    running: true, score: 0, combo: 0, maxCombo: 0,
    arrows: [], spawnInterval: CONFIG.spawn.start,
    lastSpawn: performance.now(), startTime: performance.now(),
    lastFrame: performance.now(),
  };
  el.overlay.classList.add('hidden');
  el.startModal.classList.add('hidden');
  el.endModal.classList.add('hidden');
  updateHud();
  updateDancer();
  requestAnimationFrame(loop);
}

function endGame() {
  state.running = false;
  const e = CONFIG.endings.slice().reverse().find(x => state.score >= x.min) || CONFIG.endings[0];
  el.endTitle.textContent = e.title;
  el.endStory.textContent = e.story;
  el.finalScore.innerHTML = `Очки: <b>${state.score}</b> &nbsp;•&nbsp; макс. комбо: <b>${state.maxCombo}</b>`;
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

// первичная отрисовка фона
render();
