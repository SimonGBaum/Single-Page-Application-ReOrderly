# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from `client/`:

```bash
npm run dev        # start Vite dev server with HMR (port 5173)
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint
```

No test runner is configured.

## Environment variables

Create `client/.env.local` (not committed):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Both are read in `src/services/api.js` via `import.meta.env`.

## Services layer details

`api.js` sets `Prefer: return=representation` globally so every POST and PATCH returns the affected row(s) directly in `data`. Callers can destructure `{ data }` immediately — except `createOrder`, which calls `getOrderById` after insert to get the joined `delivery_schedules` shape.

The `api` interceptor redirects to `/login` on any 401. The `authApi` instance does **not** redirect — it's used for auth operations that should handle errors locally.

**Sign-up quirk:** Supabase no longer returns a session on `/signup`, so `authService.signUp` immediately calls `authService.signIn` to obtain a token before profile creation can proceed (profile insert requires an authenticated Bearer token).

**Draft persistence:** `src/services/draftService.js` is a thin localStorage wrapper (`reorderly_draft_{userId}`) used by `CreateOrder` to autosave form state. Separate from the main `api` layer — no Supabase calls.

**`updateOrder` split-write:** `orderService.updateOrder` inspects which keys are present in `updates` and fans writes across both the `orders` table (product/store fields) and `delivery_schedules` table (frequency/count fields) independently. Only tables with at least one changed field are patched, then `getOrderById` is called to return the fresh joined shape.

## Context API

**`useAuth()`** — exposes `{ user, isLoading, dispatch, logout }`. `user` is the camelCase profile merged with `email` from Supabase auth. `isLoading: true` while the session is being validated on mount.

**`useOrders()`** — exposes `{ orders, activeTab, dispatch }`. Loads on `user` change. Dispatch actions: `SET_ORDERS`, `ADD_ORDER`, `UPDATE_ORDER` (takes `{ orderId, updates }`), `DELETE_ORDER` (takes the orderId string), `SET_TAB`.

## VoltronTransition

The component is a canvas-based `requestAnimationFrame` animation, **not** a CSS-class-driven state machine. Timing constants (all in ms):

| Constant | Value | Meaning |
|---|---|---|
| `TOTAL_MS` | 1800 | Total animation runtime; component returns to `null` after this |
| `TRAIL_END` | 600 | Four colored trails (Red/Green/Blue/Yellow) converge from corners to center over this window |
| `BURST_START` / `BURST_END` | 400–700 | Gold ring burst pulses at the center |
| `CANVAS_STOP` | 750 | Canvas draw calls stop; canvas clears |

State is a simple `{ running: boolean }` reducer (`START` / `STOP`). The component returns `null` when `running: false`, removing it from the DOM entirely. CSS classes on the overlay are `vt-overlay`, `vt-canvas`, `vt-wordmark` — there are no `voltron-overlay--{phase}` classes.

Respects `prefers-reduced-motion: reduce` — if set, the transition is skipped entirely.

## Key localStorage keys

| Key | Purpose |
|---|---|
| `reorderly_session` | `{ accessToken, refreshToken, expiresAt }` — read by `api.js` interceptor on every request |
| `reorderly_draft_{userId}` | Auto-saved `CreateOrder` form data |

## What to ignore

`src/data/userStore.js` and `src/data/orderStore.js` are legacy localStorage stores superseded by the `services/` layer. They remain on disk but are not imported anywhere active.
