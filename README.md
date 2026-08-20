# 🎨 Palettive

A local, in-browser color palette generator. No backend, no API keys, no network dependencies — every byte of the app runs in your browser and your palettes stay on your machine.

> **Offline by design.** Palettive is 100% client-side: React bundles + a Web Worker for image quantization. Close the tab, your data never left it. That's the whole trust model — no accounts, no telemetry, no server.

---

## ✨ Features

**Generator** (`/`)
Generate 3–9 color palettes from seven harmony rules — complementary, analogous, triadic, split-complementary, square, monochromatic, random. Adjust intensity, lock individual colors in place, drag to reorder, nudge any color on the wheel, and undo/redo your way out of any decision.

**Explore** (`/explore`)
Browse 199 built-in palettes drawn from design systems (Material, Tailwind, Open Color, Apple, Adobe Spectrum, IBM Carbon, Ant Design, Atlassian) plus nature and editor themes. Search by name, filter by mood and tags.

**Saved** (`/saved`)
Name and tag palettes, search, filter, edit, and export your collection as JSON — or import a JSON file back in. Everything persists to `localStorage`.

**Image extraction** (`/image`)
Drop in any image and extract a color palette from it. K-means quantization runs off the main thread in a Web Worker, so the UI stays responsive.

**UI Preview** (`/preview`)
Render a palette on real components — hero sections, cards, navbar, forms, tables, pricing — across ten self-hosted fonts (Inter, DM Sans, Outfit, Plus Jakarta Sans, Manrope, Space Grotesk, Playfair Display, Fraunces, DM Serif Display, Young Serif). No font CDN calls.

**Contrast Checker** (`/contrast`)
WCAG 2.1 contrast ratios (AA/AAA) for any pair of colors, plus color-blindness simulation for protanopia, deuteranopia, tritanopia, and achromatopsia.

**Gradient Generator** (`/gradient`)
Two-color linear and radial gradients with angle control and live preview.

**Export** (`/export`)
Ship a palette as CSS custom properties, Tailwind config (v3) or `@theme` block (v4), hex lists, SVG swatches, or JSON.

**App-wide** — dark/light mode (persisted, respects your system preference), full offline operation, localStorage persistence with before-unload flush.

---

## ⌨️ Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Space` | Generate a new random palette |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` | Redo |
| `↑ ↓ ← →` | Nudge the active color on the wheel (hue / saturation) |
| `Enter` | Confirm a save / edit |
| `Esc` | Close any open dialog |

---

## 🛠️ Tech stack

React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · Zustand · culori · react-router-dom (hash-based routing for easy static hosting)

The heavy lifting of image extraction runs in a dedicated Web Worker (`src/lib/quantize.worker.ts`), keeping the main thread free.

---

## 🚀 Getting started

Requires Node.js 20+ and npm.

```bash
npm install       # install dependencies
npm run dev       # start the dev server on localhost:5173
```

### Production

```bash
npm run build     # type-check (tsc -b) + production build -> dist/
npm run preview   # serve the production build locally
```

### Quality

```bash
npm run lint      # eslint over the whole project
```

The build outputs a fully static bundle — deploy `dist/` anywhere (GitHub Pages, Netlify, Vercel, S3, a USB stick).

---

## 🧭 Project structure

```
src/
  components/       Layout, ColorWheel, HarmonySelector
  lib/              color math, harmony rules, quantization, storage, fonts
  pages/            one file per feature route
  store/            Zustand stores (palette state, notifications)
  types/            shared TypeScript types
```

Key modules:
- `lib/harmony.ts` — harmony rule math + shade scaling
- `lib/quantize.ts` / `lib/quantize.worker.ts` — k-means image quantization off the main thread
- `lib/storage.ts` — `localStorage` read/write with debounced, before-unload flush
- `lib/color.ts` — hex parsing, text-on-color contrast, UUIDs

---

## 🗺️ Roadmap / status

Current state: **feature complete at v0** — all eight core features ship and build cleanly. This repository is early and pre-1.0 (version `0.0.0`, no published release yet). Candidates on the near horizon:

- [x] All eight features working
- [ ] Live demo deployment
- [ ] Screenshots + GIFs in this README (palettive is a visual tool — it should *look* like one here)
- [ ] v1.0.0 tag + release notes
- [ ] (Suggest yours — see contributing)

---

## 🤝 Contributing

PRs and suggestions are welcome. Smallest useful things first:

1. Fork the repo and create a branch.
2. Make your change; keep the TypeScript types honest.
3. Run `npm run lint` and `npm run build` — both should pass.
4. Open a PR against `main` with a short description of what and why.

Found a bug or have an idea? Open an issue — no template gymnastics required.

---

## 📄 License

MIT © 2026 LordVipul. See [LICENSE](LICENSE).
