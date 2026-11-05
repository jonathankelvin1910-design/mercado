import { formatarMoeda } from '../utils/moeda'

export default function Resultado({ comparacao, totalItens }) {
  if (!comparacao) {
    return (
      <section className="resultado">
        <p className="vazio">Carregando…</p>
      </section>
    )
  }

  if (comparacao.ranking.length === 0) {
    let mensagem

    if (totalItens === 0) {
      mensagem = 'Adicione produtos à lista para começar.'
    } else if (comparacao.mercados_com_preco.length < 2) {
      mensagem =
        'Preencha preços em pelo menos 2 mercados para ver a comparação.'
    } else {
      mensagem =
        'Nenhum item tem preço em todos os mercados preenchidos. Preencha os mesmos itens em todos eles.'
    }

    return (
      <section className="resultado">
        <p className="vazio">{mensagem}</p>
      </section>
    )
  }

  const empate = comparacao.vencedores.length > 1
  const prefixo = empate ? 'Empate: ' : 'Mais barato: '

  const mostraItensFora = comparacao.itens_fora > 0
  const mostraEconomia = Number(comparacao.economia_dividindo) > 0

  return (
    <section className="resultado">
      <div className="faixa">
        <h2>
          {prefixo}
          {comparacao.vencedores.join(' · ')}
        </h2>
        <span className="etiqueta">
          {formatarMoeda(Number(comparacao.ranking[0].total))}
        </span>
        <small>
          {comparacao.itens_em_comum}{' '}
          {comparacao.itens_em_comum === 1 ? 'item em comum' : 'itens em comum'}
        </small>
      </div>

      <ol className="ranking">
        {comparacao.ranking.map((r, i) => (
          <li
            key={r.mercado_id}
            className={
              Number(r.total) === Number(comparacao.ranking[0].total)
                ? 'primeiro'
                : undefined
            }
          >
            <span className="pos">{i + 1}</span>
            <span className="nome">{r.nome}</span>
            <span className="total">{formatarMoeda(Number(r.total))}</span>
            {Number(r.diferenca) > 0 && (
              <span className="dif">
                + {formatarMoeda(Number(r.diferenca))} (+
                {Number(r.diferenca_percentual).toFixed(1).replace('.', ',')}%)
              </span>
            )}
          </li>
        ))}
      </ol>

      {(mostraItensFora || mostraEconomia) && (
        <div className="notas">
          {mostraItensFora && (
            <p>
              {comparacao.itens_fora === 1
                ? '1 item tem preço, mas ficou fora da comparação porque falta preço em algum mercado.'
                : `${comparacao.itens_fora} itens têm preço, mas ficaram fora da comparação porque falta preço em algum mercado.`}
            </p>
          )}
          {mostraEconomia && (
            <p>
              Dividindo a compra entre os mercados mais baratos de cada item, o total dos itens em comum cai para {formatarMoeda(Number(comparacao.compra_dividida))} (economia de {formatarMoeda(Number(comparacao.economia_dividindo))}).
            </p>
          )}
        </div>
      )}
    </section>
  )
}
