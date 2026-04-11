'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Particles animation
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 40 + 20,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  )

  useEffect(() => {
    // Check if we have a session (the callback should have established it)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Sessão expirada ou link inválido. Solicite uma nova redefinição.')
      }
    })
  }, [supabase])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Senha atualizada com sucesso! Redirecionando...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(5,217,232,0.06)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(255,42,109,0.05)_0%,transparent_60%)]" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full animate-float"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.id % 3 === 0 ? 'var(--color-cyber-cyan)' : p.id % 3 === 1 ? 'var(--color-cyber-pink)' : 'var(--color-cyber-purple)',
              opacity: p.opacity,
              animationDuration: `${p.speed}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:Orbitron] text-[32px] font-black tracking-[4px] text-tx-1 leading-tight">
            NOVA SENHA
          </h1>
          <p className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] text-tx-3 mt-2 uppercase">
            {"// Redefinição de acesso seguro"}
          </p>
        </div>

        <div className="glass-strong rounded-[20px] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />

          {error && (
            <div className="mb-4 px-4 py-3 rounded-[10px] bg-cyber-pink/10 border border-cyber-pink/20 text-cyber-pink text-[12px] font-medium animate-fade-up">
              ⚠ {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-[10px] bg-cyber-green/10 border border-cyber-green/20 text-cyber-green text-[12px] font-medium animate-fade-up">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">
                Nova Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3.5 glass rounded-[10px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none focus:border-cyber-cyan/30 transition-all"
              />
            </div>

            <div>
              <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">
                Confirme a Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3.5 glass rounded-[10px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none focus:border-cyber-cyan/30 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full py-3.5 rounded-[10px] bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 text-sm font-bold tracking-[1px] uppercase transition-all duration-300 hover:bg-cyber-cyan/20 disabled:opacity-50"
            >
              {loading ? 'Atualizando...' : '💾 Definir Nova Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
