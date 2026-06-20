# Voltron Order Tracker — Style Guide

**For Claude Code:** This document is the single source of truth for all visual and UX decisions in this application. Every page, component, button, and transition must trace back to a rule here. When in doubt, ask: *does this feel like it belongs in the Voltron universe?* If not, revise it.

---

## 1. Voice and Tone

- Write at an **8th-grade reading level**. Short sentences. Plain words. No jargon.
- Keep the tone **casual and witty** — like a friendly robot sidekick who's also a little cocky.
- Microcopy (button labels, empty states, error messages, tooltips) should feel like something Pidge or Lance would say, not a corporate manual.
- **Examples:**
  - Instead of "No orders found." → "Looks like your order queue is emptier than space. Let's fix that."
  - Instead of "Submit" → "Launch It"
  - Instead of "An error occurred." → "Uh oh. The Galra got to this page. Try again."
- Use **active voice** always. Name actions by what they do: "Track your order," not "Order tracking."
- Sentence case everywhere. No ALL CAPS except the app name or lion names when used as labels.

---

## 2. Color System

### 2a. The Five Lion Pages

Each of the five main functional pages maps to one Voltron lion. The lion's color is the **dominant theme** of that page — used for the background, hero section, primary buttons, active nav indicator, and key accents. Supporting colors (card backgrounds, body text backgrounds) stay dark and neutral so the lion color pops.

| Page | Lion | Dominant Color | Accent / Trim | Dark Base |
|---|---|---|---|---|
| Home | Black Lion | `#1C1C2E` (deep navy-black) | `#C9A84C` (gold) | `#12121F` |
| Create | Red Lion | `#8B1A1A` (deep crimson) | `#FF4040` (bright red) | `#1A0808` |
| Orders | Blue Lion | `#0D2B5E` (deep cobalt) | `#4A9EE8` (sky blue) | `#080F1F` |
| Update | Green Lion | `#0F3320` (deep forest) | `#3DCA5A` (bright green) | `#061A0E` |
| Track | Yellow Lion | `#3D2E00` (deep gold-brown) | `#F0C030` (bright yellow) | `#1A1400` |

**Implementation rule:** Apply the dominant color as a CSS custom property on the `<body>` or top-level page wrapper: `--lion-color`, `--lion-accent`, `--lion-base`. All themed components (buttons, borders, glows, nav indicators) reference these variables so swapping pages swaps the whole theme automatically.

```css
/* Example: Red Lion page */
body.page-create {
  --lion-color: #8B1A1A;
  --lion-accent: #FF4040;
  --lion-base: #1A0808;
}
```

### 2b. The Voltron Logo Pages

These six pages (Login, Sign-Up, Draft, Contact Us, Sort, Profile) share a single multi-color brand palette inspired by the Voltron logo itself — all five lion colors unified on a dark cosmic background. None of these pages belongs to a single lion; they represent the *assembled* Voltron.

**Shared Voltron Logo Palette:**

| Role | Color | Hex |
|---|---|---|
| Page background | Deep space black | `#0D0D1A` |
| Card / surface | Dark slate | `#16162A` |
| Border / divider | Muted navy | `#2A2A4A` |
| Primary text | Off-white | `#E8E8F0` |
| Secondary text | Muted grey-blue | `#8888AA` |
| Gold accent (Black Lion) | Voltron gold | `#C9A84C` |
| Red accent (Red Lion) | Voltron red | `#CC3333` |
| Blue accent (Blue Lion) | Voltron blue | `#3A8EDF` |
| Green accent (Green Lion) | Voltron green | `#33AA55` |
| Yellow accent (Yellow Lion) | Voltron yellow | `#DDB830` |
| Chrome / trim | Silver-white | `#C0C8D8` |

**Implementation rule:** Use the five accent colors as decorative highlights — colored top borders on cards, gradient dividers cycling through all five colors, colored icon accents. No single accent should dominate. The effect should feel like all five lions are present equally.

**Voltron 5-color gradient strip** (reuse this across all logo-theme pages):
```css
.voltron-stripe {
  background: linear-gradient(
    to right,
    #C9A84C 0%,    /* Black Lion gold */
    #CC3333 25%,   /* Red Lion */
    #3A8EDF 50%,   /* Blue Lion */
    #33AA55 75%,   /* Green Lion */
    #DDB830 100%   /* Yellow Lion */
  );
  height: 3px;
}
```

### 2c. The Galra Empire — Error Page

The Error page (404, 500, or any unhandled error state) uses the color scheme of the villainous Galra Empire. It should feel intentionally menacing and visually jarring — users must instantly know something went wrong.

