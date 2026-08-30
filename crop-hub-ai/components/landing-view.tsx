'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Leaf,
  ArrowRight,
  Sprout,
  Building2,
  BrainCircuit,
  CloudSun,
  GitCompareArrows,
  Database,
  TrendingUp,
  Globe,
  Sparkles,
  ShieldCheck,
  Languages,
  Moon,
  BarChart3,
  Wheat,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Feature grid data ────────────────────────────────────────────────────────
const features = [
  {
    icon: BrainCircuit,
    title: 'AI Crop Recommendation',
    desc: 'Weighted multi-factor scoring across soil, pH, NPK, rainfall, and market ROI to surface your best 3 crops.',
    accent: 'from-emerald-500/20 to-green-500/10',
  },
  {
    icon: CloudSun,
    title: 'Live Climate Intelligence',
    desc: 'OpenWeatherMap 5-day forecast aggregated as seasonal precipitation — no guesswork extrapolation.',
    accent: 'from-sky-500/20 to-blue-500/10',
  },
  {
    icon: GitCompareArrows,
    title: 'Smart Crop Comparator',
    desc: 'Side-by-side analysis of the AI recommendation vs your habitual crop — ROI, water needs, growth cycle.',
    accent: 'from-violet-500/20 to-purple-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Mandi Prices',
    desc: 'APMC modal rates updated live by market administrators — farmer recommendations resync instantly.',
    accent: 'from-amber-500/20 to-yellow-500/10',
  },
  {
    icon: Languages,
    title: 'Multilingual Interface',
    desc: 'Full English, Marathi (मराठी), and Hindi (हिंदी) support so every farmer can use their preferred language.',
    accent: 'from-rose-500/20 to-pink-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Admin Console',
    desc: 'PIN-protected APMC portal with HttpOnly session cookies — safe from XSS, session expires in 8 hours.',
    accent: 'from-teal-500/20 to-cyan-500/10',
  },
]

// ─── Stats ───────────────────────────────────────────────────────────────────
const stats = [
  { value: 10, label: 'Crops in Database', suffix: '+' },
  { value: 28, label: 'States & Regions Covered', suffix: '+' },
  { value: 4, label: 'Scoring Dimensions', suffix: '' },
  { value: 3, label: 'Languages Supported', suffix: '' },
]

