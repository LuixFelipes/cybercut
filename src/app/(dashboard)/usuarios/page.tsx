'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import Modal from '@/components/ui/modal'
import type { Profile } from '@/lib/types'

const perfilColors: Record<string, string> = {
  Administrador: 'bg-cyber-cyan/12 text-cyber-cyan border-cyber-cyan/20',
  Barbeiro: 'bg-cyber-purple/12 text-cyber-purple border-cyber-purple/20',
  Atendente: 'bg-cyber-amber/12 text-cyber-amber border-cyber-amber/20',
  Caixa: 'bg-cyber-green/12 text-cyber-green border-cyber-green/20',
}

export default function UsuariosPage() {
  const store = useStore()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [form, setForm] = useState({ nome: '', login: '', email: '', telefone: '', cpf: '', perfil: '', senha: '' })

  const [comissaoOpen, setComissaoOpen] = useState(false)
  const [comissaoUser, setComissaoUser] = useState<Profile | null>(null)
  const [comissaoPercent, setComissaoPercent] = useState(50)

  function openNew() { setEditing(null); setForm({ nome: '', login: '', email: '', telefone: '', cpf: '', perfil: '', senha: '' }); setModalOpen(true) }
  function openEdit(u: Profile) { setEditing(u); setForm({ nome: u.nome, login: u.login, email: u.email, telefone: u.telefone, cpf: u.cpf, perfil: u.perfil, senha: '' }); setModalOpen(true) }
  async function save() {
    if (!form.nome || !form.login || !form.email || !form.perfil) { toast('Preencha campos obrigatórios', 'er'); return }
    if (editing) { await store.updateUsuario({ ...editing, ...form, perfil: form.perfil as Profile['perfil'] }); toast('Usuário atualizado!') }
    else { await store.addUsuario({ ...form, perfil: form.perfil as Profile['perfil'], status: 'Ativo', login: form.login, telefone: form.telefone, cpf: form.cpf, email: form.email, nome: form.nome }); toast('Usuário adicionado!') }
    setModalOpen(false)
  }
  async function toggleStatus(u: Profile) { await store.updateUsuario({ ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' }); toast(`Usuário ${u.status === 'Ativo' ? 'desativado' : 'ativado'}`) }

  function openComissao(u: Profile) {
    setComissaoUser(u)
    setComissaoPercent(50)
    setComissaoOpen(true)
  }

  const inits = (n: string) => n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-tx-1 flex items-center gap-3"><span className="w-8 h-[3px] rounded bg-gradient-to-r from-cyber-cyan to-cyber-pink" />Usuários</h1>
          <p className="font-[family-name:var(--font-jetbrains)] text-[11px] text-tx-3 tracking-wider mt-1">{"// equipe e acessos"}</p>
        </div>
        <button onClick={openNew} className="px-5 py-2.5 rounded-[10px] bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 font-bold text-sm hover:bg-cyber-cyan/20 transition-all">＋ Novo Usuário</button>
      </div>

      <div className="glass rounded-[14px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-black/20">
                <th className="text-left px-6 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Usuário</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 hidden md:table-cell">Login</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Perfil</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Status</th>
                <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {store.usuarios.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyber-purple/20 to-cyber-cyan/20 flex items-center justify-center text-[10px] font-bold text-cyber-purple border border-cyber-purple/20">{inits(u.nome)}</div>
                      <div><div className="font-semibold text-tx-1">{u.nome}</div><div className="text-[10px] text-tx-3">{u.telefone}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-[family-name:var(--font-jetbrains)] text-[12px] text-tx-2 hidden md:table-cell">{u.login}</td>
                  <td className="px-4 py-4 text-tx-2 hidden md:table-cell">{u.email}</td>
                  <td className="px-4 py-4"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${perfilColors[u.perfil] || 'text-tx-3'}`}>{u.perfil}</span></td>
                  <td className="px-4 py-4">
                    <button onClick={() => toggleStatus(u)} className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${u.status === 'Ativo' ? 'bg-cyber-green/12 text-cyber-green' : 'bg-cyber-pink/12 text-cyber-pink'}`}>
                      {u.status}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {u.perfil === 'Barbeiro' && (
                        <button onClick={() => openComissao(u)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-cyber-purple bg-cyber-purple/8 border border-cyber-purple/15 hover:bg-cyber-purple/15 transition-all">💰 Comissão</button>
                      )}
                      <button onClick={() => openEdit(u)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-cyber-cyan bg-cyber-cyan/8 border border-cyber-cyan/15 hover:bg-cyber-cyan/15 transition-all">✎ Editar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Usuário' : 'Novo Usuário'}
        footer={<>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-tx-3 hover:text-tx-1 transition-colors">Cancelar</button>
          <button onClick={save} className="px-5 py-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 text-sm font-bold hover:bg-cyber-cyan/20 transition-all">💾 Salvar</button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Nome Completo *', key: 'nome', placeholder: 'João Silva' },
            { label: 'Login *', key: 'login', placeholder: 'joao.silva' },
            { label: 'Email *', key: 'email', placeholder: 'email@cybercut.com', type: 'email' },
            { label: 'Telefone', key: 'telefone', placeholder: '(11) 99999-9999' },
            { label: 'Senha', key: 'senha', placeholder: 'Mínimo 6 caracteres', type: 'password' },
            { label: 'CPF', key: 'cpf', placeholder: '000.000.000-00' },
          ].map(f => (
            <div key={f.key}>
              <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">{f.label}</label>
              <input type={f.type || 'text'} value={form[f.key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Perfil *</label>
            <select value={form.perfil} onChange={e => setForm(prev => ({ ...prev, perfil: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              <option value="">Selecione...</option>
              {['Administrador', 'Barbeiro', 'Atendente', 'Caixa'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* Comissão Modal */}
      <Modal open={comissaoOpen} onClose={() => setComissaoOpen(false)} title={`Comissões: ${comissaoUser?.nome || ''}`}
        footer={<button onClick={() => setComissaoOpen(false)} className="px-5 py-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 text-sm font-bold mx-auto w-full transition-all hover:bg-cyber-cyan/20">Aprovar / Fechar Relatório</button>}
      >
        {comissaoUser && (() => {
          const cortesMensais = store.agendamentos.filter(a => a.barbeiro_id === comissaoUser.id && a.status === 'Confirmado' && new Date(a.data).getMonth() === new Date().getMonth())
          const faturamentoTotal = cortesMensais.reduce((acc, curr) => acc + curr.preco, 0)
          const comissaoReceber = faturamentoTotal * (comissaoPercent / 100)
          const lucroCasa = faturamentoTotal - comissaoReceber
          const fmtM = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

          return (
            <div className="space-y-6">
              <div className="flex gap-4 p-4 glass rounded-[10px] items-center">
                <div className="flex-1">
                  <div className="font-[family-name:var(--font-jetbrains)] text-[10px] tracking-[2px] uppercase text-tx-3 mb-1">Mês Corrente</div>
                  <div className="text-xl font-bold text-tx-1">{cortesMensais.length} cortes realizados</div>
                </div>
                <div className="flex-1 text-right">
                  <div className="font-[family-name:var(--font-jetbrains)] text-[10px] tracking-[2px] uppercase text-tx-3 mb-1">Gerado (Total)</div>
                  <div className="text-xl font-bold text-cyber-green">{fmtM(faturamentoTotal)}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="font-[family-name:var(--font-jetbrains)] text-[10px] tracking-[2px] uppercase text-tx-3 block">Taxa de Comissão do Perfil</label>
                  <span className="font-bold text-tx-1 text-lg">{comissaoPercent}%</span>
                </div>
                <input type="range" min="0" max="100" value={comissaoPercent} onChange={(e) => setComissaoPercent(Number(e.target.value))} className="w-full accent-cyber-purple cursor-pointer" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-[10px] border border-cyber-purple/20 bg-cyber-purple/5 p-4 text-center">
                  <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] text-cyber-purple/80 uppercase mb-2">A Receber (Profissional)</div>
                  <div className="text-2xl font-black text-cyber-purple">{fmtM(comissaoReceber)}</div>
                </div>
                <div className="glass rounded-[10px] border border-cyber-cyan/20 bg-cyber-cyan/5 p-4 text-center">
                  <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] text-cyber-cyan/80 uppercase mb-2">Lucro Líquido (Casa)</div>
                  <div className="text-2xl font-black text-cyber-cyan">{fmtM(lucroCasa)}</div>
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
