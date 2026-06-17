# Dance Promo — промпты для генерации ассетов

Готовые промпты под все ассеты из [`ASSETS.md`](ASSETS.md).
Промпты на английском (модели понимают лучше). После каждого — рус. пометка.

**Общий стиль-якорь** (добавляй к любому визуальному промпту):
> `clean minimalist game art, dark nightclub palette, single hot-pink accent (#ff4d7d), soft neon glow, flat vector with subtle gradients, crisp silhouette readable on dark background, transparent background, centered, high detail, no text, no watermark`

**Negative (для SD/Flux):**
> `text, letters, watermark, signature, frame, border, busy background, photo, realistic skin pores, low contrast, jpeg artifacts, extra limbs, blurry`

> ⚠️ Для спрайт-анимации генераторы дают непостоянного персонажа. Лучшая практика:
> сначала зафиксируй **референс персонажа** (один сид/одно изображение), потом гоняй
> позы с тем же сидом / image-to-image, либо отдай дизайнеру как мудборд.

---

## 1. Танцор 🔴

Сначала — единый референс, затем позы по настроениям.

### 1.0 Референс персонажа (зафиксировать первым)
```
Full-body character reference of a stylish young dancer for a rhythm game mascot,
gender-neutral cool vibe, simple modern streetwear (hoodie, sneakers, joggers),
expressive but minimalist features, clean vector illustration, front view,
neutral standing pose, dark studio background, single hot-pink rim light (#ff4d7d),
consistent design suitable for sprite sheet, full body visible, centered
```
🇷🇺 База персонажа — фиксируем сид/картинку, дальше все позы с тем же сидом.

### 1.1 idle (комбо 0)
```
<persona> standing idle, bored, weight on one leg, slight head tilt, minimal motion,
relaxed arms, waiting to dance, clean vector, dark background, soft pink rim light,
transparent background, full body, centered
```
🇷🇺 Стоит, скучает. Атлас `dancer_idle.png`, 4–6 кадров лёгкого покачивания.

### 1.2 warm (комбо 1–7)
```
<persona> starting to move, light bounce, tapping foot, subtle groove, slight smile,
loosening up, clean vector, dark background, pink rim light, transparent, full body
```
🇷🇺 Раскачивается. `dancer_warm.png`, 6 кадров.

### 1.3 groove (комбо 8–19)
```
<persona> confident dance move, body in rhythm, arms swinging, mid-step, dynamic pose,
enjoying the beat, motion energy, clean vector, dark background, pink glow, transparent
```
🇷🇺 Уверенный танец. `dancer_groove.png`, 8 кадров.

### 1.4 fire (комбо 20–39)
```
<persona> energetic dance, big expressive move, jumping or spinning step, arms up,
intense groove, sparks of energy around feet, warm orange-pink glow accent,
clean vector, dark background, transparent, full body, centered
```
🇷🇺 Зажигает. `dancer_fire.png`, 8 кадров. Можно искры у ног.

### 1.5 star (комбо 40+)
```
<persona> superstar dance pose, dramatic spin, glowing aura, confetti and sparkles,
spotlight on character, radiant hot-pink and gold glow, peak performance,
clean vector, dark background, transparent, full body, centered, epic
```
🇷🇺 Звезда вечера. `dancer_star.png`, 10–12 кадров, ореол/искры.

### 1.6 miss (вспышка при промахе)
```
<persona> stumbling, off-balance, surprised expression, tripped on the beat,
arms flailing slightly, brief comedic miss pose, clean vector, dark background,
desaturated red tint, transparent, full body
```
🇷🇺 Споткнулся. `dancer_miss.png`, 4 кадра.

---

## 2. Стрелки 🔴

### 2.1 Базовая (вариант A — одна, поворот кодом)
```
Single minimalist game arrow pointing up, thick rounded triangle shape, glossy flat
fill with subtle gradient, soft outer neon glow, crisp edge, transparent background,
centered, icon style, no text
```
🇷🇺 `arrow.png`, 128×128, остриём вверх.

### 2.2 Цветные по направлениям (вариант B)
Тот же промпт, меняй цвет и направление:
- up → `... pointing up, hot-pink (#ff5a8a) fill and glow ...` → `arrow_up.png`
- down → `... pointing down, cyan (#4ad6ff) fill and glow ...` → `arrow_down.png`
- left → `... pointing left, yellow (#ffd23f) fill and glow ...` → `arrow_left.png`
- right → `... pointing right, violet (#7c5cff) fill and glow ...` → `arrow_right.png`

### 2.3 Hit/perfect glow (опц.)
```
Same arrow shape but brightly illuminated, intense white-hot core, strong bloom glow,
energized hit state, transparent background, centered
```
🇷🇺 `arrow_<dir>_glow.png` — вспышка при попадании.

---

## 3. Кольцо-приёмник и пульс 🟡

### 3.1 Кольцо-приёмник
```
Minimalist circular target ring for a rhythm game, thin glowing outline, subtle
double ring, semi-transparent, soft neon edge, clean geometric, dark background,
transparent background, centered, top-down view, no text
```
🇷🇺 `target_ring.png`, внешний Ø ~200.

### 3.2 Пульс попадания
```
Expanding glowing ring shockwave, single thin bright circle, energy ripple, neon glow,
fading edges, transparent background, centered
```
🇷🇺 `target_pulse.png` — масштабируется и гаснет кодом.

