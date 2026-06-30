# Серверный лидерборд (Supabase)

Общая таблица для всех телефонов. Пока ключи не вписаны — игра работает локально
(localStorage), у каждого устройства своя таблица. Заполни ключи — включится общий.

Контакты — персональные данные: записываются всеми, но **публично не читаются**
(защищено правами на колонку + RLS). Видны только тебе в админке Supabase.

---

## 1. Создать проект
1. Зайди на https://supabase.com → Sign up (бесплатно).
2. **New project** → задай имя и пароль БД (пароль БД нам в коде не нужен).
3. Регион — поближе к месту ивента.

## 2. Создать таблицу и права
Открой **SQL Editor** → New query → вставь и выполни:

```sql
create table public.scores (
  id          bigint generated always as identity primary key,
  name        text not null,
  contact     text,
  score       int  not null,
  max_combo   int  default 0,
  accuracy    int  default 0,
  rank        text,
  created_at  timestamptz default now()
);

alter table public.scores enable row level security;

-- кто угодно может записать результат и читать таблицу...
create policy "anon insert" on public.scores for insert to anon with check (true);
create policy "anon select" on public.scores for select to anon using (true);

-- ...но контакт публично НЕ читается (только запись). Организатор видит его в админке.
revoke all on public.scores from anon;
grant insert (name, contact, score, max_combo, accuracy, rank) on public.scores to anon;
grant select (id, name, score, max_combo, accuracy, rank, created_at) on public.scores to anon;
```

## 3. Взять ключи
**Project Settings → API**:
- **Project URL** → это `url` (вид `https://xxxx.supabase.co`)
- **Project API keys → `anon` `public`** → это `anonKey`

> `anon`-ключ можно держать в клиенте — он публичный и ограничен правилами выше.
> НИКОГДА не вставляй `service_role`-ключ в код игры.

## 4. Вписать в игру
В [`js/config.js`](js/config.js):

```js
supabase: {
  url: 'https://xxxx.supabase.co',
  anonKey: 'eyJhbGci...'  // anon public
},
```

Закоммить и запушить — общий лидерборд включится автоматически.

---

## Как организатору забрать лиды (ники + контакты)
- **Table Editor → scores** — все записи с контактами.
- Экспорт: **Table Editor → … → Export to CSV** (или SQL `select name, contact, score, created_at from scores order by score desc;`).

## Сбросить таблицу перед ивентом
В SQL Editor: `truncate public.scores;`

## Заметки
- Антифрод/защита от накрутки на бесплатном уровне минимальна. Для конкурса с
  призами можно добавить серверную валидацию (Edge Function) — отдельная задача.
- Без интернета у устройства запись не пройдёт — игра останется играбельной,
  но место в общий топ не попадёт (показывается сообщение).
