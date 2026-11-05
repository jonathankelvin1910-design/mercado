export const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)

export const parsePreco = (texto) => {
  if (texto == null) return null
  const str = String(texto).trim()
  if (str === '') return null

  let limpo = str.replace(/R?\$\s*/g, '')

  if (limpo.includes(',')) {
    // Vírgula é decimal; os pontos são separadores de milhar.
    limpo = limpo.replace(/\./g, '').replace(',', '.')
  } else {
    // Ponto é decimal (ex.: "5.49").
    limpo = limpo.replace(/\./g, '.')
  }

  const numero = Number(limpo)
  if (Number.isNaN(numero) || numero <= 0) return null
  return numero
}

export const formatarPreco = (numero) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero)
