'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import { Droplets, CalendarDays, Wallet, TrendingUp, Sprout, TrendingDown, Printer } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatINR, type RecommendResponse, type ScoredCrop } from '@/lib/types'
import { Button } from '@/components/ui/button'


const chartConfig = {
  cost: { label: 'Input Cost', color: 'var(--chart-4)' },
  revenue: { label: 'Market Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig

// Defined once at module scope, not recreated on every render — Recharts can
// enter a re-render loop if formatter/label functions get a new reference
// on each pass.
function axisKFormatter(v: unknown) {
  return `₹${(Number(v) / 1000).toFixed(0)}k`
}

function tooltipFormatter(value: unknown, name: unknown) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <span className="text-muted-foreground">
        {chartConfig[name as keyof typeof chartConfig]?.label}
      </span>
      <span className="font-mono font-medium">{formatINR(Number(value))}</span>
    </div>
  )
}

export function AnalysisResults({
  result,
  t,
}: {
  result: RecommendResponse
  t: (k: string) => string
}) {
  const { recommendations, comparator, verdict } = result

  // Stable array reference across renders unless recommendations actually
  // change, which is also what fixed the "Maximum update depth exceeded"
  // loop coming from the Bar chart below.
  const chartData = useMemo(
    () =>
      recommendations.map((c) => ({
        crop: c.crop_name,
        cost: c.cost_per_acre,
        revenue: c.revenue_per_acre,
      })),
    [recommendations],
  )

  return (
    <div className="flex flex-col gap-6 print-area">
      {/* Print-only header — hidden in browser, shown when printing */}
      <div className="print-header hidden">
        <div>
          <h1>CropHub AI — Crop Analysis Report</h1>
          <p>Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · Smart India Hackathon 2026</p>
        </div>
      </div>

      {/* Download Report button — hidden when printing */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <Sprout className="size-4 text-primary" />
          <h2 className="text-lg font-semibold">{t('recommended')}</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          Download Report
        </Button>
      </div>

      {/* Recommended crop cards */}
      <section className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {recommendations.map((crop, i) => (
            <CropCard key={crop.crop_id} crop={crop} rank={i + 1} t={t} />
          ))}
        </div>
      </section>

      {/* Profitability chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profitTitle')}</CardTitle>
          <CardDescription>{t('profitSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 24 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="crop"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={axisKFormatter}
              />
              <ChartTooltip
                content={<ChartTooltipContent formatter={tooltipFormatter} />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Smart comparator */}
      <Comparator ai={comparator.ai} habit={comparator.habit} verdict={verdict} t={t} />
    </div>
  )
}

function CropCard({
  crop,
  rank,
  t,
}: {
  crop: ScoredCrop
  rank: number
  t: (k: string) => string
}) {
  const profitPositive = crop.net_profit_per_acre >= 0
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
            {rank}
          </span>
          <span className="font-semibold">{crop.crop_name}</span>
        </div>
        <Badge variant="secondary" className="font-mono">
          {crop.match_score}% {t('suitability')}
        </Badge>
      </div>
      <div className="flex flex-col gap-1 px-4 py-3">
        <span className="text-xs text-muted-foreground">{t('netProfit')}</span>
        <span
          className={`font-mono text-lg font-semibold ${
            profitPositive ? 'text-primary' : 'text-destructive'
          }`}
        >
          {formatINR(crop.net_profit_per_acre)}
        </span>
        {!profitPositive && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <TrendingDown className="size-3" />
            Loss at current mandi rate
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 border-t border-border px-4 py-2">
        <span className="text-xs text-muted-foreground">{t('suitability')}:</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${crop.match_score}%` }}
          />
        </div>
        <span className="w-8 text-right font-mono text-xs font-medium text-primary">
          {crop.match_score}%
        </span>
      </div>
    </Card>
  )
}

function Comparator({
  ai,
  habit,
  verdict,
  t,
}: {
  ai: ScoredCrop
  habit: ScoredCrop
  verdict: string
  t: (k: string) => string
}) {
  const rows = [
    {
      icon: Droplets,
      label: t('waterReq'),
      ai: `${ai.water_requirement_mm.toLocaleString('en-IN')} mm`,
      habit: `${habit.water_requirement_mm.toLocaleString('en-IN')} mm`,
    },
    {
      icon: CalendarDays,
      label: t('growthCycle'),
      ai: `${ai.growth_cycle_days} ${t('days')}`,
      habit: `${habit.growth_cycle_days} ${t('days')}`,
    },
    {
      icon: Wallet,
      label: t('investment'),
      ai: formatINR(ai.cost_per_acre),
      habit: formatINR(habit.cost_per_acre),
    },
    {
      icon: TrendingUp,
      label: t('netProfit'),
      ai: formatINR(ai.net_profit_per_acre),
      habit: formatINR(habit.net_profit_per_acre),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('comparatorTitle')}</CardTitle>
        <CardDescription>{t('comparatorSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 text-sm">
          <span />
          <div className="flex flex-col items-center gap-1 rounded-lg bg-primary/10 px-2 py-2 text-center">
            <Badge className="text-[10px]">{t('aiChoice')}</Badge>
            <span className="font-semibold text-primary">{ai.crop_name}</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted px-2 py-2 text-center">
            <Badge variant="outline" className="text-[10px]">
              {t('yourHabit')}
            </Badge>
            <span className="font-semibold">{habit.crop_name}</span>
          </div>

          {rows.map((row) => (
            <ComparatorRow key={row.label} {...row} />
          ))}
        </div>

        {/* AI verdict */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <span className="font-semibold text-primary">
              {t('verdictTitle')}
            </span>
          </div>
          <p className="text-pretty text-sm leading-relaxed text-foreground/80">
            {verdict}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ComparatorRow({
  icon: Icon,
  label,
  ai,
  habit,
}: {
  icon: React.ElementType
  label: string
  ai: string
  habit: string
}) {
  return (
    <>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-[13px]">{label}</span>
      </div>
      <span className="text-center font-mono text-sm font-medium text-primary">
        {ai}
      </span>
      <span className="text-center font-mono text-sm">{habit}</span>
    </>
  )
}
