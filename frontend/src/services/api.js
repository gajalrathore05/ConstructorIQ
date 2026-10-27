import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
})

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.detail || err.message || 'Request failed'
    if (err.response?.status !== 404) toast.error(msg)
    return Promise.reject(err)
  }
)

// Projects
export const getProjects = () => api.get('/projects/')
export const createProject = (data) => api.post('/projects/', data)
export const getProject = (id) => api.get(`/projects/${id}`)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}`)

// Tasks
export const getProjectTasks = (projectId) => api.get(`/projects/${projectId}/tasks`)
export const createTask = (projectId, data) => api.post(`/projects/${projectId}/tasks`, data)
export const updateTask = (taskId, data) => api.put(`/tasks/${taskId}`, data)
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`)

// AI Chat
export const sendChatMessage = (formData) => api.post('/ai/chat', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const getConversations = () => api.get('/ai/conversations')
export const getMessages = (convId) => api.get(`/ai/conversations/${convId}/messages`)
export const deleteConversation = (convId) => api.delete(`/ai/conversations/${convId}`)

// Safety
export const analyzeSafety = (formData) => api.post('/safety/analyze', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// Crack Analysis
export const analyzeCrack = (formData) => api.post('/cracks/analyze', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// Valuation
export const estimateValuation = (data) => api.post('/valuation/estimate', data)

// Planning
export const generatePlan = (data) => api.post('/planning/generate', data)

// Dashboard
export const getDashboard = () => api.get('/dashboard')

// Analyses / History
export const getAnalyses = (params) => api.get('/analyses', { params })
export const getAnalysis = (id) => api.get(`/analyses/${id}`)
export const deleteAnalysis = (id) => api.delete(`/analyses/${id}`)
export const downloadReport = (id) => api.get(`/analyses/${id}/report`, { responseType: 'blob' })

// Weather
export const getWeather = (location) => api.get('/weather', { params: { location } })

// Diary
export const getDiaryEntries = (projectId) => api.get('/diary', { params: projectId ? { project_id: projectId } : {} })
export const createDiaryEntry = (data) => api.post('/diary', data)
export const updateDiaryEntry = (id, data) => api.put(`/diary/${id}`, data)
export const deleteDiaryEntry = (id) => api.delete(`/diary/${id}`)

// Health
export const getHealth = () => api.get('/health')

export default api
