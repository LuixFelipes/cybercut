'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import Modal from '@/components/ui/modal'
import StatCard from '@/components/ui/stat-card'
import type { Transacao } from '@/lib/types'

const fmtM = (v: number) => 'R$ ' + v.toFixed(2).replace('.', ',')

export default function FinanceiroPage() {
  const store = useStore()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transacao | null>(null)
  const [form, setForm] = useState({ descricao: '', valor: '', data: '', categoria: '', tipo: 'entrada', pagamento: 'Pix', observacoes: '' })

  const now = new Date()
  const mesAtual = now.getMonth()
  const anoAtual = now.getFullYear()
  const txMes = store.transacoes.filter(t => { const d = new Date(t.data + 'T12:00'); return d.getMonth() === mesAtual && d.getFullYear() === anoAtual })
  const entradas = txMes.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0)
  const saidas = txMes.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0)

  const filtered = store.transacoes.filter(t => {
    const ms = !search || t.descricao.toLowerCase().includes(search.toLowerCase())
    const mt = !filterTipo || t.tipo === filterTipo
    return ms && mt
  }).sort((a, b) => b.data.localeCompare(a.data))

  function openNew(tipo: string) {
    setEditing(null)
    setForm({ descricao: '', valor: '', data: new Date().toISOString().split('T')[0], categoria: '', tipo, pagamento: 'Pix', observacoes: '' })
    setModalOpen(true)
  }
  function openEdit(t: Transacao) { setEditing(t); setForm({ descricao: t.descricao, valor: String(t.valor), data: t.data, categoria: t.categoria, tipo: t.tipo, pagamento: t.pagamento, observacoes: t.observacoes }); setModalOpen(true) }
  async function save() {
    if (!form.descricao || !form.valor || !form.data || !form.categoria) { toast('Preencha campos obrigatórios', 'er'); return }
    const data = { descricao: form.descricao, valor: parseFloat(form.valor), data: form.data, categoria: form.categoria, tipo: form.tipo as Transacao['tipo'], pagamento: form.pagamento, observacoes: form.observacoes }
    if (editing) { await store.updateTransacao({ ...editing, ...data }); toast('Transação atualizada!') }
    else { await store.addTransacao(data); toast('Transação adicionada!') }
    setModalOpen(false)
  }
  async function del(id: string) { if (confirm('Excluir?')) { await store.deleteTransacao(id); toast('Transação removida', 'info') } }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-tx-1 flex items-center gap-3"><span className="w-8 h-[3px] rounded bg-gradient-to-r from-cyber-cyan to-cyber-pink" />Controle Financeiro</h1>
          <p className="font-[family-name:var(--font-jetbrains)] text-[11px] text-tx-3 tracking-wider mt-1">{"// entradas e saídas"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openNew('entrada')} className="px-4 py-2.5 rounded-[10px] bg-cyber-green/10 text-cyber-green border border-cyber-green/20 font-bold text-sm hover:bg-cyber-green/20 transition-all">＋ Entrada</button>
          <button onClick={() => openNew('saida')} className="px-4 py-2.5 rounded-[10px] bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/20 font-bold text-sm hover:bg-cyber-pink/20 transition-all">＋ Saída</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Entradas Mês" value={fmtM(entradas)} desc="total de receitas" icon="📈" color="green" />
        <StatCard label="Saídas Mês" value={fmtM(saidas)} desc="total de despesas" icon="📉" color="pink" />
        <StatCard label="Saldo Mês" value={fmtM(entradas - saidas)} desc="entradas - saídas" icon="💰" color={entradas - saidas >= 0 ? 'cyan' : 'pink'} />
        <StatCard label="Lançamentos" value={txMes.length} desc="neste mês" icon="📊" color="amber" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tx-3">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar transação..." className="w-full pl-11 pr-4 py-3 glass rounded-[10px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none" />
        </div>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="px-4 py-3 glass rounded-[10px] text-sm text-tx-1 focus:outline-none cursor-pointer">
          <option value="">Todos os tipos</option>
          <option value="entrada">Entradas</option>
          <option value="saida">Saídas</option>
        </select>
      </div>

      <div className="glass rounded-[14px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-black/20">
                {['Data', 'Descrição', 'Categoria', 'Pagamento', 'Tipo', 'Valor', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[11px] text-tx-2">{new Date(t.data + 'T12:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-tx-1 font-medium">{t.descricao}</td>
                  <td className="px-4 py-3 text-tx-3">{t.categoria}</td>
                  <td className="px-4 py-3 text-tx-3">{t.pagamento}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${t.tipo === 'entrada' ? 'bg-cyber-green/12 text-cyber-green' : 'bg-cyber-pink/12 text-cyber-pink'}`}>
                      {t.tipo === 'entrada' ? '▲ Entrada' : '▼ Saída'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-[family-name:var(--font-jetbrains)] font-bold ${t.tipo === 'entrada' ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                    {t.tipo === 'entrada' ? '+' : '-'}{fmtM(t.valor)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-cyber-cyan bg-cyber-cyan/8 border border-cyber-cyan/15 hover:bg-cyber-cyan/15 transition-all">✎</button>
                      <button onClick={() => del(t.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-cyber-pink/60 hover:text-cyber-pink hover:bg-cyber-pink/10 transition-all text-xs">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Transação' : form.tipo === 'entrada' ? 'Nova Entrada' : 'Nova Saída'} titleColor={form.tipo === 'entrada' ? 'var(--color-cyber-green)' : 'var(--color-cyber-pink)'}
        footer={<>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-tx-3 hover:text-tx-1 transition-colors">Cancelar</button>
          <button onClick={save} className="px-5 py-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 text-sm font-bold hover:bg-cyber-cyan/20 transition-all">💾 Salvar</button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Descrição *</label><input value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Descrição da transação" className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none" /></div>
          <div><label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Valor *</label><input type="number" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} placeholder="0.00" className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none" /></div>
          <div><label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Data *</label><input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none" /></div>
          <div><label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Categoria *</label>
            <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              <option value="">Selecione...</option>
              {['Serviço', 'Produto', 'Aluguel', 'Folha', 'Fornecedor', 'Marketing', 'Outros'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Pagamento</label>
            <select value={form.pagamento} onChange={e => setForm(p => ({ ...p, pagamento: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              {['Pix', 'Dinheiro', 'Cartão', 'Transferência', 'Débito Automático'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
