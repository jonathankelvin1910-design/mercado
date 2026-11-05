import { useEffect, useRef, useState } from 'react'
import { getProdutos } from '../api/api'

export default function BuscaProduto({ onAdicionar }) {
  const [texto, setTexto] = useState('')
  const [sugestoes, setSugestoes] = useState([])
  const [ativa, setAtiva] = useState(-1)
  const [aberta, setAberta] = useState(false)

  const inputRef = useRef(null)

  useEffect(() => {
    const semEspacos = texto.replace(/\s/g, '')

    if (semEspacos.length < 1) {
      setSugestoes([])
      setAberta(false)
      setAtiva(-1)
      return
    }

    let cancelado = false
    getProdutos(texto)
      .then((resultados) => {
        if (cancelado) return
        setSugestoes(resultados)
        setAberta(true)
        const indice = resultados.findIndex((p) => !p.na_lista)
        setAtiva(indice)
      })
      .catch(() => {
        if (!cancelado) {
          setSugestoes([])
          setAberta(false)
          setAtiva(-1)
        }
      })

    return () => {
      cancelado = true
    }
  }, [texto])

  const moverAtiva = (direcao) => {
    const candidatos = sugestoes
      .map((_, i) => i)
      .filter((i) => !sugestoes[i].na_lista)
    if (candidatos.length === 0) return
    const pos = candidatos.indexOf(ativa)
    let idx
    if (direcao === 'baixo') {
      idx = pos === -1 ? 0 : candidatos[(pos + 1) % candidatos.length]
    } else {
      idx =
        pos === -1
          ? candidatos[candidatos.length - 1]
          : candidatos[(pos - 1 + candidatos.length) % candidatos.length]
    }
    setAtiva(idx)
  }

  const adicionar = (produto) => {
    onAdicionar(produto.id)
    setTexto('')
    setSugestoes([])
    setAberta(false)
    setAtiva(-1)
    inputRef.current?.focus()
  }

  const handleChange = (e) => setTexto(e.target.value)

  const handleTecla = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      moverAtiva('baixo')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moverAtiva('cima')
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (ativa !== -1) {
        const produto = sugestoes[ativa]
        if (produto && !produto.na_lista) adicionar(produto)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setAberta(false)
      setAtiva(-1)
    }
  }

  const handleClique = (produto) => (e) => {
    e.preventDefault()
    if (produto && !produto.na_lista) adicionar(produto)
  }

  const handleFoco = () => setAberta(sugestoes.length > 0)

  return (
    <div className="busca-produto">
      <label htmlFor="busca-produto">Adicionar produto</label>
      <input
        id="busca-produto"
        ref={inputRef}
        type="text"
        autoComplete="off"
        role="combobox"
        placeholder="Digite as primeiras letras: arr, fei, det…"
        value={texto}
        onChange={handleChange}
        onKeyDown={handleTecla}
        onFocus={handleFoco}
        onBlur={() => setAberta(false)}
        aria-expanded={aberta && sugestoes.length > 0}
        aria-controls="sugestoes-produto"
      />
      {aberta && sugestoes.length > 0 && (
        <ul className="sugestoes" id="sugestoes-produto" role="listbox">
          {sugestoes.map((produto, indice) => (
            <li
              key={produto.id}
              role="option"
              aria-selected={indice === ativa}
              className={[
                'sugestao',
                produto.na_lista ? 'na-lista' : '',
                indice === ativa ? 'ativa' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseDown={handleClique(produto)}
            >
              <span className="sugestao-info">
                <span className="sugestao-nome">{produto.nome}</span>
                <span className="sugestao-categoria">{produto.categoria_nome}</span>
              </span>
              {produto.na_lista && (
                <span className="sugestao-status">na lista</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
