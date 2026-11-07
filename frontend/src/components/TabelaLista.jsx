import { Fragment, useState } from 'react'
import {
  parsePreco,
  formatarPreco,
  formatarMoeda,
  parseTamanho,
  formatarTamanho,
} from '../utils/moeda'

const EXEMPLO = { g: 'ex.: 800 g', ml: 'ex.: 3 L', m: 'ex.: 30 m', un: 'ex.: 12 un' }

export default function TabelaLista({ itens, mercados, comparacao, onPreco, onQuantidade, onRemover }) {
  const [informarTamanho, setInformarTamanho] = useState(false)

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

  const handleBlurPreco = (produto_id, mercado, precoAtual, tamanhoAtual) => (e) => {
    const texto = e.target.value
    const numero = parsePreco(texto)
    if (numero != null) {
      e.target.value = formatarPreco(numero)
      if (numero !== precoAtual) {
        onPreco(produto_id, mercado.id, numero, tamanhoAtual)
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

  const handleBlurTamanho = (item, mercado, precoAtual, tamanhoAtual) => (e) => {
    const texto = e.target.value
    if (texto.trim() === '') {
      if (tamanhoAtual != null) {
        onPreco(item.produto_id, mercado.id, precoAtual, null)
      }
      return
    }
    const tamanho = parseTamanho(texto, item.unidade)
    if (tamanho == null) {
      e.target.classList.add('invalido')
      e.target.setAttribute('aria-invalid', 'true')
      return
    }
    e.target.value = formatarTamanho(tamanho, item.unidade)
    if (tamanho !== tamanhoAtual) {
      onPreco(item.produto_id, mercado.id, precoAtual, tamanho)
    }
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
      <label className="opcao-tamanho">
        <input
          type="checkbox"
          checked={informarTamanho}
          onChange={(e) => setInformarTamanho(e.target.checked)}
        />
        Se deseja comparar por "volume, peso, tamanho", click aqui!
      </label>
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
                      const tamanhoAtual = item.tamanhos?.[mercado.id] ?? null
                      const porMedida = d?.por_medida?.por_medida?.[mercado.id]
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
                            onBlur={handleBlurPreco(item.produto_id, mercado, precoAtual, tamanhoAtual)}
                            onInput={handleInputPreco}
                            onKeyDown={handleTecla}
                          />
                          {informarTamanho && item.unidade && precoAtual != null && (
                            <input
                              type="text"
                              className="tamanho"
                              placeholder={EXEMPLO[item.unidade]}
                              autoComplete="off"
                              aria-label={`volume do item ${item.nome} no ${nomeExibicao(mercado)}`}
                              defaultValue={tamanhoAtual != null ? formatarTamanho(tamanhoAtual, item.unidade) : ''}
                              key={`${item.produto_id}-${mercado.id}-t-${tamanhoAtual}-${precoAtual}`}
                              onBlur={handleBlurTamanho(item, mercado, precoAtual, tamanhoAtual)}
                              onInput={handleInputPreco}
                              onKeyDown={handleTecla}
                            />
                          )}
                          {porMedida != null && precoAtual != null && (
                            <small className="por-medida">
                              {tamanhoAtual != null && `${formatarTamanho(tamanhoAtual, item.unidade)} · `}
                              {formatarMoeda(porMedida)}/{d.por_medida.unidade}
                            </small>
                          )}
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
                {vencedores.join(' · ')}
              </strong>
            </td>
            <td></td>
          </tr>
          <tr className="total-preenchido">
            <th colSpan={2}>Total de tudo que tem preço</th>
            {mercados.map((mercado) => {
              const tp = comparacao?.totais_preenchidos?.[mercado.id]
              return (
                <td key={mercado.id}>
                  {tp ? (
<>
{formatarMoeda(tp.total)}
<small>{tp.itens} de {itens.length} itens</small>
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
