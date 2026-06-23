// ===== Конфиг игры — всё, что меняется под ивент, держим здесь =====
const CONFIG = {
  // Геометрия поля
  canvas: { size: 480 },
  target: { radius: 104 },    // радиус центральной зоны попадания (в px)
  arrow:  { size: 54, speed: 200 }, // px в секунду к центру

  hitWindow: 34,  // допуск по расстоянию до центра для засчёта (px)

  // Длительность одного «трека» (мс). Заменим на длину реальной музыки.
  trackDuration: 60000,

  // Ритм: спавн стрелок завязан на бит. BPM заменим на BPM реального трека.
  beat: {
    bpm: 120,
    // Плотность спавна по фазам трека (доля времени 0..1 -> сколько долей на спавн).
    // every: 2 — спавн на каждый 2-й полубит; 1 — каждый полубит (плотно).
    phases: [
      { until: 0.25, everyHalfBeats: 4 }, // разогрев — редко
      { until: 0.55, everyHalfBeats: 2 }, // на каждый бит
      { until: 0.85, everyHalfBeats: 1 }, // + офф-биты
      { until: 1.01, everyHalfBeats: 1, doubles: true }, // финал — гуще
    ],
  },

  // Энергия (здоровье). Мажешь — падает, попадаешь — растёт. 0 -> провал.
  energy: {
    start: 60, max: 100,
    missCost: 14, hitGain: 4, perfectGain: 7,
  },

  // Очки в зависимости от текущего комбо
  scoreTiers: [
    { combo: 10,  points: 50 },
    { combo: 25,  points: 75 },
    { combo: 50,  points: 100 },
    { combo: 100, points: 150 },
    { combo: Infinity, points: 200 },
  ],

  // Настроение танцора по уровню комбо (порог -> класс)
  moods: [
    { combo: 0,  mood: 'idle'  },
    { combo: 1,  mood: 'warm'  },
    { combo: 8,  mood: 'groove'},
    { combo: 20, mood: 'fire'  },
    { combo: 40, mood: 'star'  },
  ],

  // Спрайт-анимации танцора (halo pack). frames — число кадров, fps — скорость цикла.
  dancer: {
    basePath: 'assets/dancer',
    // w — ширина отображения (px). Подобрана так, чтобы рост персонажа был
    // одинаковым во всех настроениях (кадры обрезаны под контент по-разному).
    sprites: {
      idle:   { frames: 6,  fps: 3,  w: 157 },
      warm:   { frames: 6,  fps: 4,  w: 143 },
      groove: { frames: 8,  fps: 6,  w: 158 },
      fire:   { frames: 8,  fps: 8,  w: 162 },
      star:   { frames: 10, fps: 10, w: 168 },
      miss:   { frames: 4,  fps: 8,  w: 156 },
    },
  },

  // Цвета стрелок по направлению (плейсхолдер вместо картинок)
  dirColors: {
    up:    '#ff5a8a',
    down:  '#4ad6ff',
    left:  '#ffd23f',
    right: '#7c5cff',
  },

  // Клавиатура -> направление
  keyMap: {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  },

  // Финальные тексты по результату (порог очков -> текст)
  endings: [
    { min: 0,    title: 'НУ... БЫЛО',     story: 'Герой потоптался и ушёл за лимонадом. Зато попробовал!' },
    { min: 1500, title: 'ОГОНЬ!',         story: 'Толпа завелась, кто-то снял сторис. Неплохой выход!' },
    { min: 4000, title: 'ЗВЕЗДА ВЕЧЕРА',  story: 'Диджей дал отдельный трек. Герой ушёл под овации.' },
  ],
};
