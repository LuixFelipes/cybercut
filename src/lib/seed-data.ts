import type { Profile, Cliente, Produto, Transacao, Servico, Agendamento } from './types'

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const d = (day: number) => {
  const dt = new Date()
  dt.setDate(day)
  return dt.toISOString().split('T')[0]
}


export const SERVICOS: Servico[] = [
  { id: 's1', nome: 'Corte', duracao_min: 30, preco: 45, cor: 'cyan' },
  { id: 's2', nome: 'Barba', duracao_min: 20, preco: 30, cor: 'green' },
  { id: 's3', nome: 'Combo', duracao_min: 50, preco: 70, cor: 'purple' },
  { id: 's4', nome: 'Tratamento', duracao_min: 40, preco: 60, cor: 'amber' },
  { id: 's5', nome: 'Outro', duracao_min: 30, preco: 40, cor: 'pink' },
]

export function getSeedData() {
  const usuarios: Profile[] = [
    { id: 'u1', nome: 'Carlos Admin', email: 'carlos@cybercut.com', telefone: '(11) 99999-0001', cpf: '111.111.111-11', perfil: 'Administrador', status: 'Ativo', login: 'carlos.admin', created_at: '2025-01-01' },
    { id: 'u2', nome: 'Lucas Barbeiro', email: 'lucas@cybercut.com', telefone: '(11) 99999-0002', cpf: '222.222.222-22', perfil: 'Barbeiro', status: 'Ativo', login: 'lucas.barbeiro', created_at: '2025-01-01' },
    { id: 'u3', nome: 'Ana Atendente', email: 'ana@cybercut.com', telefone: '(11) 99999-0003', cpf: '333.333.333-33', perfil: 'Atendente', status: 'Ativo', login: 'ana.atendente', created_at: '2025-01-01' },
  ]

  const clientes: Cliente[] = [
    { id: 'c1', nome: 'Rafael Souza', telefone: '(11) 99123-4567', email: 'rafael@email.com', cpf: '444.444.444-44', nascimento: '1990-05-15', tipo: 'VIP', status: 'Ativo', endereco: 'Rua A, 123', observacoes: 'Prefere corte degradê', created_at: '2025-03-10' },
    { id: 'c2', nome: 'Lucas Ferreira', telefone: '(11) 99234-5678', email: '', cpf: '', nascimento: '', tipo: 'Regular', status: 'Ativo', endereco: '', observacoes: '', created_at: '2025-03-15' },
    { id: 'c3', nome: 'Bruno Costa', telefone: '(11) 99345-6789', email: 'bruno@email.com', cpf: '', nascimento: '', tipo: 'Regular', status: 'Ativo', endereco: '', observacoes: 'Alergia a certos produtos', created_at: '2025-03-20' },
    { id: 'c4', nome: 'Mateus Alves', telefone: '(11) 98888-7654', email: 'mateus@email.com', cpf: '', nascimento: '', tipo: 'Novo', status: 'Ativo', endereco: '', observacoes: '', created_at: '2025-03-25' },
  ]

  const produtos: Produto[] = [
    { id: 'p1', nome: 'Pomada Modeladora', categoria: 'Cabelo', preco: 35.90, estoque: 12, estoque_minimo: 5, unidade: 'un', marca: 'Barber Pro', sku: 'POM-001', descricao: 'Pomada efeito seco', emoji: '💈', created_at: '' },
    { id: 'p2', nome: 'Óleo para Barba', categoria: 'Barba', preco: 45.00, estoque: 3, estoque_minimo: 5, unidade: 'ml', marca: 'Viking', sku: 'OLB-002', descricao: 'Óleo hidratante', emoji: '🧔', created_at: '' },
    { id: 'p3', nome: 'Shampoo Premium', categoria: 'Cabelo', preco: 28.50, estoque: 8, estoque_minimo: 4, unidade: 'ml', marca: 'Head Pro', sku: 'SHA-003', descricao: '', emoji: '🧴', created_at: '' },
    { id: 'p4', nome: 'Navalha Profissional', categoria: 'Ferramentas', preco: 89.90, estoque: 2, estoque_minimo: 3, unidade: 'un', marca: 'Feather', sku: 'NAV-004', descricao: '', emoji: '✂️', created_at: '' },
    { id: 'p5', nome: 'Creme de Barbear', categoria: 'Barba', preco: 22.00, estoque: 15, estoque_minimo: 5, unidade: 'g', marca: 'Proraso', sku: 'CRB-005', descricao: '', emoji: '🪒', created_at: '' },
    { id: 'p6', nome: 'Hidratante Facial', categoria: 'Pele', preco: 55.00, estoque: 6, estoque_minimo: 3, unidade: 'ml', marca: 'Nivea Men', sku: 'HID-006', descricao: '', emoji: '💧', created_at: '' },
  ]

  const transacoes: Transacao[] = [
    { id: 't1', descricao: 'Aluguel do Espaço', valor: 2800, data: d(1), categoria: 'Aluguel', tipo: 'saida', pagamento: 'Transferência', observacoes: '', created_at: '' },
    { id: 't2', descricao: 'Conta de Luz', valor: 420, data: d(5), categoria: 'Outros', tipo: 'saida', pagamento: 'Pix', observacoes: 'Mês de referência', created_at: '' },
    { id: 't3', descricao: 'Internet + TV', valor: 189, data: d(5), categoria: 'Outros', tipo: 'saida', pagamento: 'Débito Automático', observacoes: '', created_at: '' },
    { id: 't4', descricao: 'Fornecedor — Produtos Viking', valor: 650, data: d(8), categoria: 'Fornecedor', tipo: 'saida', pagamento: 'Pix', observacoes: '15 unidades', created_at: '' },
    { id: 't5', descricao: 'Salário Lucas (Barbeiro)', valor: 350, data: d(10), categoria: 'Folha', tipo: 'saida', pagamento: 'Transferência', observacoes: 'Semana 1', created_at: '' },
    { id: 't6', descricao: 'Marketing — Instagram Ads', valor: 200, data: d(12), categoria: 'Marketing', tipo: 'saida', pagamento: 'Cartão', observacoes: 'Campanha Abril', created_at: '' },
    { id: 't7', descricao: 'Material de Limpeza', valor: 96, data: d(15), categoria: 'Outros', tipo: 'saida', pagamento: 'Dinheiro', observacoes: '', created_at: '' },
    { id: 't8', descricao: 'Corte + Barba', valor: 70, data: d(10), categoria: 'Serviço', tipo: 'entrada', pagamento: 'Pix', observacoes: 'Cliente Rafael', created_at: '' },
    { id: 't9', descricao: 'Corte Degradê', valor: 45, data: d(12), categoria: 'Serviço', tipo: 'entrada', pagamento: 'Dinheiro', observacoes: '', created_at: '' },
    { id: 't10', descricao: 'Venda Pomada + Óleo', valor: 80.90, data: d(14), categoria: 'Produto', tipo: 'entrada', pagamento: 'Cartão', observacoes: '', created_at: '' },
    { id: 't11', descricao: 'Cortes (3x)', valor: 135, data: d(18), categoria: 'Serviço', tipo: 'entrada', pagamento: 'Pix', observacoes: 'Manhã cheia', created_at: '' },
    { id: 't12', descricao: 'Barba + Tratamento', valor: 90, data: d(20), categoria: 'Serviço', tipo: 'entrada', pagamento: 'Dinheiro', observacoes: '', created_at: '' },
    { id: 't13', descricao: 'Venda Shampoo', valor: 28.50, data: d(22), categoria: 'Produto', tipo: 'entrada', pagamento: 'Pix', observacoes: '', created_at: '' },
    { id: 't14', descricao: 'Corte Infantil x2', valor: 80, data: d(26), categoria: 'Serviço', tipo: 'entrada', pagamento: 'Dinheiro', observacoes: 'Dois irmãos', created_at: '' },
    { id: 't15', descricao: 'Venda Creme de Barbear', valor: 22, data: d(28), categoria: 'Produto', tipo: 'entrada', pagamento: 'Pix', observacoes: '', created_at: '' },
  ]

  // Generate agenda seed data
  const barbeiro = usuarios.find(u => u.perfil === 'Barbeiro')!
  const agendamentos: Agendamento[] = []

  function addAg(dayOffset: number, hora: string, servicoIdx: number, clienteIdx: number, status: string = 'Confirmado') {
    const dt = new Date()
    dt.setDate(dt.getDate() + dayOffset)
    const data = dt.toISOString().split('T')[0]
    const sv = SERVICOS[servicoIdx]
    const cl = clientes[clienteIdx % clientes.length]
    agendamentos.push({
      id: uid(),
      cliente_id: cl.id,
      cliente_nome: cl.nome,
      barbeiro_id: barbeiro.id,
      barbeiro_nome: barbeiro.nome,
      servico_id: sv.id,
      servico_nome: sv.nome,
      servico_cor: sv.cor,
      duracao_min: sv.duracao_min,
      preco: sv.preco,
      data,
      hora,
      status: status as Agendamento['status'],
      observacoes: '',
      created_at: '',
    })
  }

  // Today
  addAg(0, '09:00', 0, 0)
  addAg(0, '10:00', 2, 1)
  addAg(0, '11:30', 1, 2)
  addAg(0, '14:00', 3, 3)
  addAg(0, '15:30', 0, 0)
  // Tomorrow
  addAg(1, '09:30', 2, 2)
  addAg(1, '11:00', 0, 1)
  addAg(1, '14:30', 1, 3)
  addAg(1, '16:00', 3, 0)
  // Day +2
  addAg(2, '08:30', 0, 3)
  addAg(2, '10:00', 2, 1)
  addAg(2, '13:00', 0, 2)
  addAg(2, '15:00', 1, 0, 'Pendente')
  // Yesterday
  addAg(-1, '09:00', 0, 1)
  addAg(-1, '10:30', 2, 2)
  addAg(-1, '14:00', 1, 3)
  // Day -2
  addAg(-2, '10:00', 3, 0)
  addAg(-2, '11:00', 0, 1)
  // Day +3
  addAg(3, '09:00', 0, 2)
  addAg(3, '11:00', 2, 3)
  addAg(3, '14:00', 0, 0, 'Pendente')

  return { usuarios, clientes, produtos, transacoes, agendamentos, servicos: SERVICOS }
}
