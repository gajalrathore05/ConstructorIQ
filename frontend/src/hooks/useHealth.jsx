import { useState, useEffect } from 'react'
import { getHealth } from '../services/api.js'

export function useHealth() {
  const [health, setHealth] = useState(null)
  useEffect(() => {
    getHealth().then(r => setHealth(r.data)).catch(() => setHealth({ status: 'error', ai_available: false, demo_mode: true }))
  }, [])
  return { health }
}
