'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import {
  Leaf,
  LogOut,
  MapPin,
  CloudSun,
  Droplets,
  ShieldCheck,
  Sparkles,
  Loader2,
  Sun,
  Moon,
  History,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { AnalysisResults } from '@/components/farmer/analysis-results'
import { LANGUAGES, translator, type Lang } from '@/lib/translations'
import type { CropRow, WeatherResult, RecommendResponse, NutrientLevel } from '@/lib/types'

const SOIL_TYPES = [
  'Black Cotton Soil',
  'Red Loamy',
  'Alluvial',
  'Sandy',
] as const

const HISTORY_KEY = 'crophub_last_analysis'

export function FarmerView({
  crops,
  loadingCrops,
  onExit,
}: {
  crops: CropRow[]
  loadingCrops: boolean
  onExit: () => void
}) {
  const { theme, setTheme } = useTheme()
  const [lang, setLang] = useState<Lang>('en')
  const t = translator(lang)

  const [location, setLocation] = useState('Latur, Maharashtra')
  const [soil, setSoil] = useState<string>('Black Cotton Soil')
  const [ph, setPh] = useState(6.5)
  const [nitrogen, setNitrogen] = useState<NutrientLevel>('Medium')
  const [phosphorus, setPhosphorus] = useState<NutrientLevel>('Low')
  const [potassium, setPotassium] = useState<NutrientLevel>('Medium')
  const [habit, setHabit] = useState('')

  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState<WeatherResult | null>(null)
  const [result, setResult] = useState<RecommendResponse | null>(null)
  const didHydrate = useRef(false)

  // Hydrate last analysis result from sessionStorage on first mount
  useEffect(() => {
    if (didHydrate.current) return
    didHydrate.current = true
    try {
      const stored = sessionStorage.getItem(HISTORY_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as {
          result: RecommendResponse
          weather: WeatherResult
        }
        setResult(parsed.result)
        setWeather(parsed.weather)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  function clearHistory() {
    sessionStorage.removeItem(HISTORY_KEY)
    setResult(null)
    setWeather(null)
    toast.success('Analysis history cleared')
  }

  async function runAnalysis() {
    setLoading(true)
    setResult(null)
    try {
      // 1. Live weather for the pills / drought-risk context
      const weatherRes = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      })
      const weatherData = await weatherRes.json()
      if (!weatherRes.ok) throw new Error(weatherData?.error ?? 'Weather lookup failed')
      setWeather(weatherData as WeatherResult)

      // 2. Full agronomic + market recommendation engine
      const recRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          soil_type: soil,
          soil_ph: ph,
          nitrogen,
          phosphorus,
          potassium,
          habit_crop: habit,
        }),
      })
      const recData = await recRes.json()
      if (!recRes.ok) throw new Error(recData?.error ?? 'Recommendation failed')

      const rec = recData as RecommendResponse
      setResult(rec)

      // Persist to sessionStorage so results survive navigating away and back
      try {
        sessionStorage.setItem(
          HISTORY_KEY,
          JSON.stringify({ result: rec, weather: weatherData }),
        )
      } catch {
        // quota exceeded or private-browsing restriction — ignore silently
      }
    } catch (err) {
      toast.error('Analysis failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="size-4.5" />
            </span>
            <span className="text-sm font-semibold sm:text-base">
              CropHub AI{' '}
              <span className="font-normal text-muted-foreground">
                | {t('workspace')}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              value={[lang]}
              onValueChange={(v: string[]) => v[0] && setLang(v[0] as Lang)}
              variant="outline"
              size="sm"
            >
              {LANGUAGES.map((l) => (
                <ToggleGroupItem key={l.id} value={l.id} aria-label={l.label}>
                  {l.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Badge variant="secondary" className="gap-1.5">
              <CloudSun className="size-3.5" />
              {t('season')}
            </Badge>
            {result && (
              <Button variant="ghost" size="sm" onClick={clearHistory} title="Clear history">
                <X className="size-3.5" />
                <History className="size-3.5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle dark mode"
            >
              <Sun className="size-4 dark:hidden" />
              <Moon className="size-4 hidden dark:block" />
            </Button>
            <Button variant="outline" size="sm" onClick={onExit}>
              <LogOut data-icon="inline-start" />
              {t('switchRole')}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[380px_1fr]">
        {/* Left column: input form */}
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>{t('inputTitle')}</CardTitle>
            <CardDescription>{t('inputSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="location">
                  <MapPin className="size-4 text-primary" />
                  {t('location')}
                </FieldLabel>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <WeatherPill
                    icon={CloudSun}
                    label={weather ? `${weather.temperature_c}°C` : '—'}
                  />
                  <WeatherPill
                    icon={Droplets}
                    label={weather ? `${weather.rainfall_mm.toLocaleString('en-IN')}mm Rain` : '—'}
                  />
                  <WeatherPill
                    icon={ShieldCheck}
                    label={weather ? `${weather.drought_risk} Drought Risk` : '—'}
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="soil">{t('soilType')}</FieldLabel>
                <Select
                  value={soil}
                  onValueChange={(v: string | null) => v && setSoil(v)}
                >
                  <SelectTrigger id="soil" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SOIL_TYPES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="ph">{t('soilPh')}</FieldLabel>
                  <span className="font-mono text-sm font-medium text-primary">
                    {ph.toFixed(1)}
                  </span>
                </div>
                <Slider
                  id="ph"
                  min={4}
                  max={9}
                  step={0.1}
                  value={[ph]}
                  onValueChange={(v) =>
                    setPh(Array.isArray(v) ? v[0] : (v as number))
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>4.0</span>
                  <span>9.0</span>
                </div>
              </Field>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">{t('npk')}</span>
                <NpkRow
                  label={t('nitrogen')}
                  value={nitrogen}
                  onChange={setNitrogen}
                  t={t}
                />
                <NpkRow
                  label={t('phosphorus')}
                  value={phosphorus}
                  onChange={setPhosphorus}
                  t={t}
                />
                <NpkRow
                  label={t('potassium')}
                  value={potassium}
                  onChange={setPotassium}
                  t={t}
                />
              </div>

              <Field>
                <FieldLabel htmlFor="habit">{t('habit')}</FieldLabel>
                <Input
                  id="habit"
                  placeholder="e.g. Sugarcane, Wheat"
                  value={habit}
                  onChange={(e) => setHabit(e.target.value)}
                />
              </Field>

              <Button
                size="lg"
                className="w-full"
                onClick={runAnalysis}
                disabled={loading || loadingCrops}
              >
                {loading ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Sparkles data-icon="inline-start" />
                )}
                {loading ? t('analyzing') : t('runAnalysis')}
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Right column: results */}
        <div className="min-w-0">
          {result ? (
            <AnalysisResults result={result} t={t} />
          ) : (
            <EmptyState
              loading={loading}
              title={t('emptyTitle')}
              desc={t('emptyDesc')}
              analyzing={t('analyzing')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function WeatherPill({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
      <Icon className="size-3" />
      {label}
    </span>
  )
}

function NpkRow({
  label,
  value,
  onChange,
  t,
}: {
  label: string
  value: NutrientLevel
  onChange: (v: NutrientLevel) => void
  t: (k: string) => string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <ToggleGroup
        value={[value.toLowerCase()]}
        onValueChange={(v: string[]) =>
          v[0] &&
          onChange((v[0].charAt(0).toUpperCase() + v[0].slice(1)) as NutrientLevel)
        }
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="low">{t('low')}</ToggleGroupItem>
        <ToggleGroupItem value="medium">{t('medium')}</ToggleGroupItem>
        <ToggleGroupItem value="high">{t('high')}</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

function EmptyState({
  loading,
  title,
  desc,
  analyzing,
}: {
  loading: boolean
  title: string
  desc: string
  analyzing: string
}) {
  return (
    <Card className="flex h-full min-h-[420px] items-center justify-center border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        {loading ? (
          <>
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{analyzing}</p>
          </>
        ) : (
          <>
            <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Sparkles className="size-7" />
            </span>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="max-w-sm text-pretty text-sm text-muted-foreground">
              {desc}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
