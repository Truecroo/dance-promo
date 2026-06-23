// ===== Лидерборд =====
// Абстракция над хранилищем. Сейчас — localStorage. Чтобы перейти на сервер,
// достаточно заменить тело методов на fetch к API (интерфейс не меняется).
const Leaderboard = (() => {
  const KEY = 'dancePromo.leaderboard.v1';
  const MAX = 50; // храним больше, показываем топ-N

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function persist(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  }

  // entry: { name, contact, score, maxCombo, accuracy }
  // Возвращает { rank, total } — место (1-based) среди всех результатов.
  function submit(entry) {
    const list = load();
    const rec = { ...entry, ts: Date.now() };
    list.push(rec);
    list.sort((a, b) => b.score - a.score || b.maxCombo - a.maxCombo);
    const rank = list.indexOf(rec) + 1;
    persist(list.slice(0, MAX));
    return { rank, total: list.length };
  }

  function top(n = 10) {
    return load().slice(0, n);
  }

  function clear() { persist([]); }

  return { submit, top, clear };
})();
