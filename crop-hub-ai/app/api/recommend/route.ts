import { NextRequest, NextResponse } from 'next/server'
import { fetchAllCrops } from '@/lib/supabase'
import { resolveWeather } from '@/lib/weather'
import {
  scoreCrops,
  resolveHabitCrop,
  buildVerdict,
  type FarmerInput,
  type NutrientLevel,
} from '@/lib/scoring'
import { rateLimit, getClientIp } from '@/lib/rate-limit'


const NUTRIENT_LEVELS: NutrientLevel[] = ['Low', 'Medium', 'High']

function validate(body: unknown): { farmer: FarmerInput } | { error: string } {
  if (typeof body !== 'object' || body === null) return { error: 'Invalid request body' }
  const b = body as Record<string, unknown>

  const location = typeof b.location === 'string' ? b.location.trim() : ''
  const soil_type = typeof b.soil_type === 'string' ? b.soil_type.trim() : ''
  const soil_ph = Number(b.soil_ph)
  const nitrogen = b.nitrogen as NutrientLevel
  const phosphorus = b.phosphorus as NutrientLevel
  const potassium = b.potassium as NutrientLevel
  const habit_crop = typeof b.habit_crop === 'string' ? b.habit_crop.trim() : ''

  if (!location) return { error: 'location is required' }
  if (!soil_type) return { error: 'soil_type is required' }
  if (!Number.isFinite(soil_ph) || soil_ph < 4 || soil_ph > 9) {
    return { error: 'soil_ph must be a number between 4.0 and 9.0' }
  }
  for (const [key, val] of [
    ['nitrogen', nitrogen],
    ['phosphorus', phosphorus],
    ['potassium', potassium],
  ] as const) {
    if (!NUTRIENT_LEVELS.includes(val)) {
      return { error: `${key} must be one of Low | Medium | High` }
    }
  }

  return {
    farmer: { location, soil_type, soil_ph, nitrogen, phosphorus, potassium, habit_crop },
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 analyses per minute per IP
    const ip = getClientIp(req)
    const rl = rateLimit(ip, 10, 60_000)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before running another analysis.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      )
    }

    const body = await req.json()
    const validated = validate(body)
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }
    const { farmer } = validated

    const [crops, weather] = await Promise.all([
      fetchAllCrops(),
      resolveWeather(farmer.location),
    ])

    if (!crops.length) {
      return NextResponse.json({ error: 'No crops configured in crops_master' }, { status: 500 })
    }

    const scored = scoreCrops(farmer, weather, crops)
    const top3 = scored.slice(0, 3)

    // Resolve the farmer's habit crop against the catalogue (case-insensitive,
    // matches crop_name or crop_id).
    const habitRow = resolveHabitCrop(farmer.habit_crop, crops)

    let habitScored
    if (habitRow) {
      // Exact match — use the crop the farmer named.
      habitScored = scored.find((c) => c.crop_id === habitRow.crop_id) ?? scored[scored.length - 1]
    } else if (!farmer.habit_crop.trim()) {
      // Farmer left the field blank — compare against the 2nd-ranked crop
      // (or fall back to #1 if there's only one crop).
      habitScored = scored[1] ?? scored[0]
    } else {
      // Farmer typed something we don't recognise — use the lowest-ranked
      // crop so the comparator still shows a meaningful contrast.
      habitScored = scored[scored.length - 1] ?? scored[0]
    }

    const aiChoice = top3[0]
    const unrecognized = !!(farmer.habit_crop.trim() && !habitRow)
    const verdict = buildVerdict(
      weather,
      aiChoice,
      habitScored,
      farmer.location,
      unrecognized ? farmer.habit_crop : null,
    )

    return NextResponse.json({
      weather,
      recommendations: top3,
      comparator: {
        ai: aiChoice,
        habit: habitScored,
        habit_resolved: Boolean(habitRow),
        habit_input: farmer.habit_crop.trim() || null,
        unrecognized_habit: unrecognized,
      },
      verdict,
    })
  } catch (err) {
    console.error('POST /api/recommend failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate recommendation' },
      { status: 500 },
    )
  }
}
