import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const { data, error } = await supabase.from('transacoes').insert({
    descricao: "Venda: Pomada x1",
    valor: 45.00,
    data: "2026-04-10",
    categoria: "Produto",
    tipo: "entrada",
    pagamento: "Pix",
    observacoes: "Venda Rápida"
  }).select()
  console.log('Result:', data)
  if (error) console.error('Error:', error)
}
run()
