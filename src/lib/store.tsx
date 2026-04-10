'use client'
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Cliente, Produto, Transacao, Agendamento, Servico } from '@/lib/types'

interface StoreState {
  usuarios: Profile[]
  clientes: Cliente[]
  produtos: Produto[]
  transacoes: Transacao[]
  agendamentos: Agendamento[]
  servicos: Servico[]
  loading: boolean
}

interface StoreActions {
  addCliente: (c: Omit<Cliente, 'id' | 'created_at'>) => Promise<void>
  updateCliente: (c: Cliente) => Promise<void>
  deleteCliente: (id: string) => Promise<void>
  addProduto: (p: Omit<Produto, 'id' | 'created_at'>) => Promise<void>
  updateProduto: (p: Produto) => Promise<void>
  deleteProduto: (id: string) => Promise<void>
  addUsuario: (u: Omit<Profile, 'id' | 'created_at'>) => Promise<void>
  updateUsuario: (u: Profile) => Promise<void>
  deleteUsuario: (id: string) => Promise<void>
  addTransacao: (t: Omit<Transacao, 'id' | 'created_at'>) => Promise<void>
  updateTransacao: (t: Transacao) => Promise<void>
  deleteTransacao: (id: string) => Promise<void>
  addAgendamento: (a: Omit<Agendamento, 'id' | 'created_at'>) => Promise<void>
  updateAgendamento: (a: Agendamento) => Promise<void>
  deleteAgendamento: (id: string) => Promise<void>
  addServico: (s: Omit<Servico, 'id'>) => Promise<void>
  updateServico: (s: Servico) => Promise<void>
  deleteServico: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

type Store = StoreState & StoreActions

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>({
    usuarios: [],
    clientes: [],
    produtos: [],
    transacoes: [],
    agendamentos: [],
    servicos: [],
    loading: true,
  })

  const [supabase] = useState(() => createClient())

