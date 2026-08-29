import { NextResponse } from 'next/server'
import { fetchAllCrops } from '@/lib/supabase'

export async function GET() {
  try {
    const crops = await fetchAllCrops()
    return NextResponse.json({ crops })
  } catch (err) {
    console.error('GET /api/crops failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load crops' },
      { status: 500 },
    )
  }
}
