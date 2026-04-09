'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

const navItems = [
  { section: 'Visão Geral' },
  { href: '/', icon: '⬡', label: 'Dashboard' },
  { section: 'Cadastros' },
  { href: '/usuarios', icon: '👤', label: 'Usuários' },
  { href: '/clientes', icon: '🪮', label: 'Clientes', countKey: 'clientes' as const },
  { href: '/produtos', icon: '🧴', label: 'Produtos', countKey: 'produtos' as const },
  { section: 'Operacional' },
  { href: '/agenda', icon: '📅', label: 'Agenda', countKey: 'agendamentos' as const, countFilter: 'today' as const },
  { section: 'Financeiro' },
  { href: '/financeiro', icon: '💰', label: 'Caixa' },
  { href: '/relatorios', icon: '📊', label: 'Relatórios' },
]

interface UserInfo {
  nome: string
  email: string
  perfil: string
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const store = useStore()
  const supabase = createClient()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]

  // Fetch logged-in user info
  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        // Try to get profile from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('nome, perfil')
          .eq('id', authUser.id)
          .single()

        setUser({
          nome: profile?.nome || authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          perfil: profile?.perfil || 'Atendente',
        })
      }
    }
    getUser()
  }, [supabase])

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function getCount(item: typeof navItems[number]) {
    if (!('countKey' in item) || !item.countKey) return null
    if (item.countKey === 'agendamentos') {
      return store.agendamentos.filter(a => a.data === todayStr && a.status !== 'Cancelado').length
    }
    return (store[item.countKey] as { id: string }[]).length
  }

  const inits = (n: string) => n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-[280px] z-50
          bg-surface-1/95 backdrop-blur-xl
          flex flex-col sidebar-glow
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-cyber-green animate-glow-pulse" />
            <span className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[3px] uppercase text-tx-3">
              Sistema Online
            </span>
          </div>
          <h1
            className="font-[family-name:Orbitron] text-[28px] font-black tracking-[5px] text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-white to-cyber-pink animate-gradient-x leading-tight"
          >
            CYBERCUT
          </h1>
          <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[3px] text-tx-3 mt-1">
            {"// BARBEARIA PREMIUM"}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navItems.map((item, i) => {
            if ('section' in item && !('href' in item)) {
              return (
                <div
                  key={i}
                  className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[3px] uppercase text-tx-3 px-3 pt-5 pb-2"
                >
                  {item.section}
                </div>
              )
            }

            if (!('href' in item)) return null
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href!)
            const count = getCount(item)

            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => onClose()}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-[10px] mb-1
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-cyber-cyan/8 text-cyber-cyan border-l-2 border-cyber-cyan'
                    : 'text-tx-2 hover:text-tx-1 hover:bg-white/[0.02] border-l-2 border-transparent'
                  }
                `}
              >
                <span className="text-lg leading-none w-6 text-center">{item.icon}</span>
                <span className="text-[13px] font-semibold tracking-wide flex-1">{item.label}</span>
                {count !== null && count > 0 && (
                  <span
                    className={`
                      min-w-[22px] h-[22px] px-1.5 rounded-full text-[10px] font-bold
                      flex items-center justify-center
                      ${item.countKey === 'agendamentos'
                        ? 'bg-cyber-purple/12 text-cyber-purple border border-cyber-purple/20'
                        : 'bg-cyber-cyan/12 text-cyber-cyan border border-cyber-cyan/20'
                      }
                    `}
                  >
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer — user info + logout */}
        <div className="px-4 py-4 border-t border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-cyber-cyan via-cyber-purple to-cyber-pink flex items-center justify-center text-[11px] font-bold text-surface-bg animate-gradient-x flex-shrink-0">
              {user ? inits(user.nome) : '··'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-tx-1 truncate">
                {user?.nome || 'Carregando...'}
              </div>
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">
                {user?.perfil || '···'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-tx-3 hover:text-cyber-pink hover:bg-cyber-pink/10 transition-all flex-shrink-0"
              title="Sair do sistema"
            >
              {loggingOut ? (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
