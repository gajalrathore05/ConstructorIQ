import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AIAssistant from './pages/AIAssistant.jsx'
import SiteSafety from './pages/SiteSafety.jsx'
import CrackAnalysis from './pages/CrackAnalysis.jsx'
import ProjectPlanning from './pages/ProjectPlanning.jsx'
import RealEstate from './pages/RealEstate.jsx'
import WeatherAdvisory from './pages/WeatherAdvisory.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="assistant" element={<AIAssistant />} />
        <Route path="safety" element={<SiteSafety />} />
        <Route path="cracks" element={<CrackAnalysis />} />
        <Route path="planning" element={<ProjectPlanning />} />
        <Route path="valuation" element={<RealEstate />} />
        <Route path="weather" element={<WeatherAdvisory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
