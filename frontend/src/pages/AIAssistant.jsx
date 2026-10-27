import { useState, useEffect, useRef } from 'react'
import {
  Bot, Send, Plus, Trash2, Image, X, Loader2,
  MessageSquare, Lightbulb, AlertCircle
} from 'lucide-react'
import { sendChatMessage, getConversations, getMessages, deleteConversation } from '../services/api.js'
import { DemoNotice } from '../components/UI.jsx'
import { Spinner } from '../components/Spinner.jsx'
import toast from 'react-hot-toast'

const SUGGESTED = [
  'Identify potential safety risks in this site image.',
  'Help me prepare a construction project schedule for a 5-floor residential building.',
  'What should I inspect when a wall develops visible cracks?',
  'Estimate a preliminary construction budget for a 3000 sqft house.',
  'Explain the likely causes of diagonal cracks in brick masonry walls.',
  'What are the key safety measures for working at height on a construction site?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 bg-[#14283F] rounded-full flex items-center justify-center shrink-0 mt-1">
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-[#14283F] text-white rounded-tr-sm'
          : 'bg-white border border-slate-100 text-[#172B3A] rounded-tl-sm shadow-sm'
      }`}>
        {msg.image_path && (
          <img src={`/uploads/${msg.image_path.split('/uploads/').pop()}`}
            alt="Attached" className="rounded-lg max-h-40 mb-2 object-contain" />
        )}
        {msg.imagePreview && (
          <img src={msg.imagePreview} alt="Attached" className="rounded-lg max-h-40 mb-2 object-contain" />
        )}
        <div className="whitespace-pre-wrap">{msg.content}</div>
        {msg.is_demo && <DemoNotice message="Demo mode response — configure AI provider for real answers." />}
      </div>
    </div>
  )
}

export default function AIAssistant() {
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    getConversations()
      .then(r => setConversations(r.data))
      .catch(() => {})
      .finally(() => setLoadingConvs(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function loadConversation(id) {
    setActiveConvId(id)
    try {
      const r = await getMessages(id)
      setMessages(r.data)
    } catch { toast.error('Failed to load messages') }
  }

  function startNew() {
    setActiveConvId(null)
    setMessages([])
  }

  async function send() {
    if (!input.trim() && !image) return
    const fd = new FormData()
    fd.append('message', input.trim() || 'Please analyze this image.')
    if (activeConvId) fd.append('conversation_id', activeConvId)
    if (image) fd.append('image', image)

    const optimistic = [
      ...messages,
      { id: Date.now(), role: 'user', content: input.trim() || '(image)', imagePreview }
    ]
    setMessages(optimistic)
    setInput('')
    setImage(null)
    setImagePreview(null)
    setLoading(true)

    try {
      const r = await sendChatMessage(fd)
      const { conversation_id, response, is_demo } = r.data
      setActiveConvId(conversation_id)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: response, is_demo }])
      // Refresh sidebar
      const convs = await getConversations()
      setConversations(convs.data)
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Failed to get response. Please check the backend server is running.', is_demo: true }])
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteConv(id, e) {
    e.stopPropagation()
    try {
      await deleteConversation(id)
      setConversations(prev => prev.filter(c => c.id !== id))
      if (activeConvId === id) startNew()
      toast.success('Conversation deleted')
    } catch { }
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { toast.error('Image must be under 20MB'); return }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col gap-2">
        <button className="btn-primary w-full" onClick={startNew}>
          <Plus size={15} /> New Chat
        </button>
        <div className="card flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConvs ? (
            <div className="flex justify-center py-4"><Spinner size={18} className="text-slate-300" /></div>
          ) : conversations.length ? (
            conversations.map(c => (
              <div
                key={c.id}
                onClick={() => loadConversation(c.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm group transition-colors ${
                  activeConvId === c.id ? 'bg-[#14283F] text-white' : 'hover:bg-slate-50 text-[#172B3A]'
                }`}
              >
                <MessageSquare size={13} className="shrink-0" />
                <span className="flex-1 truncate text-xs">{c.title || 'Untitled'}</span>
                <button
                  onClick={e => handleDeleteConv(c.id, e)}
                  className={`opacity-0 group-hover:opacity-100 ${activeConvId === c.id ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-red-500'}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No conversations yet</p>
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 card flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-[#14283F] rounded-2xl mx-auto flex items-center justify-center mb-3">
                <Bot size={28} className="text-white" />
              </div>
              <h3 className="font-semibold text-[#172B3A] mb-1">ConstructIQ AI Assistant</h3>
              <p className="text-sm text-slate-400 mb-6">Ask anything about construction, safety, structures, or planning.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                {SUGGESTED.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="flex items-start gap-2 p-3 text-left text-xs bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 text-slate-600 transition-colors"
                  >
                    <Lightbulb size={12} className="text-[#F59E0B] mt-0.5 shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map(m => <Message key={m.id} msg={m} />)}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 bg-[#14283F] rounded-full flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#14283F]" />
                <span className="text-sm text-slate-400">Analyzing…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Image preview strip */}
        {imagePreview && (
          <div className="px-4 pb-0 pt-2 border-t border-slate-100 flex items-center gap-3">
            <img src={imagePreview} alt="preview" className="h-12 w-12 rounded object-cover border border-slate-200" />
            <span className="text-xs text-slate-500 flex-1">{image?.name}</span>
            <button onClick={() => { setImage(null); setImagePreview(null) }} className="text-slate-400 hover:text-red-500">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-100 flex gap-2 items-end">
          <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleImage} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#14283F] hover:border-[#14283F] transition-colors shrink-0"
            title="Attach image"
          >
            <Image size={16} />
          </button>
          <textarea
            className="input flex-1 resize-none min-h-[40px] max-h-32 py-2"
            rows={1}
            placeholder="Ask a construction question…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          />
          <button
            className="btn-primary w-9 h-9 p-0 flex items-center justify-center shrink-0"
            onClick={send}
            disabled={loading || (!input.trim() && !image)}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}
