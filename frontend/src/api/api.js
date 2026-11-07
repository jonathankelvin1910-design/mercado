import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000',
})

export const getMercados = () => api.get('/mercados/').then((r) => r.data)

export const putMercado = (id, nome) =>
  api.put(`/mercados/${id}`, { nome }).then((r) => r.data)

export const getCategorias = () => api.get('/categorias/').then((r) => r.data)

export const getProdutos = (busca) =>
  api.get('/produtos/', { params: { busca } }).then((r) => r.data)

export const postProduto = (nome, categoria_id) =>
  api.post('/produtos/', { nome, categoria_id }).then((r) => r.data)

export const getLista = () => api.get('/lista/').then((r) => r.data)

export const postLista = (produto_id) =>
  api.post('/lista/', { produto_id }).then((r) => r.data)

export const patchLista = (produto_id, quantidade) =>
  api.patch(`/lista/${produto_id}`, { quantidade }).then((r) => r.data)

export const deleteLista = (produto_id) =>
  api.delete(`/lista/${produto_id}`).then((r) => r.data)

export const putPreco = (produto_id, mercado_id, valor, tamanho = null) =>
  api.put('/precos/', { produto_id, mercado_id, valor, tamanho }).then((r) => r.data)

export const deletePrecos = () => api.delete('/precos/').then((r) => r.data)

export const getComparacao = () => api.get('/comparacao/').then((r) => r.data)