### 3.3 Гнёзда приёмника (опц.)
```
Outlined arrow receiver slot pointing up, hollow thin neon contour of an arrow,
docking target marker, semi-transparent, transparent background, centered
```
🇷🇺 `receiver_<dir>.png` ×4 (поворот/цвет как у стрелок).

---

## 4. Фон сцены 🟡

### 4.1 Задник
```
Vertical nightclub dance stage background, 9:16, dark moody venue, light beams and
spotlights from above, hint of a DJ booth, depth and atmosphere, calm uncluttered
center area for gameplay, deep purple and pink neon ambiance, cinematic, no text,
no characters
```
🇷🇺 `bg_stage.jpg`, 1080×1920. Центр — спокойный.

### 4.2 Силуэты толпы
```
Silhouettes of a cheering crowd at a concert, black backlit shapes, raised hands,
horizontal strip composition, transparent background above the crowd line, neon
backlight rim, no faces, no text
```
🇷🇺 `bg_crowd.png`, 1080×~400. Для движения — 2–3 кадра.

### 4.3 Свет-подиум
```
Soft glowing light pool on a dark floor, elliptical spotlight from above, hot-pink
radial glow fading to transparent, top-down, transparent background, centered
```
🇷🇺 `floor_glow.png`, 256×80.

---

## 5. Эффекты 🟢

### 5.1 Партикл
```
Small glowing spark particle, simple four-point star / soft dot, bright center, neon
bloom, transparent background, centered, tiny icon
```
🇷🇺 `particle.png`, 32×32 (можно 2–3 вариации).

### 5.2 Perfect-вспышка
```
Burst of light for a perfect hit, radial star flare with sparkles, white-green and
hot-pink glow, energetic, transparent background, centered
```
🇷🇺 `spark_perfect.png`, 128×128.

### 5.3 Луч прожектора
```
Vertical spotlight light beam, volumetric cone of light, soft neon gradient, fading
edges, transparent background, top-down origin
```
🇷🇺 `beam_light.png`, 256×512 (опц.).

### 5.4 Конфетти
```
Colorful confetti pieces scattered, small rectangles and ribbons, festive neon palette,
motion variety, transparent background, sprite sheet of falling confetti frames
```
🇷🇺 `confetti.png` — атлас 8–12 кадров (финал/большое комбо, опц.).

---

## 6. UI 🟢

### 6.1 Тач-кнопки направлений
```
Minimalist rounded square game button, glassmorphism, semi-transparent dark fill,
thin light border, soft inner glow, a clean arrow glyph pointing up centered on it,
mobile UI, transparent background, centered, no text
```
🇷🇺 `btn_up.png` (и down/left/right — меняй направление стрелки), 140×140.
Активное состояние сделаю кодом (или сгенерь `btn_<dir>_active.png` с pink-заливкой).

### 6.2 Иконки HUD (опц.)
```
Tiny minimalist line icon of <a flame for combo / a star for score>, single hot-pink
accent, clean, transparent background, centered, 48px icon
```
🇷🇺 `icon_combo.png`, `icon_score.png`.

### 6.3 Подложка модалки (опц.)
```
Minimalist modal panel background, rounded rectangle, dark gradient (#1c1c27 to
#14141c), thin subtle border, soft shadow, glassmorphism, transparent outside, no text
```
🇷🇺 `panel_modal.png` (или 9-slice).

---

## 7. Звук 🟡 (для Suno / Udio / ElevenLabs SFX и т.п.)

### 7.1 Музыка трека
```
Upbeat energetic electronic dance track, 4-on-the-floor beat, catchy synth hook,
club / festival vibe, fun and danceable, building energy, looping-friendly,
instrumental, 120–128 BPM, ~60 seconds
```
🇷🇺 `track.mp3`. Скажи итоговый **BPM** — завяжу спавн стрелок в такт.

### 7.2 SFX
- `sfx_hit.mp3` → `short bright UI tap / pluck sound, satisfying rhythm-game hit, clean, <0.4s`
- `sfx_perfect.mp3` → `sparkly rewarding chime, bright ascending blip, perfect-hit feedback, <0.5s`
- `sfx_miss.mp3` → `soft dull thud / error buzz, gentle negative feedback, not harsh, <0.4s`
- `sfx_combo.mp3` → `rising energetic riser / power-up sweep for combo milestone, <0.8s`
- `sfx_finish.mp3` → `crowd cheering and applause with a triumphant musical sting, ~2s`

🇷🇺 Короткие, нормализованные по громкости.

---

## 8. Брендинг (если Xsolla)

Логотип не генерируем — берём готовый `logo.svg` + фирменные hex/шрифт.
Если нужна стилизация под бренд — добавь в стиль-якорь нужный accent-цвет вместо
`#ff4d7d` и перегенери стрелки/эффекты в этой палитре.

---

## Порядок генерации (рекомендация)

1. Зафиксируй **референс танцора** (1.0) — один сид/картинка.
2. Прогони **6 поз** (1.1–1.6) с тем же сидом → сведи в спрайт-листы.
3. **Стрелки** (2.2) — 4 цвета.
4. **Фон** (4.1) + **floor_glow** (4.3).
5. **Партикл** (5.1) + **target_pulse** (3.2).
6. **Звук** (7) — трек + 3 базовых SFX.
7. Остальное (UI, толпа, конфетти, лучи) — по желанию.

Как будут файлы — пришли список с числом кадров на атлас, подключу в `config.js`.
