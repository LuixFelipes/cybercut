'use client'
import React, { useEffect, useState } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  titleColor?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function Modal({ open, onClose, title, titleColor, children, footer }: ModalProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setShow(true))
    } else {
      requestAnimationFrame(() => setShow(false))
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${show ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}`}
      onClick={onClose}
    >
      <div
        className={`
          w-full max-w-2xl max-h-[90vh] overflow-y-auto
          glass-strong rounded-[14px] shadow-2xl
          transition-all duration-300
          ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Animated top bar */}
        <div className="h-[2px] bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink animate-gradient-x rounded-t-[14px]" />

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border-default">
          <h2
            className="font-[family-name:Orbitron] text-sm font-bold tracking-[3px] uppercase"
            style={{ color: titleColor || 'var(--color-cyber-cyan)' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-tx-3 hover:text-tx-1 hover:bg-white/5 transition-all hover:rotate-90 duration-300"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-7 py-4 border-t border-border-default flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
