# Папа & Доча Cooperation 🌊
**Сайт для завантаження відео та музики з YouTube**

## Що це таке
Статичний сайт на одному HTML-файлі. Не потребує сервера. Ніколи не «засинає». Безкоштовно назавжди.

Використовує:
- **cobalt.tools** — безкоштовний API для завантаження з YouTube
- **ffmpeg.wasm** — нарізка відео прямо в браузері, без сервера
- **File System Access API** — дозволяє тату самому обрати папку збереження

---

## Деплой на Vercel (5 хвилин, безкоштовно)

### 1. Завантаж на GitHub
1. Зайди на [github.com](https://github.com) → New Repository
2. Назви: `papa-downloader`
3. Завантаж `index.html` та `vercel.json`

### 2. Підключи до Vercel
1. Зайди на [vercel.com](https://vercel.com) → New Project
2. Import з GitHub → вибери `papa-downloader`
3. Deploy!

Vercel автоматично застосує `vercel.json` з потрібними заголовками.  
Сайт отримає адресу виду `papa-downloader.vercel.app`

---

## Як оновлювати сайт
1. Відредагуй `index.html` на GitHub прямо в браузері
2. Зроби commit — Vercel автоматично задеплоїть оновлення

---

## Функції
- ✅ Завантаження відео (MP4, WebM) — 360p / 720p / 1080p
- ✅ Завантаження аудіо (MP3, M4A, WAV, OGG) — різна якість
- ✅ Обрізка за часом (ffmpeg.wasm в браузері)
- ✅ Вибір папки збереження (File System Access API)
- ✅ Перейменування файлу
- ✅ Історія завантажень (localStorage)
- ✅ Підказки на кожному кроці
- ✅ Інтерфейс російською для тата

---

## Якщо cobalt.tools перестане працювати
Cobalt — open source проєкт. Якщо їхній публічний API зупиниться, можна:
1. Самостійно задеплоїти cobalt на Koyeb/Railway (є інструкція в їх репо)
2. Або поміняти API URL у рядку `fetch('https://api.cobalt.tools/...')`
