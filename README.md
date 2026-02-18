# 🐍 Auto-Snake Pro (TikTok Live Edition)

A high-performance, automated Snake game designed for TikTok Live streaming. Features advanced AI pathfinding, stunning visual effects, and PWA support.

> **Live Demo:** [Open index.html](index.html)

## ✨ Features

### 🎮 Gameplay (AI-Driven)
- **Auto-Play AI:** Uses BFS pathfinding with safety checks and stalling strategies.
- **Adaptive Speed:** Starts fast, slows down as snake grows for tension.
- **Combo System:** Fast eating triggers combo multipliers and floating text.
- **Jackpot Mode:** 8% chance to spawn 4 bonus golden apples.
- **High Score:** Persisted locally.

### 🎨 Visual Effects
- **Neon Glow Trail:** Ghost trail follows snake movement.
- **Particles:** Colorful explosions when eating food.
- **Dynamic Lighting:** Snake body glows with gradient from head to tail.
- **Screen Shake:** Impact feedback on game over.
- **Portrait Layout:** Optimized for 9:16 vertical video (TikTok/Shorts/Reels).

### 📺 TikTok Live Tools
- **Hidden Cursor:** Mouse pointer automatically hides.
- **Fake WASD UI:** Visual keyboard overlay mimics human input based on AI moves.
- **Clean HUD:** Minimalist "Pro" interface without "Auto" labels.
- **Auto-Restart:** Game loops endlessly without interaction.

### 📱 PWA Support
- **Installable:** Add to Home Screen on iOS/Android.
- **Offline Ready:** Cached via Service Worker.
- **App Icons:** Custom neon SVG icons.

## 🚀 Installation

### Local Development
1. Clone this repository:
   ```bash
   git clone https://github.com/andisiahaan/auto-snake.git
   cd auto-snake
   ```
2. Serve via HTTP (required for PWA):
   ```bash
   # Using Node.js
   npx serve .
   
   # Or using Python
   python -m http.server
   ```
3. Open `http://localhost:3000` (or 8000) in Chrome.

### Deployment (Static)
This is a static HTML/JS project. You can deploy it instantly to:
- **GitHub Pages:** Go to Settings > Pages > Source = `main` branch.
- **Netlify / Vercel:** Drag and drop the folder.
- **VPS / Shared Hosting:** Upload `index.html` and assets to `public_html`.

## 🛠️ Configuration
Edit `index.html` constants to tweak the game:
```javascript
const COLS = 22;           // Grid width
const ROWS = 28;           // Grid height
const BASE_SPEED = 65;     // Starting speed (ms)
const JACKPOT_CHANCE = 0.08; // 8% bonus chance
```

## 📄 License
MIT License. Free to use for your streams!
