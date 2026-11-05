import { useState, useEffect, useRef } from 'react'

export default function Mercados({ mercados, onRenomear }) {
  const [valores, setValores] = useState(() => {
    const inicial = {}
    mercados.forEach((mercado) => {
      inicial[mercado.id] = mercado.nome
    })
    return inicial
  })

  const timersRef = useRef({})

  useEffect(() => {
    mercados.forEach((mercado) => {
      const valor = valores[mercado.id]
      if (valor === undefined) return
      if (valor.trim() !== mercado.nome) {
        if (timersRef.current[mercado.id]) {
          clearTimeout(timersRef.current[mercado.id])
        }
        timersRef.current[mercado.id] = setTimeout(() => {
          onRenomear(mercado.id, valor.trim())
        }, 500)
      }
    })

    return () => {
      Object.values(timersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
      timersRef.current = {}
    }
  }, [valores, mercados, onRenomear])

  const alterarNome = (id, nome) => {
    setValores((prev) => ({ ...prev, [id]: nome }))
  }

  return (
    <section className="painel">
      <div className="mercados-grade">
        {mercados.map((mercado) => (
          <div className="campo-mercado" key={mercado.id}>
            <label htmlFor={`mercado-${mercado.id}`}>
              Mercado {mercado.posicao}
            </label>
            <input
              id={`mercado-${mercado.id}`}
              type="text"
              placeholder="Nome do mercado"
              maxLength={30}
              value={valores[mercado.id] ?? mercado.nome}
              onChange={(e) => alterarNome(mercado.id, e.target.value)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
