import type { WeatherResult } from '@/lib/types'

export type { WeatherResult }

// ─── Mock profiles ─────────────────────────────────────────────────────────
// Deterministic profiles so the demo never fails when
// OPENWEATHER_API_KEY is absent. Falls back to `default` for any other
// location string. Rainfall figures are historical Kharif-season averages
// (June–September) for each district, **not** extrapolated from current rain.
const MOCK_PROFILES: Record<string, Omit<WeatherResult, 'location' | 'source'>> = {
  default: {
    temperature_c: 29,
    humidity_pct: 58,
    rainfall_mm: 620,
    condition: 'Partly Cloudy',
    drought_risk: 'Low',
  },
  latur: {
    temperature_c: 31,
    humidity_pct: 52,
    rainfall_mm: 620,
    condition: 'Clear',
    drought_risk: 'Low',
  },
  nagpur: {
    temperature_c: 33,
    humidity_pct: 48,
    rainfall_mm: 480,
    condition: 'Sunny',
    drought_risk: 'Medium',
  },
  pune: {
    temperature_c: 27,
    humidity_pct: 64,
    rainfall_mm: 720,
    condition: 'Light Rain',
    drought_risk: 'Low',
  },
  nashik: {
    temperature_c: 26,
    humidity_pct: 60,
    rainfall_mm: 680,
    condition: 'Overcast',
    drought_risk: 'Low',
  },
  aurangabad: {
    temperature_c: 30,
    humidity_pct: 50,
    rainfall_mm: 530,
    condition: 'Sunny',
    drought_risk: 'Medium',
  },
  solapur: {
    temperature_c: 32,
    humidity_pct: 44,
    rainfall_mm: 380,
    condition: 'Clear',
    drought_risk: 'High',
  },
  kolhapur: {
    temperature_c: 25,
    humidity_pct: 72,
    rainfall_mm: 1100,
    condition: 'Rainy',
    drought_risk: 'Low',
  },
  amravati: {
    temperature_c: 32,
    humidity_pct: 55,
    rainfall_mm: 790,
    condition: 'Partly Cloudy',
    drought_risk: 'Low',
  },
  indore: {
    temperature_c: 28,
    humidity_pct: 62,
    rainfall_mm: 850,
    condition: 'Partly Cloudy',
    drought_risk: 'Low',
  },
  jaipur: {
    temperature_c: 34,
    humidity_pct: 42,
    rainfall_mm: 450,
    condition: 'Sunny',
    drought_risk: 'Medium',
  },
  patna: {
    temperature_c: 31,
    humidity_pct: 68,
    rainfall_mm: 980,
    condition: 'Humid',
    drought_risk: 'Low',
  },
  ludhiana: {
    temperature_c: 30,
    humidity_pct: 54,
    rainfall_mm: 600,
    condition: 'Clear',
    drought_risk: 'Low',
  },
  karnal: {
    temperature_c: 29,
    humidity_pct: 56,
    rainfall_mm: 640,
    condition: 'Partly Cloudy',
    drought_risk: 'Low',
  },
  lucknow: {
    temperature_c: 32,
    humidity_pct: 65,
    rainfall_mm: 890,
    condition: 'Partly Cloudy',
    drought_risk: 'Low',
  },
  hyderabad: {
    temperature_c: 30,
    humidity_pct: 58,
    rainfall_mm: 750,
    condition: 'Clear',
    drought_risk: 'Low',
  },
  ahmedabad: {
    temperature_c: 33,
    humidity_pct: 50,
    rainfall_mm: 580,
    condition: 'Sunny',
    drought_risk: 'Low',
  },
  bhopal: {
    temperature_c: 29,
    humidity_pct: 60,
    rainfall_mm: 920,
    condition: 'Partly Cloudy',
    drought_risk: 'Low',
  },
}

// Historical Kharif-season average rainfall (mm) used when live forecast
// returns zero precipitation (e.g. checked outside the rainy season).
const HISTORICAL_SEASONAL_RAINFALL: Record<string, number> = {
  latur: 620,
  nagpur: 1050,
  pune: 720,
  nashik: 680,
  aurangabad: 530,
  solapur: 380,
  kolhapur: 1100,
  amravati: 790,
  indore: 850,
  jaipur: 450,
  patna: 980,
  ludhiana: 600,
  karnal: 640,
  lucknow: 890,
  hyderabad: 750,
  ahmedabad: 580,
  bhopal: 920,
  default: 620,
}

