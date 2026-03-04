# FlashMind

A modern, full-featured flashcard app for learning anything — built with React, Supabase, and Framer Motion.

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

## Features

- **Dashboard** — Topic overview with card counts, accuracy stats per topic, and animated progress bars
- **Learn Mode** — 3D card flip animation, session score tracking, keyboard shortcuts (`Space` / `←` / `→`)
- **Manage Cards** — Inline editing, delete with confirmation, filter by topic
- **Add Cards** — Single card form with topic autocomplete, or bulk import via JSON paste
- **Auto-seed** — Loads 10 Machine Learning example cards on first launch if the database is empty
- **Dark mode only** — Linear/Vercel-inspired aesthetic with glassmorphism card effects

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Animations | Framer Motion 12 |
| Routing | React Router v7 |
| Database | Supabase (PostgreSQL) |
| Linting | ESLint + Prettier |

## Getting Started

### 1. Create the Supabase table

Run this SQL in your Supabase project's SQL editor:

```sql
create table flashcards (
  id uuid default gen_random_uuid() primary key,
  front text not null,
  back text not null,
  topic text not null,
  created_at timestamp default now(),
  times_seen integer default 0,
  times_correct integer default 0
);
```

### 2. Configure Supabase credentials

Update [`src/lib/supabase.js`](src/lib/supabase.js) with your project URL and publishable key:

```js
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'sb_publishable_...'
```

### 3. Install and run

```bash
npm install
npm run dev
```

## Available Scripts

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
npm run format    # Prettier format
```

## Project Structure

```
src/
├── lib/
│   └── supabase.js          # Supabase client + seed data
├── components/
│   ├── Layout.jsx            # Nav bar + page wrapper
│   ├── Spinner.jsx           # Loading indicator
│   └── Toast.jsx             # Animated toast notifications
├── hooks/
│   └── useToast.js           # Toast state hook
├── pages/
│   ├── Dashboard.jsx         # Topic overview + stats
│   ├── Learn.jsx             # Study mode with card flip
│   ├── Manage.jsx            # CRUD table view
│   └── AddCard.jsx           # Single card + bulk import
├── App.jsx                   # Router setup
├── main.jsx                  # Entry point
└── index.css                 # Tailwind v4 + global styles
```

## Keyboard Shortcuts (Learn Mode)

| Key | Action |
|---|---|
| `Space` | Flip card |
| `→` | Mark correct |
| `←` | Mark wrong |
