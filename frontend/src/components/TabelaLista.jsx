import { Fragment } from 'react'
import { parsePreco, formatarPreco, formatarMoeda } from '../utils/moeda'

export default function TabelaLista({ itens, mercados, comparacao, onPreco, onQuantidade, onRemover }) {
  const nomeExibicao = (mercado) => {
    const nome = (mercado.nome || '').trim()
    return nome || `Mercado ${mercado.posicao}`
  }

  const getNomeMercado = (id) => {
    const mercado = mercados.find((m) => m.id === id)
    return mercado ? nomeExibicao(mercado) : String(id)
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
      e.target.value = formatarPreco(numero)
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

  const renderMaisBarato = (d, item) => {
    const nPrecos = Object.keys(item.precos).length
    if (!d || d.menor_preco == null) {
      return <span>—</span>
    }
    if (nPrecos === 1) {
      return (
        <>
          <span className="mb-nome">{getNomeMercado(d.mercados_mais_baratos[0])}</span>
          <span className="mb-detalhe">único preço · {formatarMoeda(d.menor_preco)}</span>
        </>
      )
    }
    if (nPrecos > 1 && d.destacar === false) {
      return (
        <>
          <span className="mb-nome">Empate</span>
          <span className="mb-detalhe">{formatarMoeda(d.menor_preco)}</span>
        </>
      )
    }
    return (
      <>
        <span className="mb-nome">{d.mercados_mais_baratos.map((id) => getNomeMercado(id)).join(' · ')}</span>
        <span className="mb-detalhe">{formatarMoeda(d.menor_preco)} · poupa {formatarMoeda(d.poupa)}</span>
      </>
    )
  }

  const ranking = comparacao?.ranking ?? []
  const firstTotal = ranking[0]?.total
  const vencedores = comparacao?.vencedores ?? []

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
              {grupo.itens.map((item) => {
                const d = comparacao?.por_item?.[item.produto_id]
                return (
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
                      const menor = d?.destacar && d.mercados_mais_baratos?.includes(mercado.id)
                      return (
                        <td key={mercado.id} className={menor ? 'menor' : undefined}>
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
                    <td className="mais-barato">{renderMaisBarato(d, item)}</td>
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
                )
              })}
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr className="total-comum">
            <th colSpan={2}>Total dos itens em comum</th>
            {mercados.map((mercado) => {
              const rankingItem = ranking.find((r) => r.mercado_id === mercado.id)
              const total = rankingItem?.total
              const melhor = total != null && firstTotal != null && total === firstTotal
              return (
                <td key={mercado.id} className={melhor ? 'melhor' : undefined}>
                  {total != null ? formatarMoeda(total) : '—'}
                </td>
              )
            })}
            <td className="mais-barato">
              <strong>
                {vencedores.map((id) => getNomeMercado(id)).join(' · ')}
              </strong>
            </td>
            <td></td>
          </tr>
          <tr className="total-preenchido">
            <th colSpan={2}>Total de tudo que tem preço</th>
            {mercados.map((mercado) => {
              const total = comparacao?.totais_prenchidos?.[mercado.id]
              const qtdPrenchida = itens.filter((item) => item.precos[mercado.id] != null).length
              return (
                <td key={mercado.id}>
                  {total != null ? (
                    <>
                      {formatarMoeda(total)}
                      <small>{qtdPrenchida} de {itens.length} itens</small>
                    </>
                  ) : '—'}
                </td>
              )
            })}
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
