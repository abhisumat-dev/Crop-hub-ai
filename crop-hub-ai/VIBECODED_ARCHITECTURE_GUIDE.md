# 🌾 CropHub AI — The Complete Vibe-Coder's Master Guide & Architecture Blueprint

> **"Built with pure vision, prompts, and modern AI engineering tools — from zero to a production-grade, hackathon-winning Agritech platform."**

---

## 📑 Table of Contents
1. [What is CropHub AI? (Project Overview & Features)](#1-what-is-crophub-ai)
2. [Real-World Agronomic & Market Problems Solved](#2-real-world-problems-identified--how-they-are-solved)
3. [Technology Stack, Languages & AI Tooling](#3-technology-stack-tools--languages)
4. [File-by-File Architectural Breakdown & System Flow](#4-file-by-file-architectural-breakdown--system-flow)
5. [Technical Hurdles Overcome & Production Knowledge Base](#5-technical-hurdles-overcome--engineering-solutions)
6. [Critical Code Snippets & Algorithmic Deep Dive](#6-critical-code-snippets--algorithmic-deep-dive)
7. [Getting Started & Operational Commands](#7-getting-started--operational-commands)

---

## 1. What is CropHub AI?

**CropHub AI** is an intelligent, full-stack Agritech Decision Intelligence and Market Discovery platform built for **Smart India Hackathon (SIH) 2026**. It bridges the gap between field-level soil science, real-time meteorological forecasts, and volatile APMC (Agricultural Produce Market Committee) mandi commodity rates across Indian agricultural regions.

### 🌟 Core Capabilities & Features
* **🎯 100-Point Multi-Dimensional Crop Recommendation Engine**:
  Synthesizes 4 distinct agronomic layers: **Soil Compatibility (35%)**, **NPK Chemistry (20%)**, **Precipitation & Water Budget (20%)**, and **Market Profitability/ROI (25%)**.
* **🌦️ Live Climate Intelligence & Drought Risk Engine**:
  Integrates with OpenWeatherMap 5-day / 3-hour forecast APIs to compute seasonal precipitation budgets per district and assess dryland drought risk.
* **⚖️ AI vs. Habit Crop Comparator**:
  Allows farmers to enter their traditional crop (e.g. Cotton or Sugarcane) and renders a side-by-side comparative breakdown showing net profit delta, water savings, and a synthesized agronomic verdict.
* **📊 Visual Profitability Analytics**:
  Interactive Recharts bar charts showing Input Cost vs. Expected Market Revenue per acre for top-ranked crops.
* **🛡️ PIN-Protected APMC Market Admin Portal**:
  Secure portal for market administrators to update commodity prices in real time, which automatically updates 7-day trend percentages (`trend_7d`) and instantly recalibrates farmer recommendations.
* **📄 Print & PDF Report Generation**:
  Integrated print stylesheet (`print.css`) allowing farmers to generate clean, A4-formatted agronomic advisory reports with a single click.
* **🌐 Trilingual Localization**:
  Full interface translation across **English**, **Marathi (मराठी)**, and **Hindi (हिंदी)**.
* **🌓 Dynamic Theme Engine**:
  Tailored dark and light modes with custom CSS tokens, accessible contrast, and zero layout shift.
* **📱 Progressive Web App (PWA)**:
  Installable on Android and mobile devices via `manifest.json`.

---

## 2. Real-World Problems Identified & How They Are Solved

### Problem 1: Intuition-Based Crop Selection (The Monoculture Trap)
* **The Reality**: Across many agrarian belts (e.g., Marathwada, Vidarbha, Malwa, and northern plains), millions of farmers repeatedly sow Soybean, Cotton, or Wheat year after year regardless of soil nutrient depletion or weather outlook, frequently leading to crop failure or debt.
* **The Solution**: CropHub AI takes real soil test inputs (Soil Type, pH, and Nitrogen, Phosphorus, Potassium levels) and calculates exact biological compatibility scores against ICAR crop baselines.

### Problem 2: Weather Guesswork & Water Budget Deficits
* **The Reality**: Rainfall in semi-arid zones like Solapur or Latur is highly erratic. Farmers often sow water-intensive crops (like Sugarcane needing 1,800mm) in regions forecasting only 400mm rainfall.
* **The Solution**: The engine compares forecasted seasonal precipitation against each crop's biological water requirement. It penalizes crops with severe deficits while simultaneously penalizing waterlogging-sensitive crops in high-rainfall zones.

### Problem 3: Price Volatility & Mandi Information Asymmetry
* **The Reality**: Farmers sell at distressed rates because APMC market rates fluctuate daily and are not factored into planting decisions.
* **The Solution**: CropHub connects live modal prices from APMC markets directly into the scoring algorithm. If onion prices crash, onion's market score decreases proportionally, elevating resilient alternative crops.

### Problem 4: Language & Digital Divide
* **The Reality**: Most agricultural software is English-first and unusable for grassroots farmers.
* **The Solution**: Instant language switching to Marathi and Hindi with clear visual icons, color-coded badges, and printable paper reports.

---

## 3. Technology Stack, Tools & Languages

| Category | Technology / Library | Purpose in CropHub AI |
|---|---|---|
| **Framework** | **Next.js 16 (App Router + Turbopack)** | Full-stack architecture, React Server Components, API routes |
| **Language** | **TypeScript 5 (Strict Mode)** | Type-safe data modeling for crop records, inputs, and API responses |
| **Styling** | **Tailwind CSS v4 + Vanilla CSS** | Modern UI styling, CSS custom variables, responsive grid |
| **UI Components** | **shadcn/ui + Radix UI primitives** | Accessible dialogs, cards, buttons, badges, tables, sliders |
| **Icons** | **Lucide React** | Consistent, high-quality agricultural and dashboard iconography |
| **Charts** | **Recharts 2.15** | Bar charts visualizing Cost vs. Revenue per acre |
| **Database** | **Supabase (PostgreSQL)** | Persistent storage of `crops_master` table and pricing data |
| **External APIs** | **OpenWeatherMap API** | Live geocoding and 5-day precipitation forecasts |
| **Security** | **Node.js `crypto` (HMAC-SHA256)** | Cryptographically signed session tokens for admin access |
| **Notifications** | **Sonner** | Modern toast notifications for real-time feedback |
| **CI/CD** | **GitHub Actions** | Automated typechecking and production build verification on push |

---

## 4. File-by-File Architectural Breakdown & System Flow

```
d:\SIH 2026\crop-hub-ai\
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/route.ts       # Admin PIN auth with rate limiting & HMAC cookie
│   │   │   ├── logout/route.ts      # CSRF-guarded session termination
│   │   │   └── update-price/route.ts # Supabase price update + 7-day trend calculation
│   │   ├── crops/route.ts           # Fetches master crop list from Supabase / mock
│   │   ├── health/route.ts          # Database ping & system latency monitor
│   │   ├── recommend/route.ts       # Core recommendation API (validation + scoring)
│   │   └── weather/route.ts         # Geocoding + precipitation aggregation proxy
│   ├── globals.css                  # Design tokens, color schemes & glassmorphism
│   ├── layout.tsx                   # Root HTML, SEO meta tags, OpenGraph & PWA links
│   ├── page.tsx                     # Main client controller & view router (Landing/Farmer/Admin)
│   └── print.css                    # A4 print stylesheet for clean PDF export
├── components/
│   ├── admin-view.tsx               # APMC Market Dashboard, price editor & modal
│   ├── farmer-view.tsx              # Farmer workspace: soil inputs, weather, results
│   ├── landing-view.tsx             # Interactive landing page with animated stats & roles
│   ├── farmer/
│   │   ├── analysis-results.tsx     # Top 3 crop cards, Recharts chart & print button
│   │   ├── comparator-card.tsx      # Side-by-side habitual vs AI crop breakdown
│   │   ├── soil-form.tsx            # Soil parameters, pH slider, NPK selector
│   │   └── weather-card.tsx         # Live temperature, rainfall & drought indicators
│   └── ui/                          # shadcn/ui components (button, card, dialog, table...)
├── lib/
│   ├── auth.ts                      # HMAC-SHA256 session token generator & verifier
│   ├── rate-limit.ts                # In-memory sliding window rate limiter
│   ├── scoring.ts                   # 100-point multi-factor agronomic algorithm
│   ├── supabase.ts                  # Supabase client singleton & mock fallback
│   ├── translations.ts              # English, Marathi, and Hindi dictionary
│   ├── types.ts                     # TypeScript interfaces for all system entities
│   └── weather.ts                   # OpenWeatherMap fetcher & historical district baselines
├── public/
│   └── manifest.json                # PWA configuration for mobile installation
├── tests/
│   ├── run-tests.ps1                # Automated 51-test suite (PowerShell)
│   └── retest.ps1                   # Targeted security and validation test runner
├── schema.sql                       # PostgreSQL schema & initial seeding for Supabase
├── package.json                     # Project manifest and scripts
└── next.config.mjs                  # Security headers (CSP, X-Frame-Options)
```

---

## 5. Technical Hurdles Overcome & Engineering Solutions

During development, multiple complex technical hurdles were identified and resolved:

### 1. The Session Forgery Flaw (Critical Security Fix)
* **The Hurdle**: The admin session was initially identified by a static cookie value (`"authenticated"`). Any user could open DevTools and bypass authentication by setting the cookie manually.
* **The Fix**: Rewrote [`lib/auth.ts`](file:///d:/SIH%202026/crop-hub-ai/lib/auth.ts) to use **HMAC-SHA256 cryptographic signatures** with `crypto.timingSafeEqual`. Each session generates a random 24-byte payload signed with a server secret. Forged or altered cookies fail validation instantly.

### 2. Login Brute-Force Vulnerability
* **The Hurdle**: The 4-digit admin PIN could be brute-forced without rate limits.
* **The Fix**: Integrated our sliding-window rate limiter in [`app/api/admin/login/route.ts`](file:///d:/SIH%202026/crop-hub-ai/app/api/admin/login/route.ts), restricting login attempts to **5 per minute per IP** with `429 Too Many Requests`.

### 3. IP Spoofing on Serverless Reverse Proxies
* **The Hurdle**: Attackers can spoof `X-Forwarded-For: 1.2.3.4` to evade rate limiting.
* **The Fix**: Upgraded [`lib/rate-limit.ts`](file:///d:/SIH%202026/crop-hub-ai/lib/rate-limit.ts) to prioritize platform-verified headers (`x-vercel-forwarded-for`, `cf-connecting-ip`) before untrusted proxy headers.

### 4. Flawed Water Scoring (The Over-Watering Bug)
* **The Hurdle**: When rainfall exceeded crop requirements, the algorithm gave a score of 100/100, ignoring the fact that flooding and waterlogging destroy dryland crops like Chickpea or Jowar.
* **The Fix**: Updated [`lib/scoring.ts`](file:///d:/SIH%202026/crop-hub-ai/lib/scoring.ts) so that rainfall up to 1.8× water demand receives 100 points, but excess precipitation beyond 1.8× incurs a graduated penalty.

### 5. Negative ROI Flattening
* **The Hurdle**: All loss-making crops received an identical market score of `0`, making a crop losing ₹20,000/acre indistinguishable from a crop losing ₹100/acre.
* **The Fix**: Implemented proportional negative ROI scaling (0–20 points) so slightly unprofitable crops rank above financially catastrophic ones.

### 6. Realistic 90-Day Kharif Season Rain Estimation
* **The Hurdle**: Extrapolating a 5-day monsoon forecast directly (`5-day rain × 18`) could produce unrealistic numbers exceeding 3,000mm.
* **The Fix**: Capped extrapolation in [`lib/weather.ts`](file:///d:/SIH%202026/crop-hub-ai/lib/weather.ts) at 1,500mm and blended live forecasts with historical district baselines (60% live forecast / 40% historical average).

---

## 6. Critical Code Snippets & Algorithmic Deep Dive

### A. The 100-Point Agronomic Multi-Factor Scoring Engine
*Located in [`lib/scoring.ts`](file:///d:/SIH%202026/crop-hub-ai/lib/scoring.ts)*

```typescript
const WEIGHTS = { soil: 0.35, npk: 0.2, weather: 0.2, market: 0.25 } as const

// 1. Soil & pH Matching (35%)
function scoreSoil(farmer: FarmerInput, crop: CropRow): number {
  const soilTypeMatch = crop.preferred_soil_types.some(
    (s) => s.toLowerCase() === farmer.soil_type.toLowerCase(),
  )
  const soilTypePoints = soilTypeMatch ? 60 : 20

  let phPoints: number
  if (farmer.soil_ph >= crop.ideal_ph_min && farmer.soil_ph <= crop.ideal_ph_max) {
    phPoints = 40
  } else {
    const distance =
      farmer.soil_ph < crop.ideal_ph_min
        ? crop.ideal_ph_min - farmer.soil_ph
        : farmer.soil_ph - crop.ideal_ph_max
    phPoints = Math.max(0, 40 - distance * 20)
  }
  return Math.round(soilTypePoints + phPoints)
}

// 2. Weather & Waterlogging Penalty (20%)
function scoreWeather(weather: WeatherResult, crop: CropRow): number {
  const ratio = weather.rainfall_mm / crop.water_requirement_mm
  if (ratio < 1) return Math.round(Math.max(0, ratio * 100))
  if (ratio <= 1.8) return 100 // Ideal moisture
  return Math.round(Math.max(40, 100 - (ratio - 1.8) * 35)) // Waterlogging penalty
}

// 3. Market ROI with Negative Loss Scaling (25%)
function scoreMarket(crop: CropRow, maxRoi: number, minRoi: number): number {
  const profit = crop.avg_yield_quintals_per_acre * crop.modal_price_per_qtl - crop.base_cost_per_acre
  const roi = crop.base_cost_per_acre > 0 ? profit / crop.base_cost_per_acre : 0
  if (roi >= 0) {
    if (maxRoi <= 0) return 50
    return Math.round(Math.min(1, roi / maxRoi) * 100)
  }
  const lossSpan = Math.abs(minRoi) || 1
  const lossRatio = Math.min(1, Math.abs(roi) / lossSpan)
  return Math.round(Math.max(0, 20 * (1 - lossRatio)))
}
```

### B. Cryptographic HMAC Token Authentication & Constant-Time Verification
*Located in [`lib/auth.ts`](file:///d:/SIH%202026/crop-hub-ai/lib/auth.ts)*

```typescript
import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

export function generateSessionToken(): string {
  const payload = randomBytes(24).toString('hex')
  const hmac = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return `${payload}.${hmac}`
}

export function verifySessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payload, signature] = parts

  const expectedHmac = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  if (expectedHmac.length !== signature.length) return false

  // Constant-time buffer comparison to prevent timing attacks
  return timingSafeEqual(Buffer.from(expectedHmac), Buffer.from(signature))
}
```

### C. In-Memory Sliding-Window Rate Limiter
*Located in [`lib/rate-limit.ts`](file:///d:/SIH%202026/crop-hub-ai/lib/rate-limit.ts)*

```typescript
export function rateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || entry.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { success: true }
  }

  if (entry.count >= limit) {
    return { success: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count += 1
  return { success: true }
}
```

---

## 7. Getting Started & Operational Commands

### 🚀 Running Locally
```bash
# 1. Navigate to the app directory
cd crop-hub-ai

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Start the Turbopack development server
npm run dev
# App will run at http://localhost:3000
```

### 🧪 Executing the Automated Test Suite
```bash
# Run the complete 51-test suite
powershell -ExecutionPolicy Bypass -File tests/run-tests.ps1

# Run the fast targeted security verification suite
powershell -ExecutionPolicy Bypass -File tests/retest.ps1
```

### 🏗️ Building for Production
```bash
# Run TypeScript typecheck
npx tsc --noEmit

# Run production build
npm run build
```

---

## 🏁 Summary: Why This Platform Stands Out
CropHub AI isn't just a prototype — it is an engineered, production-ready system featuring:
1. **Real-world agronomic grounding** (ICAR standards + nationwide multi-zone climate data).
2. **Robust security architecture** (HMAC sessions, rate limiting, XSS/SQL defenses, security headers).
3. **World-class UX & Accessibility** (Trilingual, Dark Mode, Recharts, Mobile PWA, Instant PDF Reports).
4. **Clean, documented code** ready for review, deployment, and real-world impact.
