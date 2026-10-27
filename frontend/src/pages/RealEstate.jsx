import { useState } from 'react'
import { Building2, Loader2, TrendingUp } from 'lucide-react'
import { estimateValuation } from '../services/api.js'
import { DemoNotice, DisclaimerBox, EmptyState } from '../components/UI.jsx'
import toast from 'react-hot-toast'

const AMENITIES = ['Parking', 'Elevator', 'Gym', 'Swimming Pool', 'Security', 'Garden', 'Club House', 'Power Backup', 'CCTV', 'Intercom']

export default function RealEstate() {
  const [form, setForm] = useState({
    location: '', property_type: 'apartment', built_up_area: '',
    land_area: '', bedrooms: '', bathrooms: '', property_age: '',
    construction_quality: 'standard', floor_number: '', comparable_info: '',
    amenities: []
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function toggleAmenity(a) {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a]
    }))
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.location.trim()) return toast.error('Location is required')
    if (!form.built_up_area) return toast.error('Built-up area is required')
    setLoading(true); setResult(null)
    try {
      const payload = {
        ...form,
        built_up_area: parseFloat(form.built_up_area),
        land_area: form.land_area ? parseFloat(form.land_area) : null,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        property_age: form.property_age ? parseInt(form.property_age) : null,
        floor_number: form.floor_number ? parseInt(form.floor_number) : null,
      }
      const r = await estimateValuation(payload)
      setResult(r.data)
    } catch { } finally { setLoading(false) }
  }

  const formatValue = (v) => v > 0 ? `₹${(v/1e5).toFixed(2)} Lakh` : '—'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#172B3A]">Real Estate Valuation</h2>
        <p className="text-sm text-slate-400 mt-1">Preliminary illustrative property value estimate based on AI analysis. Not a certified appraisal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card p-5">
          <h3 className="font-semibold text-[#172B3A] mb-4">Property Details</h3>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label">Location *</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Bandra West, Mumbai" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Property Type</label>
                <select className="input" value={form.property_type} onChange={e => set('property_type', e.target.value)}>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa / House</option>
                  <option value="plot">Plot / Land</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
              <div>
                <label className="label">Construction Quality</label>
                <select className="input" value={form.construction_quality} onChange={e => set('construction_quality', e.target.value)}>
                  <option value="economy">Economy</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Built-up Area (sqft) *</label>
                <input type="number" className="input" value={form.built_up_area} onChange={e => set('built_up_area', e.target.value)} placeholder="e.g. 1200" />
              </div>
              <div>
                <label className="label">Land Area (sqft)</label>
                <input type="number" className="input" value={form.land_area} onChange={e => set('land_area', e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Bedrooms</label>
                <input type="number" className="input" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="3" />
              </div>
              <div>
                <label className="label">Bathrooms</label>
                <input type="number" className="input" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="2" />
              </div>
              <div>
                <label className="label">Age (years)</label>
                <input type="number" className="input" value={form.property_age} onChange={e => set('property_age', e.target.value)} placeholder="0" />
              </div>
            </div>
            <div>
              <label className="label">Floor Number</label>
              <input type="number" className="input" value={form.floor_number} onChange={e => set('floor_number', e.target.value)} placeholder="Ground = 0" />
            </div>
            <div>
              <label className="label">Amenities</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {AMENITIES.map(a => (
                  <button key={a} type="button"
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                      form.amenities.includes(a)
                        ? 'bg-[#14283F] text-white border-[#14283F]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#14283F]'
                    }`}
                    onClick={() => toggleAmenity(a)}
                  >{a}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Additional Information</label>
              <textarea className="input h-16 resize-none text-xs" value={form.comparable_info} onChange={e => set('comparable_info', e.target.value)} placeholder="Any comparable property info, recent transactions, etc." />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
              {loading ? 'Estimating…' : 'Get Preliminary Estimate'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="card p-8">
              <EmptyState icon={Building2} title="No estimate yet" description="Fill in the property details and click Get Estimate." />
            </div>
          )}
          {loading && (
            <div className="card p-8 flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#14283F]" />
              <p className="text-sm text-slate-500">Generating valuation estimate…</p>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              {result.is_demo && <DemoNotice message="Demo mode — configure AI provider for actual estimates." />}

              {/* Value Card */}
              <div className="card p-6 bg-gradient-to-br from-[#14283F] to-[#203A56] text-white">
                <p className="text-sm text-white/60 mb-1">Estimated Value Range</p>
                <p className="text-3xl font-bold mb-1">
                  {result.estimated_value_min > 0
                    ? `${formatValue(result.estimated_value_min)} – ${formatValue(result.estimated_value_max)}`
                    : 'Not estimated (Demo Mode)'}
                </p>
                {result.price_per_sqft > 0 && (
                  <p className="text-sm text-white/70">₹{result.price_per_sqft?.toLocaleString()} / sqft</p>
                )}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs text-white/50 uppercase tracking-wide">PRELIMINARY ILLUSTRATIVE ESTIMATE ONLY</p>
                </div>
              </div>

              {/* Key Factors */}
              {result.key_factors?.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-semibold text-[#172B3A] mb-2">Key Value Factors</h3>
                  <ul className="space-y-1.5">
                    {result.key_factors.map((f, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-[#F59E0B] mt-0.5">•</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assumptions */}
              {result.assumptions?.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-semibold text-[#172B3A] mb-2 text-sm">Assumptions</h3>
                  <ul className="space-y-1">
                    {result.assumptions.map((a, i) => (
                      <li key={i} className="text-xs text-slate-500 flex items-start gap-2"><span className="text-slate-300">•</span>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.disclaimer && <DisclaimerBox text={result.disclaimer} />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
