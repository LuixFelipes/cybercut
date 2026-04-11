'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import Modal from '@/components/ui/modal'
import StatCard from '@/components/ui/stat-card'
import type { Agendamento } from '@/lib/types'


function getMonday(d: Date) {
  const dt = new Date(d)
  const day = dt.getDay()
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1)
  dt.setDate(diff)
  dt.setHours(0, 0, 0, 0)
  return dt
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

const dayNames = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8 to 20

export default function AgendaPage() {
  const store = useStore()
  const toast = useToast()
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Agendamento | null>(null)
  const [form, setForm] = useState({
    cliente_id: '', barbeiro_id: '', servico_id: '', data: '', hora: '', status: 'Confirmado', observacoes: ''
  })
  const [pagamento, setPagamento] = useState('Pix')

  const todayStr = new Date().toISOString().split('T')[0]
  const nowH = new Date().getHours()
  const nowM = new Date().getMinutes()

  const weekDates = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i).toISOString().split('T')[0]),
    [weekStart]
  )

  const endWeek = addDays(weekStart, 6)
  const periodText = weekStart.getMonth() === endWeek.getMonth()
    ? `${weekStart.getDate()} — ${endWeek.getDate()} de ${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear()}`
    : `${weekStart.getDate()} ${monthNames[weekStart.getMonth()].slice(0, 3)} — ${endWeek.getDate()} ${monthNames[endWeek.getMonth()].slice(0, 3)} ${weekStart.getFullYear()}`

  // Stats
  const todayEvts = store.agendamentos.filter(a => a.data === todayStr && a.status !== 'Cancelado')
  const weekEvts = store.agendamentos.filter(a => weekDates.includes(a.data) && a.status !== 'Cancelado')
  const confEvts = weekEvts.filter(a => a.status === 'Confirmado')
  const weekRevenue = weekEvts.reduce((s, a) => s + a.preco, 0)
  const fmtShort = (v: number) => Math.abs(v) >= 1000 ? 'R$' + (v / 1000).toFixed(1).replace('.', ',') + 'k' : 'R$' + v.toFixed(0)

  const barbers = store.usuarios.filter(u => u.perfil === 'Barbeiro' && u.status === 'Ativo')

  function openNew(date?: string, time?: string) {
    setEditing(null)
    setForm({
      cliente_id: '', barbeiro_id: '', servico_id: '',
      data: date || todayStr, hora: time || '',
      status: 'Confirmado', observacoes: ''
    })
    setPagamento('Pix')
    setModalOpen(true)
  }

  function openEdit(a: Agendamento) {
    setEditing(a)
    setForm({
      cliente_id: a.cliente_id, barbeiro_id: a.barbeiro_id, servico_id: a.servico_id,
      data: a.data, hora: a.hora, status: a.status, observacoes: a.observacoes
    })
    setModalOpen(true)
  }

  async function save() {
    if (!form.cliente_id || !form.servico_id || !form.data || !form.hora) {
      toast('Preencha todos os campos obrigatórios', 'er')
      return
    }
    const sv = store.servicos.find(s => s.id === form.servico_id)!
    const cl = store.clientes.find(c => c.id === form.cliente_id)!

    const obj = {
      cliente_id: cl.id, cliente_nome: cl.nome,
      barbeiro_id: form.barbeiro_id || '', barbeiro_nome: '',
      servico_id: sv.id, servico_nome: sv.nome, servico_cor: sv.cor,
      duracao_min: sv.duracao_min, preco: sv.preco,
      data: form.data, hora: form.hora,
      status: form.status as Agendamento['status'],
      observacoes: form.observacoes,
    }

    if (editing) {
      await store.updateAgendamento({ ...obj, id: editing.id, created_at: editing.created_at })
      if (form.status === 'Realizado' && editing.status !== 'Realizado') {
        const b = barbers.find(x => x.id === obj.barbeiro_id)
        await store.addTransacao({ descricao: `Serviço: ${sv.nome} (${cl.nome})`, valor: sv.preco, data: form.data, categoria: 'Serviço', tipo: 'entrada', pagamento: pagamento, observacoes: `Barbeiro: ${b?.nome || '-'}` })
        toast('Concluído e lançamento no Caixa enviado!')
      } else {
        toast('Agendamento atualizado!')
      }
    } else {
      await store.addAgendamento(obj)
      toast('Agendamento criado!')
    }
    setModalOpen(false)
  }

  const evColorClass = (cor: string, st: string) => {
    if (st === 'Realizado') return 'bg-tx-3/10 text-tx-3 border border-tx-3/20 grayscale hover:grayscale-0'
    return `ev-${cor === 'cyan' ? 'corte' : cor === 'green' ? 'barba' : cor === 'purple' ? 'combo' : cor === 'amber' ? 'tratamento' : 'outro'}`
  }

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-tx-1 flex items-center gap-3">
            <span className="w-8 h-[3px] rounded bg-gradient-to-r from-cyber-cyan to-cyber-pink" />
            Agenda
          </h1>
          <p className="font-[family-name:var(--font-jetbrains)] text-[11px] text-tx-3 tracking-wider mt-1">{"// agendamentos e horários"}</p>
        </div>
        <button onClick={() => openNew()} className="px-5 py-2.5 rounded-[10px] bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 font-bold text-sm hover:bg-cyber-cyan/20 transition-all">
          ＋ Novo Agendamento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Hoje" value={todayEvts.length} desc="agendamentos hoje" icon="📅" color="cyan" />
        <StatCard label="Esta Semana" value={weekEvts.length} desc="agendamentos na semana" icon="📆" color="green" />
        <StatCard label="Confirmados" value={confEvts.length} desc="status confirmado" icon="✓" color="amber" />
        <StatCard label="Receita Prevista" value={fmtShort(weekRevenue)} desc="da semana atual" icon="💰" color="pink" />
      </div>

      {/* Calendar Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setWeekStart(prev => addDays(prev, -7))} className="w-9 h-9 rounded-[8px] glass flex items-center justify-center text-tx-2 hover:text-cyber-cyan hover:border-cyber-cyan/30 transition-all">◀</button>
          <button onClick={() => setWeekStart(getMonday(new Date()))} className="px-4 py-2 rounded-[8px] glass text-tx-2 text-[11px] font-bold tracking-[1px] uppercase hover:text-cyber-cyan hover:border-cyber-cyan/30 transition-all">Hoje</button>
          <button onClick={() => setWeekStart(prev => addDays(prev, 7))} className="w-9 h-9 rounded-[8px] glass flex items-center justify-center text-tx-2 hover:text-cyber-cyan hover:border-cyber-cyan/30 transition-all">▶</button>
        </div>
        <span className="font-[family-name:Orbitron] text-[15px] font-bold tracking-[2px] text-tx-1 flex-1">
          {periodText}
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-[14px] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border-default bg-black/20 sticky top-14 z-10">
          <div className="border-r border-border-default" />
          {weekDates.map((ds, i) => {
            const date = addDays(weekStart, i)
            const isToday = ds === todayStr
            return (
              <div key={ds} className={`text-center py-3 px-1 border-r border-border-default last:border-r-0 transition-colors ${isToday ? 'bg-cyber-cyan/5' : ''}`}>
                <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1">{dayNames[i]}</div>
                <div className={`w-8 h-8 rounded-full inline-flex items-center justify-center font-[family-name:Orbitron] text-[13px] font-bold transition-all ${isToday ? 'bg-cyber-cyan text-surface-bg shadow-[0_0_14px_rgba(5,217,232,0.4)]' : 'text-tx-1'}`}>
                  {date.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Body */}
        <div className="h-[600px] md:h-[calc(100vh-250px)] overflow-y-auto">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
            {/* Time column */}
            <div className="border-r border-border-default">
              {hours.map(h => (
                <div key={h} className="h-14 flex items-start justify-end px-2 border-b border-border-default">
                  <span className="font-[family-name:var(--font-jetbrains)] text-[9px] text-tx-3 tracking-[1px] -translate-y-1.5">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDates.map((ds) => {
              const isToday = ds === todayStr
              const dayEvts = store.agendamentos.filter(a => a.data === ds && a.status !== 'Cancelado')

              return (
                <div key={ds} className={`border-r border-border-default last:border-r-0 relative ${isToday ? 'bg-cyber-cyan/[0.015]' : ''}`}>
                  {/* Time cells */}
                  {hours.map(h => (
                    <div
                      key={h}
                      className="h-14 border-b border-border-default hover:bg-cyber-cyan/[0.03] transition-colors cursor-pointer"
                      onClick={() => openNew(ds, `${String(h).padStart(2, '0')}:00`)}
                    />
                  ))}

                  {/* Events */}
                  {dayEvts.map(ev => {
                    const [eh, em] = ev.hora.split(':').map(Number)
                    const topPx = (eh - 8) * 56 + (em / 60) * 56
                    const hPx = (ev.duracao_min / 60) * 56

                    return (
                      <div
                        key={ev.id}
                        className={`absolute left-[3px] right-[3px] rounded-md px-2 py-1 cursor-pointer z-[3] transition-all hover:scale-[1.02] hover:z-[6] hover:shadow-lg overflow-hidden ${evColorClass(ev.servico_cor, ev.status)}`}
                        style={{ top: `${topPx}px`, height: `${Math.max(hPx, 24)}px` }}
                        onClick={(e) => { e.stopPropagation(); openEdit(ev) }}
                        title={`${ev.servico_nome} — ${ev.cliente_nome}\n${ev.hora} (${ev.duracao_min}min)\nBarbeiro: ${ev.barbeiro_nome}`}
                      >
                        <div className="text-[11px] font-bold truncate">
                          {ev.status === 'Realizado' && <span className="mr-1">✅</span>}{ev.servico_nome}
                        </div>
                        {hPx >= 36 && (
                          <div className="font-[family-name:var(--font-jetbrains)] text-[9px] opacity-80 truncate">
                            {ev.cliente_nome} · {ev.hora}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Now line */}
                  {isToday && nowH >= 8 && nowH <= 20 && (
                    <div className="cal-now-line" style={{ top: `${(nowH - 8) * 56 + (nowM / 60) * 56}px` }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 flex-wrap">
        {[
          { label: 'Corte', color: 'bg-cyber-cyan' },
          { label: 'Barba', color: 'bg-cyber-green' },
          { label: 'Combo', color: 'bg-cyber-purple' },
          { label: 'Tratamento', color: 'bg-cyber-amber' },
          { label: 'Outro', color: 'bg-cyber-pink' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
            <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-tx-3 tracking-wide">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Agendamento' : 'Novo Agendamento'}
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <div>
              {editing && editing.status !== 'Realizado' && editing.status !== 'Cancelado' && (
                <button 
                  onClick={async () => {
                    if (confirm('Deseja realmente cancelar este agendamento?')) {
                      await store.updateAgendamento({ ...editing, status: 'Cancelado' })
                      toast('Agendamento Cancelado!', 'info')
                      setModalOpen(false)
                    }
                  }} 
                  className="px-3 py-2 rounded-[8px] text-[12px] text-cyber-pink border border-cyber-pink/20 hover:bg-cyber-pink/10 transition-colors uppercase font-bold tracking-wider"
                >
                  🚫 Cancelar Serviço
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-tx-3 hover:text-tx-1 transition-colors">Fechar</button>
              <button onClick={save} className="px-5 py-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 text-sm font-bold hover:bg-cyber-cyan/20 transition-all">
                {editing ? '💾 Salvar Reagendamento' : '💾 Salvar Agendamento'}
              </button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Cliente *</label>
            <select value={form.cliente_id} onChange={e => setForm(prev => ({ ...prev, cliente_id: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              <option value="">Selecione o cliente...</option>
              {store.clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Barbeiro *</label>
            <select value={form.barbeiro_id} onChange={e => setForm(prev => ({ ...prev, barbeiro_id: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              <option value="">Selecione o barbeiro...</option>
              {barbers.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Serviço *</label>
            <select value={form.servico_id} onChange={e => setForm(prev => ({ ...prev, servico_id: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              <option value="">Selecione...</option>
              {store.servicos.map(s => <option key={s.id} value={s.id}>{s.nome} — R${s.preco} ({s.duracao_min}min)</option>)}
            </select>
          </div>
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Data *</label>
            <input type="date" value={form.data} onChange={e => setForm(prev => ({ ...prev, data: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none" />
          </div>
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Horário *</label>
            <select value={form.hora} onChange={e => setForm(prev => ({ ...prev, hora: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              <option value="">Selecione...</option>
              {Array.from({ length: 24 }, (_, i) => {
                const h = Math.floor(i / 2) + 8
                const m = i % 2 === 0 ? '00' : '30'
                return `${String(h).padStart(2, '0')}:${m}`
              }).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Observações</label>
            <textarea value={form.observacoes} onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))} placeholder="Notas sobre o agendamento..." className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none min-h-[56px] resize-y" />
          </div>

          {editing && editing.status !== 'Realizado' && (
            <div className="sm:col-span-2 p-4 mt-2 border border-cyber-green/30 bg-cyber-green/[0.03] rounded-[8px]">
              <label className="flex items-center gap-3 font-bold text-cyber-green text-sm cursor-pointer mb-1">
                <input type="checkbox" checked={form.status === 'Realizado'} onChange={e => setForm(prev => ({ ...prev, status: e.target.checked ? 'Realizado' : editing.status }))} className="w-4 h-4 accent-cyber-green cursor-pointer" />
                ✅ Marcar Atendimento como Realizado
              </label>
              {form.status === 'Realizado' && (
                <div className="mt-3 pl-7 animate-fade-in fade-in-0 duration-300">
                  <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Registrar no Caixa Automático (Pagamento)</label>
                  <select value={pagamento} onChange={e => setPagamento(e.target.value)} className="w-[200px] px-3 py-2 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
                    <option>Pix</option>
                    <option>Cartão de Crédito</option>
                    <option>Cartão de Débito</option>
                    <option>Dinheiro</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
