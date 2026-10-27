import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Bot, ShieldAlert, ScanLine, FolderKanban,
  Building2, CloudSun, FileText, Settings, ChevronLeft, ChevronRight,
  HardHat, Bell, Search, Zap, User, Plus
} from 'lucide-react'
import { useHealth } from '../hooks/useHealth.jsx'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Overview' },
  { to: '/assistant',  icon: Bot,             label: 'AI Assistant' },
  { to: '/safety',     icon: ShieldAlert,     label: 'Site Safety' },
  { to: '/cracks',     icon: ScanLine,        label: 'Crack Analysis' },
  { to: '/planning',   icon: FolderKanban,    label: 'Project Planning' },
  { to: '/valuation',  icon: Building2,       label: 'Real Estate' },
  { to: '/weather',    icon: CloudSun,        label: 'Weather Advisory' },
  { to: '/reports',    icon: FileText,        label: 'Reports & History' },
  { to: '/settings',   icon: Settings,        label: 'Settings' },
]

const pageTitles = {
  '/dashboard': 'Overview',
  '/assistant': 'AI Assistant',
  '/safety': 'Site Safety Monitoring',
  '/cracks': 'Structural Crack Analysis',
  '/planning': 'Project Planning',
  '/valuation': 'Real Estate Valuation',
  '/weather': 'Weather Advisory',
  '/reports': 'Reports & History',
  '/settings': 'Settings',
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { health } = useHealth()

  const pageTitle = pageTitles[location.pathname] || 'ConstructIQ'

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FA]">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-[#14283F] transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        } shrink-0 overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center shrink-0">
            <HardHat size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-white font-bold text-base leading-tight">ConstructIQ</div>
              <div className="text-slate-400 text-[10px] leading-tight">AI Intelligence</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* AI Status */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${health?.ai_available ? 'bg-green-400' : 'bg-amber-400'}`} />
              <span className="text-xs text-slate-300 font-medium">
                {health?.ai_available ? `AI: ${health.ai_provider?.toUpperCase()}` : 'AI: Demo Mode'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {health?.ai_available ? 'Real AI analysis active' : 'Configure API key for live AI'}
            </p>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center py-3 border-t border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top nav */}
        <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-semibold text-[#172B3A]">{pageTitle}</h1>
            <p className="text-xs text-slate-400">ConstructIQ / {pageTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-400 w-48">
              <Search size={14} />
              <span>Search…</span>
            </div>
            {/* AI indicator */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              health?.ai_available
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <Zap size={12} />
              {health?.ai_available ? 'AI Live' : 'Demo'}
            </div>
            {/* Bell */}
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
              <Bell size={16} />
            </button>
            {/* Profile */}
            <div className="w-8 h-8 bg-[#14283F] rounded-full flex items-center justify-center text-white">
              <User size={14} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
