import { useState } from 'react'
import { ShieldAlert, Upload, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react'
import { analyzeSafety } from '../services/api.js'
import { ImageDropzone } from '../components/ImageDropzone.jsx'
import { SeverityBadge } from '../components/Badges.jsx'
import { DemoNotice, DisclaimerBox, EmptyState } from '../components/UI.jsx'
import toast from 'react-hot-toast'

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'informational']
const SEVERITY_ICON = {
  critical: <AlertTriangle size={14} className="text-red-600" />,
  high: <AlertTriangle size={14} className="text-orange-500" />,
  medium: <AlertTriangle size={14} className="text-amber-500" />,
  low: <Info size={14} className="text-green-600" />,
  informational: <Info size={14} className="text-blue-500" />,
}

export default function SiteSafety() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function analyze() {
    if (!file) return toast.error('Please upload an image first')
    setLoading(true)
    setResult(null)
    const fd = new FormData()
    fd.append('image', file)
    try {
      const r = await analyzeSafety(fd)
      setResult(r.data)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Analysis failed')
    } finally { setLoading(false) }
  }

  const sortedFindings = result?.findings
    ? [...result.findings].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))
    : []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#172B3A]">Construction Site Safety Monitoring</h2>
        <p className="text-sm text-slate-400 mt-1">Upload a site photograph for AI-assisted preliminary safety review.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Panel */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-[#172B3A]">Upload Site Image</h3>
          <ImageDropzone file={file} onFile={setFile} onRemove={() => { setFile(null); setResult(null) }} />
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
            <strong>Note:</strong> AI findings are preliminary decision support only. All results require verification by a qualified site safety professional.
          </div>
          <button
            className="btn-primary w-full"
            onClick={analyze}
            disabled={loading || !file}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
            {loading ? 'Analyzing…' : 'Analyze for Safety Hazards'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="card p-8">
              <EmptyState icon={ShieldAlert} title="No analysis yet" description="Upload a site image and click Analyze to see safety findings." />
            </div>
          )}

          {loading && (
            <div className="card p-8 flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#14283F]" />
              <p className="text-sm text-slate-500">Analyzing site image for safety hazards…</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.is_demo && <DemoNotice message="Demo mode — no real image analysis performed. Configure AI provider for actual results." />}

              {/* Summary */}
              <div className="card p-4">
                <h3 className="font-semibold text-[#172B3A] mb-2 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" /> Analysis Summary
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>
              </div>

              {/* Findings */}
              {sortedFindings.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-semibold text-[#172B3A] mb-3">
                    Findings ({sortedFindings.length})
                  </h3>
                  <div className="space-y-3">
                    {sortedFindings.map((f, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          {SEVERITY_ICON[f.severity?.toLowerCase()]}
                          <SeverityBadge severity={f.severity} />
                          <span className="text-sm font-medium text-[#172B3A]">{f.category}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-1"><strong>Observation:</strong> {f.observation}</p>
                        <p className="text-xs text-slate-600"><strong>Action:</strong> {f.recommended_action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Limitations */}
              {result.limitations?.length > 0 && (
                <div className="card p-4">
                  <h3 className="font-semibold text-[#172B3A] mb-2 text-sm">Limitations</h3>
                  <ul className="space-y-1">
                    {result.limitations.map((l, i) => (
                      <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                        <span className="text-slate-300 mt-0.5">•</span>{l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <DisclaimerBox text="AI safety analysis is for preliminary decision support only and does not replace on-site inspection by a qualified health and safety professional." />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
