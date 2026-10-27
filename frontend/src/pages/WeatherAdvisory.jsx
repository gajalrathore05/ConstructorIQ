import { useState, useEffect } from 'react'
import { CloudSun, Search, Loader2, Wind, Droplets, Thermometer, AlertTriangle, RefreshCw } from 'lucide-react'
import { getWeather } from '../services/api.js'
import { DisclaimerBox } from '../components/UI.jsx'
import toast from 'react-hot-toast'

export default function WeatherAdvisory() {
  const [location, setLocation] = useState('Mumbai')
  const [inputLoc, setInputLoc] = useState('Mumbai')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)

  async function fetch(loc) {
    setLoading(true)
    try {
      const r = await getWeather(loc || location)
      setWeather(r.data)
    } catch { toast.error('Failed to fetch weather') } finally { setLoading(false) }
  }

  useEffect(() => { fetch('Mumbai') }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (!inputLoc.trim()) return
    setLocation(inputLoc.trim())
    fetch(inputLoc.trim())
  }

  const condIcon = (cond = '') => {
    const c = cond.toLowerCase()
    if (c.includes('rain') || c.includes('drizzle')) return '🌧️'
    if (c.includes('storm') || c.includes('thunder')) return '⛈️'
    if (c.includes('snow')) return '❄️'
    if (c.includes('cloud')) return '⛅'
    if (c.includes('fog') || c.includes('mist')) return '🌫️'
    return '☀️'
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#172B3A]">Weather Advisory</h2>
        <p className="text-sm text-slate-400 mt-1">Construction site weather advisory and planning support.</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="input flex-1"
          value={inputLoc}
          onChange={e => setInputLoc(e.target.value)}
          placeholder="Enter city name (e.g. Delhi, Chennai, Pune)…"
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? 'Loading…' : 'Get Weather'}
        </button>
      </form>

      {!weather && !loading && (
        <div className="card p-12 flex flex-col items-center gap-3">
          <CloudSun size={40} className="text-slate-300" />
          <p className="text-slate-400">Enter a city to get construction weather advisory</p>
        </div>
      )}

      {loading && (
        <div className="card p-12 flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#14283F]" />
          <p className="text-sm text-slate-500">Fetching weather data…</p>
        </div>
      )}

      {weather && !loading && (
        <div className="space-y-4">
          {/* Status banner */}
          {!weather.is_live && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              <span>{weather.error || 'Live weather not available — add WEATHER_API_KEY to enable.'}</span>
            </div>
          )}

          {/* Current weather card */}
          {weather.temperature != null && (
            <div className="card p-6 bg-gradient-to-br from-[#14283F] to-[#203A56] text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">{weather.location}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{condIcon(weather.condition)}</span>
                    <div>
                      <p className="text-4xl font-bold">{weather.temperature}°C</p>
                      <p className="text-white/70 text-sm capitalize">{weather.condition}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-white/60 space-y-1">
                  {weather.feels_like != null && <p>Feels like {weather.feels_like}°C</p>}
                  {weather.humidity != null && (
                    <p className="flex items-center gap-1 justify-end"><Droplets size={12} />{weather.humidity}%</p>
                  )}
                  {weather.wind_speed != null && (
                    <p className="flex items-center gap-1 justify-end"><Wind size={12} />{weather.wind_speed} km/h</p>
                  )}
                </div>
              </div>
              {weather.last_updated && (
                <p className="text-xs text-white/40 mt-3 flex items-center gap-1">
                  <RefreshCw size={10} />Updated: {new Date(weather.last_updated).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}

          {/* Construction Advisory */}
          {weather.construction_advisory && (
            <div className="card p-4">
              <h3 className="font-semibold text-[#172B3A] mb-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-[#F59E0B]" />
                Construction Advisory
              </h3>
              <div className="space-y-2">
                {weather.construction_advisory.split(' | ').map((adv, i) => (
                  <div key={i} className="p-3 bg-amber-50 rounded-lg text-sm text-amber-800 border border-amber-100">{adv}</div>
                ))}
              </div>
            </div>
          )}

          {/* Forecast */}
          {weather.forecast?.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold text-[#172B3A] mb-3">5-Day Forecast</h3>
              <div className="grid grid-cols-5 gap-2">
                {weather.forecast.map((day, i) => (
                  <div key={i} className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</p>
                    <p className="text-xl mb-1">{condIcon(day.condition)}</p>
                    <p className="text-xs font-medium text-[#172B3A]">{day.temp_max}°</p>
                    <p className="text-xs text-slate-400">{day.temp_min}°</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{day.condition?.split(' ').slice(0,2).join(' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DisclaimerBox text="Weather data is for general planning reference. Always verify with local forecasts before making construction decisions. Live data requires WEATHER_API_KEY configuration." />
        </div>
      )}
    </div>
  )
}
