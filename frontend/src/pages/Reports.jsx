import { useState, useEffect } from 'react'
import { FileText, Download, Trash2, Search, Filter, Loader2, RefreshCw } from 'lucide-react'
import { getAnalyses, deleteAnalysis, downloadReport } from '../services/api.js'
import { EmptyState, ConfirmDialog } from '../components/UI.jsx'
import { Spinner } from '../components/Spinner.jsx'
import toast from 'react-hot-toast'

const TYPE_LABELS = { safety: 'Site Safety', crack: 'Crack Analysis', valuation: 'Valuation', planning: 'Planning', chat: 'AI Chat' }
const TYPE_COLORS = {
  safety: 'bg-red-100 text-red-700',
  crack: 'bg-orange-100 text-orange-700',
  valuation: 'bg-blue-100 text-blue-700',
  planning: 'bg-green-100 text-green-700',
  chat: 'bg-purple-100 text-purple-700',
}

export default function Reports() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [downloading, setDownloading] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const r = await getAnalyses(typeFilter ? { analysis_type: typeFilter } : {})
      setAnalyses(r.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [typeFilter])

  async function handleDelete(id) {
    try {
      await deleteAnalysis(id)
      setAnalyses(prev => prev.filter(a => a.id !== id))
      toast.success('Analysis deleted')
    } catch { }
    setConfirm(null)
  }

  async function handleDownload(id) {
    setDownloading(id)
    try {
      const r = await downloadReport(id)
      const url = URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `constructiq_report_${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded')
    } catch {
      toast.error('Failed to generate report')
    } finally { setDownloading(null) }
  }

  const filtered = analyses.filter(a => {
    const q = filter.toLowerCase()
    return !q || (a.title || '').toLowerCase().includes(q) || (a.analysis_type || '').includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172B3A]">Reports & Analysis History</h2>
          <p className="text-sm text-slate-400 mt-1">{analyses.length} total analyses</p>
        </div>
        <button className="btn-secondary" onClick={load}>
          <RefreshCw size={14} />Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search analyses…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <select className="input w-44" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="safety">Site Safety</option>
          <option value="crack">Crack Analysis</option>
          <option value="valuation">Valuation</option>
          <option value="planning">Planning</option>
          <option value="chat">AI Chat</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={28} className="text-[#14283F]" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            icon={FileText}
            title="No analyses found"
            description="Run a safety check, crack analysis, or valuation to see results here."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400">ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400">Type</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400">Title</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400">Input</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400">Date</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-400 text-xs">#{a.id}</td>
                  <td className="px-3 py-3">
                    <span className={`badge ${TYPE_COLORS[a.analysis_type] || 'bg-slate-100 text-slate-600'}`}>
                      {TYPE_LABELS[a.analysis_type] || a.analysis_type}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-medium text-[#172B3A] max-w-xs truncate">{a.title || '—'}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs max-w-48 truncate">{a.input_summary || '—'}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs">
                    {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        className="btn-secondary px-2 py-1 text-xs"
                        onClick={() => handleDownload(a.id)}
                        disabled={downloading === a.id}
                        title="Download PDF report"
                      >
                        {downloading === a.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Download size={12} />
                        }
                        PDF
                      </button>
                      <button
                        className="text-slate-400 hover:text-red-500 p-1"
                        onClick={() => setConfirm({ id: a.id, title: a.title })}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Delete Analysis?"
        message={`"${confirm?.title || `Analysis #${confirm?.id}`}" will be permanently deleted.`}
        onConfirm={() => handleDelete(confirm.id)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
