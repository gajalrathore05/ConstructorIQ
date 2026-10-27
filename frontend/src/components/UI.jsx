import { AlertTriangle, Info } from 'lucide-react'

export function DemoNotice({ message }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 mb-4">
      <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
      <span>{message || 'Demo mode — configure an AI provider for real analysis.'}</span>
    </div>
  )
}

export function DisclaimerBox({ text }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 mt-4">
      <Info size={14} className="shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={40} className="text-slate-300 mb-4" />}
      <h3 className="text-base font-semibold text-[#172B3A] mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  )
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="font-semibold text-[#172B3A] mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}
