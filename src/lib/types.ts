/* Type definitions for CyberCut */

export interface Profile {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  perfil: 'Administrador' | 'Barbeiro' | 'Atendente' | 'Caixa'
  status: 'Ativo' | 'Inativo'
  login: string
  created_at: string
}

export interface Cliente {
  id: string
  nome: string
  telefone: string
  email: string
  cpf: string
  nascimento: string
  tipo: 'VIP' | 'Regular' | 'Novo'
  status: 'Ativo' | 'Inativo'
  endereco: string
  observacoes: string
  created_at: string
}

export interface Produto {
  id: string
  nome: string
  categoria: 'Cabelo' | 'Barba' | 'Pele' | 'Ferramentas' | 'Outros'
  preco: number
  estoque: number
  estoque_minimo: number
  unidade: string
  marca: string
  sku: string
  descricao: string
  emoji: string
  created_at: string
}

export interface Transacao {
  id: string
  descricao: string
  valor: number
  data: string
  categoria: string
  tipo: 'entrada' | 'saida'
  pagamento: string
  observacoes: string
  created_at: string
}

export interface Servico {
  id: string
  nome: string
  duracao_min: number
  preco: number
  cor: 'cyan' | 'green' | 'purple' | 'amber' | 'pink'
}

export interface Agendamento {
  id: string
  cliente_id: string
  cliente_nome: string
  barbeiro_id: string
  barbeiro_nome: string
  servico_id: string
  servico_nome: string
  servico_cor: string
  duracao_min: number
  preco: number
  data: string
  hora: string
  status: 'Confirmado' | 'Pendente' | 'Cancelado' | 'Realizado'
  observacoes: string
  created_at: string
}
