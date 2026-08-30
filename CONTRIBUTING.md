# Contributing to CropHub AI

Thank you for your interest in contributing! This project was built for **Smart India Hackathon 2026** to help farmers make data-driven crop decisions.

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- A Supabase account (free tier works)
- Optional: OpenWeatherMap API key (free tier)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/abhisumat-dev/SIH.git
cd SIH/crop-hub-ai

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Fill in your Supabase URL + service role key in .env.local

# 4. Seed the database
# In your Supabase dashboard → SQL Editor → paste schema.sql → Run

# 5. Start dev server
npm run dev
# Open http://localhost:3000
```

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, deployable code |
| `feature/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `chore/<name>` | Refactors, dependency updates |

---

## Code Style

- **TypeScript strict mode** — no `any` types, no `@ts-ignore` without a comment explaining why
- **Tailwind CSS** — use existing CSS variables from `globals.css`, don't add new inline colours
- **Imports** — always use `@/` alias, lowercase `@/components/ui/` (not `UI/`)
- **Components** — named exports only (no default exports for components)

---

## Pull Request Process

1. Branch off `main`
2. Make your changes
3. Run `npx tsc --noEmit` and `npm run build` — both must pass
4. Open a PR using the PR template
5. Request a review

---

## Commit Convention

Use conventional commits:
```
feat: add WhatsApp share button to farmer results
fix: correct rainfall extrapolation in weather.ts
chore: upgrade recharts to 3.9.0
docs: update README setup instructions
```

---

## Questions?

Open a GitHub Discussion or file an issue using the feature request template.