  // ─── Fetch all data from Supabase ───
  const fetchAll = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))

    const [
      { data: servicos },
      { data: clientes },
      { data: produtos },
      { data: transacoes },
      { data: agendamentosRaw },
    ] = await Promise.all([
      supabase.from('servicos').select('*').order('id'),
      supabase.from('clientes').select('*').order('created_at', { ascending: false }),
      supabase.from('produtos').select('*').order('created_at', { ascending: false }),
      supabase.from('transacoes').select('*').order('data', { ascending: false }),
      supabase.from('agendamentos').select(`
        *,
        clientes ( id, nome ),
        servicos ( id, nome, duracao_min, preco, cor )
      `).order('data', { ascending: false }),
    ])

    // Map agendamentos to include denormalized fields for easy UI consumption
    const agendamentos: Agendamento[] = (agendamentosRaw || []).map((a: Record<string, unknown>) => {
      const cl = a.clientes as Record<string, unknown> | null
      const sv = a.servicos as Record<string, unknown> | null
      return {
        id: String(a.id),
        cliente_id: String(a.cliente_id || ''),
        cliente_nome: cl?.nome as string || 'Sem cliente',
        barbeiro_id: String(a.barbeiro_id || ''),
        barbeiro_nome: '', // profiles not fetched for now
        servico_id: String(a.servico_id || ''),
        servico_nome: sv?.nome as string || '',
        servico_cor: sv?.cor as string || 'cyan',
        duracao_min: sv?.duracao_min as number || 30,
        preco: sv?.preco as number || 0,
        data: String(a.data),
        hora: String(a.hora).slice(0, 5), // "HH:MM"
        status: a.status as Agendamento['status'],
        observacoes: a.observacoes as string || '',
        created_at: String(a.created_at || ''),
      }
    })

    setState({
      servicos: (servicos || []).map(s => ({ ...s, id: String(s.id) })),
      clientes: (clientes || []).map(c => ({
        ...c, id: String(c.id),
        nascimento: c.nascimento || '', endereco: c.endereco || '',
        observacoes: c.observacoes || '', cpf: c.cpf || '', email: c.email || '',
        status: (c.status as 'Ativo'|'Inativo') || 'Ativo',
      })),
      produtos: (produtos || []).map(p => ({
        ...p, id: String(p.id), preco: Number(p.preco),
        descricao: p.descricao || '', emoji: p.emoji || '📦',
        marca: p.marca || '', sku: p.sku || '',
      })),
      transacoes: (transacoes || []).map(t => ({
        ...t, id: String(t.id), valor: Number(t.valor),
        observacoes: t.observacoes || '',
      })),
      agendamentos,
      usuarios: [], // Will be populated if auth is configured
      loading: false,
    })
  }, [supabase])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll() }, [fetchAll])

  // ─── CRUD: Clientes ───
  const addCliente = useCallback(async (c: Omit<Cliente, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('clientes').insert(c).select().single()
    if (!error && data) setState(prev => ({ ...prev, clientes: [{ ...data, id: String(data.id), email: data.email||'', cpf: data.cpf||'', nascimento: data.nascimento||'', endereco: data.endereco||'', observacoes: data.observacoes||'', status: data.status||'Ativo' }, ...prev.clientes] }))
  }, [supabase])

  const updateCliente = useCallback(async (c: Cliente) => {
    const { id, ...rest } = c
    const { error } = await supabase.from('clientes').update(rest).eq('id', Number(id))
    if (!error) setState(prev => ({ ...prev, clientes: prev.clientes.map(x => x.id === id ? c : x) }))
  }, [supabase])

  const deleteCliente = useCallback(async (id: string) => {
    const { error } = await supabase.from('clientes').delete().eq('id', Number(id))
    if (!error) setState(prev => ({ ...prev, clientes: prev.clientes.filter(x => x.id !== id) }))
  }, [supabase])

  // ─── CRUD: Produtos ───
  const addProduto = useCallback(async (p: Omit<Produto, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('produtos').insert(p).select().single()
    if (!error && data) setState(prev => ({ ...prev, produtos: [{ ...data, id: String(data.id), preco: Number(data.preco), descricao: data.descricao||'', emoji: data.emoji||'📦', marca: data.marca||'', sku: data.sku||'' }, ...prev.produtos] }))
  }, [supabase])

  const updateProduto = useCallback(async (p: Produto) => {
    const { id, ...rest } = p
    const { error } = await supabase.from('produtos').update(rest).eq('id', Number(id))
    if (!error) setState(prev => ({ ...prev, produtos: prev.produtos.map(x => x.id === id ? p : x) }))
  }, [supabase])

  const deleteProduto = useCallback(async (id: string) => {
    const { error } = await supabase.from('produtos').delete().eq('id', Number(id))
    if (!error) setState(prev => ({ ...prev, produtos: prev.produtos.filter(x => x.id !== id) }))
  }, [supabase])

  // ─── CRUD: Transacoes ───
  const addTransacao = useCallback(async (t: Omit<Transacao, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('transacoes').insert(t).select().single()
    if (!error && data) setState(prev => ({ ...prev, transacoes: [{ ...data, id: String(data.id), valor: Number(data.valor), observacoes: data.observacoes||'' }, ...prev.transacoes] }))
  }, [supabase])

  const updateTransacao = useCallback(async (t: Transacao) => {
    const { id, ...rest } = t
    const { error } = await supabase.from('transacoes').update(rest).eq('id', Number(id))
    if (!error) setState(prev => ({ ...prev, transacoes: prev.transacoes.map(x => x.id === id ? t : x) }))
  }, [supabase])

  const deleteTransacao = useCallback(async (id: string) => {
    const { error } = await supabase.from('transacoes').delete().eq('id', Number(id))
    if (!error) setState(prev => ({ ...prev, transacoes: prev.transacoes.filter(x => x.id !== id) }))
  }, [supabase])

  // ─── CRUD: Usuarios (profiles) ───
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addUsuario = useCallback(async (_u: Omit<Profile, 'id' | 'created_at'>) => {
    // Profiles are tied to auth.users — skip insert for now
  }, [])

  const updateUsuario = useCallback(async (u: Profile) => {
    const { id, ...rest } = u
    const { error } = await supabase.from('profiles').update(rest).eq('id', id)
    if (!error) setState(prev => ({ ...prev, usuarios: prev.usuarios.map(x => x.id === id ? u : x) }))
  }, [supabase])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteUsuario = useCallback(async (_id: string) => {
    // Cannot delete profiles via anon key
  }, [])

  // ─── CRUD: Agendamentos ───
  const addAgendamento = useCallback(async (a: Omit<Agendamento, 'id' | 'created_at'>) => {
    const row = {
      cliente_id: Number(a.cliente_id),
      servico_id: Number(a.servico_id),
      barbeiro_id: a.barbeiro_id || null,
      data: a.data,
      hora: a.hora,
      status: a.status,
      observacoes: a.observacoes,
    }
    const { data, error } = await supabase.from('agendamentos').insert(row).select(`
      *, clientes(id, nome), servicos(id, nome, duracao_min, preco, cor)
    `).single()
    if (!error && data) {
      const cl = data.clientes as Record<string, unknown> | null
      const sv = data.servicos as Record<string, unknown> | null
      const mapped: Agendamento = {
        id: String(data.id),
        cliente_id: String(data.cliente_id || ''),
        cliente_nome: cl?.nome as string || '',
        barbeiro_id: String(data.barbeiro_id || ''),
        barbeiro_nome: a.barbeiro_nome || '',
        servico_id: String(data.servico_id || ''),
        servico_nome: sv?.nome as string || '',
        servico_cor: sv?.cor as string || 'cyan',
        duracao_min: sv?.duracao_min as number || 30,
        preco: sv?.preco as number || 0,
        data: String(data.data),
        hora: String(data.hora).slice(0, 5),
        status: data.status as Agendamento['status'],
        observacoes: data.observacoes || '',
        created_at: String(data.created_at || ''),
      }
      setState(prev => ({ ...prev, agendamentos: [mapped, ...prev.agendamentos] }))
    }
  }, [supabase])

  const updateAgendamento = useCallback(async (a: Agendamento) => {
    const row = {
      cliente_id: Number(a.cliente_id),
      servico_id: Number(a.servico_id),
      barbeiro_id: a.barbeiro_id || null,
      data: a.data,
      hora: a.hora,
      status: a.status,
      observacoes: a.observacoes,
    }
    const { error } = await supabase.from('agendamentos').update(row).eq('id', Number(a.id))
    if (!error) setState(prev => ({ ...prev, agendamentos: prev.agendamentos.map(x => x.id === a.id ? a : x) }))
  }, [supabase])

  const deleteAgendamento = useCallback(async (id: string) => {
    const { error } = await supabase.from('agendamentos').delete().eq('id', Number(id))
    if (!error) setState(prev => ({ ...prev, agendamentos: prev.agendamentos.filter(x => x.id !== id) }))
  }, [supabase])

  // ─── CRUD: Servicos ───
  const addServico = useCallback(async (s: Omit<Servico, 'id'>) => {
    const { data, error } = await supabase.from('servicos').insert(s).select().single()
    if (!error && data) setState(prev => ({ ...prev, servicos: [...prev.servicos, { ...data, id: String(data.id), preco: Number(data.preco) }] }))
  }, [supabase])

  const updateServico = useCallback(async (s: Servico) => {
    const { id, ...rest } = s
    const { error } = await supabase.from('servicos').update(rest).eq('id', Number(id))
    if (!error) setState(prev => ({ ...prev, servicos: prev.servicos.map(x => x.id === id ? s : x) }))
  }, [supabase])

  const deleteServico = useCallback(async (id: string) => {
    const { error } = await supabase.from('servicos').delete().eq('id', Number(id))
    if (!error) setState(prev => ({ ...prev, servicos: prev.servicos.filter(x => x.id !== id) }))
  }, [supabase])

  const value: Store = {
    ...state,
    addCliente, updateCliente, deleteCliente,
    addProduto, updateProduto, deleteProduto,
    addUsuario, updateUsuario, deleteUsuario,
    addTransacao, updateTransacao, deleteTransacao,
    addAgendamento, updateAgendamento, deleteAgendamento,
    addServico, updateServico, deleteServico,
    refresh: fetchAll,
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
