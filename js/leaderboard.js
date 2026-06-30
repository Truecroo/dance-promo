// ===== Лидерборд =====
// Два адаптера за единым async-интерфейсом:
//   submit(entry) -> { rank, total, id }
//   top(n)        -> [{ name, score, maxCombo, accuracy, rank }, ...]
//   gapToTop(n, score) -> number
//   clear()       -> только локально
// Если в CONFIG.supabase заданы url+anonKey — работаем с сервером, иначе localStorage.
const Leaderboard = (() => {
  const SB = CONFIG.supabase || {};
  const remote = !!(SB.url && SB.anonKey);

  // ---------- LOCAL (localStorage) ----------
  const KEY = 'dancePromo.leaderboard.v1';
  const MAX = 50;
  const loadLocal = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const saveLocal = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} };

  const local = {
    remote: false,
    async submit(entry) {
      const list = loadLocal();
      const rec = { ...entry, ts: Date.now() };
      list.push(rec);
      list.sort((a, b) => b.score - a.score || b.maxCombo - a.maxCombo);
      const rank = list.indexOf(rec) + 1;
      saveLocal(list.slice(0, MAX));
      return { rank, total: list.length, id: rec.ts };
    },
    async top(n = 10) { return loadLocal().slice(0, n); },
    async gapToTop(n, score) {
      const list = loadLocal();
      if (list.length < n) return 0;
      return Math.max(0, list[n - 1].score - score + 1);
    },
    clear() { saveLocal([]); },
  };

  // ---------- REMOTE (Supabase REST) ----------
  const base = `${SB.url}/rest/v1/scores`;
  const headers = {
    'apikey': SB.anonKey,
    'Authorization': `Bearer ${SB.anonKey}`,
    'Content-Type': 'application/json',
  };

  async function count(filter = '') {
    const res = await fetch(`${base}?select=id${filter}`, {
      headers: { ...headers, 'Prefer': 'count=exact', 'Range-Unit': 'items', 'Range': '0-0' },
    });
    const cr = res.headers.get('content-range') || '*/0'; // вид "0-0/123"
    return parseInt(cr.split('/')[1], 10) || 0;
  }

  const remoteApi = {
    remote: true,
    async submit(entry) {
      await fetch(base, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          name: entry.name, contact: entry.contact || null,
          score: entry.score, max_combo: entry.maxCombo,
          accuracy: entry.accuracy, rank: entry.rank,
        }),
      });
      const total = await count();
      const higher = await count(`&score=gt.${entry.score}`);
      return { rank: higher + 1, total, id: null };
    },
    async top(n = 10) {
      const res = await fetch(
        `${base}?select=name,score,max_combo,accuracy,rank&order=score.desc,max_combo.desc&limit=${n}`,
        { headers });
      if (!res.ok) throw new Error('lb top failed');
      const rows = await res.json();
      return rows.map(r => ({ name: r.name, score: r.score, maxCombo: r.max_combo, accuracy: r.accuracy, rank: r.rank }));
    },
    async gapToTop(n, score) {
      const res = await fetch(`${base}?select=score&order=score.desc&offset=${n - 1}&limit=1`, { headers });
      if (!res.ok) return 0;
      const rows = await res.json();
      if (!rows.length) return 0;
      return Math.max(0, rows[0].score - score + 1);
    },
    clear() { /* серверный лидерборд чистится только организатором из админки */ },
  };

  return remote ? remoteApi : local;
})();
