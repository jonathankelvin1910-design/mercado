import { Fragment } from 'react'
import { parsePreco, formatarPreco } from '../utils/moeda'

export default function TabelaLista({ itens, mercados, onPreco, onQuantidade, onRemover }) {
  const nomeExibicao = (mercado) => {
    const nome = (mercado.nome || '').trim()
    return nome || `Mercado ${mercado.posicao}`
  }

  const totalColunas = mercados.length + 4

  const grupos = Object.values(
    itens.reduce((acc, item) => {
      if (!acc[item.categoria_nome]) {
        acc[item.categoria_nome] = {
          nome: item.categoria_nome,
          categoria_ordem: item.categoria_ordem,
          itens: [],
        }
      }
      acc[item.categoria_nome].itens.push(item)
      return acc
    }, {})
  )
    .map((grupo) => ({
      ...grupo,
      itens: [...grupo.itens].sort((a, b) => a.nome.localeCompare(b.nome)),
    }))
    .sort((a, b) => a.categoria_ordem - b.categoria_ordem)

  const handleBlurPreco = (produto_id, mercado, precoAtual) => (e) => {
    const texto = e.target.value
    const numero = parsePreco(texto)
    if (numero != null) {
      if (numero !== precoAtual) {
        onPreco(produto_id, mercado.id, numero)
      }
    } else if (texto.trim() === '') {
      if (precoAtual != null) {
        onPreco(produto_id, mercado.id, null)
      }
    } else {
      e.target.classList.add('invalido')
      e.target.setAttribute('aria-invalid', 'true')
    }
  }

  const handleInputPreco = (e) => {
    e.target.classList.remove('invalido')
    e.target.removeAttribute('aria-invalid')
  }

  const handleBlurQuantidade = (produto_id, quantidade) => (e) => {
    const n = parseInt(e.target.value, 10)
    if (Number.isInteger(n) && n >= 1 && n <= 999 && n !== quantidade) {
      onQuantidade(produto_id, n)
    } else {
      e.target.value = quantidade
    }
  }

  const handleTecla = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  return (
    <div className="tabela-lista">
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Qtd</th>
            {mercados.map((mercado) => (
              <th key={mercado.id}>{nomeExibicao(mercado)}</th>
            ))}
            <th>Mais barato</th>
            <th>
              <span className="sr-only">Remover</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {grupos.map((grupo) => (
            <Fragment key={grupo.nome}>
              <tr className="categoria">
                <td colSpan={totalColunas}>
                  {grupo.nome} ({grupo.itens.length})
                </td>
              </tr>
              {grupo.itens.map((item) => (
                <tr key={item.produto_id} className="item">
                  <td>{item.nome}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      aria-label={`Quantidade de ${item.nome}`}
                      defaultValue={item.quantidade}
                      key={`${item.produto_id}-${item.quantidade}`}
                      onBlur={handleBlurQuantidade(item.produto_id, item.quantidade)}
                      onKeyDown={handleTecla}
                    />
                  </td>
                  {mercados.map((mercado) => {
                    const precoAtual = item.precos[mercado.id] ?? null
                    const valor = precoAtual != null ? formatarPreco(precoAtual) : ''
                    return (
                      <td key={mercado.id}>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0,00"
                          autoComplete="off"
                          aria-label={`Preço de ${item.nome} no ${nomeExibicao(mercado)}`}
                          defaultValue={valor}
                          key={`${item.produto_id}-${mercado.id}-${precoAtual}`}
                          onBlur={handleBlurPreco(item.produto_id, mercado, precoAtual)}
                          onInput={handleInputPreco}
                          onKeyDown={handleTecla}
                        />
                      </td>
                    )
                  })}
                  <td className="mais-barato"></td>
                  <td>
                    <button
                      type="button"
                      aria-label={`Remover ${item.nome}`}
                      onClick={() => onRemover(item.produto_id)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
