// ===== Звук-плейсхолдер: процедурный бит на WebAudio =====
// Даёт слышимый ритм без аудио-файла. Когда появится реальный трек —
// заменим на <audio>, оставив тот же интерфейс (kick/hat/hit/perfect/miss).
const Sound = (() => {
  let ctx = null, master = null, enabled = true;

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function setMuted(m) { enabled = !m; }

  // Бочка: синус с быстрым спадом высоты и громкости
  function kick(t = 0) {
    if (!enabled || !ctx) return;
    const now = ctx.currentTime + t;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, now);
    o.frequency.exponentialRampToValueAtTime(50, now + 0.12);
    g.gain.setValueAtTime(0.9, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    o.connect(g); g.connect(master);
    o.start(now); o.stop(now + 0.2);
  }

  // Хэт: короткий всплеск шума через хайпас
  function hat(t = 0) {
    if (!enabled || !ctx) return;
    const now = ctx.currentTime + t;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = ctx.createGain(); g.gain.value = 0.25;
    src.connect(hp); hp.connect(g); g.connect(master);
    src.start(now);
  }

  // Короткий тон для фидбэка
  function blip(freq, dur, vol) {
    if (!enabled || !ctx) return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.connect(g); g.connect(master);
    o.start(now); o.stop(now + dur);
  }

  const hit     = () => blip(660, 0.12, 0.3);
  const perfect = () => { blip(880, 0.10, 0.3); blip(1320, 0.12, 0.2); };
  const miss    = () => blip(160, 0.18, 0.3);

  return { ensure, setMuted, kick, hat, hit, perfect, miss };
})();
