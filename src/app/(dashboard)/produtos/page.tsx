'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import Modal from '@/components/ui/modal'
import type { Produto } from '@/lib/types'

const emojis: Record<string, string> = { Cabelo: '💈', Barba: '🪒', Pele: '🧴', Ferramentas: '✂️', Outros: '📦' }

export default function ProdutosPage() {
  const store = useStore()
  const toast = useToast()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Produto | null>(null)
  const [form, setForm] = useState({ nome: '', categoria: '', preco: '', estoque: '', estoque_minimo: '', unidade: 'un', marca: '', sku: '', descricao: '' })

  const [vendaOpen, setVendaOpen] = useState(false)
  const [formVenda, setFormVenda] = useState({ produto_id: '', cliente_id: '', qtd: 1, valor_pago: 0, pagamento: 'Pix' })

  const filtered = store.produtos.filter(p => {
    const matchSearch = !search || p.nome.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || p.categoria === filterCat
    return matchSearch && matchCat
  })

  function openNew() {
    setEditing(null)
    setForm({ nome: '', categoria: '', preco: '', estoque: '', estoque_minimo: '', unidade: 'un', marca: '', sku: '', descricao: '' })
    setModalOpen(true)
  }
  function openEdit(p: Produto) {
    setEditing(p)
    setForm({ nome: p.nome, categoria: p.categoria, preco: String(p.preco), estoque: String(p.estoque), estoque_minimo: String(p.estoque_minimo), unidade: p.unidade, marca: p.marca, sku: p.sku, descricao: p.descricao })
    setModalOpen(true)
  }
  async function save() {
    if (!form.nome || !form.categoria || !form.preco) { toast('Preencha campos obrigatórios', 'er'); return }
    const data = {
      nome: form.nome, categoria: form.categoria as Produto['categoria'],
      preco: parseFloat(form.preco), estoque: parseInt(form.estoque) || 0,
      estoque_minimo: parseInt(form.estoque_minimo) || 0, unidade: form.unidade,
      marca: form.marca, sku: form.sku, descricao: form.descricao,
      emoji: emojis[form.categoria] || '📦',
    }
    if (editing) { await store.updateProduto({ ...editing, ...data }); toast('Produto atualizado!') }
    else { await store.addProduto(data); toast('Produto adicionado!') }
    setModalOpen(false)
  }
  async function del(id: string) { if (confirm('Excluir?')) { await store.deleteProduto(id); toast('Produto removido', 'info') } }

  function openVenda() {
    setFormVenda({ produto_id: '', cliente_id: '', qtd: 1, valor_pago: 0, pagamento: 'Pix' })
    setVendaOpen(true)
  }

  function handleProdutoVendaChange(id: string) {
    const p = store.produtos.find(x => x.id === id)
    if (p) setFormVenda(prev => ({ ...prev, produto_id: id, valor_pago: p.preco * prev.qtd }))
    else setFormVenda(prev => ({ ...prev, produto_id: '' }))
  }

  function handleQtdChange(qtd: number) {
    const p = store.produtos.find(x => x.id === formVenda.produto_id)
    setFormVenda(prev => ({ ...prev, qtd, valor_pago: p ? p.preco * qtd : 0 }))
  }

  async function saveVenda() {
    const p = store.produtos.find(x => x.id === formVenda.produto_id)
    if (!p) return toast('Selecione um produto', 'er')
    if (formVenda.qtd <= 0 || formVenda.qtd > p.estoque) return toast('Quantidade inválida ou produto sem estoque suficiente', 'er')

    const c = store.clientes.find(x => x.id === formVenda.cliente_id)

    // Subtrair Estoque
    await store.updateProduto({ ...p, estoque: p.estoque - formVenda.qtd })
    
    // Adicionar Venda ao Caixa
    await store.addTransacao({
      descricao: `Venda: ${p.nome} x${formVenda.qtd}${c ? ` para ${c.nome}` : ''}`,
      valor: formVenda.valor_pago,
      data: new Date().toISOString().split('T')[0],
      categoria: 'Produto',
      tipo: 'entrada',
      pagamento: formVenda.pagamento,
      observacoes: 'Venda Rápida (PDV)'
    })

    toast('Venda e Receita gerada com sucesso! 💸')
    setVendaOpen(false)
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-tx-1 flex items-center gap-3">
            <span className="w-8 h-[3px] rounded bg-gradient-to-r from-cyber-cyan to-cyber-pink" />Produtos
          </h1>
          <p className="font-[family-name:var(--font-jetbrains)] text-[11px] text-tx-3 tracking-wider mt-1">{"// catálogo de produtos"}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openVenda} className="px-5 py-2.5 rounded-[10px] bg-cyber-green/10 text-cyber-green border border-cyber-green/20 font-bold text-sm hover:bg-cyber-green/20 transition-all shadow-[0_0_15px_rgba(50,215,75,0.15)]">🛒 Vender Produto</button>
          <button onClick={openNew} className="px-5 py-2.5 rounded-[10px] bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 font-bold text-sm hover:bg-cyber-cyan/20 transition-all">＋ Novo</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tx-3">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." className="w-full pl-11 pr-4 py-3 glass rounded-[10px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-4 py-3 glass rounded-[10px] text-sm text-tx-1 focus:outline-none cursor-pointer">
          <option value="">Todas categorias</option>
          {['Cabelo', 'Barba', 'Pele', 'Ferramentas', 'Outros'].map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex border border-border-default rounded-[8px] overflow-hidden">
          <button onClick={() => setView('grid')} className={`px-3 py-2 text-sm ${view === 'grid' ? 'bg-cyber-cyan/10 text-cyber-cyan' : 'text-tx-3'}`}>▦</button>
          <button onClick={() => setView('list')} className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-cyber-cyan/10 text-cyber-cyan' : 'text-tx-3'}`}>☰</button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="glass rounded-[14px] p-5 group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-4xl mb-3 filter drop-shadow-lg group-hover:scale-110 group-hover:-rotate-5 transition-transform duration-300">{p.emoji}</div>
              <div className="text-sm font-bold text-tx-1 mb-1">{p.nome}</div>
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-3">{p.categoria}</div>
              <div className="font-[family-name:var(--font-jetbrains)] text-xl font-bold text-cyber-green mb-1">R$ {p.preco.toFixed(2).replace('.', ',')}</div>
              <div className={`text-[12px] mb-1 ${p.estoque <= p.estoque_minimo ? 'text-cyber-pink font-semibold' : 'text-tx-2'}`}>
                Estoque: {p.estoque} {p.unidade} {p.estoque <= p.estoque_minimo && '⚠'}
              </div>
              <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-tx-3 mb-3">{p.marca}</div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-cyber-cyan bg-cyber-cyan/8 border border-cyber-cyan/15 hover:bg-cyber-cyan/15 transition-all">✎ Editar</button>
                <button onClick={() => del(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-cyber-pink/60 hover:text-cyber-pink hover:bg-cyber-pink/10 transition-all">🗑</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-[14px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-black/20">
                  <th className="text-left px-6 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Produto</th>
                  <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Categoria</th>
                  <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Preço</th>
                  <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Estoque</th>
                  <th className="text-left px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3"><span className="mr-2">{p.emoji}</span>{p.nome}</td>
                    <td className="px-4 py-3 text-tx-3">{p.categoria}</td>
                    <td className="px-4 py-3 font-[family-name:var(--font-jetbrains)] text-cyber-green font-bold">R$ {p.preco.toFixed(2).replace('.', ',')}</td>
                    <td className={`px-4 py-3 ${p.estoque <= p.estoque_minimo ? 'text-cyber-pink font-semibold' : 'text-tx-2'}`}>{p.estoque} {p.unidade}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-cyber-cyan bg-cyber-cyan/8 border border-cyber-cyan/15 hover:bg-cyber-cyan/15 transition-all">✎</button>
                        <button onClick={() => del(p.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-cyber-pink/60 hover:text-cyber-pink hover:bg-cyber-pink/10 transition-all text-xs">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Produto' : 'Novo Produto'}
        footer={<>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-tx-3 hover:text-tx-1 transition-colors">Cancelar</button>
          <button onClick={save} className="px-5 py-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 text-sm font-bold hover:bg-cyber-cyan/20 transition-all">💾 Salvar</button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Nome *', key: 'nome', placeholder: 'Pomada Modeladora' },
            { label: 'Marca', key: 'marca', placeholder: 'Barber Pro' },
            { label: 'Preço *', key: 'preco', placeholder: '35.90', type: 'number' },
            { label: 'Estoque', key: 'estoque', placeholder: '10', type: 'number' },
            { label: 'Estoque Mínimo', key: 'estoque_minimo', placeholder: '5', type: 'number' },
            { label: 'SKU', key: 'sku', placeholder: 'POM-001' },
          ].map(f => (
            <div key={f.key}>
              <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">{f.label}</label>
              <input type={f.type || 'text'} value={form[f.key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 placeholder:text-tx-3 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Categoria *</label>
            <select value={form.categoria} onChange={e => setForm(prev => ({ ...prev, categoria: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              <option value="">Selecione...</option>
              {['Cabelo', 'Barba', 'Pele', 'Ferramentas', 'Outros'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Unidade</label>
            <select value={form.unidade} onChange={e => setForm(prev => ({ ...prev, unidade: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              {['un', 'ml', 'g', 'L', 'kg'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <Modal open={vendaOpen} onClose={() => setVendaOpen(false)} title="Venda Rápida de Balcão (PDV)"
        footer={<>
          <button onClick={() => setVendaOpen(false)} className="px-4 py-2 rounded-lg text-sm text-tx-3 hover:text-tx-1 transition-colors">Cancelar</button>
          <button onClick={saveVenda} className="px-5 py-2 rounded-lg bg-cyber-green/10 text-cyber-green border border-cyber-green/20 text-sm font-bold hover:bg-cyber-green/20 transition-all">💵 Concluir Venda</button>
        </>}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Qual Produto? *</label>
            <select value={formVenda.produto_id} onChange={e => handleProdutoVendaChange(e.target.value)} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer border border-cyber-cyan/10">
              <option value="">Selecione no catálogo...</option>
              {store.produtos.filter(p => p.estoque > 0).map(p => <option key={p.id} value={p.id}>{p.emoji} {p.nome} — R${p.preco} (Temos {p.estoque} em estoque)</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Quantidade (un) *</label>
              <input type="number" min="1" value={formVenda.qtd} onChange={e => handleQtdChange(parseInt(e.target.value) || 1)} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none" />
            </div>
            <div>
              <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Valor Pagante (R$) *</label>
              <input type="number" step="0.01" value={formVenda.valor_pago} onChange={e => setFormVenda(prev => ({ ...prev, valor_pago: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-cyber-green font-bold shadow-inner focus:outline-none" title="Você pode alterar caso dê algum desconto" />
            </div>
          </div>
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Cliente Vinculado (Opcional)</label>
            <select value={formVenda.cliente_id} onChange={e => setFormVenda(prev => ({ ...prev, cliente_id: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer">
              <option value="">Consumidor Final (Não Cadastrado)</option>
              {store.clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-1.5 block">Forma de Pagamento Recebida *</label>
            <select value={formVenda.pagamento} onChange={e => setFormVenda(prev => ({ ...prev, pagamento: e.target.value }))} className="w-full px-4 py-2.5 glass rounded-[8px] text-sm text-tx-1 focus:outline-none cursor-pointer bg-cyber-green/[0.05] border-cyber-green/20">
              <option>Pix</option>
              <option>Cartão de Crédito</option>
              <option>Cartão de Débito</option>
              <option>Dinheiro</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
