import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 price updates per minute per IP
    const ip = getClientIp(req)
    const rl = rateLimit(ip, 5, 60_000)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      )
    }

    // Auth guard — only authenticated admins may update prices
    const authed = await isAdminAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const cropId: string = typeof body?.crop_id === 'string' ? body.crop_id.trim() : ''
    const cropName: string = typeof body?.crop_name === 'string' ? body.crop_name.trim() : ''
    const newPrice: number = Number(body?.new_price_per_qtl)

    if ((!cropId && !cropName) || !Number.isFinite(newPrice) || newPrice <= 0 || newPrice > 500_000) {
      return NextResponse.json(
        { error: 'Valid crop identifier and price between ₹1 and ₹5,00,000 per quintal are required' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseServerClient()

    // Fetch the current price first so we can calculate trend_7d
    let query = supabase.from('crops_master').select('crop_id, crop_name, modal_price_per_qtl')
    if (cropId) {
      query = query.eq('crop_id', cropId)
    } else {
      query = query.eq('crop_name', cropName)
    }

    const { data: current, error: fetchError } = await query.single()

    if (fetchError || !current) {
      return NextResponse.json({ error: `Crop "${cropId || cropName}" not found in master records` }, { status: 404 })
    }

    const oldPrice: number = current.modal_price_per_qtl
    const roundedNew = Math.round(newPrice)
    // trend_7d represents the percentage change from the previous price
    const newTrend7d =
      oldPrice > 0
        ? parseFloat((((roundedNew - oldPrice) / oldPrice) * 100).toFixed(1))
        : 0

    const { data, error } = await supabase
      .from('crops_master')
      .update({ modal_price_per_qtl: roundedNew, trend_7d: newTrend7d })
      .eq('crop_id', current.crop_id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update failed:', error)
      return NextResponse.json({ error: 'Database update failed. Please try again later.' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: `Crop not found` }, { status: 404 })
    }

    // `data` now reflects the new price and trend — any subsequent call to
    // /api/recommend re-reads crops_master fresh from Supabase, so farmer-side
    // profit calculations pick up this update on their very next analysis run.
    return NextResponse.json({ crop: data })
  } catch (err) {
    console.error('POST /api/admin/update-price failed:', err)
    return NextResponse.json({ error: 'Failed to update price' }, { status: 500 })
  }
}

