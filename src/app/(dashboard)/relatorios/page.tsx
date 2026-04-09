'use client'
import { useStore } from '@/lib/store'
import StatCard from '@/components/ui/stat-card'

const fmtM = (v: number) => 'R$ ' + v.toFixed(2).replace('.', ',')

export default function RelatoriosPage() {
  const { transacoes, produtos } = useStore()

  const entradas = transacoes.filter(t => t.tipo === 'entrada')
  const saidas = transacoes.filter(t => t.tipo === 'saida')
  const totalE = entradas.reduce((s, t) => s + t.valor, 0)
  const totalS = saidas.reduce((s, t) => s + t.valor, 0)
  const ticket = entradas.length > 0 ? totalE / entradas.length : 0
  const maxE = entradas.length > 0 ? Math.max(...entradas.map(t => t.valor)) : 0
  const maxS = saidas.length > 0 ? Math.max(...saidas.map(t => t.valor)) : 0
  const margem = totalE > 0 ? ((totalE - totalS) / totalE * 100) : 0

  // By category
  const catEntradas: Record<string, number> = {}
  entradas.forEach(t => { catEntradas[t.categoria] = (catEntradas[t.categoria] || 0) + t.valor })
  const catSaidas: Record<string, number> = {}
  saidas.forEach(t => { catSaidas[t.categoria] = (catSaidas[t.categoria] || 0) + t.valor })

  const lowStock = produtos.filter(p => p.estoque <= p.estoque_minimo)

  const maxCE = Math.max(...Object.values(catEntradas), 1)
  const maxCS = Math.max(...Object.values(catSaidas), 1)

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-tx-1 flex items-center gap-3"><span className="w-8 h-[3px] rounded bg-gradient-to-r from-cyber-cyan to-cyber-pink" />Relatórios</h1>
        <p className="font-[family-name:var(--font-jetbrains)] text-[11px] text-tx-3 tracking-wider mt-1">{"// análise e indicadores"}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ticket Médio" value={fmtM(ticket)} desc="por entrada registrada" icon="📊" color="cyan" />
        <StatCard label="Maior Entrada" value={fmtM(maxE)} desc="lançamento único" icon="📈" color="green" />
        <StatCard label="Maior Saída" value={fmtM(maxS)} desc="lançamento único" icon="📉" color="pink" />
        <StatCard label="Margem de Lucro" value={`${margem.toFixed(1)}%`} desc="sobre entradas totais" icon="💎" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entradas por categoria */}
        <div className="glass rounded-[14px] overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border-default">
            <div className="w-2 h-2 rounded-full bg-cyber-green" />
            <span className="font-[family-name:Orbitron] text-[11px] tracking-[2px] uppercase text-tx-2 font-bold">Entradas por Categoria</span>
          </div>
          <div className="p-6 space-y-3">
            {Object.entries(catEntradas).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-[12px] text-tx-2 w-24 truncate">{cat}</span>
                <div className="flex-1 h-2 bg-surface-4 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyber-green/80 to-cyber-green rounded-full transition-all duration-500 relative" style={{ width: `${(val / maxCE) * 100}%` }}>
                    <div className="absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-r from-transparent to-white/30 rounded-full" />
                  </div>
                </div>
                <span className="font-[family-name:var(--font-jetbrains)] text-[11px] text-cyber-green font-bold min-w-[70px] text-right">{fmtM(val)}</span>
              </div>
            ))}
            {Object.keys(catEntradas).length === 0 && <p className="text-tx-3 text-sm">Nenhuma entrada registrada</p>}
          </div>
        </div>

        {/* Saídas por categoria */}
        <div className="glass rounded-[14px] overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border-default">
            <div className="w-2 h-2 rounded-full bg-cyber-pink" />
            <span className="font-[family-name:Orbitron] text-[11px] tracking-[2px] uppercase text-tx-2 font-bold">Saídas por Categoria</span>
          </div>
          <div className="p-6 space-y-3">
            {Object.entries(catSaidas).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-[12px] text-tx-2 w-24 truncate">{cat}</span>
                <div className="flex-1 h-2 bg-surface-4 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyber-pink/80 to-cyber-pink rounded-full transition-all duration-500 relative" style={{ width: `${(val / maxCS) * 100}%` }}>
                    <div className="absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-r from-transparent to-white/30 rounded-full" />
                  </div>
                </div>
                <span className="font-[family-name:var(--font-jetbrains)] text-[11px] text-cyber-pink font-bold min-w-[70px] text-right">{fmtM(val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock */}
      <div className="glass rounded-[14px] overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border-default">
          <div className="w-2 h-2 rounded-full bg-cyber-amber" />
          <span className="font-[family-name:Orbitron] text-[11px] tracking-[2px] uppercase text-tx-2 font-bold">Estoque Crítico</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-black/20">
                {['Produto', 'Categoria', 'Estoque Atual', 'Mínimo', 'Situação'].map(h => (
                  <th key={h} className="text-left px-6 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {lowStock.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3 text-tx-1 font-medium">{p.emoji} {p.nome}</td>
                  <td className="px-6 py-3 text-tx-3">{p.categoria}</td>
                  <td className="px-6 py-3 font-[family-name:var(--font-jetbrains)] text-cyber-pink font-bold">{p.estoque} {p.unidade}</td>
                  <td className="px-6 py-3 font-[family-name:var(--font-jetbrains)] text-tx-3">{p.estoque_minimo} {p.unidade}</td>
                  <td className="px-6 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${p.estoque === 0 ? 'bg-cyber-pink/15 text-cyber-pink' : 'bg-cyber-amber/15 text-cyber-amber'}`}>
                      {p.estoque === 0 ? '🔴 Esgotado' : '⚠ Baixo'}
                    </span>
                  </td>
                </tr>
              ))}
              {lowStock.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-tx-3">Nenhum produto com estoque crítico</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
