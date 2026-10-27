import { useState } from 'react'
import { ScanLine, Loader2, AlertTriangle, Info } from 'lucide-react'
import { analyzeCrack } from '../services/api.js'
import { ImageDropzone } from '../components/ImageDropzone.jsx'
import { SeverityBadge } from '../components/Badges.jsx'
import { DemoNotice, DisclaimerBox, EmptyState } from '../components/UI.jsx'
import toast from 'react-hot-toast'

export default function CrackAnalysis() {
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ structure_type: '', material: '', location_description: '', symptoms: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function analyze() {
    if (!file) return toast.error('Please upload a crack photograph')
    setLoading(true); setResult(null)
    const fd = new FormData()
    fd.append('image', file)
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
    try {
      const r = await analyzeCrack(fd)
      setResult(r.data)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Analysis failed')
    } finally { setLoading(false) }
  }

  const urgencyColors = {
    immediate: 'text-red-600 bg-red-50 border-red-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    low: 'text-green-600 bg-green-50 border-green-200',
    monitor: 'text-blue-600 bg-blue-50 border-blue-200',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#172B3A]">Structural Crack Analysis</h2>
        <p className="text-sm text-slate-400 mt-1">Upload a crack photograph for AI-assisted visual observation. Not a substitute for engineering inspection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-[#172B3A]">Upload Crack Photograph</h3>
          <ImageDropzone file={file} onFile={setFile} onRemove={() => { setFile(null); setResult(null) }} />

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Structure Type</label>
                <select className="input" value={form.structure_type} onChange={e => set('structure_type', e.target.value)}>
                  <option value="">Select…</option>
                  <option>Residential Building</option>
                  <option>Commercial Building</option>
                  <option>Retaining Wall</option>
                  <option>Bridge</option>
                  <option>Column</option>
                  <option>Beam</option>
                  <option>Foundation</option>
                  <option>Slab</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Material</label>
                <select className="input" value={form.material} onChange={e => set('material', e.target.value)}>
                  <option value="">Select…</option>
                  <option>Reinforced Concrete</option>
                  <option>Brick Masonry</option>
                  <option>Stone Masonry</option>
                  <option>Concrete Block</option>
                  <option>Plaster/Render</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Location Description</label>
              <input className="input" value={form.location_description} onChange={e => set('location_description', e.target.value)} placeholder="e.g. External wall, 2nd floor, south side" />
            </div>
            <div>
              <label className="label">Additional Symptoms</label>
              <textarea className="input h-16 resize-none text-xs" value={form.symptoms} onChange={e => set('symptoms', e.target.value)} placeholder="e.g. crack is widening, damp patches nearby, doors sticking…" />
            </div>
          </div>

          <button className="btn-primary w-full" onClick={analyze} disabled={loading || !file}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
            {loading ? 'Analyzing…' : 'Analyze Crack'}
          </button>
        </div>

        <div className="space-y-4">
          {!result && !loading && (
            <div className="card p-8">
              <EmptyState icon={ScanLine} title="No analysis yet" description="Upload a crack photograph and click Analyze." />
            </div>
          )}
          {loading && (
            <div className="card p-8 flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#14283F]" />
              <p className="text-sm text-slate-500">Analyzing crack photograph…</p>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              {result.is_demo && <DemoNotice message="Demo mode — no real image analysis. Configure AI provider for actual results." />}

              {/* Urgency */}
              <div className={`p-4 rounded-xl border ${urgencyColors[result.urgency_level] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1">Urgency Level</p>
                <p className="font-bold text-lg capitalize">{result.urgency_level}</p>
              </div>

              {/* Summary */}
              <div className="card p-4">
                <h3 className="font-semibold text-[#172B3A] mb-2">Summary</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>
              </div>

              {/* Observations */}
              {result.observations?.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-semibold text-[#172B3A] mb-2">Observations</h3>
                  <ul className="space-y-1.5">
                    {result.observations.map((o, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-[#F59E0B] mt-0.5">•</span>{o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Crack Details */}
              {result.crack_details && (
                <div className="card p-4">
                  <h3 className="font-semibold text-[#172B3A] mb-3">Crack Details</h3>
                  <div className="space-y-2 text-sm">
                    {result.crack_details.pattern && <div><span className="text-slate-400">Pattern:</span> <span className="text-[#172B3A]">{result.crack_details.pattern}</span></div>}
                    {result.crack_details.location && <div><span className="text-slate-400">Location:</span> <span className="text-[#172B3A]">{result.crack_details.location}</span></div>}
                    {result.crack_details.estimated_width ? (
                      <div><span className="text-slate-400">Est. Width:</span> <span className="text-[#172B3A]">{result.crack_details.estimated_width}</span></div>
                    ) : (
                      <div><span className="text-slate-400">Est. Width:</span> <span className="text-slate-400 italic">Not determinable from image (no calibrated reference)</span></div>
                    )}
                    {result.crack_details.potential_causes?.length > 0 && (
                      <div>
                        <p className="text-slate-400 mb-1">Potential Causes:</p>
                        <ul className="space-y-0.5">
                          {result.crack_details.potential_causes.map((c, i) => (
                            <li key={i} className="text-[#172B3A] flex items-start gap-2"><span className="text-slate-300">•</span>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.crack_details.recommended_actions?.length > 0 && (
                      <div>
                        <p className="text-slate-400 mb-1">Recommended Actions:</p>
                        <ul className="space-y-0.5">
                          {result.crack_details.recommended_actions.map((a, i) => (
                            <li key={i} className="text-[#172B3A] flex items-start gap-2"><span className="text-[#F59E0B]">→</span>{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.limitations?.length > 0 && (
                <div className="card p-4">
                  <h3 className="text-sm font-semibold text-[#172B3A] mb-2">Limitations</h3>
                  <ul className="space-y-1">
                    {result.limitations.map((l, i) => (
                      <li key={i} className="text-xs text-slate-500 flex items-start gap-2"><span className="text-slate-300">•</span>{l}</li>
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
