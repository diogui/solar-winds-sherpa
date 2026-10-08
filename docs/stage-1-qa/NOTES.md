# Stage 1 — Containers, margins & spacing

Review stop: spacing/layout only. No Stage 2 (type, heroes rebuild, Support variants).

## 1. Summary of changes

Introduced shared layout tokens and applied them selectively to the worst empty bands (last visible content → first of next section), without changing copy, section order, type sizes, media, or components.

**Tokens** (`src/styles/global.css`):

| Token | Desktop | ≤1023px |
| --- | --- | --- |
| `--page-gutter` | `1.5rem` | `1rem` |
| `--content` | `min(1120px, 100% − 2×gutter)` | same formula |
| `--prose` | `min(760px, …)` | same |
| `--media-wide` | `min(1280px, …)` | same |
| `--section-y` | `4.5rem` | `3.5rem` |
| `--section-y-lg` | `6rem` | `5rem` |
| `--section-y-half` | half of `--section-y` | half |

**Files touched**

- `src/styles/global.css` — tokens + `.page-narrow` → `--prose`
- `src/styles/about.css` — founder / blocks / suite / support / media-wide; mobile founder; hero `height: auto`
- `src/styles/home.css` — partners / latest / papers gutters & padding; mobile hero `height: auto`
- `src/styles/science.css` — section / next spacing (essay opening kept)
- `src/styles/expedition.css` — blocks / partners / podcast / processed / next / invite; panels use gutter; hero `height: auto`
- `src/styles/work.css`, `support.css`, `connect.css` — section padding via tokens

**Selective spacing (not uniform)**

- About: reduced oversized founder / support bands; half+half between blocks
- Home: work / papers / latest tuned so work→why and papers→support don’t double-space
- Expedition: processed / next / invite use half+half or lg for dusk Support
- Science: section tops use `--section-y`; next uses half margin + lg padding

## 2. Screenshots (before / after)

All under `docs/stage-1-qa/`.

### Desktop (1440×900)

| Page | Before | After |
| --- | --- | --- |
| Home | `before/home-desktop.png` | `after/home-desktop.png` |
| About (hero) | `before/about-desktop.png` | `after/about-desktop.png` |
| About (founder spacing) | `before/about-desktop-founder.png` | `after/about-desktop-founder.png` |
| Science | `before/science-desktop.png` | `after/science-desktop.png` |
| Latest Expedition | `before/expedition-desktop.png` | `after/expedition-desktop.png` |

### Mobile (390×844)

| Page | Before | After |
| --- | --- | --- |
| Home | `before/home-mobile-390.png` | `after/home-mobile-390.png` |
| About | `before/about-mobile-390.png` | `after/about-mobile-390.png` |
| Science | — (essay opening; spacing below fold) | `after/science-mobile-390.png` |
| Latest Expedition | — (hero unchanged at fold) | `after/expedition-mobile-390.png` |

Hero viewports look nearly identical before/after by design (Stage 1 does not rebuild heroes). Spacing differences show below the fold (founder, support, closing blocks).

## 3. Verification

| Width | Tokens | Overflow-X | Notes |
| --- | --- | --- | --- |
| **360** | gutter `1rem`, `--section-y` `3.5rem` | none (Home, Exp) | Home hero: `min-height`/`height: auto` with content fitting; title/question/CTA inside hero |
| **390** | same | none | Home / About heroes fit; interactives OK |
| **~900** | still mobile token band (`1rem` / `3.5rem`) via ≤1023 media | none | Nav still hamburger at 900 |
| **1440** | gutter `1.5rem`, `--section-y` `4.5rem` | none | Desktop composition unchanged at hero |

**Interactives (spot-checked after Stage 1)**

- Mobile menu open/close — OK  
- Home Film/Photos switch — OK  
- Home pause/play control — OK  
- Expedition gallery filter (Pico Trigaza) — OK  
- Why-step click at 390 intercepted by header when target was under fixed chrome; steps remain present and focusable after scroll

## 4. Exceptions kept (with justification)

1. **Science essay opening** — Kept (adjusted proposal). No photo-hero conversion; only token integration for rails/spacing.
2. **Home Why / globe** — Tall scroll-driven sections not flattened; Stage 1 only adjusts adjacent padding into/out of neighbours.
3. **Expedition Processed → Next visual gap** — Still includes panel internal padding; measuring last↔first *content* can look larger than title-to-title. Half+half token sum is intentional; panel chrome is not Stage 1 scope.
4. **Science intro → first section** — Large mid-page content (questions list + figure) sits between; gap is not empty band between adjacent section titles alone.
5. **Hero `min-height: 100svh` retained** — Mobile heroes use `height: auto` so they can grow with copy; minimum still fills one screen when content is short. Fixed `height: 100svh` removed on Home (was clipping risk).
6. **Section title levels / type sizes** — Untouched (Stage 2+). Two levels (normal / highlight) deferred.
7. **About Support duplication / Support full vs brief** — Content issue; Stage 2.
8. **Uniform gap not applied** — Worst empty bands tightened; already-tight transitions left alone.

## Next

Pause for review before Stage 2 (labels/type, hero shade API, Support variants).
