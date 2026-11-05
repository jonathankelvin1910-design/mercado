import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000',
})

export const createTransacao = (dados) => api.post('/transacoes/', dados)

export const deleteTransacao = (id) => api.delete(`/transacoes/${id}`)
export const updateTransacao = (id, dados) => api.put(`/transacoes/${id}`, dados)
