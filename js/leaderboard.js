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
    return { rank, total: list.length, id: rec.ts };
  }

  // Дозаписать контакт к ранее сохранённой записи (лид после лидерборда)
  function setContact(id, contact) {
    const list = load();
    const rec = list.find(r => r.ts === id);
    if (rec) { rec.contact = contact; persist(list); }
  }

  function top(n = 10) {
    return load().slice(0, n);
  }

  // Сколько очков не хватило до места n (0 если уже в топ-n или мест меньше n)
  function gapToTop(n, score) {
    const list = load();
    if (list.length < n) return 0;
    const nth = list[n - 1].score;
    return Math.max(0, nth - score + 1);
  }

  function clear() { persist([]); }

  return { submit, setContact, top, clear, gapToTop };
})();
