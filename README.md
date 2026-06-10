# 🌸 Smilance 

> A deeply personalized, offline-first sanctuary crafted with precision. Features period tracking, an immersive music lounge, and an encrypted diary—all styled with high-fidelity animations and fluid interactions.

![Smilance Aesthetics](https://via.placeholder.com/1000x350/11050A/F43F5E?text=Smilance:+A+Sanctuary+For+Smiley)

---

## ✨ Exquisite Visuals & Fluid Interactions

Smilance focuses on sensory delight through cohesive colors and refined physics:
- **Liquid Physics Engine:** The Cycle tracker features a deeply immersive, smooth liquid beaker that sloshes vividly to reflect current cycle phases.
- **Particle System:** Elegant interactive particles, bubble floaters, star-bursts, and pulsing feedback across the interface. 
- **Touch Harmonics:** Screen interactions are met with delicate chime sounds and visually striking cluster bursts.
- **Themes:** Handcrafted aesthetic palettes spanning from **Dark Rose** to **Ocean Sapphire**.

---

## 🧭 Complete Feature Walkthrough

### 1. 🏠 Home: The Wish Hearth
* **Animated Ambient Clock:** Real-time UTC ticking with heart-beat separators.
* **Touch My Heart:** An interactive centerpiece reacting to touch with sonic feedback and scattered stars to reveal romantic wish cards.

### 2. 📻 Radio: The Soundscape Portal
* **Lo-Fi Player:** Integrated media controls, playback scrubbing, and dynamic disc-spinning vinyls.

### 3. 📅 Cycle Tracker: Dyn-Fluid Analytics
* **Liquid Phase Beaker:** Real-time reactive water animations for cycle progression.
* **Smart Analytics Hub:** Heatmaps, symptom scatter-plots, and historic logs tracking ovulation windows across 4 active months. 

### 4. 🔔 Intelligent PWA Push Diagnostics
* Full Offline caching support built with Service Workers.
* Diagnostic tracking tools to guarantee background push deliveries and test handshake authorizations.

### 5. 📝 Journey: The IndexedDB Vault
* **Secret Diary & Letters:** Heavy client-side storage architecture guarding deeply personal notes intact natively.

### 6. 🔐 Zero-Trust Security
* **App Passcode Lock:** Bank-grade visual lock-screens. 
* ***Default Startup PIN:*** `0809`
* **Deep Clean:** End-to-end data wipe utilities securely trapped behind authentication gates.

---

## 🚀 Deployment: Hosting on GitHub Pages

Smilance is developed as a standalone React SPA (Single Page Application), making it **100% compatible with GitHub Pages** for free, secure hosting. 

### Effortless GitHub Pages Setup:

1. **Update `vite.config.ts`:**
   Add `base: '/smilance/'` (replace `smilance` with your actual GitHub repository name).
2. **Install Deployment Tool:**
   ```bash
   npm install -D gh-pages
   ```
3. **Add Deploy Scripts (`package.json`):**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
4. **Deploy:**
   Run `npm run deploy`. Your beautiful app is now hosted globally!

---

## 🛠 Developer Quick-Start

Smilance leverages **React 18**, **TypeScript**, and **Tailwind CSS**, energized by **Vite**.

1. **Install Dependencies:** `npm install`
2. **Run Dev Environment:** `npm run dev` (Runs on `localhost:3000`)
3. **Build Static Bundle:** `npm run build`

---
*Crafted elegantly with pristine code. Everything runs smoothly, beautifully, and safely.* 💖
