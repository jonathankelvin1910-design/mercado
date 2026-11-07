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

const FATORES = {
  g: { g: 1, kg: 1000 },
  ml: { ml: 1, l: 1000 },
  m: { m: 1, cm: 0.01 },
  un: { un: 1 },
}

// Texto digitado ("3 L", "800 g", "1,5 kg", "30 m") -> número na unidade base
// (g, ml, m ou un). Em g e ml a unidade é obrigatória; em m e un pode faltar.
export function parseTamanho(texto, unidade) {
  const fatores = FATORES[unidade]
  if (!fatores) return null
  const achado = String(texto ?? '')
    .trim()
    .toLowerCase()
    .match(/^(\d+(?:[.,]\d+)?)\s*([a-z]*)$/)
  if (!achado) return null
  const numero = Number(achado[1].replace(',', '.'))
  const sufixo = achado[2] || (unidade === 'm' || unidade === 'un' ? unidade : '')
  const fator = fatores[sufixo]
  if (!fator || !(numero > 0)) return null
  const valor = Math.round(numero * fator * 1000) / 1000
  return valor > 0 && valor <= 9999999 ? valor : null
}

// Número na unidade base -> texto legível ("5 kg", "800 g", "3 L", "30 m").
export function formatarTamanho(valor, unidade) {
  const n = Number(valor)
  if (!(n > 0)) return ''
  const fmt = (x) => String(Math.round(x * 1000) / 1000).replace('.', ',')
  if (unidade === 'g') return n >= 1000 ? `${fmt(n / 1000)} kg` : `${fmt(n)} g`
  if (unidade === 'ml') return n >= 1000 ? `${fmt(n / 1000)} L` : `${fmt(n)} ml`
  return `${fmt(n)} ${unidade}`
}
