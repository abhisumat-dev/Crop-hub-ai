# CropHub AI 🌾

**Data-Driven Agronomy, Climate Intelligence & Market Price Discovery**

[![CI](https://github.com/abhisumat-dev/SIH/actions/workflows/ci.yml/badge.svg)](https://github.com/abhisumat-dev/SIH/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/abhisumat-dev/SIH/blob/main/LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abhisumat-dev/SIH&root-directory=crop-hub-ai&env=SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,OPENWEATHER_API_KEY,ADMIN_PIN&envDescription=See%20crop-hub-ai/.env.example%20for%20details)

CropHub AI is a full-stack Next.js application for **Smart India Hackathon 2026**. It gives farmers AI-powered crop recommendations grounded in real soil parameters, live OpenWeatherMap climate data, and APMC mandi prices — while letting market administrators update commodity rates in real time.

---

## Features

| Feature | Description |
|---|---|
| 🌱 **Crop Recommendation Engine** | Weighted scoring across Soil & pH (35%), N-P-K (20%), Rainfall (20%), and Market ROI (25%) |
| 🌤️ **Live Weather Integration** | OpenWeatherMap 5-day forecast for accurate seasonal rainfall estimation |
| 📊 **Profitability Charts** | Recharts bar chart comparing input cost vs. market revenue per acre |
| 🔄 **Smart Comparator** | Side-by-side analysis of AI pick vs. farmer's habitual crop |
| 🔐 **Admin Authentication** | PIN-protected APMC console with HttpOnly session cookies |
| 💰 **Real-Time Price Updates** | Admin edits instantly resync `trend_7d` and farmer recommendations |
| 🌐 **Multilingual** | English, Marathi (मराठी), and Hindi (हिंदी) support |
| 🌙 **Dark Mode** | Full light/dark theme toggle via `next-themes` |
| 💾 **Analysis History** | Last analysis persisted to `sessionStorage` — survives navigation |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Charts:** Recharts
- **Weather:** OpenWeatherMap Geocoding + Current + Forecast APIs
- **Fonts:** Geist Sans + Geist Mono

---

## Setup & Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-org/crop-hub-ai.git
cd crop-hub-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project**
1. In your Supabase dashboard, open **SQL Editor → New Query**
2. Paste the full contents of [`schema.sql`](./schema.sql)
3. Click **Run** — this creates the `crops_master` table and seeds 10 crops

### 5. Configure environment variables

Copy `.env.local` and fill in your values:

```bash
# Already pre-filled — replace with your own keys if using a different project
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional — app works with mock data if omitted
OPENWEATHER_API_KEY=your-openweathermap-api-key

# Admin Console PIN (default: 1234 — change before production!)
ADMIN_PIN=1234
```

**Get a free OpenWeatherMap API key:** [openweathermap.org/api](https://openweathermap.org/api) → Sign up → API Keys tab. Takes ~2 minutes.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
crop-hub-ai/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/route.ts        # PIN auth → sets session cookie
│   │   │   ├── logout/route.ts       # Clears session cookie
│   │   │   └── update-price/route.ts # Auth-guarded price + trend update
│   │   ├── crops/route.ts            # Fetches all crops from Supabase
│   │   ├── recommend/route.ts        # Core recommendation engine API
│   │   └── weather/route.ts          # OpenWeatherMap proxy + mock fallback
│   ├── layout.tsx                    # Root layout with ThemeProvider
│   ├── page.tsx                      # View router (landing / farmer / admin)
│   └── globals.css                   # Tailwind + CSS custom properties
│
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   ├── farmer/
│   │   └── analysis-results.tsx      # Charts + comparator + crop cards
│   ├── admin-view.tsx                # PIN login + admin dashboard
│   ├── farmer-view.tsx               # Soil form + results layout
│   └── landing-view.tsx              # Role selection + data sources
│
├── lib/
│   ├── auth.ts                       # PIN validation + cookie helpers
│   ├── scoring.ts                    # Weighted crop scoring algorithm
│   ├── supabase.ts                   # Server-side Supabase client
│   ├── translations.ts               # EN / MR / HI string dictionaries
│   ├── types.ts                      # Shared TypeScript interfaces
│   ├── utils.ts                      # Tailwind class merge utility
│   └── weather.ts                    # OpenWeather + mock weather logic
│
└── schema.sql                        # PostgreSQL schema + 10 crop seeds
```

---

## How the Scoring Works

Each crop is scored out of 100 on four dimensions:

| Dimension | Weight | How it's calculated |
|---|---|---|
| **Soil & pH** | 35% | Soil type match (60pts) + pH distance penalty (40pts) |
| **N-P-K** | 20% | Distance between farmer's levels and crop's ideal (Low/Med/High scale) |
| **Weather/Rainfall** | 20% | Actual seasonal forecast ÷ crop water requirement |
| **Market ROI** | 25% | Normalized profit margin vs. highest-ROI crop in database |

---

## Admin Console

- Access via **Enter as APMC Market Admin** on the landing page
- Default PIN: `1234` (set `ADMIN_PIN` in `.env.local` before deployment)
- Sessions last 8 hours with an `HttpOnly` cookie — safe from XSS
- Price edits automatically recalculate `trend_7d` as the % change from the previous price

---

## Crops Seeded (Indian Agricultural Baseline)

| Crop | Category | Avg Yield | Price/Qtl |
|---|---|---|---|
| Soybean | Oilseed | 12 qtl/acre | ₹4,800 |
| Cotton | Cash Crop | 10 qtl/acre | ₹6,500 |
| Tur Dal | Pulse | 8 qtl/acre | ₹7,200 |
| Sugarcane | Cash Crop | 400 qtl/acre | ₹320 |
| Wheat | Cereal | 18 qtl/acre | ₹2,400 |
| Chickpea (Gram) | Pulse | 7 qtl/acre | ₹5,500 |
| Onion | Vegetable | 120 qtl/acre | ₹800 |
| Groundnut | Oilseed | 15 qtl/acre | ₹5,200 |
| Jowar (Sorghum) | Cereal | 14 qtl/acre | ₹2,200 |
| Bajra (Pearl Millet) | Cereal | 12 qtl/acre | ₹1,900 |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in **Project Settings → Environment Variables**
4. Deploy — Vercel auto-detects Next.js

---

## License

MIT — built for Smart India Hackathon 2026.
