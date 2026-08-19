'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Show me turfs near Vesu',
  'Any slots this Saturday evening?',
  'Which venue has the best rating?',
]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages([...updated, { role: 'assistant', content: err.error || 'Something went wrong.' }])
      } else {
        const { reply } = await res.json()
        setMessages([...updated, { role: 'assistant', content: reply }])
      }
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Network error. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105',
          open ? 'bg-surface-800 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'
        )}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-surface-200 flex flex-col transition-all duration-300 origin-bottom-right',
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
        style={{ height: '520px' }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-200 bg-brand-600 rounded-t-2xl">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-semibold text-white text-sm">CricBooking AI</p>
            <p className="text-xs text-white/70">Find venues, check slots, book instantly</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.length === 0 && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-3">
                <Bot className="w-6 h-6 text-brand-600" />
              </div>
              <p className="text-sm font-medium text-surface-900 mb-1">How can I help?</p>
              <p className="text-xs text-surface-800/50 mb-5">Ask me about venues, slots, or booking</p>
              <div className="flex flex-col gap-2 w-full">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-sm px-3 py-2.5 bg-surface-50 hover:bg-brand-50 border border-surface-200 hover:border-brand-200 rounded-lg text-surface-800/70 hover:text-brand-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-brand-700" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-md'
                    : 'bg-surface-100 text-surface-800 rounded-bl-md'
                )}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 bg-surface-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-surface-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-brand-700" />
              </div>
              <div className="bg-surface-100 rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 text-surface-800/50 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-surface-200">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Ask about venues, slots..."
              disabled={loading}
              className="flex-1 bg-surface-100 border border-surface-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-surface-800/40 disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-brand-600 hover:bg-brand-700 disabled:bg-surface-300 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-surface-800/30 text-center mt-2">Powered by AI · Responses may be inaccurate</p>
        </div>
      </div>
    </>
  )
}
