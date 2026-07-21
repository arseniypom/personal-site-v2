# personal-website

Личный сайт-визитка на Next.js + страница про Telegram-канал ([@pomazkovjs](https://t.me/pomazkovjs)) с семантическим поиском по постам и картой тем.

## Структура

- `/` — визитка (без ссылок на страницу канала).
- `/channel` — поиск по постам канала + карта тем (доступна только по прямому адресу).
- `app/api/search` — serverless-поиск: векторный (если сгенерированы эмбеддинги и задан `OPENAI_API_KEY`), иначе — по ключевым словам.
- `data/` — сгенерированные данные: `posts.json` (посты), `map.json` (2D-карта тем), `vectors.json` (эмбеддинги, base64).
- `scripts/prepare-data.mjs` — пайплайн генерации данных из экспорта Telegram.

## Локальный запуск

```bash
npm install
npm run dev
```

## Обновление данных канала

1. В **Telegram Desktop**: канал → «⋮» → Export chat history → без медиа → формат JSON (`result.json`) или HTML (`messages.html`). Положи экспорт в `data/raw/` (папка в .gitignore).
2. Ключ OpenAI: `export OPENAI_API_KEY=sk-...` (или добавь в `.env.local` и подгрузи в шелл).
3. Запусти пайплайн:

```bash
npm run prepare-data -- --export data/raw/messages.html --channel pomazkovjs
```

Скрипт: парсит экспорт → эмбеддинги `text-embedding-3-small` (512d, стоит копейки) → k-means кластеризация тем → UMAP-проекция в 2D → tf-idf лейблы кластеров. Результат пишется в `data/`.

Без `OPENAI_API_KEY` скрипт запишет только посты (поиск будет работать по ключевым словам, карта тем скроется).

4. Закоммить изменения в `data/` и запушь — Vercel передеплоит сайт.

## Деплой (Vercel)

1. Импортируй репозиторий в Vercel — фреймворк определится автоматически.
2. В настройках проекта добавь env-переменную `OPENAI_API_KEY` (нужна для семантического поиска в рантайме).
3. Привяжи домен: Project → Settings → Domains → добавь домен и пропиши у регистратора DNS-записи, которые покажет Vercel.
