'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import Modal from '@/components/ui/modal'
import type { Servico } from '@/lib/types'

const corClasses: Record<string, string> = {
  cyan: 'bg-cyber-cyan/12 text-cyber-cyan border-cyber-cyan/20',
  green: 'bg-cyber-green/12 text-cyber-green border-cyber-green/20',
  purple: 'bg-cyber-purple/12 text-cyber-purple border-cyber-purple/20',
  amber: 'bg-cyber-amber/12 text-cyber-amber border-cyber-amber/20',
  pink: 'bg-cyber-pink/12 text-cyber-pink border-cyber-pink/20',
}

const cores = ['cyan', 'green', 'purple', 'amber', 'pink']

export default function ServicosPage() {
  const store = useStore()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)
  const [form, setForm] = useState({ nome: '', duracao_min: 30, preco: 0, cor: 'cyan' })

  function openNew() {
    setEditing(null)
    setForm({ nome: '', duracao_min: 30, preco: 0, cor: 'cyan' })
    setModalOpen(true)
  }

  function openEdit(s: Servico) {
    setEditing(s)
    setForm({ nome: s.nome, duracao_min: s.duracao_min, preco: s.preco, cor: s.cor })
    setModalOpen(true)
  }

  async function save() {
    if (!form.nome || form.preco < 0 || form.duracao_min <= 0) {
      toast('Preencha os campos corretamente', 'er')
      return
    }
    const payload = {
      ...form,
      preco: Number(form.preco),
      duracao_min: Number(form.duracao_min),
      cor: form.cor as Servico['cor']
    }

    if (editing) {
      await store.updateServico({ id: editing.id, ...payload })
      toast('Serviço atualizado!')
    } else {
      await store.addServico(payload)
      toast('Serviço adicionado!')
    }
    setModalOpen(false)
  }

  async function del(id: string) {
    if (confirm('Tem certeza que deseja excluir este serviço? Históricos passados ligados a este serviço poderão ser afetados.')) {
      await store.deleteServico(id)
      toast('Serviço removido', 'info')
    }
  }

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-tx-1 flex items-center gap-3">
            <span className="w-8 h-[3px] rounded bg-gradient-to-r from-cyber-cyan to-cyber-pink" />
            Serviços
          </h1>
          <p className="font-[family-name:var(--font-jetbrains)] text-[11px] text-tx-3 tracking-wider mt-1">
            {"// catálogo, preços e tempo de agendamento"}
          </p>
        </div>
        <button onClick={openNew} className="px-5 py-2.5 rounded-[10px] bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/20 font-bold text-sm hover:bg-cyber-pink/20 transition-all">
          ＋ Novo Serviço
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-[14px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-black/20">
                <th className="text-left px-6 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Nome do Serviço</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Duração</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Preço</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Cor da Agenda</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {store.servicos.map(s => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-tx-1 flex items-center gap-2">
                       <div className={`w-3 h-3 rounded shadow-sm opacity-80 ${corClasses[s.cor]?.split(' ')[0]}`} />
                       {s.nome}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-[family-name:var(--font-jetbrains)] text-[12px] text-tx-2">
                    {s.duracao_min} min
                  </td>
                  <td className="px-4 py-4 font-[family-name:var(--font-jetbrains)] text-[12px] font-bold text-cyber-green">
                    {fmt(s.preco)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded border capitalize ${corClasses[s.cor]}`}>
                      {s.cor}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-cyber-cyan bg-cyber-cyan/8 border border-cyber-cyan/15 hover:bg-cyber-cyan/15 transition-all">
                        ✎ Editar
                      </button>
                      <button onClick={() => del(s.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-cyber-pink/60 hover:text-cyber-pink hover:bg-cyber-pink/10 transition-all font-bold text-lg">
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {store.servicos.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-tx-3">Nenhum serviço cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Serviço' : 'Novo Serviço'}
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
          <div className="sm:col-span-2">
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Nome do Serviço *</label>
            <input
              type="text"
              value={form.nome}
              onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Corte Degradê"
              className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none"
            />
          </div>
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Preço (R$) *</label>
            <input
              type="number"
              step="0.01"
              value={form.preco}
              onChange={e => setForm(prev => ({ ...prev, preco: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none font-[family-name:var(--font-jetbrains)]"
            />
          </div>
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Duração Estimada (minutos) *</label>
            <input
              type="number"
              value={form.duracao_min}
              onChange={e => setForm(prev => ({ ...prev, duracao_min: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none font-[family-name:var(--font-jetbrains)]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Cor na Agenda *</label>
            <div className="flex gap-3">
              {cores.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(prev => ({ ...prev, cor: c }))}
                  className={`w-10 h-10 rounded shadow-md border-2 transition-all ${corClasses[c]} ${form.cor === c ? 'border-tx-1 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                />
              ))}
            </div>
            <p className="text-[10px] text-tx-3 mt-2">Escolha uma cor para identificar este serviço no Calendário da Agenda.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
