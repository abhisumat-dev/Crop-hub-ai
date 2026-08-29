'use client'

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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const badges = [
  { icon: BrainCircuit, label: 'AI-Driven Agronomy' },
  { icon: CloudSun, label: 'Live Weather Grounding' },
  { icon: GitCompareArrows, label: 'Explainable Crop Comparison' },
]

const dataSources = [
  {
    icon: Database,
    title: 'ICAR Agronomic Database',
    desc: 'Crop parameters (soil, pH, NPK, water, yield) aligned with Indian Council of Agricultural Research baselines for Maharashtra.',
  },
  {
    icon: TrendingUp,
    title: 'APMC Mandi Prices',
    desc: 'Real-time modal prices from Maharashtra Agricultural Produce Market Committees, updated live by market administrators.',
  },
  {
    icon: Globe,
    title: 'OpenWeatherMap API',
    desc: 'Live temperature, humidity, and 5-day forecast precipitation data geocoded to the farmer\'s district.',
  },
]

export function LandingView({
  onSelect,
}: {
  onSelect: (view: 'farmer' | 'admin') => void
}) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center justify-center gap-12 px-6 py-16">
      <header className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-6" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            CropHub AI
          </h1>
        </div>
        <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          Data-Driven Agronomy, Climate Intelligence &amp; Market Price
          Discovery for Maharashtra Farmers and APMC Administrators
        </p>
      </header>

      {/* Role selection cards */}
      <div className="grid w-full gap-6 md:grid-cols-2">
        <RoleCard
          icon={<Sprout className="size-6" />}
          title="Enter as Farmer / FPO"
          description="Analyze soil parameters, check weather forecasts, and discover high-profit crop recommendations tailored to your field."
          cta="Launch Farmer Workspace"
          onClick={() => onSelect('farmer')}
        />
        <RoleCard
          icon={<Building2 className="size-6" />}
          title="Enter as APMC Market Admin"
          description="Monitor commodity trends, update mandi rates, and control real-time market signals for connected farmers."
          cta="Launch Admin Console"
          onClick={() => onSelect('admin')}
        />
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {badges.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground"
          >
            <Icon className="size-4 text-primary" />
            {label}
          </span>
        ))}
      </div>

      {/* Data sources section */}
      <section className="w-full">
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Powered By
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {dataSources.map((ds) => (
            <div
              key={ds.title}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <ds.icon className="size-4" />
              </span>
              <span className="text-sm font-semibold">{ds.title}</span>
              <p className="text-xs leading-relaxed text-muted-foreground">{ds.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function RoleCard({
  icon,
  title,
  description,
  cta,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  cta: string
  onClick: () => void
}) {
  return (
    <Card className="group flex flex-col justify-between border-border transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <CardHeader>
        <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          {icon}
        </span>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-pretty leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="lg" className="w-full" onClick={onClick}>
          {cta}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  )
}
