# ⚡ LearnTracker

A focused, privacy-first **learning time tracker** built with React + Vite + Bootstrap.
All data lives in your browser's `localStorage` — no server, no login, no tracking.

## Features

- **Start / Stop timer** with per-topic tracking
- **Topic management** — custom name, color, and icon per topic
- **Session notes** — add a quick note before each session
- **Full history** — grouped by date, filterable by topic, editable notes
- **Statistics** — total time, streaks, 7-day bar chart, per-topic breakdown
- **Export** — download all your data as JSON anytime
- **Persistent** — survives browser closes, restarts, days/weeks away
- **Crash-safe timer** — recovers elapsed time if you close mid-session
- **GitHub Pages ready** — zero backend, pure static build

## Quick Start

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

### 1. Set your repo name in `vite.config.js`

```js
base: '/your-repo-name/',
```

### 2. Add homepage to package.json

```json
"homepage": "https://your-username.github.io/your-repo-name"
```

### 3. Deploy

```bash
git add . && git commit -m "init" && git push origin main
npm run deploy
```

Then go to: **GitHub repo → Settings → Pages → Source → gh-pages branch**

## Project Structure

```
learn-tracker/
├── index.html
├── vite.config.js
├── package.json
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── TrackerContext.jsx
    ├── hooks/
    │   ├── useLocalStorage.js
    │   └── useTimer.js
    ├── utils/
    │   └── timeUtils.js
    └── components/
        ├── Navbar.jsx
        ├── TopicSelector.jsx
        ├── TimerView.jsx
        ├── SessionHistory.jsx
        └── StatsPanel.jsx
```

## Tech Stack

- **React 18** + **Vite 6**
- **Bootstrap 5.3** + **Bootstrap Icons**
- **gh-pages** for deployment
- Zero backend — localStorage only

## License

MIT
