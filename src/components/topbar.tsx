'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/usuarios': 'Usuários',
  '/clientes': 'Clientes',
  '/produtos': 'Produtos',
  '/financeiro': 'Controle Financeiro',
  '/agenda': 'Agenda',
  '/relatorios': 'Relatórios',
}

export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const pathname = usePathname()
  const [clock, setClock] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    function tick() {
      const n = new Date()
      setClock(n.toLocaleTimeString('pt-BR'))
      setDate(n.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }))
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  const pageName = pageNames[pathname] || 'CyberCut'

  return (
    <header className="h-14 px-4 md:px-8 flex items-center gap-3 glass-strong top-bar-glow sticky top-0 z-30">
      {/* Hamburger (mobile) */}
      <button
        className="md:hidden flex flex-col gap-[5px] w-8 h-8 items-center justify-center"
        onClick={onToggleSidebar}
      >
        <span className="w-5 h-[2px] bg-tx-2 rounded transition-all" />
        <span className="w-5 h-[2px] bg-tx-2 rounded transition-all" />
        <span className="w-5 h-[2px] bg-tx-2 rounded transition-all" />
      </button>

      {/* Breadcrumb */}
      <span className="font-[family-name:Orbitron] text-[11px] tracking-[3px] text-tx-3 hidden sm:inline">
        CYBERCUT
      </span>
      <span className="text-tx-3 text-sm hidden sm:inline">/</span>
      <span className="text-[14px] font-bold text-tx-1">{pageName}</span>

      <div className="flex-1" />

      {/* Date & Clock */}
      <span className="text-tx-3 text-[12px] hidden md:inline">{date}</span>
      <div className="font-[family-name:var(--font-jetbrains)] text-sm font-bold text-cyber-cyan border border-cyber-cyan/20 rounded-full px-4 py-1.5 bg-cyber-cyan/5">
        {clock}
      </div>
    </header>
  )
}
