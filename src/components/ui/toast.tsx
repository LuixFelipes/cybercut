'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'ok' | 'er' | 'info'
}

const ToastContext = createContext<{
  toast: (msg: string, type?: 'ok' | 'er' | 'info') => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: 'ok' | 'er' | 'info' = 'ok') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`
              px-5 py-3 rounded-[10px] text-sm font-semibold
              shadow-lg animate-slide-in-right glass
              ${t.type === 'ok' ? 'border-l-3 border-cyber-green text-cyber-green' : ''}
              ${t.type === 'er' ? 'border-l-3 border-cyber-pink text-cyber-pink' : ''}
              ${t.type === 'info' ? 'border-l-3 border-cyber-cyan text-cyber-cyan' : ''}
            `}
          >
            {t.type === 'ok' && '✓ '}{t.type === 'er' && '✕ '}{t.type === 'info' && 'ℹ '}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
