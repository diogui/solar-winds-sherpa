# Visual identity audit — Solar Wind Sherpas

**Date:** 8 October 2026 (proposta ajustada)  
**Scope:** Home, About (`/about` → chat), Science, Latest Expedition, Support (secções `#support`)  
**Constraint:** report only — no site code, content rewrites, section merges, or new visual effects in this phase.

### Evidence method

| Source | What was checked |
| --- | --- |
| **Visual (browser)** | Desktop (~2074×1167) and mobile (390×844) on Home, About, Science, Latest Expedition |
| **Code** | `global.css`, page CSS, shared components, page composition |
| **Reference** | [Under The Pole](https://underthepole.org/) — coherence benchmark, not a layout to copy |

---

## 1. Snapshot of what exists

### Shared chrome

- Tokens in `global.css`: `--bg #080d14`, `--accent #f9ab00`, Oswald / Open Sans, `--content: min(1120px, calc(100% - 3rem))`
- Header / Footer / `.label` / `.cta` / `.cta--button` shared
- Dusk band `#171d2e` used for Home vision→partners, Support, and some closers

### Page openings (observed)

| Page | Opening | Notes |
| --- | --- | --- |
| Home | Full-bleed video; brand title bottom-left | Cinematic |
| About | Full-bleed photo; sentence h1 + indicators | Narrative screen |
| Science | Editorial intro under header + inset corona | Essay opening — see §2 |
| Latest Expedition | Full-bleed photo; place h1 + facts | Narrative screen |
| Support | Not a live standalone page | On-page `#support` only (`/join` → `/`) |

### Reference blocks to keep (do not redesign from scratch)

| ID | Block | Why |
| --- | --- | --- |
| A | Full-bleed photo/video hero (Home / About / Exp) | Strongest expedition signal |
| B | Yellow `.label` + section h2 `clamp(1.7rem, 3.2vw, 2.45rem)` | House section grammar |
| C | `WorkCards` | Shared three-card pattern |
| D | `PartnerLogos` | Quiet institutional strip |
| E | Support + `HomeConnect` closing pair | End-of-journey pattern |

---

## 2. Science opening — two options (not an automatic inconsistency)

Science’s editorial first viewport is a **content-led choice**, not a bug by default. Choose deliberately.

### Option A — Keep and integrate the editorial opening

**What:** Retain kicker + h1 + lead + inset figure under the header. Align it to the shared system (gutters, type roles, spacing, label style) so it feels like the same site, not a different product.

**Advantages**

- Matches a research/essay tone; questions and papers follow naturally
- Avoids forcing a photo hero where the story is conceptual, not place-based
- Less risk of competing with Home/About/Expedition cinematic openings
- Smaller implementation scope

**Trade-offs**

- First viewport will keep reading differently from the other three live pages
- Needs care so padding, type, and inset media still share tokens with the rest

### Option B — Adopt a photographic full-bleed hero

**What:** Use the same screen-hero model as About / Latest Expedition (photo edge-to-edge, bottom copy, credit), then continue into questions.

**Advantages**

- Stronger cross-site first-viewport consistency
- Reinforces “real photographs in the spotlight”

**Trade-offs**

- Science may feel more like a campaign page than a research page
- Needs a hero image that earns full-bleed (not every corona crop does)
- More layout work without improving the scientific reading path

### Recommendation

**Option A — keep and integrate the editorial opening.**

Treat Science as the approved **essay opening** exception. Tie it to shared margins, typography, and spacing so coherence comes from the system, not from cloning the photo hero. Revisit Option B only if a specific field photograph is chosen as the Science brand image later.

**Decision needed:** approve Option A or B before Stage 3 page work.

---

## 3. Common hero rules (with per-photo adjustment)

Shared structure for Home / About / Latest Expedition (and any future photo hero). Science uses the essay opening if Option A is approved.

### Shared structure (fixed)

| Rule | Value |
| --- | --- |
| Height | `100svh` / `100dvh` full-bleed |
| Copy | Bottom-aligned from first paint |
| Width of copy rail | `--content` (1120) |
| Type roles | `hero-brand` (Home) or `hero-sentence` (About / Exp) |
| Kicker | Global `.label` (accent) unless a credit |
| Credit | `.media-credit` under copy or on media |
| No radius on full-bleed media | Edge-to-edge |

### Per-photo adjustments (required — not one shade for all)

Each hero sets **framing** and **shade intensity** for that image. Do not copy About’s heavy left scrim onto every photo.

| Parameter | How to set | Examples today |
| --- | --- | --- |
| `object-position` / crop | Per image so instruments, horizon, or corona stay readable | Exp ridge ~`58% 48%`; About totality crop via `object-view-box` |
| Shade side | `left` · `bottom` · `left+bottom` · `none-light` | About: strong left + bottom; Exp: softer left + fade to `--bg`; Home: left + bottom compact |
| Shade strength | `soft` · `medium` · `strong` opacity stops | Stronger only when white type sits on bright sky/snow |
| Exit into next band | `fade-to-bg` or `continue-dusk` | Home → dusk vision; Exp → fade to `--bg` |

**Rule:** shared *component API* + *tokens*; unique *photo recipe* per hero asset. Verification = type remains legible without crushing the photograph.

---

## 4. Support component — two approved variants

One component (evolve `HomeSupport`), two variants. No third fork in About/Exp CSS.

### Variant `full`

**Contents:** label, h2, two short paragraphs (incl. conversation link), four fund items, Patreon + Buy Me a Coffee buttons.  
**Reference:** current Home / Science `HomeSupport`.  
**Use on:**

| Page | Why |
| --- | --- |
| Home | Primary fundraising surface |
| About | Replace duplicated `about-support` |
| Science | Keep as research-adjacent ask |

### Variant `brief`

**Contents:** label, h2, one short line, primary CTA to full Support (e.g. `/#support` or in-page full block), optional secondary mailto. **No** four-fund grid, **no** long Patreon/BMC essay.  
**Reference starting point:** Latest Expedition `.exp-invite` (structure only; restyle to shared tokens).  
**Use on:**

| Page | Why |
| --- | --- |
| Latest Expedition | Page is already long; avoid repeating the full fund story after corona + next expedition |

**Do not:** paste the full Support copy on every page.  
**Do:** always place Support (full or brief) immediately before `HomeConnect`, and keep **Processed images**, **Next expedition**, and **Support** as three separate sections on Latest Expedition.

---

## 5. Priorities (reordered)

### P1 — Layout foundation first

Margins, widths, section spacing (including adjacent padding sums), remove duplicated Support styles, align gutters.

### P2 — Type, buttons, labels

Section h2 convergence, remove label size/colour overrides, CTA/ghost vocabulary, hero type roles.

### P3 — Polish last

Border radii, credit casing, minor card chrome, orphan legacy CSS cleanup.

---

## 6. Inconsistencies (by priority band)

### P1 — Layout & duplication

| # | Where | Difference | Type | Resolve with |
| --- | --- | --- | --- | --- |
| L1 | Gutters | `--content` uses ~`3rem` total inset; Exp/About panels often `2.5rem`; mobile `2rem` | Inconsistency | `--page-gutter` single token |
| L2 | Widths | 1120 / 760 / 1280 / `54rem` / `860px` Support / ad hoc panels | Undocumented mix | Lock `content` · `prose` · `media-wide`; map Support to `content` or `prose` |
| L3 | Section padding | Vision tight; work `4.5–5.5rem`; science `4.25–6.5rem`; About people ~`8.5rem`; support large | Inconsistency | `--section-y` / `--section-y-lg` + **adjacent sum rule** (§8) |
| L4 | Support ×3 | `HomeSupport`, `about-support`, `exp-invite` | Duplication | One component, `full` \| `brief` |
| L5 | About versions | `about-chat` vs `about-atual` | Process debt | Freeze one before extracting heroes |

### P2 — Type, buttons, labels

| # | Where | Difference | Type | Resolve with |
| --- | --- | --- | --- | --- |
| T1 | Hero / section labels | Exp hero muted; Home vision white `0.9rem`; global accent `0.72rem` | Inconsistency | One `.label`; mute only credits |
| T2 | Home marketing h2s | Why/latest/papers larger (~2–3.4rem) vs shared section h2 | Inconsistency | Shared section-h2 token |
| T3 | Hero h1 roles | Brand vs sentence justified; Science essay h1 separate if Option A | Mixed | Document three roles: brand · sentence · essay |
| T4 | CTA extras | `.exp-invite-secondary` etc. | Mild inconsistency | `.cta` / `.cta--button` / `.cta--ghost` only |

### P3 — Polish

| # | Where | Difference | Type | Resolve with |
| --- | --- | --- | --- | --- |
| D1 | Radii | 4 / 5 / 6 px | Inconsistency | `--radius-media: 6px`; 0 on full-bleed |
| D2 | Credits | Uppercase mix; processed credit sentence case | Mild | `.media-credit` |
| D3 | Header 1280 vs content 1120 | Different rails | Mild / OK if documented | Keep header wider; document |
| D4 | Legacy CSS | `.hero` / `.who` / v1 trees | Debt | Archive later; don’t extend |

**Not listed as inconsistency:** Science editorial opening (see §2).  
**Justified separation:** Latest Expedition **Processed corona** ≠ **Next expedition** ≠ **Support** — keep three blocks.

---

## 7. Small visual system

### Typography

| Role | Size | Use |
| --- | --- | --- |
| Hero brand | `clamp(2.2rem, 4.4vw, 4.05rem)` | Home only |
| Hero sentence | `clamp(2.35rem, 5vw, 4.15rem)` | About / Exp screens |
| Essay h1 | `clamp(1.85rem, 5.4vw, 3.15rem)` | Science if Option A |
| Section h2 | `clamp(1.7rem, 3.2vw, 2.45rem)` | Default sections |
| Subhead | `clamp(1.35rem, 2.4vw, 1.85rem)` | Questions / cards |
| Lead | `clamp(1.2rem, 2vw, 1.55rem)` | `.lead` |
| Body | `1.125rem` / lh 1.7 | Global |
| Label | `0.72rem` / `0.28em` / accent | No overrides |
| Credit | `0.68rem` / mute | `.media-credit` |

### Containers

| Token | Value | Use |
| --- | --- | --- |
| `--page-gutter` | `1.5rem` desktop / `1rem` mobile | All insets |
| `--content` | `min(1120px, calc(100% - 2 * gutter))` | Default |
| `--prose` | `min(760px, …)` | Long text |
| `--media-wide` | `min(1280px, …)` | Galleries |

### Colour

`--bg`, `--bg-2`, `--hero-dusk`, `--text` / dim / mute, `--accent` for orientation only (labels, nav underline, primary buttons, key links).

### Buttons

`.cta` · `.cta--button` · `.cta--ghost` · accent underline in prose only.

### Centralized vs fragmented today

| Centralized | Fragmented |
| --- | --- |
| Tokens, `.label`, `.cta`, Header/Footer | About ↔ Exp hero CSS twins |
| `PartnerLogos`, `WorkCards`, `HomeConnect` | Support ×3 |
| Accent yellow | Gutter / width one-offs; label overrides |

---

## 8. Spacing between blocks — adjacent padding rule

Isolated section padding can be correct and still create empty bands when two neighbours each add a large block-padding.

### Rule

Target **gap between content of section A and content of section B**:

```
gap_AB ≈ padding-bottom(A) + padding-top(B)
```

Aim for **`gap_AB ≈ --section-y` (4.5rem)** in normal sequences, or **`--section-y-lg` (6rem)** only before a major closer (Support full / Contact).

### How to apply

| Situation | Practice |
| --- | --- |
| Two consecutive `--bg` sections | Prefer `padding-block: calc(var(--section-y) / 2)` each → sum ≈ `--section-y` |
| Or | First section `padding-bottom: var(--section-y)`; next `padding-top: 0` (or reverse) — document which convention |
| Background change (e.g. `--bg` → dusk Support) | Allow full `--section-y-lg` on the dusk band only; keep previous section’s bottom padding modest (`≤ 2.5rem`) so sum doesn’t exceed ~`8–9rem` |
| Hero → first section | Hero bottom padding is for type clearance, not section gap; first section top should be smaller if hero already fades |
| Soft panels inside a section (podcast, next) | Panel padding ≠ section padding; don’t add another full `--section-y` around the panel |

### Anti-patterns to fix

- About people `~8.5rem` + support `~7.25rem` (+ extra margin) → empty band
- Science section `clamp(4.25rem, 8vw, 6.5rem)` top **and** previous section large bottom
- Home work `4.5rem 0 5.5rem` next to similarly padded neighbours without halving

**Verification:** on desktop, measure empty space between consecutive headlines — should feel even; no “double breathing room.”

---

## 9. Section → reusable model map

Preserve Latest Expedition’s closing trio: **Processed images** · **Next expedition** · **Support** (never merge).

### Models

| Model | Variants |
| --- | --- |
| Hero | `brand` · `place` · `story` (+ optional indicators); photo recipe per asset |
| Essay opening | Science only (if Option A) |
| Section intro | wide · narrow |
| Media split | image-left · image-right · featured-card |
| Card grid | WorkCards / 2–3 col / compare |
| Gallery | filterable · lightbox (page-owned behaviour OK) |
| Logos | PartnerLogos |
| Media panel | film · podcast · film/photos toggle |
| Indexed list | numbered · bordered |
| Campaign next | destinations (Exp) · research-status (Science) — **different content, shared type** |
| Support | `full` · `brief` |
| Contact | HomeConnect |

### Home

| Section | Model |
| --- | --- |
| HomeHero | Hero `brand` |
| HomeVision | Section intro (centred) + dusk band |
| HomePartners | Logos |
| HomeWork | Card grid (`WorkCards`) |
| HomeWhyEclipses | Section intro + interactive (page-owned) |
| HomeExpeditions | Media panel / globe (page-owned) |
| HomeLatest | Media panel (film/photos) |
| HomeContributions | Card grid + section intro |
| HomeSupport | Support `full` |
| HomeConnect | Contact |

### About (`about-chat`)

| Section | Model |
| --- | --- |
| about-screen | Hero `story` + indicators slot |
| Founder | Media split `featured-card` |
| Our Story + gallery | Section intro + Gallery |
| People | Gallery / montage |
| Our Actions | Card grid (`WorkCards`) |
| Partners | Logos (+ short intro) |
| Support | Support `full` (replace local clone) |
| HomeConnect | Contact |

### Science

| Section | Model |
| --- | --- |
| science-intro + hero figure | Essay opening (Option A) **or** Hero (Option B) |
| Questions | Indexed list |
| Why eclipses | Media split / compare grid |
| Instruments | Media split (alternating) |
| Pipeline | Indexed list + media |
| Publications | Card grid + list |
| What comes next | Campaign next `research-status` |
| HomeSupport | Support `full` |
| HomeConnect | Contact |

### Latest Expedition

| Section | Model |
| --- | --- |
| exp-screen | Hero `place` |
| Two sites | Section intro + Media split / pair |
| Gallery | Gallery (filterable) |
| Film | Media panel `film` |
| In the field | Card / beat grid |
| Team | Grid (page-owned) |
| Partners | Logos |
| Podcast | Media panel `podcast` |
| **Processed eclipse images** | Media split — **own section** |
| **Next expedition** | Campaign next `destinations` — **own section** |
| **Support** | Support `brief` — **own section** |
| HomeConnect | Contact |

---

## 10. Decision table (approve before coding)

| # | Proposed rule | Current reference block | Pages affected | Justified exceptions | Decision to approve |
| --- | --- | --- | --- | --- | --- |
| 1 | Science keeps editorial opening; integrate to tokens | Science intro today | Science | Essay opening only on Science | **A keep+integrate** or **B photo hero**? *(Recommend A)* |
| 2 | Screen heroes share structure; shade/framing per photo | About screen + Exp screen (as twins with different shades) | Home, About, Exp | Science if A; mid-page film ≠ page hero | Approve per-photo shade API? |
| 3 | Support component: `full` + `brief` only | HomeSupport = full; Exp invite ≈ brief | Home, About, Science, Exp | Brief only on Latest Expedition | Approve placement table in §4? |
| 4 | Widths: 1120 / 760 / 1280 only | `--content`, `.page-narrow`, About story gallery | All | Header may stay 1280 wider than body | Lock three widths? |
| 5 | Single `--page-gutter` | Closest: `--content` calc | All | None | Approve gutter values? |
| 6 | Adjacent padding sum ≈ `--section-y` (or lg before closer) | Science/About/Exp moderate blocks (not About people) | All | Hero clearance separate from section gap | Approve §8 convention (half+half vs pad-one-side)? |
| 7 | One `.label` style (accent) | Global `.label` on Science/About | All | Credits use mute, not label | Remove Home/Exp overrides? |
| 8 | Section h2 shared scale | About / Science / Exp / Support h2 | Home especially | Hero/vision display sizes stay larger | Pull Home marketing h2s down? |
| 9 | CTA set: text / button / ghost | Global `.cta*` | Exp invite, Support | Prose accent underlines | Alias Exp secondary → ghost? |
| 10 | Freeze About version before hero extraction | `about-chat` (canonical now) | About | Keep `/about-atual` offline for review only | Freeze **chat**? |
| 11 | Keep Processed · Next · Support as three Exp sections | Current Exp closing | Latest Expedition | None — do not merge | Confirm separation? |
| 12 | Accent yellow = orientation only | Nav underline, labels, buttons | All | Annotation line on Home video OK as UI, not wash | Confirm no decorative yellow fields? |
| 13 | Soft panel vs bordered card as two named looks | Podcast panel + WorkCards | Home, About, Exp | Science question list = third: list-rule | Approve three chrome names? |
| 14 | Polish (radius/credits) after P1–P2 | Science frames `6px` | All | Full-bleed radius 0 | Defer to Stage 4? |

---

## 11. Implementation plan (staged)

No content rewrites, no section merges, no new effects — system and wiring only.

### Stage 0 — Approvals

**Files:** none (this doc).  
**Do:** resolve Decision table rows 1–11 at minimum.  
**Verify:** written sign-off in chat or checklist.

### Stage 1 — Layout tokens & spacing (P1)

**Files:** `src/styles/global.css`; light touch `home.css`, `about.css`, `science.css`, `expedition.css`, `support.css`, `connect.css`, `work.css`.

**Do:**

- Add `--page-gutter`, normalize `--content` / `--prose` / `--media-wide`
- Introduce `--section-y`, `--section-y-lg`
- Apply adjacent-padding rule to the worst empty bands (About people/support, stacked science sections, home work neighbours)
- Do **not** yet rebuild heroes or type scales wholesale

**Verify desktop**

- Same left edge for section content across Home / About / Science / Exp
- No double-height empty band between consecutive sections (measure headline-to-headline)
- Support/Contact still align to content rail

**Verify mobile (390)**

- Gutters readable; no horizontal scroll
- Section gaps feel even, not sparse

### Stage 2 — Deduplicate Support (P1)

**Files:** `src/components/home/HomeSupport.astro`, `src/styles/support.css`, `about-chat.astro`, `about.css`, `latest-expedition.astro`, `expedition.css`.

**Do:**

- Add `variant="full" | "brief"`
- About: replace `about-support` with `full`
- Exp: replace `exp-invite` with `brief`; keep Processed and Next as separate preceding sections
- Delete duplicate About support CSS when unused

**Verify desktop / mobile**

- Home & Science & About: same full Support structure
- Exp: brief only; link reaches full Support; no fund-grid repeat
- Order on Exp: Processed → Next → Support → Contact

### Stage 3 — Hero shared structure + photo recipes (P1 residual / P2 start)

**Files:** `HomeHero.astro`, About screen markup/CSS, Exp screen markup/CSS; optional `ScreenHero.astro` if extraction is clean.

**Do:**

- Shared copy rail, bottom alignment, label/credit classes
- Per-hero shade/framing props or CSS variables (no single global scrim)
- Science: only token integration if Option A; no forced photo hero

**Verify desktop / mobile**

- Type legible on each hero photo without identical dark wash
- Home / About / Exp bottoms feel related
- Science opening still essay (if A)

### Stage 4 — Typography, labels, CTAs (P2)

**Files:** `global.css`, `home.css` (remove label/h2 overrides), page CSS as needed.

**Do:**

- Enforce label + section h2 tokens
- Map CTAs to `.cta` / `.cta--button` / `.cta--ghost`
- Document essay vs brand vs sentence h1

**Verify:** labels yellow and same size; Home section titles match About/Science/Exp; buttons look like one family.

### Stage 5 — Polish (P3)

**Files:** page CSS only as needed.

**Do:** `--radius-media`, `.media-credit`, document header 1280 vs content 1120; optionally mark legacy CSS for later deletion (no risky deletes required).

**Verify:** radii consistent on inset media; credits readable; full-bleed still square-edged.

### Stage 6 — Cross-page QA

**Breakpoints:** ≥1120, ~900, 390×844.  
**Checklist:**

- [ ] Gutters and content width consistent
- [ ] Adjacent section gaps follow sum rule
- [ ] Heroes: shared structure, distinct shades
- [ ] Science opening matches approved option
- [ ] Support full vs brief placement correct
- [ ] Exp: Processed ≠ Next ≠ Support
- [ ] Contact `#contact` / Support anchors work per page
- [ ] No new animations or content rewrites introduced

---

## Appendix — Quick inventory

| Page | Opening | Signature mid-page | Closing |
| --- | --- | --- | --- |
| Home | Video hero brand | Vision, logos, work, why, globe, latest, papers | Support `full` + Contact |
| About | Photo hero story | Founder, galleries, work, logos | Support `full` (after fix) + Contact |
| Science | Essay opening | Questions, why, instruments, pipeline, papers | Support `full` + Contact |
| Latest Expedition | Photo hero place | Sites, gallery, film, team, logos, podcast | **Processed** → **Next** → Support `brief` → Contact |
| Support | — | — | On-page only |
