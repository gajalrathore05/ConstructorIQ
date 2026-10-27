import { useState, useEffect } from 'react'
import { Settings2, Save, Loader2, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { getHealth } from '../services/api.js'
import toast from 'react-hot-toast'

function Section({ title, children }) {
  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-semibold text-[#172B3A] border-b border-slate-100 pb-3">{title}</h3>
      {children}
    </div>
  )
}

export default function Settings() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    getHealth().then(r => setHealth(r.data)).catch(() => {})
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#172B3A]">Settings</h2>
        <p className="text-sm text-slate-400 mt-1">Configure AI provider, weather, and application settings.</p>
      </div>

      {/* System Status */}
      <Section title="System Status">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              {health?.status === 'healthy'
                ? <CheckCircle size={16} className="text-green-600" />
                : <AlertTriangle size={16} className="text-amber-500" />}
              <span className="text-sm font-medium text-[#172B3A]">Backend API</span>
            </div>
            <span className={`badge ${health?.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {health?.status || 'Checking…'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              {health?.ai_available
                ? <CheckCircle size={16} className="text-green-600" />
                : <AlertTriangle size={16} className="text-amber-500" />}
              <span className="text-sm font-medium text-[#172B3A]">AI Provider</span>
            </div>
            <span className={`badge ${health?.ai_available ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {health?.ai_available ? `${health.ai_provider?.toUpperCase()} — Active` : 'Demo Mode'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              {health?.weather_available
                ? <CheckCircle size={16} className="text-green-600" />
                : <AlertTriangle size={16} className="text-amber-500" />}
              <span className="text-sm font-medium text-[#172B3A]">Weather Service</span>
            </div>
            <span className={`badge ${health?.weather_available ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {health?.weather_available ? 'Connected' : 'Not configured'}
            </span>
          </div>
        </div>
      </Section>

      {/* AI Config */}
      <Section title="AI Provider Configuration">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-2">API keys are configured via environment variables, not stored in the browser.</p>
          <p className="text-blue-600 text-xs">Edit <code className="bg-blue-100 px-1 rounded">backend/.env</code> to update credentials.</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">Current AI Provider</label>
            <div className="input bg-slate-50 text-slate-500 cursor-not-allowed">
              {health?.ai_available ? `${health.ai_provider} (active)` : 'Not configured — Demo Mode active'}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-[#172B3A]">To enable AI features:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-xs leading-relaxed">
              <li>Copy <code className="bg-slate-100 px-1 rounded">backend/.env.example</code> to <code className="bg-slate-100 px-1 rounded">backend/.env</code></li>
              <li>Set <code className="bg-slate-100 px-1 rounded">GEMINI_API_KEY=your_key</code> (free at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">aistudio.google.com</a>)</li>
              <li>Or set <code className="bg-slate-100 px-1 rounded">OPENAI_API_KEY=your_key</code> with <code className="bg-slate-100 px-1 rounded">AI_PROVIDER=openai</code></li>
              <li>Restart the backend server: <code className="bg-slate-100 px-1 rounded">uvicorn app.main:app --reload</code></li>
            </ol>
          </div>
        </div>
      </Section>

      {/* Weather Config */}
      <Section title="Weather Service Configuration">
        <div className="space-y-3">
          <div>
            <label className="label">Weather Provider Status</label>
            <div className="input bg-slate-50 text-slate-500 cursor-not-allowed">
              {health?.weather_available ? 'OpenWeatherMap — Connected' : 'Not configured'}
            </div>
          </div>
          <div className="text-sm space-y-1 text-slate-600 text-xs">
            <p className="font-medium text-[#172B3A] text-sm">To enable live weather:</p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>Get a free API key at <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer" className="text-blue-600 underline">openweathermap.org</a></li>
              <li>Set <code className="bg-slate-100 px-1 rounded">WEATHER_API_KEY=your_key</code> in <code className="bg-slate-100 px-1 rounded">backend/.env</code></li>
              <li>Restart the backend</li>
            </ol>
          </div>
        </div>
      </Section>

      {/* About */}
      <Section title="About ConstructIQ">
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between"><span className="text-slate-400">Version</span><span>1.0.0</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Frontend</span><span>React 18 + Vite + Tailwind CSS</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Backend</span><span>Python 3.11 + FastAPI + SQLite</span></div>
          <div className="flex justify-between"><span className="text-slate-400">API Docs</span>
            <a href="/api/docs" target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1 hover:underline">
              /api/docs <ExternalLink size={11} />
            </a>
          </div>
          <div className="flex justify-between"><span className="text-slate-400">Tagline</span><span className="italic">Intelligent Decisions. Safer Construction.</span></div>
        </div>
      </Section>
    </div>
  )
}
