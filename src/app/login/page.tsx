'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
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

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/')
    })
  }, [supabase, router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : error.message
      )
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Conta criada! Faça login para continuar.')
      setMode('login')
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(5,217,232,0.06)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(255,42,109,0.05)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(168,85,247,0.03)_0%,transparent_50%)]" />

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
              filter: `blur(${p.size > 2 ? 1 : 0}px)`,
            }}
          />
        ))}
      </div>

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(5,217,232,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(5,217,232,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent animate-scan" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-cyber-green animate-glow-pulse" />
            <span className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[3px] uppercase text-tx-3">
              Sistema Online
            </span>
          </div>
          <h1
            className="font-[family-name:Orbitron] text-[38px] font-black tracking-[6px] text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-white to-cyber-pink animate-gradient-x leading-tight"
          >
            CYBERCUT
          </h1>
          <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[3px] text-tx-3 mt-2">
            {"// BARBEARIA PREMIUM"}
          </div>
        </div>

        {/* Glass card */}
        <div className="glass-strong rounded-[20px] p-8 relative overflow-hidden">
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />

          {/* Mode tabs */}
          <div className="flex mb-7 bg-black/30 rounded-[10px] p-1 gap-1">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 py-2.5 rounded-[8px] text-[12px] font-bold tracking-[1px] uppercase transition-all duration-300 ${
                mode === 'login'
                ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 shadow-[0_0_12px_rgba(5,217,232,0.1)]'
                : 'text-tx-3 hover:text-tx-2'
              }`}
            >
              ⬡ Entrar
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
              className={`flex-1 py-2.5 rounded-[8px] text-[12px] font-bold tracking-[1px] uppercase transition-all duration-300 ${
                mode === 'register'
                ? 'bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20 shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                : 'text-tx-3 hover:text-tx-2'
              }`}
            >
              ＋ Registrar
            </button>
          </div>

          {/* Error / Success alerts */}
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

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <div className="animate-fade-up">
                <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full px-4 py-3.5 glass rounded-[10px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none focus:border-cyber-cyan/30 focus:shadow-[0_0_20px_rgba(5,217,232,0.05)] transition-all"
                />
              </div>
            )}

            <div>
              <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@cybercut.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 glass rounded-[10px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none focus:border-cyber-cyan/30 focus:shadow-[0_0_20px_rgba(5,217,232,0.05)] transition-all"
              />
            </div>

            <div>
              <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3.5 glass rounded-[10px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none focus:border-cyber-cyan/30 focus:shadow-[0_0_20px_rgba(5,217,232,0.05)] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-[10px] text-sm font-bold tracking-[1px] uppercase transition-all duration-300 relative overflow-hidden group ${
                mode === 'login'
                ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 hover:bg-cyber-cyan/20 hover:shadow-[0_0_30px_rgba(5,217,232,0.15)]'
                : 'bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20 hover:bg-cyber-purple/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </>
                ) : mode === 'login' ? (
                  <>🔐 Acessar Sistema</>
                ) : (
                  <>🚀 Criar Conta</>
                )}
              </span>
              {/* Hover shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </form>

          {/* Footer text */}
          <div className="mt-6 text-center">
            <p className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">
              {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
                className={`${mode === 'login' ? 'text-cyber-cyan' : 'text-cyber-purple'} hover:underline font-bold`}
              >
                {mode === 'login' ? 'Registre-se' : 'Fazer Login'}
              </button>
            </p>
          </div>
        </div>

        {/* Version badge */}
        <div className="text-center mt-6">
          <span className="font-[family-name:var(--font-jetbrains)] text-[8px] tracking-[3px] uppercase text-tx-3 bg-surface-3/50 px-3 py-1.5 rounded-full border border-border-default">
            v2.0 — Next.js · Supabase · Edge
          </span>
        </div>
      </div>
    </div>
  )
}