// ─── Data sources ─────────────────────────────────────────────────────────────
const dataSources = [
  {
    icon: Database,
    title: 'ICAR Agronomic Data',
    desc: 'Crop parameters aligned with Indian Council of Agricultural Research baselines.',
  },
  {
    icon: BarChart3,
    title: 'APMC Mandi Prices',
    desc: 'Agricultural Produce Market Committee (APMC) live commodity modal rates & trends.',
  },
  {
    icon: Globe,
    title: 'OpenWeatherMap API',
    desc: 'Live temperature, humidity, and 5-day precipitation forecast per district.',
  },
]

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCounter(target: number, duration = 1600, trigger: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, trigger])
  return count
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LandingView({
  onSelect,
}: {
  onSelect: (view: 'farmer' | 'admin') => void
}) {
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.4 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex min-h-svh flex-col bg-background">

      {/* ── Sticky nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Leaf className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">CropHub AI</span>
            <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary sm:inline">
              SIH 2026
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => onSelect('farmer')}>
              Farmer Workspace
            </Button>
            <Button size="sm" onClick={() => onSelect('admin')}>
              Admin Console
              <ArrowRight className="ml-1 size-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-40 size-[600px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -right-40 top-20 size-[500px] rounded-full bg-emerald-400/6 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 size-[400px] -translate-x-1/2 rounded-full bg-green-300/5 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-28">
          {/* Badge */}
          <span className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-3.5" />
            AI-Powered Agronomy & Market Intelligence Platform
          </span>

          {/* Headline */}
          <h1 className="animate-fade-in text-4xl font-bold tracking-tight text-foreground [animation-delay:100ms] sm:text-5xl lg:text-6xl">
            Grow Smarter,{' '}
            <span className="bg-gradient-to-r from-primary via-emerald-600 to-green-500 bg-clip-text text-transparent dark:from-primary dark:via-emerald-400 dark:to-green-300">
              Profit More
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-in max-w-2xl text-balance text-lg text-muted-foreground [animation-delay:200ms]">
            Data-driven crop recommendations grounded in real soil parameters,
            live OpenWeatherMap climate data, and APMC mandi prices — empowering
            farmers, FPOs, and market administrators across India.
          </p>

          {/* CTA row */}
          <div className="animate-fade-in flex flex-col gap-3 [animation-delay:300ms] sm:flex-row">
            <Button
              size="lg"
              className="h-12 gap-2 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:scale-[1.03] hover:shadow-primary/40"
              onClick={() => onSelect('farmer')}
            >
              <Sprout className="size-5" />
              Launch Farmer Workspace
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2 px-8 text-base transition-all hover:scale-[1.03]"
              onClick={() => onSelect('admin')}
            >
              <Building2 className="size-5" />
              APMC Admin Console
            </Button>
          </div>

          {/* Feature pill badges */}
          <div className="animate-fade-in flex flex-wrap justify-center gap-2 [animation-delay:400ms]">
            {[
              { icon: Moon, label: 'Dark Mode' },
              { icon: Languages, label: '3 Languages' },
              { icon: Wheat, label: '10 Crops' },
              { icon: ShieldCheck, label: 'PIN Protected Admin' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm"
              >
                <Icon className="size-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Animated Stats Strip ────────────────────────────────────────────── */}
      <section ref={statsRef} className="border-y border-border bg-card/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} trigger={statsVisible} />
          ))}
        </div>
      </section>

      {/* ── Feature Grid ────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            What CropHub AI Does
          </p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Every tool a farmer needs in one platform
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── Role Selection Cards ─────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Choose Your Role
          </p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Who are you?
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <RoleCard
            icon={<Sprout className="size-7" />}
            title="Farmer / FPO"
            description="Enter your district, soil type, and NPK levels. Get AI-ranked crop recommendations with cost vs. revenue charts, water requirements, and a comparator against what you traditionally grow."
            cta="Launch Farmer Workspace"
            highlight
            onClick={() => onSelect('farmer')}
          />
          <RoleCard
            icon={<Building2 className="size-7" />}
            title="APMC Market Admin"
            description="Access the PIN-protected mandi control panel. Update commodity modal prices in real time — the AI engine and all farmer recommendations resync automatically."
            cta="Open Admin Console"
            onClick={() => onSelect('admin')}
          />
        </div>
      </section>

      {/* ── Data Sources ────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-card/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Powered By
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {dataSources.map((ds) => (
              <div
                key={ds.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <ds.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{ds.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ds.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground sm:px-6">
          <div className="flex items-center gap-1.5">
            <Leaf className="size-3.5 text-primary" />
            <span className="font-semibold text-foreground">CropHub AI</span>
          </div>
          <p>Built with ❤️ for Farmers · Smart India Hackathon 2026</p>
          <p>© 2026 CropHub AI. MIT License.</p>
          <a
            href="https://github.com/abhisumat-dev/SIH"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 underline underline-offset-2 hover:text-foreground"
          >
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  value,
  suffix,
  label,
  trigger,
}: {
  value: number
  suffix: string
  label: string
  trigger: boolean
}) {
  const count = useCounter(value, 1400, trigger)
  return (
    <div className="flex flex-col items-center gap-1 py-8">
      <span className="text-3xl font-bold text-primary sm:text-4xl">
        {count}{suffix}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  accent,
}: {
  icon: React.ElementType
  title: string
  desc: string
  accent: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="relative flex flex-col gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors duration-300 group-hover:bg-primary/15 group-hover:text-primary">
          <Icon className="size-5" />
        </span>
        <h3 className="font-semibold leading-snug">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

function RoleCard({
  icon,
  title,
  description,
  cta,
  highlight = false,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  cta: string
  highlight?: boolean
  onClick: () => void
}) {
  return (
    <div
      className={`group relative flex flex-col gap-5 overflow-hidden rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        highlight
          ? 'border-primary/40 bg-gradient-to-br from-primary/8 via-card to-card hover:border-primary/60 hover:shadow-primary/15'
          : 'border-border bg-card hover:border-border/80'
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${
            highlight
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
              : 'bg-accent text-accent-foreground'
          }`}
        >
          {icon}
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {highlight ? 'Farmers & FPOs' : 'Market Officials'}
          </span>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
      </div>

      <p className="flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <Button
        size="lg"
        variant={highlight ? 'default' : 'outline'}
        className={`w-full gap-2 transition-all ${
          highlight
            ? 'shadow-md shadow-primary/20 hover:shadow-primary/30'
            : ''
        }`}
        onClick={onClick}
      >
        {cta}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
