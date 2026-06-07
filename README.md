# Colorado Family Trip 2026 🏔

Personal PWA for our family Colorado trip — June 19–24, 2026.

**Live app:** https://rishihjoshi.github.io/ColoradoTrip2026/

---

## Install on iPhone (Recommended)

1. Open the live URL in **Safari**
2. Tap the **Share** button (square with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add** — the app icon appears on your home screen
5. Open from home screen for full-screen standalone mode

## Install on Android

1. Open the live URL in **Chrome**
2. Tap the **⋮ menu → Add to Home Screen** (or banner appears automatically)
3. Tap **Add**

---

## Features

| Tab | What it does |
|-----|-------------|
| 🗺 **Itinerary** | 6-day timeline with activities, drive connectors, live weather forecasts |
| 🍽 **Eats** | 48 curated restaurants + 9 activities with cuisine filters and "Closest First" geolocation sorting |
| 🔐 **Passes** | Face ID / PIN-protected vault for confirmation photos and booking links |
| 🎒 **Pack** | Interactive packing checklist with progress tracking |

---

## Reservations Tab — First Time Setup

1. Tap **Passes** in the bottom nav
2. Tap **Set Up Face ID / Biometrics** — uses your device's built-in authentication
3. If Face ID isn't available, set a **6-digit PIN**
4. Default PIN (if skipping setup): **`202606`**

**To change the PIN:** Open the app in Safari DevTools → Console → run:
```javascript
hashPin('YOUR_NEW_PIN').then(h => localStorage.setItem('res_pin_hash', h))
```

**Session expires after 4 hours** — you'll need to re-authenticate.

---

## Adding Confirmation Photos

Once inside the Passes tab:
- Tap **📤 Add confirmation photo** on any reservation card
- Select a screenshot from your Photos library
- The image is stored locally on your device (not uploaded anywhere)

---

## Adding Custom Items

- **Itinerary:** Tap the **+** FAB → fill out the form → it merges into the timeline sorted by time
- **Eats:** Tap the **+** FAB → add a restaurant or activity
- **Pack:** Tap the **+** FAB → type a category and item

All additions are saved locally on your device.

---

## Offline Support

The app works fully offline for itinerary, restaurants, and packing list. Weather falls back to June historical averages when offline.

---

## GitHub Pages Setup

1. Go to repo **Settings → Pages**
2. Source: **Deploy from branch**
3. Branch: `main` / Folder: `/docs`
4. Save — site deploys in ~1 minute

---

## Tech Stack

- Vanilla HTML + CSS + JavaScript (no frameworks)
- Open-Meteo API for weather (no API key needed)
- WebAuthn for Face ID biometric auth
- Service Worker for offline support
- localStorage for all persistence
