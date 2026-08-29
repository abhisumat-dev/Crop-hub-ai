export type NutrientLevel = 'Low' | 'Medium' | 'High'
export type WaterDemand = 'Low' | 'Medium' | 'High' | 'Very High'

export interface CropRow {
  id: string
  crop_id: string
  crop_name: string
  category: string
  preferred_soil_types: string[]
  ideal_ph_min: number
  ideal_ph_max: number
  ideal_nitrogen: NutrientLevel
  ideal_phosphorus: NutrientLevel
  ideal_potassium: NutrientLevel
  water_demand: WaterDemand
  water_requirement_mm: number
  growth_cycle_days: number
  base_cost_per_acre: number
  avg_yield_quintals_per_acre: number
  modal_price_per_qtl: number
  trend_7d: number
  last_updated: string
}

export interface WeatherResult {
  location: string
  temperature_c: number
  humidity_pct: number
  rainfall_mm: number
  condition: string
  drought_risk: 'Low' | 'Medium' | 'High'
  source: 'live' | 'mock'
}

export interface FarmerInput {
  location: string
  soil_type: string
  soil_ph: number
  nitrogen: NutrientLevel
  phosphorus: NutrientLevel
  potassium: NutrientLevel
  habit_crop: string
}

export interface ScoredCrop {
  crop_id: string
  crop_name: string
  category: string
  soil_score: number
  npk_score: number
  weather_score: number
  market_score: number
  match_score: number
  revenue_per_acre: number
  cost_per_acre: number
  net_profit_per_acre: number
  water_requirement_mm: number
  water_demand: WaterDemand
  growth_cycle_days: number
  modal_price_per_qtl: number
}

export interface RecommendResponse {
  weather: WeatherResult
  recommendations: ScoredCrop[]
  comparator: {
    ai: ScoredCrop
    habit: ScoredCrop
    habit_resolved: boolean
  }
  verdict: string
}

export function formatINR(value: number): string {
  return '₹' + Math.round(value).toLocaleString('en-IN')
}
