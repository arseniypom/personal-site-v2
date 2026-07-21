# CLAUDE.md

Personal website (Next.js App Router, TypeScript). Two pages: `/` (landing) and `/channel`
(интерактивная страница Telegram-канала @pomazkovjs: статистика, карта тем, поиск).

## Language & design rules

- **UI страницы `/channel` — на русском**, простыми словами, нейтрально. Минимум поясняющего
  текста: заголовок + максимум одна короткая строка-подсказка на секцию.
- Дизайн берётся с корневой страницы: тёмный фон `#0f0b0d`, карточки `#1b171a` c radius 30,
  акцент — жёлтый `#ffd94d`, градиентные плитки в цветах корневой (жёлтый/фиолетовый/оранжевый),
  пилюли 999px. Никаких «ИИшных» клише и перегруза.
- Цвета кластеров — `lib/palette.ts`, единые для карты, графиков и чипов
  (цвет следует за темой везде).
- Адаптив: fluid-сетки + брейкпоинт 640px (чипы меньше, плитки 2×2, месяцы одной буквой).
  Таймлайн на десктопе — CSS columns (2 от 760px, 3 от 1080px).

## Data pipeline

`scripts/prepare-data.mjs` — из HTML-экспорта Telegram Desktop (`data/raw/messages*.html`):

```
OPENAI_API_KEY=... npm run prepare-data -- --export data/raw/messages.html --channel pomazkovjs
```

- Эмбеддинги: `text-embedding-3-small`, 512d → `data/vectors.json` (поиск + UMAP).
- **Кластеризация: НЕ k-means.** `gpt-4.1` читает все посты, строит таксономию (6–9 тем,
  ≥8 постов в каждой) и относит каждый пост к теме. k-means — только фолбэк при ошибке LLM.
- Карта: **supervised UMAP** (`setSupervisedProjection`, `targetWeight: 0.3`, `minDist: 0.6`) —
  кластеры компактные пятна, а не конфетти.
- Реакции парсятся из экспорта (`parseHtmlReactions`); кастомные эмодзи завёрнуты в HTML —
  очищаются через `htmlToText`.
- `map.json` получает `updatedAt` (YYYY-MM-DD) — показывается в футере как «Обновлено …».
- Текущая разметка тем в `data/posts.json` — ручная (8 тем, размечено Клодом по содержанию).
  Перезапуск пайплайна с ключом **перезапишет её** LLM-классификацией.

## Data files

- `data/posts.json` — посты: id, date, text, link, cluster, reactions `[{e, n}]`.
- `data/map.json` — updatedAt, clusters (id+label), points (x, y, c).
- `data/vectors.json` — base64 Float32 эмбеддинги для поиска.
- `data/curated.json` — **ручная курация, пайплайн её НЕ трогает**:
  - `series` — серии постов (title, description, ids по порядку);
  - `timeline` — вехи истории канала (id поста + label).

## /channel page structure

`app/channel/page.tsx` — серверный оркестратор: собирает `PostMeta[]` (`toMeta` в `lib/data.ts`),
считает статистику и задаёт порядок секций:

1. `ActivityRhythm` (ChannelInsights.tsx) — плитки статистики + хитмэп по месяцам
2. `TopicMap` — карта тем (SVG, tooltips)
3. `StoryArcs` — таймлайн с номерами + серии (пилюли Ч1…Чn → ссылки в TG)
4. `TopPosts` (ChannelInsights.tsx) — топ-7 по реакциям, фильтр-селект по темам
5. `TopicsOverTime` (ChannelInsights.tsx) — stacked-столбцы по годам, drill-down по клику
6. `ChannelSearch` — векторный поиск (API `/api/search`)
7. `RandomPost` — кнопка внизу, открывает модалку (превью + «Ещё один»)

`PostItem` — единая карточка поста: дата, чип темы, эмодзи+число реакций, превью ~200 символов,
«Открыть в Telegram →». Склонения — через `plural()` в ChannelInsights.

## Gotchas

- Тултипы графика/хитмэпа (`viz-tooltip`) скрыты через `display: none`, НЕ `opacity: 0` —
  иначе absolutely-positioned nowrap-тултипы у правого края расширяют страницу
  (горизонтальный оверфлоу на мобиле). На `html/body` стоит `overflow-x: clip` как страховка.
- `opacity` на сегментах графика создаёт stacking context — чтобы тултип не прятался за
  соседними колонками, при hover поднимаются `z-index` и колонка, и сегмент
  (`.topics-col:hover`, `.heatmap-row:hover`).
- Все 236 постов сериализуются в RSC-payload — grep по HTML находит текст постов даже там,
  где они не отображаются; проверять видимые списки, а не raw HTML.
- Клиентские секции получают один и тот же `metas` (React Flight дедуплицирует по ссылке).

## Workflow

- Проверка: `npx tsc --noEmit` и `npm run build`; визуально — dev-сервер на :3199 + Chrome
  (claude-in-chrome), включая мобильную ширину (~430px).
- Данные коммитятся в git; Vercel деплоит из `main`.
