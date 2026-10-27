import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderOpen, TrendingUp, ShieldAlert, Cpu, DollarSign,
  Calendar, Plus, ArrowRight, AlertCircle, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { getDashboard, createProject } from '../services/api.js'
import { StatusBadge } from '../components/Badges.jsx'
import { EmptyState, ConfirmDialog } from '../components/UI.jsx'
import { Spinner } from '../components/Spinner.jsx'
import toast from 'react-hot-toast'

const COLORS = ['#14283F', '#F59E0B', '#16A34A', '#DC2626', '#8B5CF6']

function StatCard({ icon: Icon, label, value, sub, color = '#14283F' }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#172B3A] mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', location: '', status: 'planning', budget: '', description: '' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Project name is required')
    setLoading(true)
    try {
      const res = await createProject({ ...form, budget: parseFloat(form.budget) || 0 })
      toast.success('Project created!')
      onCreated(res.data)
      onClose()
    } catch { } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h2 className="font-semibold text-[#172B3A] mb-4">New Project</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Project Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. City Heights Tower" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Mumbai" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Budget (₹ / $)</label>
            <input className="input" type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-20 resize-none" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief project description…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  async function load() {
    try {
      const res = await getDashboard()
      setData(res.data)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} className="text-[#14283F]" />
    </div>
  )

  const stats = data?.stats || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172B3A]">Construction Intelligence Dashboard</h2>
          <p className="text-sm text-slate-400">Real-time overview of your projects and analyses</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderOpen} label="Total Projects" value={stats.total_projects ?? 0} sub={`${stats.active_projects ?? 0} active`} color="#14283F" />
        <StatCard icon={TrendingUp} label="Avg Progress" value={`${stats.average_progress ?? 0}%`} sub={`${stats.completed_projects ?? 0} completed`} color="#16A34A" />
        <StatCard icon={ShieldAlert} label="Overdue Tasks" value={stats.overdue_tasks ?? 0} sub="Require attention" color="#DC2626" />
        <StatCard icon={Cpu} label="Total Analyses" value={stats.total_analyses ?? 0} sub="AI analyses run" color="#F59E0B" />
      </div>

      {/* Budget Row */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={DollarSign} label="Total Budget" value={`₹${((stats.total_budget ?? 0) / 1e6).toFixed(1)}M`} sub="Across all projects" color="#8B5CF6" />
        <StatCard icon={DollarSign} label="Total Spent" value={`₹${((stats.total_spent ?? 0) / 1e6).toFixed(1)}M`}
          sub={stats.total_budget ? `${((stats.total_spent / stats.total_budget) * 100).toFixed(0)}% utilized` : '—'}
          color="#D97706" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget Chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-[#172B3A] mb-4">Budget vs Spent by Project</h3>
          {data?.budget_chart?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.budget_chart} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => `${(v/1e6).toFixed(1)}M`} />
                <Tooltip formatter={(v) => `₹${(v/1e6).toFixed(2)}M`} />
                <Bar dataKey="budget" fill="#14283F" radius={[3,3,0,0]} name="Budget" />
                <Bar dataKey="spent" fill="#F59E0B" radius={[3,3,0,0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-300 text-sm">No project budget data yet</div>
          )}
        </div>

        {/* Analysis Breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-[#172B3A] mb-4">Analysis Type Breakdown</h3>
          {data?.analysis_breakdown?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.analysis_breakdown} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}>
                  {data.analysis_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-300 text-sm">No analyses yet — run your first analysis</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#172B3A]">Recent Projects</h3>
            <button className="text-xs text-[#14283F] hover:underline flex items-center gap-1" onClick={() => navigate('/planning')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {data?.recent_projects?.length ? (
            <div className="space-y-3">
              {data.recent_projects.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/planning')}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#172B3A] truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.location || '—'}</p>
                    <div className="mt-1.5 bg-slate-100 rounded-full h-1.5 w-full">
                      <div className="bg-[#14283F] h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FolderOpen} title="No projects yet" description="Create your first project to get started."
              action={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={14} />New Project</button>} />
          )}
        </div>

        {/* Recent Analyses */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#172B3A]">Recent Analyses</h3>
            <button className="text-xs text-[#14283F] hover:underline flex items-center gap-1" onClick={() => navigate('/reports')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {data?.recent_analyses?.length ? (
            <div className="space-y-2">
              {data.recent_analyses.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#172B3A] truncate">{a.title || a.type}</p>
                    <p className="text-xs text-slate-400">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</p>
                  </div>
                  <span className="badge bg-slate-100 text-slate-600">{a.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Cpu} title="No analyses yet" description="Run a safety, crack, or valuation analysis." />
          )}
        </div>
      </div>

      {showModal && <ProjectModal onClose={() => setShowModal(false)} onCreated={() => load()} />}
    </div>
  )
}
