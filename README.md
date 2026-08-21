# Palettive

A local, in-browser color palette generator. No backend, no API keys, no network dependencies — everything runs in the browser. Offline by design: no accounts, no telemetry, saved palettes stay in your localStorage and never leave your machine.

## Features

- **Generator** — 3–9 color palettes via harmony rules (complementary, analogous, triadic, split-complementary, square, monochromatic, random), intensity control, per-color locking, 9 shades per color, drag-to-reorder, color wheel, undo/redo
- **Explore** — 199 built-in palettes from design systems (Material, Tailwind, brands, editor themes, nature) with search and mood/tag filters
- **Saved** — save palettes with names and tags, search/filter, JSON import and export
- **Image extraction** — extract a palette from any image; k-means quantization runs in a Web Worker
- **UI Preview** — render a palette on real components (hero, cards, navbar, forms, tables, pricing) with 10 self-hosted fonts
- **Contrast Checker** — WCAG 2.1 AA/AAA ratios plus color-blindness simulation (protanopia, deuteranopia, tritanopia, achromatopsia)
- **Gradient Generator** — 2-color linear/radial gradients with angle control
- **Export** — CSS variables, Tailwind config (v3) and `@theme` (v4), hex lists, SVG, JSON
- **App** — dark/light mode (persisted, respects system preference), localStorage persistence, fully offline

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Space` | New random palette |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` | Redo |
| `↑` `↓` `←` `→` | Nudge the selected color on the wheel |
| `Enter` | Confirm save / rename |
| `Esc` | Close dialogs |

## Tech stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · Zustand · culori

## Getting started

```bash
npm install
npm start        # dev server on localhost:5173
npm run build    # type-check + production build
npm run preview  # preview production build
```
