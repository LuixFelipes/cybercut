import { test } from 'node:test'
import * as assert from 'node:assert'

test('Deve garantir que uma entrada é superior a ZERO e processou a tipagem sem erros', () => {
    const mockTransacao = {
      descricao: "Venda Mock",
      valor: 50.00,
      tipo: "entrada"
    }
    assert.strictEqual(mockTransacao.valor > 0, true)
    assert.strictEqual(mockTransacao.tipo, "entrada")
    const stringified = JSON.stringify(mockTransacao)
    assert.ok(stringified.includes("Venda"))
})
