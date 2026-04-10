'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import Modal from '@/components/ui/modal'
import type { Cliente } from '@/lib/types'

export default function ClientesPage() {
  const store = useStore()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [filterStatus, setFilterStatus] = useState('Ativo')
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', cpf: '', nascimento: '', tipo: 'Regular', status: 'Ativo', endereco: '', observacoes: '' })

  const filtered = store.clientes.filter(c => {
    const matchSearch = !search || [c.nome, c.telefone, c.email].some(f => f.toLowerCase().includes(search.toLowerCase()))
    const matchTipo = !filterTipo || c.tipo === filterTipo
    const matchStatus = filterStatus === 'Todos' ? true : c.status === filterStatus
    return matchSearch && matchTipo && matchStatus
  })

  function openNew() {
    setEditing(null)
    setForm({ nome: '', telefone: '', email: '', cpf: '', nascimento: '', tipo: 'Regular', status: 'Ativo', endereco: '', observacoes: '' })
    setModalOpen(true)
  }

  function openEdit(c: Cliente) {
    setEditing(c)
    setForm({ nome: c.nome, telefone: c.telefone, email: c.email, cpf: c.cpf, nascimento: c.nascimento, tipo: c.tipo, status: c.status || 'Ativo', endereco: c.endereco, observacoes: c.observacoes })
    setModalOpen(true)
  }

  async function save() {
    if (!form.nome || !form.telefone) { toast('Preencha nome e telefone', 'er'); return }
    if (editing) {
      await store.updateCliente({ ...editing, ...form, tipo: form.tipo as Cliente['tipo'], status: form.status as Cliente['status'] })
      toast('Cliente atualizado!')
    } else {
      await store.addCliente({ ...form, tipo: form.tipo as Cliente['tipo'], status: form.status as Cliente['status'] })
      toast('Cliente adicionado!')
    }
    setModalOpen(false)
  }

  async function del(id: string) {
    if (confirm('Excluir este cliente?')) {
      await store.deleteCliente(id)
      toast('Cliente removido', 'info')
    }
  }

  const inits = (n: string) => n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-tx-1 flex items-center gap-3">
            <span className="w-8 h-[3px] rounded bg-gradient-to-r from-cyber-cyan to-cyber-pink" />
            Clientes
          </h1>
          <p className="font-[family-name:var(--font-jetbrains)] text-[11px] text-tx-3 tracking-wider mt-1">{"// base completa de clientes"}</p>
        </div>
        <button onClick={openNew} className="px-5 py-2.5 rounded-[10px] bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 font-bold text-sm hover:bg-cyber-cyan/20 transition-all">
          ＋ Novo Cliente
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tx-3">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou email..."
            className="w-full pl-11 pr-4 py-3 glass rounded-[10px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none focus:border-cyber-cyan/30"
          />
        </div>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="px-4 py-3 glass rounded-[10px] text-sm text-tx-1 focus:outline-none cursor-pointer">
          <option value="">Todos os tipos</option>
          <option>VIP</option>
          <option>Regular</option>
          <option>Novo</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-3 glass rounded-[10px] text-sm text-tx-1 focus:outline-none cursor-pointer">
          <option value="Todos">Todos (Ativos/Inativos)</option>
          <option value="Ativo">Apenas Ativos</option>
          <option value="Inativo">Apenas Inativos</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-[14px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-black/20">
                <th className="text-left px-6 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Cliente</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Telefone</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 hidden md:table-cell">Histórico</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Tipo / Status</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 hidden lg:table-cell">Cadastro</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filtered.map(c => {
                const agnds = store.agendamentos.filter(a => a.cliente_id === c.id && a.status !== 'Cancelado')
                const totalCortes = agnds.length
                const lastCorte = totalCortes > 0 ? new Date(Math.max(...agnds.map(a => new Date(a.data).getTime() + 1000 * 60 * 60 * 12))).toLocaleDateString('pt-BR') : 'Nenhum'
                return (
                <tr key={c.id} className={`hover:bg-white/[0.02] transition-colors group ${c.status === 'Inativo' ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 flex items-center justify-center text-[10px] font-bold text-cyber-cyan border border-cyber-cyan/20 flex-shrink-0">
                        {inits(c.nome)}
                      </div>
                      <div>
                        <div className="font-semibold text-tx-1">{c.nome}</div>
                        {c.observacoes && <div className="text-[10px] text-tx-3 truncate max-w-[200px]">{c.observacoes}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-[family-name:var(--font-jetbrains)] text-[12px] text-tx-2">{c.telefone}</td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="text-[11px] text-tx-2">
                       <span className="font-bold text-cyber-cyan">{totalCortes}</span> ref. {totalCortes === 1 ? 'concluída' : 'concluídas'}
                    </div>
                    {totalCortes > 0 && <div className="text-[10px] text-tx-3">Último: {lastCorte}</div>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2 items-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      c.tipo === 'VIP' ? 'bg-cyber-amber/12 text-cyber-amber border border-cyber-amber/20' :
                      c.tipo === 'Novo' ? 'bg-cyber-green/12 text-cyber-green border border-cyber-green/20' :
                      'bg-cyber-cyan/12 text-cyber-cyan border border-cyber-cyan/20'
                    }`}>
                      {c.tipo === 'VIP' && '⭐ '}{c.tipo}
                    </span>
                    {c.status === 'Inativo' && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        Inativo
                      </span>
                    )}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-[family-name:var(--font-jetbrains)] text-[11px] text-tx-3 hidden lg:table-cell">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-cyber-cyan bg-cyber-cyan/8 border border-cyber-cyan/15 hover:bg-cyber-cyan/15 transition-all">
                        ✎ Editar
                      </button>
                      <button onClick={() => del(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-cyber-pink/60 hover:text-cyber-pink hover:bg-cyber-pink/10 transition-all">
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-tx-3">Nenhum cliente encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Cliente' : 'Novo Cliente'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-tx-3 hover:text-tx-1 transition-colors">Cancelar</button>
            <button onClick={save} className="px-5 py-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 text-sm font-bold hover:bg-cyber-cyan/20 transition-all">
              💾 Salvar
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Nome Completo *', key: 'nome', placeholder: 'João Silva' },
            { label: 'Telefone *', key: 'telefone', placeholder: '(11) 99999-9999' },
            { label: 'Email', key: 'email', placeholder: 'email@email.com', type: 'email' },
            { label: 'CPF', key: 'cpf', placeholder: '000.000.000-00' },
            { label: 'Nascimento', key: 'nascimento', type: 'date' },
            { label: 'Endereço', key: 'endereco', placeholder: 'Rua, Número' },
          ].map(f => (
            <div key={f.key}>
              <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">{f.label}</label>
              <input
                type={f.type || 'text'}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none focus:border-cyber-cyan/30 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Tipo</label>
            <select value={form.tipo} onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              <option>Regular</option>
              <option>VIP</option>
              <option>Novo</option>
            </select>
          </div>
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Status</label>
            <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Notas sobre o cliente..."
              className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none min-h-[70px] resize-y"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
