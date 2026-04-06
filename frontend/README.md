# Finance Dashboard — Frontend

Static HTML/CSS/JavaScript Single Page Application (SPA)

## Project Structure

```
frontend/
├── index.html    ← Complete SPA (HTML + CSS + JS all-in-one)
└── README.md     ← This file
```

## Getting Started

### Option 1: Direct Browser Open (Simplest)
Simply double-click `index.html` to open in your browser.

> **Note:** Make sure the backend server is running on `http://localhost:5000` before opening the frontend.

### Option 2: Live Server (Recommended for Development)
If you have VS Code, right-click `index.html` → **Open with Live Server**

### Option 3: Python HTTP Server
```bash
# Python 3
python -m http.server 3000
# Then open: http://localhost:3000
```

### Option 4: Node http-server
```bash
npx http-server . -p 3000
# Then open: http://localhost:3000
```

## Features

- 🔐 **Authentication** — Login & Register with JWT
- 👥 **Role-Based UI** — Admin / Analyst / Viewer views
- 📊 **Charts** — Category spread, monthly trends, price graphs
- 💡 **Smart Insights** — Spending analysis & budget alerts
- 📋 **Transactions Table** — Filter, sort, search records
- 📤 **CSV Upload** — Bulk import transactions (Admin only)
- 🗑️ **Soft Delete & Restore** — Non-destructive record management

## Configuration

The frontend connects to the backend API at `http://localhost:5000`.

If your backend runs on a different port, update the API fetch URLs in `index.html`:
- Search for `/api/` and update the base URL accordingly.

## Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Glassmorphism design, custom properties, animations
- **Vanilla JavaScript** — No frameworks, pure JS SPA logic
- **Chart.js** — CDN-loaded charting library
- **Google Fonts** — Outfit font family
