import { useCallback, useEffect, useState } from 'react'
import {
  getMercados,
  putMercado,
  getCategorias,
  postProduto,
  getLista,
  postLista,
  patchLista,
  deleteLista,
  putPreco,
  deletePrecos,
  getComparacao,
} from './api/api'
import Mercados from './components/Mercados'
import Resultado from './components/Resultado'
import BuscaProduto from './components/BuscaProduto'
import TabelaLista from './components/TabelaLista'

function mensagemErro(e) {
  const detalhe = e?.response?.data?.detail
  if (typeof detalhe === 'string') return detalhe
  if (e?.response) return 'Não foi possível salvar. Confira o valor e tente de novo.'
  return 'Não foi possível falar com o servidor. Ele está rodando?'
}

export default function App() {
  const [mercados, setMercados] = useState([])
  const [categorias, setCategorias] = useState([])
  const [lista, setLista] = useState([])
  const [comparacao, setComparacao] = useState(null)
  const [erro, setErro] = useState('')
  const [confirmaLimpar, setConfirmaLimpar] = useState(false)

  useEffect(() => {
    let cancelado = false
    Promise.all([getMercados(), getCategorias(), getLista(), getComparacao()])
      .then(([m, c, l, cmp]) => {
        if (cancelado) return
        setMercados(m)
        setCategorias(c)
        setLista(l)
        setComparacao(cmp)
      })
      .catch((e) => {
        if (!cancelado) setErro(mensagemErro(e))
      })
    return () => {
      cancelado = true
    }
  }, [])

  const recarregar = useCallback(async () => {
    const [l, cmp] = await Promise.all([getLista(), getComparacao()])
    setLista(l)
    setComparacao(cmp)
  }, [])

  const executar = useCallback(
    async (acao) => {
      try {
        await acao()
        await recarregar()
        setErro('')
      } catch (e) {
        setErro(mensagemErro(e))
      }
    },
    [recarregar],
  )

  const renomear = useCallback(async (id, nome) => {
    try {
      await putMercado(id, nome)
      setMercados((atual) => atual.map((m) => (m.id === id ? { ...m, nome } : m)))
      setComparacao(await getComparacao())
      setErro('')
    } catch (e) {
      setErro(mensagemErro(e))
    }
  }, [])

  const adicionar = (produtoId) => executar(() => postLista(produtoId))

  const criar = (nome, categoriaId) =>
    executar(async () => {
      const produto = await postProduto(nome, categoriaId)
      await postLista(produto.id)
    })

  const alterarPreco = (produtoId, mercadoId, valor) =>
    executar(() => putPreco(produtoId, mercadoId, valor))

  const alterarQuantidade = (produtoId, quantidade) =>
    executar(() => patchLista(produtoId, quantidade))

  const remover = (produtoId) => executar(() => deleteLista(produtoId))

  const limparPrecos = () => {
    setConfirmaLimpar(false)
    return executar(() => deletePrecos())
  }

  return (
    <main className="app">
      <header className="topo">
        <h1>Mercado</h1>
        <p>Compare os preços da feira do mês</p>
      </header>

      {erro && (
        <div className="erro" role="alert">
          {erro}
        </div>
      )}

      <Mercados mercados={mercados} onRenomear={renomear} />

      <Resultado comparacao={comparacao} totalItens={lista.length} />

      <BuscaProduto
        onAdicionar={adicionar}
        categorias={categorias}
        onCriar={criar}
      />

      <TabelaLista
        itens={lista}
        mercados={mercados}
        comparacao={comparacao}
        onPreco={alterarPreco}
        onQuantidade={alterarQuantidade}
        onRemover={remover}
      />

      <div className="acoes">
        {confirmaLimpar ? (
          <>
            <span>Apagar todos os preços digitados?</span>
            <button type="button" className="perigo" onClick={limparPrecos}>
              Sim, apagar
            </button>
            <button type="button" onClick={() => setConfirmaLimpar(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirmaLimpar(true)}>
            Limpar preços
          </button>
        )}
      </div>
    </main>
  )
}