| Role | Color | Hex |
|---|---|---|
| Page background | Galra void black | `#0A0010` |
| Surface / card | Dark purple-black | `#150020` |
| Primary accent | Galra purple | `#7B2FBE` |
| Secondary accent | Sickly yellow-green | `#8BC34A` |
| Danger highlight | Galra magenta | `#C0308A` |
| Primary text | Cold grey-white | `#D0C8E0` |
| Secondary text | Muted purple-grey | `#7A6A8A` |

---

## 3. Typography

### 3a. Font Stack

**Headings (H1–H3):** `'Orbitron', sans-serif`
Load from Google Fonts: `https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap`

Orbitron is a geometric, angular, sci-fi typeface that directly echoes the Voltron title card lettering. Use it for page titles, section headings, and key labels only — not body copy.

**Body / UI text:** `'Exo 2', sans-serif`
Load from Google Fonts: `https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600&display=swap`

Exo 2 has a technical, slightly futuristic feel while staying very readable. Use it for all body text, form labels, buttons, and microcopy.

**Monospace / data:** `'Share Tech Mono', monospace`
Load from Google Fonts: `https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap`

Use for order IDs, tracking numbers, timestamps, and any data that should feel like a readout from Voltron's onboard computer.

### 3b. Type Scale

```css
--text-hero:    clamp(2rem, 5vw, 4rem);     /* Page hero / app name */
--text-h1:      clamp(1.5rem, 3vw, 2.5rem); /* Page titles */
--text-h2:      clamp(1.2rem, 2vw, 1.75rem);/* Section headings */
--text-h3:      1.2rem;                      /* Card titles */
--text-body:    1rem;                        /* Body copy, labels */
--text-small:   0.875rem;                    /* Captions, secondary info */
--text-data:    0.9rem;                      /* Monospace data fields */
```

All weights: 400 (regular body), 600 (UI labels, button text), 700 or 900 (Orbitron headings only).

---

## 4. Iconography

Use **angular, geometric icons** only. The Voltron universe is built on hard edges and mechanical precision — rounded, bubbly, or "friendly" icons break the aesthetic.

