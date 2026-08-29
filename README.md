# CropHub AI 🌾

**Data-Driven Agronomy, Climate Intelligence & Market Price Discovery**

CropHub AI is a full-stack agronomy and APMC (Agricultural Produce Market Committee) administration platform built for Smart India Hackathon 2026. The platform optimizes crop selection for farmers using dynamic soil, weather, and market ROI inputs, while allowing APMC administrators to manage live commodity prices.

---

## 📂 Project Directory Structure

```text
crop-hub-ai/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/route.ts        # PIN authentication (sets HttpOnly cookie)
│   │   │   ├── logout/route.ts       # Session clearing endpoint
│   │   │   └── update-price/route.ts # Guarded mandi price update & trend calculation
│   │   ├── crops/route.ts            # Dynamic crop catalog fetcher
│   │   ├── recommend/route.ts        # Main agronomic recommendation endpoint
│   │   └── weather/route.ts          # OpenWeather API integration with caching
│   ├── globals.css                   # Global styling with Tailwind variables
│   ├── layout.tsx                    # Root layout with ThemeProvider (dark mode)
│   └── page.tsx                      # Client-side router view-switch
│
├── components/
│   ├── farmer/
│   │   └── analysis-results.tsx      # Multi-crop profitability chart & comparator
│   ├── ui/                           # Reusable shadcn/ui components
│   ├── admin-view.tsx                # APMC Admin Dashboard and login gate
│   ├── farmer-view.tsx               # Soil & NPK entry form with weather data
│   └── landing-view.tsx              # Welcome screen and dashboard portal selector
│
├── lib/
│   ├── auth.ts                       # Server-side cookie helpers & PIN validation
│   ├── scoring.ts                    # Core suitability scoring engine
│   ├── supabase.ts                   # Admin database connection configs
│   ├── translations.ts               # Localized language dictionaries (EN, MR, HI)
│   ├── types.ts                      # Shared TypeScript definitions
│   └── weather.ts                    # Weather geocoding & forecast mapping engine
│
├── schema.sql                        # PostgreSQL setup and 10 default crop seeds
└── package.json                      # Scripts, compilation parameters & dependencies
```

---

## 🛠️ Tech Stack & Dependencies

This project is built using a modern, scalable full-stack web architecture leveraging serverless APIs and a real-time database.

### 1. Frontend & User Interface
* **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) — React framework utilizing server-side rendering (SSR) and Server Components.
* **Component Library:** [shadcn/ui](https://ui.shadcn.com/) — Accessible, unstyled UI components built on top of Radix UI primitives.
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) — Utility-first CSS framework for fast styling and custom token variables.
* **Icons:** [Lucide React](https://lucide.dev/) — Clean, consistent SVG icon set.
* **Charts:** [Recharts](https://recharts.org/) — Composed declarative charting library for dynamic revenue vs. cost breakdown visualization.
* **Themes:** [next-themes](https://github.com/pacocoursey/next-themes) — Seamless light/dark mode configuration.

### 2. Backend, Database & Storage
* **Hosting Platform:** [Vercel Serverless](https://vercel.com/) — Hosts Next.js backend API routes serverlessly.
* **Database:** [PostgreSQL (via Supabase)](https://supabase.com/) — Relational database storage for crop configuration tables and APMC mandi price matrices.
* **Database Client:** [@supabase/supabase-js](https://supabase.com/docs/reference/javascript/introduction) — Service-role backed admin client bypassing row-level security (RLS) for backend operations.

### 3. APIs & Integrations
* **Climate Intelligence:** [OpenWeatherMap API](https://openweathermap.org/api) — Live geocoding and 5-day/3-hour forecast integration for localized seasonal precipitation calculations.
* **Internal APIs:**
  * `POST /api/recommend` — Weighted scoring engine.
  * `POST /api/admin/login` / `logout` — PIN authentication with `HttpOnly` state secure cookie session validation.
  * `POST /api/admin/update-price` — Mandi rate broadcast with auto 7-day trend calculation.

### 4. Language & Tools
* **Language:** [TypeScript](https://www.typescriptlang.org/) — Strict static typing for bug prevention and structured interfaces.
* **Formatting & Linting:** [Prettier](https://prettier.io/) / [ESLint](https://eslint.org/) — Code formatting and style enforcement.
* **Build System:** Turbopack (Next.js Dev Compiler) — Rust-based compiler tooling for fast HMR (Hot Module Replacement).
