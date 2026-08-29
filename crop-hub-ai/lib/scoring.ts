import type { CropRow, WeatherResult, FarmerInput, NutrientLevel, ScoredCrop } from '@/lib/types'

export type { FarmerInput, NutrientLevel, ScoredCrop }

const WEIGHTS = { soil: 0.35, npk: 0.2, weather: 0.2, market: 0.25 } as const

const NUTRIENT_RANK: Record<NutrientLevel, number> = { Low: 0, Medium: 1, High: 2 }

export function netProfitPerAcre(crop: CropRow): number {
  return crop.avg_yield_quintals_per_acre * crop.modal_price_per_qtl - crop.base_cost_per_acre
}

export function revenuePerAcre(crop: CropRow): number {
  return crop.avg_yield_quintals_per_acre * crop.modal_price_per_qtl
}

function scoreSoil(farmer: FarmerInput, crop: CropRow): number {
  const soilTypeMatch = crop.preferred_soil_types.some(
    (s) => s.toLowerCase() === farmer.soil_type.toLowerCase(),
  )
  const soilTypePoints = soilTypeMatch ? 60 : 20

  let phPoints: number
  if (farmer.soil_ph >= crop.ideal_ph_min && farmer.soil_ph <= crop.ideal_ph_max) {
    phPoints = 40
  } else {
    const distance =
      farmer.soil_ph < crop.ideal_ph_min
        ? crop.ideal_ph_min - farmer.soil_ph
        : farmer.soil_ph - crop.ideal_ph_max
    phPoints = Math.max(0, 40 - distance * 20)
  }

  return Math.round(soilTypePoints + phPoints)
}

function nutrientPoints(farmerLevel: NutrientLevel, idealLevel: NutrientLevel): number {
  const diff = Math.abs(NUTRIENT_RANK[farmerLevel] - NUTRIENT_RANK[idealLevel])
  if (diff === 0) return 33.33
  if (diff === 1) return 16.67
  return 0
}

function scoreNpk(farmer: FarmerInput, crop: CropRow): number {
  const n = nutrientPoints(farmer.nitrogen, crop.ideal_nitrogen)
  const p = nutrientPoints(farmer.phosphorus, crop.ideal_phosphorus)
  const k = nutrientPoints(farmer.potassium, crop.ideal_potassium)
  return Math.round(n + p + k)
}

function scoreWeather(weather: WeatherResult, crop: CropRow): number {
  const ratio = weather.rainfall_mm / crop.water_requirement_mm
  if (ratio >= 1) return 100
  return Math.round(Math.max(0, ratio * 100))
}

function scoreMarket(crop: CropRow, maxRoi: number): number {
  const profit = netProfitPerAcre(crop)
  const roi = crop.base_cost_per_acre > 0 ? profit / crop.base_cost_per_acre : 0
  if (maxRoi <= 0) return 0
  return Math.round(Math.max(0, Math.min(1, roi / maxRoi)) * 100)
}

/**
 * Runs the weighted scoring algorithm across every active crop and returns
 * them sorted by descending match_score.
 *
 * Weights: Soil & pH 35% · N-P-K 20% · Weather/Rainfall 20% · Market 25%.
 */
export function scoreCrops(
  farmer: FarmerInput,
  weather: WeatherResult,
  crops: CropRow[],
): ScoredCrop[] {
  const maxRoi = Math.max(
    ...crops.map((c) => (c.base_cost_per_acre > 0 ? netProfitPerAcre(c) / c.base_cost_per_acre : 0)),
    0,
  )

  const scored: ScoredCrop[] = crops.map((crop) => {
    const soil_score = scoreSoil(farmer, crop)
    const npk_score = scoreNpk(farmer, crop)
    const weather_score = scoreWeather(weather, crop)
    const market_score = scoreMarket(crop, maxRoi)

    const match_score = Math.round(
      soil_score * WEIGHTS.soil +
        npk_score * WEIGHTS.npk +
        weather_score * WEIGHTS.weather +
        market_score * WEIGHTS.market,
    )

    return {
      crop_id: crop.crop_id,
      crop_name: crop.crop_name,
      category: crop.category,
      soil_score,
      npk_score,
      weather_score,
      market_score,
      match_score: Math.max(0, Math.min(100, match_score)),
      revenue_per_acre: Math.round(revenuePerAcre(crop)),
      cost_per_acre: crop.base_cost_per_acre,
      net_profit_per_acre: Math.round(netProfitPerAcre(crop)),
      water_requirement_mm: crop.water_requirement_mm,
      water_demand: crop.water_demand,
      growth_cycle_days: crop.growth_cycle_days,
      modal_price_per_qtl: crop.modal_price_per_qtl,
    }
  })

  return scored.sort((a, b) => b.match_score - a.match_score)
}

/** Resolves the farmer's free-text habit crop against the known catalogue. */
export function resolveHabitCrop(habitCropText: string, crops: CropRow[]): CropRow | null {
  const q = habitCropText.trim().toLowerCase()
  if (!q) return null
  return (
    crops.find((c) => c.crop_name.toLowerCase() === q || c.crop_id.toLowerCase() === q) ?? null
  )
}

export function buildVerdict(
  weather: WeatherResult,
  ai: ScoredCrop,
  habit: ScoredCrop,
  farmerLocation: string,
): string {
  if (ai.crop_id === habit.crop_id) {
    return `${ai.crop_name} is already both your usual crop and the top AI match for ${farmerLocation} this season, scoring ${ai.match_score}% on soil, nutrient, weather and market fit combined.`
  }

  const profitDelta = ai.net_profit_per_acre - habit.net_profit_per_acre
  const profitPct =
    habit.net_profit_per_acre > 0
      ? Math.round((profitDelta / habit.net_profit_per_acre) * 100)
      : null
  const waterDelta = habit.water_requirement_mm - ai.water_requirement_mm

  const parts: string[] = []

  if (waterDelta > 0) {
    parts.push(
      `${habit.crop_name} needs ~${habit.water_requirement_mm.toLocaleString(
        'en-IN',
      )}mm of water against a forecasted ${weather.rainfall_mm.toLocaleString(
        'en-IN',
      )}mm, a real risk if rainfall underperforms. ${ai.crop_name} needs only ${ai.water_requirement_mm.toLocaleString(
        'en-IN',
      )}mm, comfortably within the forecast.`,
    )
  } else {
    parts.push(
      `Both crops sit within a workable water budget for the ${weather.rainfall_mm.toLocaleString(
        'en-IN',
      )}mm forecast for ${farmerLocation}.`,
    )
  }

  if (profitDelta > 0) {
    parts.push(
      profitPct !== null
        ? `${ai.crop_name} also delivers a ${profitPct}% higher net return per acre at current mandi rates.`
        : `${ai.crop_name} also delivers a stronger net return per acre at current mandi rates.`,
    )
  } else if (profitDelta < 0) {
    parts.push(
      `${habit.crop_name} still edges out on raw profit per acre, so weigh that against the water-risk trade-off above.`,
    )
  }

  return parts.join(' ')
}