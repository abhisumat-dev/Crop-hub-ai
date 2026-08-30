'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import {
  Leaf,
  LogOut,
  Radio,
  Boxes,
  Building2,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Droplets,
  Loader2,
  Sun,
  Moon,
  Clock,
  TrendingUp,
  Lock,
  KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { formatINR, type CropRow } from '@/lib/types'

// ─── Auth types ────────────────────────────────────────────────────────────
type AuthState = 'locked' | 'authenticating' | 'unlocked'

export function AdminView({
  crops,
  loadingCrops,
  onPriceUpdated,
  onExit,
}: {
  crops: CropRow[]
  loadingCrops: boolean
  onPriceUpdated: (crop: CropRow) => void
  onExit: () => void
}) {
  const { theme, setTheme } = useTheme()

  // ── Auth state ──────────────────────────────────────────────────────────
  const [authState, setAuthState] = useState<AuthState>('locked')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  async function handleLogin() {
    if (!pin.trim()) { setPinError('Please enter the admin PIN.'); return }
    setLoggingIn(true)
    setPinError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPinError(data?.error ?? 'Invalid PIN. Try again.')
      } else {
        setAuthState('unlocked')
        setPin('')
      }
    } catch {
      setPinError('Network error. Please try again.')
    } finally {
      setLoggingIn(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthState('locked')
    setPin('')
  }

  // ── Price editing state ─────────────────────────────────────────────────
  const [editing, setEditing] = useState<CropRow | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  // ── Dashboard metrics ───────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const topDemand = [...crops].sort((a, b) => b.trend_7d - a.trend_7d)[0]
    const avgPrice =
      crops.length > 0
        ? Math.round(crops.reduce((sum, c) => sum + c.modal_price_per_qtl, 0) / crops.length)
        : 0
    const lastUpdated = crops.reduce<string | null>((latest, c) => {
      if (!latest) return c.last_updated
      return c.last_updated > latest ? c.last_updated : latest
    }, null)

    return [
      {
        icon: Boxes,
        label: 'Total Commodities',
        value: String(crops.length || '—'),
        hint: 'Crops monitored',
      },
      {
        icon: TrendingUp,
        label: 'Avg Mandi Price',
        value: crops.length ? formatINR(avgPrice) : '—',
        hint: 'Per quintal across all crops',
      },
      {
        icon: Flame,
        label: 'Highest Demand Commodity',
        value: topDemand?.crop_name ?? '—',
        hint: topDemand
          ? `Trending ${topDemand.trend_7d >= 0 ? '+' : ''}${topDemand.trend_7d.toFixed(1)}% this week`
          : '',
      },
      {
        icon: Clock,
        label: 'Last Price Update',
        value: lastUpdated
          ? new Date(lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          : '—',
        hint: lastUpdated
          ? new Date(lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'No updates yet',
      },
    ]
  }, [crops])

  function openEdit(crop: CropRow) {
    setEditing(crop)
    setDraft(String(crop.modal_price_per_qtl))
  }

  async function save() {
    if (!editing) return
    const next = Number(draft)
    if (!Number.isFinite(next) || next <= 0 || next > 500_000) {
      toast.error('Enter a valid price between ₹1 and ₹5,00,000 per quintal.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_id: editing.crop_id,
          crop_name: editing.crop_name,
          new_price_per_qtl: Math.round(next),
        }),
      })
      const data = await res.json()
      if (res.status === 401) {
        // Session expired — send back to login
        setAuthState('locked')
        toast.error('Session expired. Please log in again.')
        setEditing(null)
        return
      }
      if (!res.ok) throw new Error(data?.error ?? 'Update failed')

      onPriceUpdated(data.crop as CropRow)
      setEditing(null)
      toast.success('Market price updated', {
        description: `${editing.crop_name} set to ${formatINR(next)}/qtl. Farmer recommendations will resync on next analysis.`,
      })
    } catch (err) {
      toast.error('Could not update price', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setSaving(false)
    }
  }

  // ─── PIN Lock Screen ────────────────────────────────────────────────────
  if (authState === 'locked') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Lock className="size-7" />
          </span>
          <h1 className="text-2xl font-semibold">Admin Console</h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            Enter the APMC administrator PIN to access the market control panel.
          </p>
        </div>

        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col gap-4 pt-6">
            <Field>
              <FieldLabel htmlFor="pin">
                <KeyRound className="size-4 text-primary" />
                Admin PIN
              </FieldLabel>
              <Input
                id="pin"
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError('') }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleLogin()
                }}
                autoFocus
                disabled={loggingIn}
              />
              {pinError && (
                <p className="text-sm text-destructive">{pinError}</p>
              )}
            </Field>
            <Button className="w-full" onClick={handleLogin} disabled={loggingIn}>
              {loggingIn && <Loader2 data-icon="inline-start" className="animate-spin" />}
              Access Admin Console
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={onExit}>
              <LogOut data-icon="inline-start" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Authenticated Dashboard ────────────────────────────────────────────
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="size-4.5" />
            </span>
            <span className="text-sm font-semibold sm:text-base">
              CropHub AI{' '}
              <span className="font-normal text-muted-foreground">
                | Market Controller
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Radio className="size-3.5 text-primary" />
              Live Mandi Sync: Active
            </Badge>
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
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut data-icon="inline-start" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        {/* Summary metrics — responsive 2×2 / 4-col grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label}>
              <CardContent className="flex items-start gap-3 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <m.icon className="size-5" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-muted-foreground">
                    {m.label}
                  </span>
                  <span className="text-xl font-semibold">{m.value}</span>
                  <span className="text-xs text-muted-foreground">
                    {m.hint}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Price management table */}
        <Card>
          <CardHeader>
            <CardTitle>Commodity Price Management</CardTitle>
            <CardDescription>
              Maharashtra APMC modal rates. Edits instantly resync farmer
              recommendations and recalculate 7-day trend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCrops ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crop Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Modal Price (₹/qtl)</TableHead>
                      <TableHead>7-Day Trend</TableHead>
                      <TableHead>Water Demand</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <TableCell key={j}>
                            <div className="h-4 animate-pulse rounded bg-muted" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : crops.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No crops found. Confirm `schema.sql` has been run and seeded in Supabase.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crop Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">
                        Modal Price (₹/qtl)
                      </TableHead>
                      <TableHead>7-Day Trend</TableHead>
                      <TableHead>Water Demand</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crops.map((crop) => {
                      const up = crop.trend_7d >= 0
                      return (
                        <TableRow key={crop.crop_id}>
                          <TableCell className="font-medium">
                            {crop.crop_name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {crop.category}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {formatINR(crop.modal_price_per_qtl)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={up ? 'default' : 'destructive'}
                              className="gap-1 font-mono"
                            >
                              {up ? (
                                <ArrowUpRight className="size-3.5" />
                              ) : (
                                <ArrowDownRight className="size-3.5" />
                              )}
                              {up ? '+' : ''}
                              {crop.trend_7d.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <WaterBadge index={crop.water_demand} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(crop)}
                            >
                              <Pencil data-icon="inline-start" />
                              Edit Price
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && !saving && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Price — {editing ? editing.crop_name : ''}
            </DialogTitle>
            <DialogDescription>
              Set the new modal price per quintal. This broadcasts to all
              connected mandis and the AI agronomy engine.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="new-price">New Price (₹ / quintal)</FieldLabel>
            <Input
              id="new-price"
              type="number"
              min={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) save()
              }}
              autoFocus
              disabled={saving}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Radio data-icon="inline-start" />
              )}
              Save &amp; Broadcast Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WaterBadge({ index }: { index: string }) {
  const variant =
    index === 'Very High' || index === 'High' ? 'destructive' : 'outline'
  return (
    <Badge variant={variant} className="gap-1">
      <Droplets className="size-3.5" />
      {index}
    </Badge>
  )
}