**Recommended icon set:** [Tabler Icons](https://tabler.io/icons) (outline style, available via CDN).

**Rules:**
- Icon stroke weight: `1.5px` — thin and precise, like technical schematics.
- No filled/solid icon variants. Outline only.
- Icon color always matches the current page's `--lion-accent` for interactive icons, or `--text-secondary` for decorative ones.
- Size: `20px` for inline/nav icons, `32px` for feature icons, `48px` for empty state illustrations.

---

## 5. Navigation

The nav bar appears on all pages and represents the five lions in formation — always together, always ready to form Voltron.

**Structure:** Horizontal top nav bar on desktop, collapsible bottom nav on mobile.

**Lion color indicators:** Each nav link gets a colored left-border (desktop) or colored top-border (mobile) that matches its lion's accent color. The *active* page link glows with a subtle box-shadow using its lion color. Inactive links are muted but still show their lion color faintly.

```css
/* Example nav link theming */
.nav-link[data-page="home"]   { --nav-accent: #C9A84C; } /* Black Lion gold */
.nav-link[data-page="create"] { --nav-accent: #FF4040; } /* Red Lion */
.nav-link[data-page="orders"] { --nav-accent: #4A9EE8; } /* Blue Lion */
.nav-link[data-page="update"] { --nav-accent: #3DCA5A; } /* Green Lion */
.nav-link[data-page="track"]  { --nav-accent: #F0C030; } /* Yellow Lion */

.nav-link {
  border-left: 3px solid transparent;
  transition: border-color 0.2s, color 0.2s;
}
.nav-link:hover,
.nav-link.active {
  border-left-color: var(--nav-accent);
  color: var(--nav-accent);
  box-shadow: inset 0 0 12px color-mix(in srgb, var(--nav-accent) 15%, transparent);
}
```

**App name / logo treatment:** Display "VOLTRON ORDER TRACKER" in Orbitron at the nav's left edge. On hover, the five letters of "VOLTRON" each briefly flash their lion's color in sequence (V=black/gold, O=red, L=blue, T=green, R=yellow, O=yellow, N=gold) using a CSS animation.

---

## 6. Page Transitions — The Assembly Effect

This is the signature interaction of the application. Every time the user navigates between pages, the transition should feel like the five lions flying together to form Voltron. Keep it fast and punchy — no longer than **600ms total** — so it never feels slow.

### How it works

**On navigate (leaving a page):**
1. Five thin colored bars (one per lion, in their accent colors) sweep in from the edges of the screen simultaneously, meeting in the center. Each bar is ~20% of screen width/height.
2. They "lock together" in the center for one frame (about 80ms) — this is the assembled moment.
3. The new page content fades in behind them as the bars sweep back out.

**Implementation — CSS + vanilla JS:**

```css
/* Transition overlay */
#voltron-transition {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
}

.vt-bar {
  height: 100vh;
  transform: scaleY(0);
  transform-origin: center;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.vt-bar:nth-child(1) { background: #C9A84C; } /* Black Lion gold */
.vt-bar:nth-child(2) { background: #CC3333; } /* Red Lion */
.vt-bar:nth-child(3) { background: #3A8EDF; } /* Blue Lion */
.vt-bar:nth-child(4) { background: #33AA55; } /* Green Lion */
.vt-bar:nth-child(5) { background: #DDB830; } /* Yellow Lion */

#voltron-transition.assembling .vt-bar {
  transform: scaleY(1);
}

#voltron-transition.dispersing .vt-bar {
  transform: scaleY(0);
  transition-delay: calc(var(--i) * 40ms);
}
```

```javascript
// Transition controller
function navigateTo(pageId) {
  const overlay = document.getElementById('voltron-transition');

  // Phase 1: Assemble (bars sweep in)
  overlay.classList.add('assembling');

  setTimeout(() => {
    // Phase 2: Swap the page content while bars are covering screen
    showPage(pageId);

    // Phase 3: Disperse (bars sweep out, revealing new page)
    overlay.classList.remove('assembling');
    overlay.classList.add('dispersing');

    setTimeout(() => {
      overlay.classList.remove('dispersing');
    }, 350);
  }, 280);
}
```

**Accessibility:** Wrap all transition animations in `@media (prefers-reduced-motion: no-preference)`. When reduced motion is preferred, skip the bar animation entirely and do a simple 150ms opacity crossfade between pages.

```css
@media (prefers-reduced-motion: reduce) {
  .vt-bar { transition: none; transform: scaleY(0) !important; }
  .page { transition: opacity 0.15s; }
}
```

---

## 7. Layout and Spacing

### 7a. General Rules

- **Full viewport height baseline:** Every page should fill the viewport height (`min-height: 100vh`). Content that is longer than the viewport scrolls naturally — never clip or hide overflow unless it's a deliberate modal/overlay.
- **Max content width:** `1200px`, centered with `margin: 0 auto` and `padding: 0 clamp(1rem, 4vw, 3rem)`.
- **Never feel cramped:** Minimum `2rem` padding inside all cards and containers. White (or dark) space is not wasted space — it makes the page feel more like a premium cockpit dashboard and less like a cluttered spreadsheet.
- **Never feel too busy:** If a section has more than 3–4 distinct visual elements competing for attention, simplify. One focal point per section.

### 7b. Responsive Behavior

Use CSS Grid and Flexbox — no fixed pixel widths on layout containers. The page must reflow smoothly at all viewport widths.

```css
/* Base grid */
.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(1rem, 3vw, 2rem);
}
```

**Breakpoints:**

| Name | Width | Behavior |
|---|---|---|
| Mobile | `< 640px` | Single column, bottom nav, stacked sections |
| Tablet | `640px – 1024px` | Two columns where appropriate, side nav |
| Desktop | `> 1024px` | Full layout, top nav, multi-column grids |

### 7c. Cards and Surfaces

All cards use:
- Background: `color-mix(in srgb, var(--lion-color) 20%, #12121F)` — tinted slightly with the page's lion color
- Border: `1px solid color-mix(in srgb, var(--lion-accent) 25%, transparent)`
- Border radius: `8px`
- On hover (interactive cards): border color brightens to `var(--lion-accent)`, subtle glow: `box-shadow: 0 0 16px color-mix(in srgb, var(--lion-accent) 20%, transparent)`

---

## 8. Buttons and Interactive Controls

### 8a. Primary Button

Used for the main action on each page (e.g., "Launch It", "Track My Order").

```css
.btn-primary {
  background: var(--lion-accent);
  color: #0D0D1A;
  font-family: 'Exo 2', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px; /* Deliberately less rounded — angular Voltron feel */
  cursor: pointer;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
}

.btn-primary:hover {
  box-shadow: 0 0 20px color-mix(in srgb, var(--lion-accent) 50%, transparent);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}
```

### 8b. Secondary Button

Used for cancel, back, or lesser actions.

```css
.btn-secondary {
  background: transparent;
  color: var(--lion-accent);
  border: 1.5px solid var(--lion-accent);
  /* Same sizing as primary */
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: color-mix(in srgb, var(--lion-accent) 12%, transparent);
}
```

### 8c. Form Inputs

```css
input, select, textarea {
  background: #16162A;
  border: 1.5px solid #2A2A4A;
  border-radius: 4px;
  color: #E8E8F0;
  font-family: 'Exo 2', sans-serif;
  padding: 0.65rem 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--lion-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--lion-accent) 20%, transparent);
  outline: none;
}
```

Data / ID fields use `font-family: 'Share Tech Mono', monospace` instead.

---

## 9. Individual Page Notes

### Home (Black Lion)

- Hero section: large Orbitron heading, dark background, gold trim details.
- Introduce the app with a witty one-liner ("Your orders, defended across the universe.").
- Featured stats or quick links in gold-bordered cards.
- The Black Lion is the leader — this page sets the tone. It should feel authoritative and polished.

### Create (Red Lion)

- The Red Lion is bold and aggressive. This page should feel urgent and energetic.
- Use deep crimson backgrounds with bright red call-to-action elements.
- Form for creating a new order. Primary button: "Fire It Up" or "Launch Order."
- Input focus states use red glow.

### Orders (Blue Lion)

- The Blue Lion is steady and dependable. This page should feel organized and trustworthy.
- Order list/table on a deep cobalt background. Sky blue for interactive row highlights.
- Use `Share Tech Mono` for order IDs and dates.
- Primary action: "View Orders" or "Lock On."

### Update (Green Lion)

- The Green Lion is quick and clever. This page should feel nimble and responsive.
- Edit form for existing orders. Forest green tones, bright green accents.
- Confirmation state (after save): brief flash of bright green across the page border.
- Primary button: "Update Systems" or "Apply Changes."

### Track (Yellow Lion)

- The Yellow Lion is warm and supportive. This page should feel reassuring — users come here when they're anxious about their order.
- Progress tracker / timeline visualization using gold-yellow accents.
- Status steps rendered as a horizontal or vertical timeline with yellow lion-colored active states.
- Primary copy tone: reassuring, confident. "Your order is in good hands. Here's exactly where it is."

### Login / Sign-Up

- Full Voltron logo palette (all five colors).
- Center the form card on the page with a subtle Voltron 5-color stripe across the top of the card.
- Minimal layout — no distractions.
- Login heading: "Identify Yourself, Paladin." Sign-Up: "Join the Coalition."

### Draft

- Multi-step form feel. Show progress with a Voltron-striped progress bar.
- Autosave indicator: small grey dot that turns gold when saved.

### Contact Us

- Keep it simple. Form + a fun line like "Got a problem? Let Voltron's support team handle it."
- Voltron stripe as a decorative divider between the intro text and the form.

### Sort

- Sorting/filtering controls. Lion accent colors can be used to color-code filter tags or category chips.
- Clean, minimal layout — this is a utility page, don't over-design it.

### Profile

- User details, settings. More personal — warmer tone.
- Avatar placeholder can be a stylized lion silhouette icon (geometric, angular).

### Error Page (Galra Empire)

- Dark purple void. Sickly yellow-green and magenta accents.
- Large Orbitron heading: "The Galra Have Struck." or "System Compromised."
- Error code in `Share Tech Mono`, styled to look like a corrupted readout.
- Animated: subtle flickering effect on the heading (CSS `@keyframes` opacity flicker, 0.1s interval, 3–4 cycles then stops — feels like a damaged screen, not a seizure hazard).
- Clear button to go back home: "Retreat to Safety" — styled in Galra purple, not lion colors.
- Wrap flicker animation in `@media (prefers-reduced-motion: no-preference)`.

---

## 10. Accessibility Baseline

These are non-negotiable minimums, not optional extras.

- All text must meet **WCAG AA contrast** against its background. Check every color combination.
- All interactive elements must have visible `:focus` styles (the lion glow effect counts if it's strong enough).
- All images and icon-only buttons must have `alt` text or `aria-label`.
- Page transitions must respect `prefers-reduced-motion` (see Section 6).
- Form inputs must have associated `<label>` elements — no placeholder-only labels.
- Color must never be the *only* way information is conveyed (e.g., error states need both a red border AND an error message, not just the red border).

---

## 11. Quick Reference — CSS Custom Properties

Set these on the `<html>` or `body` element and override them per page:

```css
:root {
  /* Updated per page */
  --lion-color:  #1C1C2E;
  --lion-accent: #C9A84C;
  --lion-base:   #12121F;

  /* Global — never change */
  --text-primary:   #E8E8F0;
  --text-secondary: #8888AA;
  --surface:        #16162A;
  --border:         #2A2A4A;

  /* Type */
  --font-display: 'Orbitron', sans-serif;
  --font-body:    'Exo 2', sans-serif;
  --font-data:    'Share Tech Mono', monospace;

  /* Spacing */
  --gap-sm:  0.5rem;
  --gap-md:  1rem;
  --gap-lg:  2rem;
  --gap-xl:  3rem;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
}
```
