# CropHub AI — Full-Stack Working App Upgrade

## Overview

The current app has the right bones but several gaps that prevent it from being a production-ready, fully-functional application. This plan fills those gaps across auth, data, UX, and reliability.

---

## What's Missing / Broken Right Now

| Gap | Details |
|---|---|
| **No authentication** | Anyone can open Admin Console — no password/session protection |
| **Page refresh = state lost** | App state is in-memory only; refreshing sends you back to landing |
| **Seasonal rainfall is wrong** | Live weather extrapolates 1hr rain × 24 × 90 → very inaccurate in dry weather |
| **Only 5 hardcoded crops** | Scoring engine can only rank 5 options |
| **Admin metrics are fake** | "14 Active Mandis" is hard-coded |
| **No farmer session/history** | Results disappear on re-analysis |
| **No dark mode toggle** | CSS vars exist but no user toggle |
| **No loading skeleton UX** | Crops table shows blank during load |
| **`import` path casing inconsistency** | Some files import from `@/components/UI/`, others `@/components/ui/` |
| **No 7-day trend update** | Admin can change price but `trend_7d` is never recalculated |
| **No README / setup guide** | New contributor can't run the project |

---

## Proposed Changes

### Component 1 — Authentication (Admin PIN)

#### [NEW] `lib/auth.ts`
Simple server-side PIN check using an environment variable `ADMIN_PIN`. Generates a signed session token stored in a cookie.

#### [MODIFY] `app/api/admin/update-price/route.ts`
Verify the session cookie before processing any price update.

#### [NEW] `app/api/admin/login/route.ts`
Accepts `{ pin }` POST, validates against `ADMIN_PIN` env var, sets a `HttpOnly` session cookie.

#### [NEW] `app/api/admin/logout/route.ts`
Clears the session cookie.

#### [MODIFY] `components/admin-view.tsx`
Add a PIN login dialog that gates access to the Admin Console. Show login form first, reveal dashboard only after successful auth. Add a "Logout" button that calls the logout API.

---

### Component 2 — Expanded Crop Database (10 crops → schema)

#### [MODIFY] `schema.sql`
Add 5 more crops: **Gram (Chickpea)**, **Onion**, **Groundnut**, **Jowar (Sorghum)**, **Bajra (Pearl Millet)** — all with ICAR-aligned agronomic baselines for Maharashtra.

---

### Component 3 — Reliable Weather Integration

#### [MODIFY] `lib/weather.ts`
- Fix the hourly-to-seasonal rainfall extrapolation: instead of naively scaling 1-hr rain, use the OpenWeatherMap **forecast (5-day/3-hour)** endpoint to sum up actual forecast precipitation. Fall back to historical monthly averages for that city if forecast is zero.
- Add `humidity_pct` and `temperature_c` to the mock profiles so all cities return realistic values.

#### [MODIFY] `app/api/weather/route.ts`
Accept both GET and POST (already done), but add response caching with a 30-minute revalidation header to avoid hammering OpenWeather.

---

### Component 4 — Real Admin Dashboard Metrics

#### [MODIFY] `components/admin-view.tsx`
Replace the hardcoded "14 Active Mandis" with a computed value from the crops table. Add:
- **Avg mandi price** metric across all crops
- **Last price update** timestamp from `last_updated` column
- **Trend update on save**: when Admin saves a new price, calculate the delta percentage and write it back as the new `trend_7d`.

#### [MODIFY] `app/api/admin/update-price/route.ts`
After updating `modal_price_per_qtl`, also compute and update `trend_7d` as `((newPrice - oldPrice) / oldPrice) * 100`.

---

### Component 5 — Farmer Analysis History (Session Storage)

#### [MODIFY] `components/farmer-view.tsx`
Save the last analysis result to `sessionStorage` on successful analysis. On mount, re-hydrate from `sessionStorage` so results survive navigating away and back. Add a "Clear History" button.

---

### Component 6 — Dark Mode Toggle

#### [MODIFY] `app/layout.tsx`
Remove the hard-coded `class="light"` on `<html>`. Use `next-themes` `ThemeProvider` (already installed).

#### [MODIFY] `components/farmer-view.tsx` & `components/admin-view.tsx`
Add a sun/moon icon `Button` in the header to toggle between light and dark themes using `useTheme()` from `next-themes`.

---

### Component 7 — UI Polish & Bug Fixes

#### [MODIFY] All component files importing from `@/components/UI/`
Normalize all imports to lowercase `@/components/ui/` to prevent issues on case-sensitive file systems (Linux/Docker).

#### [MODIFY] `components/admin-view.tsx`
Add skeleton loading rows (`animate-pulse`) in the crops table while `loadingCrops = true`.

#### [MODIFY] `components/farmer/analysis-results.tsx`
Show a `net_profit_per_acre` color indicator — green if positive, red if negative (sugarcane at ₹320/qtl can go negative).

#### [MODIFY] `components/landing-view.tsx`
Add a feature highlights section below role cards: what data sources power the recommendations (ICAR, APMC, OpenWeather).

---

### Component 8 — Environment & Configuration

#### [MODIFY] `.env.local`
Add `ADMIN_PIN=` variable with a default placeholder.

#### [NEW] `README.md`
Step-by-step setup: Supabase project creation, running `schema.sql`, environment variable setup, `npm install`, `npm run dev`.

#### [MODIFY] `next.config.mjs`
Add `allowedDevOrigins` for `localhost` (currently only has one IP).

---

## Verification Plan

### Automated
```bash
# Type-check everything
npx tsc --noEmit

# Confirm dev server starts with no errors  
npm run dev
```

### Manual Verification
1. **Landing page** — Role cards, feature badges render correctly in light & dark mode
2. **Farmer workflow** — Fill form → click Run Analysis → verify weather pills update → verify 3 crop cards + chart + comparator render
3. **Farmer history** — Run analysis → navigate to landing → return to farmer → verify results still show
4. **Admin auth** — Click "Enter as APMC Admin" → PIN dialog appears → wrong PIN shows error → correct PIN grants access
5. **Admin price update** — Edit a price → save → verify `trend_7d` updates in the table → verify farmer recommendations recalculate with new price on next analysis
6. **Admin logout** — Click logout → redirected to PIN screen
7. **Dark mode** — Toggle in header, all screens respect the theme
