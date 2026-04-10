'use client'
import { useStore } from '@/lib/store'
import StatCard from '@/components/ui/stat-card'

export default function DashboardPage() {
  const { clientes, produtos, transacoes, usuarios, agendamentos } = useStore()

  const now = new Date()
  const mesAtual = now.getMonth()
  const anoAtual = now.getFullYear()

  const txMes = transacoes.filter(t => {
    const d = new Date(t.data + 'T12:00')
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual
  })

  const entradas = txMes.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0)
  const saidas = txMes.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0)
  const saldo = entradas - saidas
  const todayStr = now.toISOString().split('T')[0]
  const agHoje = agendamentos.filter(a => a.data === todayStr && a.status !== 'Cancelado')
  const cortesRealizadosHoje = agHoje.filter(a => a.status === 'Confirmado')
  const faturamentoCortesHoje = cortesRealizadosHoje.reduce((sum, a) => sum + a.preco, 0)
  const fmtM = (v: number) => 'R$ ' + v.toFixed(2).replace('.', ',')
  const fmtShort = (v: number) => {
    if (Math.abs(v) >= 1000) return 'R$' + (v / 1000).toFixed(1).replace('.', ',') + 'k'
    return 'R$' + v.toFixed(0)
  }

  // Last 7 days chart data
  const days: { label: string; entradas: number; saidas: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().split('T')[0]
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)
    const dayTx = transacoes.filter(t => t.data === ds)
    days.push({
      label: dayName,
      entradas: dayTx.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0),
      saidas: dayTx.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0),
    })
  }
  const maxChart = Math.max(...days.flatMap(d => [d.entradas, d.saidas]), 1)

  // Recent clients
  const recentClientes = [...clientes].slice(-3).reverse()
  // Recent transactions
  const recentTx = [...transacoes].slice(-4).reverse()

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-tx-1 flex items-center gap-3">
          <span className="w-8 h-[3px] rounded bg-gradient-to-r from-cyber-cyan to-cyber-pink" />
          Dashboard
        </h1>
        <p className="font-[family-name:var(--font-jetbrains)] text-[11px] text-tx-3 tracking-wider mt-1">
          {"// visão geral em tempo real"}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Clientes" value={clientes.length} desc="cadastrados no sistema" icon="👥" color="cyan" className="stagger-1 animate-fade-up" />
        <StatCard label="Saldo do Mês" value={fmtShort(saldo)} desc="entradas — saídas" icon="💰" color={saldo >= 0 ? 'green' : 'pink'} className="stagger-2 animate-fade-up" />
        <StatCard label="Produtos" value={produtos.length} desc="no catálogo" icon="🧴" color="amber" className="stagger-3 animate-fade-up" />
        <StatCard label="Usuários Ativos" value={usuarios.filter(u => u.status === 'Ativo').length} desc="com acesso ao sistema" icon="👤" color="green" className="stagger-4 animate-fade-up" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mini Chart */}
        <div className="glass rounded-[14px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-cyber-pink animate-glow-pulse" />
            <span className="font-[family-name:Orbitron] text-[11px] tracking-[2px] uppercase text-tx-2 font-bold">
              Fluxo — Últimos 7 dias
            </span>
          </div>
          <div className="flex items-end gap-2 h-[90px]">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="flex-1 w-full flex items-end gap-[3px]">
                  <div
                    className="flex-1 bg-cyber-green/40 rounded-t transition-all duration-500 min-h-[4px]"
                    style={{ height: `${(d.entradas / maxChart) * 100}%` }}
                  />
                  <div
                    className="flex-1 bg-cyber-pink/40 rounded-t transition-all duration-500 min-h-[4px]"
                    style={{ height: `${(d.saidas / maxChart) * 100}%` }}
                  />
                </div>
                <span className="font-[family-name:var(--font-jetbrains)] text-[9px] text-tx-3 capitalize">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-cyber-green/60" />
              <span className="text-[10px] text-tx-3">Entradas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-cyber-pink/60" />
              <span className="text-[10px] text-tx-3">Saídas</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="glass rounded-[14px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-cyber-amber animate-glow-pulse" />
            <span className="font-[family-name:Orbitron] text-[11px] tracking-[2px] uppercase text-tx-2 font-bold">
              Resumo Financeiro
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-[10px] p-4 text-center">
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] text-tx-3 uppercase mb-2">Entradas Mês</div>
              <div className="font-[family-name:var(--font-jetbrains)] text-lg font-bold text-cyber-green">{fmtM(entradas)}</div>
            </div>
            <div className="glass rounded-[10px] p-4 text-center">
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] text-tx-3 uppercase mb-2">Saídas Mês</div>
              <div className="font-[family-name:var(--font-jetbrains)] text-lg font-bold text-cyber-pink">{fmtM(saidas)}</div>
            </div>
            <div className="glass rounded-[10px] p-4 text-center">
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] text-tx-3 uppercase mb-2">Saldo Mês</div>
              <div className={`font-[family-name:var(--font-jetbrains)] text-lg font-bold ${saldo >= 0 ? 'text-cyber-green' : 'text-cyber-pink'}`}>{fmtM(saldo)}</div>
            </div>
            <div className="glass rounded-[10px] p-4 text-center">
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] text-tx-3 uppercase mb-2">Agendamentos Hoje</div>
              <div className="font-[family-name:var(--font-jetbrains)] text-lg font-bold text-cyber-cyan">{agHoje.length}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="glass rounded-[10px] p-4 text-center border border-cyber-green/20 bg-cyber-green/5">
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] text-cyber-green/80 uppercase mb-2">Faturamento (Cortes) Hoje</div>
              <div className="font-[family-name:var(--font-jetbrains)] text-xl font-bold text-cyber-green flex items-center justify-center gap-2">
                 {fmtM(faturamentoCortesHoje)}
              </div>
            </div>
            <div className="glass rounded-[10px] p-4 text-center border border-cyber-cyan/20 bg-cyber-cyan/5">
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] text-cyber-cyan/80 uppercase mb-2">Cortes Concluídos Hoje</div>
              <div className="font-[family-name:var(--font-jetbrains)] text-xl font-bold text-cyber-cyan">{cortesRealizadosHoje.length}</div>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-tx-3">
              {transacoes.length} lançamentos registrados · {txMes.length} neste mês
            </span>
          </div>
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="glass rounded-[14px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyber-green" />
              <span className="font-[family-name:Orbitron] text-[11px] tracking-[2px] uppercase text-tx-2 font-bold">
                Últimos Clientes
              </span>
            </div>
          </div>
          <div className="divide-y divide-border-default">
            {recentClientes.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 flex items-center justify-center text-[11px] font-bold text-cyber-cyan border border-cyber-cyan/20">
                  {c.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-tx-1 truncate">{c.nome}</div>
                  <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-tx-3">
                    {c.telefone} · {c.tipo}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  c.tipo === 'VIP' ? 'bg-cyber-amber/12 text-cyber-amber border border-cyber-amber/20' :
                  c.tipo === 'Novo' ? 'bg-cyber-green/12 text-cyber-green border border-cyber-green/20' :
                  'bg-cyber-cyan/12 text-cyber-cyan border border-cyber-cyan/20'
                }`}>
                  {c.tipo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass rounded-[14px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyber-pink" />
              <span className="font-[family-name:Orbitron] text-[11px] tracking-[2px] uppercase text-tx-2 font-bold">
                Últimas Transações
              </span>
            </div>
          </div>
          <div className="divide-y divide-border-default">
            {recentTx.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${t.tipo === 'entrada' ? 'bg-cyber-green shadow-[0_0_8px_var(--color-cyber-green)]' : 'bg-cyber-pink shadow-[0_0_8px_var(--color-cyber-pink)]'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-tx-1 truncate">{t.descricao}</div>
                  <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-tx-3">
                    {new Date(t.data + 'T12:00').toLocaleDateString('pt-BR')} · {t.categoria}
                  </div>
                </div>
                <span className={`font-[family-name:var(--font-jetbrains)] text-sm font-bold ${t.tipo === 'entrada' ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                  {t.tipo === 'entrada' ? '+' : '-'}{fmtM(t.valor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