export function droughtRiskFromRainfall(rainfallMm: number): 'Low' | 'Medium' | 'High' {
  if (rainfallMm >= 600) return 'Low'
  if (rainfallMm >= 350) return 'Medium'
  return 'High'
}

export function mockWeatherFor(location: string): WeatherResult {
  const key = location.split(',')[0]?.trim().toLowerCase() ?? 'default'
  const profile = MOCK_PROFILES[key] ?? MOCK_PROFILES.default
  return { location, source: 'mock', ...profile }
}

// ─── Live weather via OpenWeatherMap ───────────────────────────────────────

async function fetchLiveWeather(location: string, apiKey: string): Promise<WeatherResult> {
  // Step 1: Geocode the location
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    location,
  )}&limit=1&appid=${apiKey}`
  const geoRes = await fetch(geoUrl, { next: { revalidate: 1800 } })
  if (!geoRes.ok) throw new Error(`Geocoding failed (${geoRes.status})`)
  const geoData = (await geoRes.json()) as Array<{ lat: number; lon: number; name: string }>
  if (!geoData.length) throw new Error('Location not found')
  const { lat, lon } = geoData[0]

  // Step 2: Fetch current weather conditions (temp, humidity, condition label)
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  const currentRes = await fetch(currentUrl, { next: { revalidate: 1800 } })
  if (!currentRes.ok) throw new Error(`Current weather fetch failed (${currentRes.status})`)
  const current = await currentRes.json()

  // Step 3: Fetch 5-day / 3-hour forecast and sum total precipitation
  // This gives a far more accurate picture of the near-term rain budget
  // than extrapolating a single hourly reading.
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  const forecastRes = await fetch(forecastUrl, { next: { revalidate: 1800 } })
  let forecastRainMm = 0
  if (forecastRes.ok) {
    const forecast = await forecastRes.json()
    // Sum up all 3-hour precipitation slots in the 5-day window
    for (const slot of forecast.list ?? []) {
      forecastRainMm += slot.rain?.['3h'] ?? 0
    }
  }

  // Step 4: If forecasted rain is present, blend 5-day scaled forecast with
  // historical district baselines and cap at 1500mm max to prevent extreme skew.
  const cityKey = location.split(',')[0]?.trim().toLowerCase() ?? 'default'
  const historicalBaseline =
    HISTORICAL_SEASONAL_RAINFALL[cityKey] ?? HISTORICAL_SEASONAL_RAINFALL.default

  let seasonalRainfallMm: number
  if (forecastRainMm > 5) {
    // 5-day forecast scaled to season, blended with historical average for reliability
    const scaledEstimate = forecastRainMm * 14 + 150
    const blended = Math.round(0.6 * scaledEstimate + 0.4 * historicalBaseline)
    seasonalRainfallMm = Math.max(250, Math.min(1500, blended))
  } else {
    seasonalRainfallMm = historicalBaseline
  }

  return {
    location,
    temperature_c: Math.round(current.main?.temp ?? 28),
    humidity_pct: Math.round(current.main?.humidity ?? 55),
    rainfall_mm: seasonalRainfallMm,
    condition: current.weather?.[0]?.main ?? 'Unknown',
    drought_risk: droughtRiskFromRainfall(seasonalRainfallMm),
    source: 'live',
  }
}

/**
 * Resolves weather for a location: live OpenWeatherMap data when
 * OPENWEATHER_API_KEY is configured and the lookup succeeds, otherwise a
 * deterministic mock so the caller never has to handle a failure.
 */
export async function resolveWeather(location: string): Promise<WeatherResult> {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) return mockWeatherFor(location)

  try {
    return await fetchLiveWeather(location, apiKey)
  } catch (err) {
    console.error('OpenWeatherMap lookup failed, falling back to mock:', err)
    return mockWeatherFor(location)
  }
}
