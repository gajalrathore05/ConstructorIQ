import { useState, useEffect } from 'react'
import {
  FolderKanban, Plus, Trash2, Edit3, CheckSquare, Square,
  Loader2, ChevronDown, ChevronRight, Calendar, DollarSign
} from 'lucide-react'
import {
  getProjects, createProject, updateProject, deleteProject,
  getProjectTasks, createTask, updateTask, deleteTask
} from '../services/api.js'
import { StatusBadge, PriorityBadge } from '../components/Badges.jsx'
import { EmptyState, ConfirmDialog } from '../components/UI.jsx'
import { Spinner } from '../components/Spinner.jsx'
import toast from 'react-hot-toast'

function ProjectForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', location: '', description: '', start_date: '', target_end_date: '', budget: '', status: 'planning', progress: 0 })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Project name required')
    setLoading(true)
    try {
      await onSave({ ...form, budget: parseFloat(form.budget) || 0, progress: parseInt(form.progress) || 0 })
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-semibold text-[#172B3A] mb-4">{initial?.id ? 'Edit Project' : 'New Project'}</h2>
        <form onSubmit={submit} className="space-y-3">
          <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Project name" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Location</label><input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="City" /></div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {['planning','active','on_hold','completed','cancelled'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Start Date</label><input type="date" className="input" value={form.start_date} onChange={e => set('start_date', e.target.value)} /></div>
            <div><label className="label">Target End</label><input type="date" className="input" value={form.target_end_date} onChange={e => set('target_end_date', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Budget</label><input type="number" className="input" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0" /></div>
            <div><label className="label">Progress %</label><input type="number" min="0" max="100" className="input" value={form.progress} onChange={e => set('progress', e.target.value)} /></div>
          </div>
          <div><label className="label">Description</label><textarea className="input h-20 resize-none" value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}{initial?.id ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TaskForm({ projectId, initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { title: '', description: '', assigned_to: '', start_date: '', due_date: '', priority: 'medium', status: 'todo', estimated_cost: '' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Task title required')
    setLoading(true)
    try {
      await onSave({ ...form, estimated_cost: parseFloat(form.estimated_cost) || 0 })
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-semibold text-[#172B3A] mb-4">{initial?.id ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={submit} className="space-y-3">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {['low','medium','high','critical'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {['todo','in_progress','completed','blocked'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Start Date</label><input type="date" className="input" value={form.start_date} onChange={e => set('start_date', e.target.value)} /></div>
            <div><label className="label">Due Date</label><input type="date" className="input" value={form.due_date} onChange={e => set('due_date', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Assigned To</label><input className="input" value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} placeholder="Name" /></div>
            <div><label className="label">Est. Cost</label><input type="number" className="input" value={form.estimated_cost} onChange={e => set('estimated_cost', e.target.value)} placeholder="0" /></div>
          </div>
          <div><label className="label">Description</label><textarea className="input h-16 resize-none" value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}{initial?.id ? 'Save' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectPlanning() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState({})
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(true)
  const [projectModal, setProjectModal] = useState(null) // null | {} | project
  const [taskModal, setTaskModal] = useState(null)
  const [confirm, setConfirm] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const r = await getProjects()
      setProjects(r.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function loadTasks(pid) {
    try {
      const r = await getProjectTasks(pid)
      setTasks(prev => ({ ...prev, [pid]: r.data }))
    } catch { }
  }

  function toggleExpand(pid) {
    setExpanded(prev => {
      const next = { ...prev, [pid]: !prev[pid] }
      if (next[pid] && !tasks[pid]) loadTasks(pid)
      return next
    })
  }

  async function handleSaveProject(data) {
    try {
      if (data.id) {
        await updateProject(data.id, data)
        toast.success('Project updated')
      } else {
        await createProject(data)
        toast.success('Project created')
      }
      setProjectModal(null)
      load()
    } catch { }
  }

  async function handleDeleteProject(id) {
    try {
      await deleteProject(id)
      toast.success('Project deleted')
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch { }
    setConfirm(null)
  }

  async function handleSaveTask(projectId, data) {
    try {
      if (data.id) {
        await updateTask(data.id, data)
        toast.success('Task updated')
      } else {
        await createTask(projectId, data)
        toast.success('Task added')
      }
      setTaskModal(null)
      loadTasks(projectId)
    } catch { }
  }

  async function handleDeleteTask(taskId, projectId) {
    try {
      await deleteTask(taskId)
      toast.success('Task deleted')
      setTasks(prev => ({ ...prev, [projectId]: prev[projectId]?.filter(t => t.id !== taskId) }))
    } catch { }
    setConfirm(null)
  }

  async function toggleTaskStatus(task, projectId) {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed'
    try {
      await updateTask(task.id, { status: newStatus })
      setTasks(prev => ({
        ...prev,
        [projectId]: prev[projectId].map(t => t.id === task.id ? { ...t, status: newStatus } : t)
      }))
    } catch { }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172B3A]">Project Planning</h2>
          <p className="text-sm text-slate-400 mt-1">Create and manage construction projects and tasks</p>
        </div>
        <button className="btn-primary" onClick={() => setProjectModal({})}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={28} className="text-[#14283F]" /></div>
      ) : projects.length === 0 ? (
        <div className="card p-8">
          <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first construction project to start planning."
            action={<button className="btn-primary" onClick={() => setProjectModal({})}><Plus size={14} />New Project</button>} />
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project.id} className="card overflow-hidden">
              {/* Project Header */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(project.id)}
              >
                {expanded[project.id] ? <ChevronDown size={16} className="text-slate-400 shrink-0" /> : <ChevronRight size={16} className="text-slate-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-[#172B3A]">{project.name}</h3>
                    <StatusBadge status={project.status} />
                    {project.location && <span className="text-xs text-slate-400">{project.location}</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="bg-slate-100 rounded-full h-1.5 flex-1 max-w-32">
                        <div className="bg-[#14283F] h-1.5 rounded-full" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{project.progress || 0}%</span>
                    </div>
                    {project.budget > 0 && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <DollarSign size={11} />Budget: ₹{(project.budget/1e6).toFixed(1)}M
                      </span>
                    )}
                    {project.target_end_date && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={11} />Due: {project.target_end_date}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button className="btn-secondary px-2 py-1 text-xs" onClick={() => setProjectModal(project)}>
                    <Edit3 size={12} />Edit
                  </button>
                  <button className="btn-secondary px-2 py-1 text-xs text-red-500 hover:text-red-600" onClick={() => setConfirm({ type: 'project', id: project.id, name: project.name })}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Tasks */}
              {expanded[project.id] && (
                <div className="border-t border-slate-100">
                  <div className="px-5 py-3 flex items-center justify-between bg-slate-50">
                    <h4 className="text-sm font-medium text-[#172B3A]">Tasks</h4>
                    <button className="btn-secondary px-2 py-1 text-xs" onClick={() => setTaskModal({ projectId: project.id })}>
                      <Plus size={12} />Add Task
                    </button>
                  </div>
                  {!tasks[project.id] ? (
                    <div className="flex justify-center py-4"><Spinner size={18} className="text-slate-300" /></div>
                  ) : tasks[project.id].length === 0 ? (
                    <div className="px-5 py-6 text-center text-sm text-slate-400">No tasks yet. Add the first task.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-5 py-2 text-left text-xs font-medium text-slate-400">Task</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">Priority</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">Status</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">Due</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">Assignee</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks[project.id].map(task => (
                          <tr key={task.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-2.5">
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleTaskStatus(task, project.id)} className="text-slate-300 hover:text-[#14283F]">
                                  {task.status === 'completed' ? <CheckSquare size={15} className="text-green-600" /> : <Square size={15} />}
                                </button>
                                <span className={task.status === 'completed' ? 'line-through text-slate-400' : 'text-[#172B3A]'}>{task.title}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5"><PriorityBadge priority={task.priority} /></td>
                            <td className="px-3 py-2.5"><StatusBadge status={task.status} /></td>
                            <td className="px-3 py-2.5 text-xs text-slate-500">{task.due_date || '—'}</td>
                            <td className="px-3 py-2.5 text-xs text-slate-500">{task.assigned_to || '—'}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex gap-1">
                                <button className="text-slate-400 hover:text-[#14283F]" onClick={() => setTaskModal({ projectId: project.id, task })}>
                                  <Edit3 size={13} />
                                </button>
                                <button className="text-slate-400 hover:text-red-500" onClick={() => setConfirm({ type: 'task', id: task.id, projectId: project.id, name: task.title })}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {projectModal !== null && (
        <ProjectForm
          initial={projectModal?.id ? projectModal : null}
          onSave={handleSaveProject}
          onCancel={() => setProjectModal(null)}
        />
      )}
      {taskModal && (
        <TaskForm
          projectId={taskModal.projectId}
          initial={taskModal.task || null}
          onSave={(data) => handleSaveTask(taskModal.projectId, data)}
          onCancel={() => setTaskModal(null)}
        />
      )}
      <ConfirmDialog
        open={!!confirm}
        title={`Delete ${confirm?.type === 'project' ? 'Project' : 'Task'}?`}
        message={`"${confirm?.name}" will be permanently deleted.`}
        onConfirm={() => {
          if (confirm?.type === 'project') handleDeleteProject(confirm.id)
          else handleDeleteTask(confirm.id, confirm.projectId)
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
