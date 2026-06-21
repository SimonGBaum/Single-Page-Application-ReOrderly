# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Client (run from `client/`):

```bash
npm run dev        # start Vite dev server with HMR
npm run build      # production build → client/dist/
npm run preview    # preview the production build locally
npm run lint       # run ESLint
```

No test runner is configured yet.

Supabase CLI (run from `supabase/` using `npx supabase` or `./node_modules/.bin/supabase`):

```bash
npx supabase db push               # apply local migrations to remote
npx supabase db pull               # pull remote schema changes
npx supabase db diff               # generate a migration from schema diff
npx supabase db reset              # reset local DB to migration state
npx supabase gen types typescript  # regenerate TypeScript types from schema
```

See `supabase/CLAUDE.md` for full CLI guidance. Remote project ref: `zdvdqialhtghbbjvqdol`.

## Architecture

Monorepo with a single `client/` package and a `supabase/` reference directory.

```
client/
  src/
    context/     # AuthContext + OrdersContext (React Context + useReducer)
    data/        # Legacy localStorage layer (userStore.js, orderStore.js) — superseded by services/
    services/    # Active Supabase integration: api.js, authService.js, orderService.js, userService.js
    pages/       # One folder per route, each with JSX + CSS
    components/  # Shared UI (Navbar, PageWrapper, ProtectedRoute, VoltronTransition, OfflineBanner)
    styles/      # tokens.css (CSS custom props) + animations.css
    utils/       # hashPassword, generateId, formatDate (+ addDays, frequencyToDays), debounce
  skeleton/      # Design docs: app_outline.md, style.guide.md, user_journey.md, wireframe PNGs
supabase/
  supabase/
    migrations/  # Four migrations: updated_at trigger, users, orders, delivery_schedules tables
```

**Bootstrap / provider hierarchy** (`main.jsx`):
```
ErrorBoundary → BrowserRouter → AuthProvider → OrdersProvider → App
```
`ErrorBoundary` catches render crashes and redirects to `/error`.

**Data persistence: Supabase (migration complete for contexts and pages).** The `src/data/` localStorage stores are superseded — `AuthContext` and `OrdersContext` now call the `services/` layer directly. The `data/` files remain on disk but are no longer on the active code path.

**Services layer** (`src/services/`):
- `api.js` — exports two Axios instances: `api` (PostgREST at `/rest/v1`, attaches Bearer token from `reorderly_session`) and `authApi` (GoTrue at `/auth/v1`). The `api` interceptor auto-redirects to `/login` on 401.
- `authService.js` — `signUp`, `signIn`, `signOut`, `getAuthUser`, `updatePassword`, `updateEmail`, `getEmailByUsername` (calls Supabase RPC `get_email_by_username` — login is by username, not email)
- `orderService.js` — `getOrders`, `getOrderById`, `createOrder`, `updateOrder`, `deleteOrder`. Uses `normalizeOrder()` to flatten the joined `delivery_schedules` row into the app's camelCase order shape. `createOrder` writes to `orders` then optionally `delivery_schedules` for recurring types.
- `userService.js` — `createProfile`, `getProfile`, `updateProfile`. Maps snake_case `users` table columns to camelCase profile shape.

**Routing:** Wired in `src/App.jsx`. Public routes: `/login`, `/signup`, `/contact`, `/error`. All other routes are wrapped in `<ProtectedRoute>` which redirects to `/login` if no session exists.

**Auth flow:** On app load, `AuthContext` reads the `reorderly_session` key from localStorage, validates the token with Supabase (`getAuthUser`), fetches the profile (`getProfile`), then dispatches `LOGIN`. On login, pages call `authService.signIn` + `userService.getProfile` manually before dispatching. Session is stored as `{ accessToken, refreshToken, expiresAt }` in localStorage.

**Order shape (camelCase, used throughout the app) vs DB (snake_case):** `orderService.normalizeOrder` is the canonical mapping. Key split: `orders` table holds product/store fields; `delivery_schedules` (joined as `delivery_schedules(*)`) holds frequency/count fields. This join is always fetched with `ORDER_SELECT = '*,delivery_schedules(*)'`.

Passwords are SHA-256 hashed client-side (Web Crypto API) before passing to Supabase — see `src/utils/hashPassword.js`.

## Application: Reorderly

A recurring-order tracker. Users create, update, and track orders (medications, food, household goods) and set delivery frequencies. Single user type — no admin role. All data is private per user.

**Pages:** Login, Sign-Up, Home, Orders, Create Order, Update Order, Track Order, Profile, Contact Us, Error.

**Order shape (key fields):** `orderId`, `userId`, `status` (draft/active/paused/completed/cancelled), `orderType` (one-time/recurring), `orderNickname`, `productName`, `productType`, `productQuantity`, `storeName`, `storeAddress`, `itemDescription`, `deliveryFrequency` (weekly/biweekly/monthly/custom), `customFrequencyDays`, `numberOfDeliveries`, `untilCancelled`, `deliveriesCompleted`, `lastDeliveryDate`, `expectedDeliveryDate`, `dateCreated`, `dateOrdered`.

## Design System — Voltron Theme

`client/skeleton/style.guide.md` is the **single source of truth** for all visual and UX decisions. Read it before building any UI. Key rules:

**Per-page lion theming:** The five main functional pages each map to a Voltron lion. Apply the lion's colors as CSS custom properties on the page wrapper:

| Page | Lion | `--lion-color` | `--lion-accent` |
|---|---|---|---|
| Home | Black | `#1C1C2E` | `#C9A84C` |
| Create | Red | `#8B1A1A` | `#FF4040` |
| Orders | Blue | `#0D2B5E` | `#4A9EE8` |
| Update | Green | `#0F3320` | `#3DCA5A` |
| Track | Yellow | `#3D2E00` | `#F0C030` |

Supporting pages (Login, Sign-Up, Profile, Contact Us) use the full Voltron logo palette — all five lion accent colors as decorative highlights on a `#0D0D1A` deep space background.

The Error page uses the Galra Empire palette: `#0A0010` background, `#7B2FBE` primary accent.

**Fonts:** Orbitron (headings), Exo 2 (body/UI), Share Tech Mono (IDs, tracking numbers, timestamps) — all via Google Fonts.

**Icons:** Tabler Icons, outline style only, `1.5px` stroke.

**Buttons:** Angular (`border-radius: 4px`). Primary uses `--lion-accent` fill; secondary uses transparent fill with `--lion-accent` border.

**Page transitions:** The "Voltron assembly" effect — five colored bars sweep in from screen edges to center, hold one frame, then sweep back out as the new page appears. Total duration ≤ 600ms. Always wrap in `@media (prefers-reduced-motion: no-preference)` and fall back to a simple 150ms opacity crossfade. Implemented in `src/components/VoltronTransition/`.

**Microcopy tone:** Casual and witty, Voltron-universe flavored. 8th-grade reading level, active voice, sentence case. Examples: "Launch It" not "Submit", "The Galra got to this page. Try again." not "An error occurred."

**Accessibility:** WCAG AA contrast on all text, visible `:focus` states, `aria-label` on icon-only buttons, `<label>` on all form inputs, never use color as the sole error indicator.
