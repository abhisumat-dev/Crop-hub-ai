'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { LandingView } from '@/components/landing-view'
import { FarmerView } from '@/components/farmer-view'
import { AdminView } from '@/components/admin-view'
import type { CropRow } from '@/lib/types'

type View = 'landing' | 'farmer' | 'admin'

export default function Page() {
  const [view, setView] = useState<View>('landing')
  const [crops, setCrops] = useState<CropRow[]>([])
  const [loadingCrops, setLoadingCrops] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadCrops() {
      try {
        const res = await fetch('/api/crops')
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error ?? 'Failed to load crops')
        if (!cancelled) setCrops(data.crops as CropRow[])
      } catch (err) {
        console.error('Failed to load crops from Supabase:', err)
        if (!cancelled) {
          toast.error('Could not load live market data', {
            description: 'Check your Supabase connection in .env.local. See README.md.',
          })
        }
      } finally {
        if (!cancelled) setLoadingCrops(false)
      }
    }

    loadCrops()
    return () => {
      cancelled = true
    }
  }, [])

  function handlePriceUpdated(updated: CropRow) {
    setCrops((prev) => prev.map((c) => (c.crop_id === updated.crop_id ? updated : c)))
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      {view === 'landing' && <LandingView onSelect={setView} />}
      {view === 'farmer' && (
        <FarmerView crops={crops} loadingCrops={loadingCrops} onExit={() => setView('landing')} />
      )}
      {view === 'admin' && (
        <AdminView
          crops={crops}
          loadingCrops={loadingCrops}
          onPriceUpdated={handlePriceUpdated}
          onExit={() => setView('landing')}
        />
      )}
    </main>
  )
}
