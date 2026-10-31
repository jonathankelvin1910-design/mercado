# Mercado: comparador de preços da feira do mês

Aplicação web para montar a lista de compras do mês, digitar o preço de cada produto em até 6 mercados e descobrir em qual deles a compra sai mais barata.

**Tecnologias:** MySQL 8 · Python + FastAPI + SQLAlchemy + PyMySQL · React (Vite) + Axios

## Ordem de execução (fazer em etapas)
Pare após cada etapa e aguarde minha confirmação antes de continuar:
1. Banco de dados: `database/schema.sql` (já pronto, não alterar)
2. Backend (modelos, esquemas, rotas) e teste em `http://localhost:8000/docs`
3. Frontend (componentes e estilo)
4. Ligar frontend e backend e escrever o `README.md`

## Estrutura de pastas
```
mercado/
├── database/schema.sql
├── backend/
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── crud.py
│       ├── comparacao.py
│       └── routers/   (mercados, categorias, produtos, lista, precos, comparacao)
└── frontend/
    └── src/
        ├── App.jsx
        ├── api/index.js
        ├── utils/moeda.js
        └── components/
            ├── Mercados.jsx
            ├── Resultado.jsx
            ├── BuscaProduto.jsx
            └── TabelaLista.jsx
```

## Conceitos
- O preço é por **embalagem** (por exemplo, "Arroz branco 5 kg"). A quantidade multiplica o preço.
- Existem **6 mercados fixos** (posições 1 a 6). Os 3 primeiros já vêm com nome (Assaí, Atacadão, Novo Atacarejo); os outros 3 o usuário preenche (por exemplo, "Mercado de bairro"). Mercado sem nome aparece como "Mercado 4", "Mercado 5" e "Mercado 6".
- O catálogo tem 91 produtos em 8 categorias: Mercearia, Padaria e matinais, Hortifrúti, Carnes e ovos, Laticínios e frios, Bebidas, Limpeza e Higiene.
- A **lista** é o conjunto de produtos que o usuário vai comprar. Já começa com 16 produtos básicos.
- Um **preço** liga um produto a um mercado. Preço vazio significa "não pesquisado".

## Regras da comparação (calculadas no backend, em `comparacao.py`)
Valores em centavos ou `Decimal`, nunca `float`.
1. **Mercado com preço:** mercado que tem pelo menos 1 preço em algum item da lista.
2. **Itens em comum:** itens da lista que têm preço em TODOS os mercados com preço. A comparação só existe quando há pelo menos 2 mercados com preço e pelo menos 1 item em comum.
3. **Total em comum** de um mercado = soma de `preço × quantidade` dos itens em comum.
4. **Vencedor** = mercado com o menor total em comum. Se houver empate, todos os empatados são vencedores.
5. **Ranking** = mercados ordenados pelo total em comum, com a diferença em R$ e em % em relação ao vencedor.
6. **Por item:** o mais barato é o de menor preço. Só destacar quando o item tem 2 ou mais preços e o maior é diferente do menor. "Poupa" = maior preço menos menor preço. Preços iguais = "Empate".
7. **Compra dividida** = soma de `menor preço × quantidade` dos itens em comum. **Economia** = total do vencedor menos a compra dividida.
8. **Itens fora da comparação** = itens com algum preço que não estão em comum.
9. **Total de tudo que tem preço** por mercado = soma de `preço × quantidade` de todos os itens que o mercado tem, com a contagem "N de M itens".

## API
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verificação de saúde |
| GET | `/mercados/` | Lista os 6 mercados |
| PUT | `/mercados/{id}` | Altera o nome (máximo 30 caracteres, espaços nas pontas removidos) |
| GET | `/categorias/` | Lista as categorias em ordem |
| GET | `/produtos/?busca=arr` | Busca por parte do nome (sem diferenciar acentos), até 8 resultados, com o campo `na_lista` |
| POST | `/produtos/` | Cria produto novo (`nome`, `categoria_id`). Se o nome já existir, responde 409 |
| GET | `/lista/` | Itens da lista com produto, categoria, quantidade e preços por mercado |
| POST | `/lista/` | Adiciona produto à lista (`produto_id`), com a quantidade sugerida |
| PATCH | `/lista/{produto_id}` | Altera a quantidade (1 a 999) |
| DELETE | `/lista/{produto_id}` | Remove da lista |
| PUT | `/precos/` | Define o preço (`produto_id`, `mercado_id`, `valor`). Valor `null` apaga. Valor válido: maior que 0 e até 99999.99 |
| DELETE | `/precos/` | Apaga todos os preços |
| GET | `/comparacao/` | Resultado completo seguindo as regras acima |

## Frontend
- Tema escuro com variáveis CSS, no mesmo estilo do controle-gastos.
- **Mercados:** 6 campos de texto no topo; ao digitar, salva o nome.
- **Resultado:** faixa com o mercado mais barato, o total em "etiqueta amarela", o ranking e as notas (itens fora, compra dividida). Quando ainda não há comparação, mostra uma mensagem dizendo o que falta.
- **Busca de produto:** campo com autocomplete. Ao digitar as primeiras letras, lista sugestões (nome e categoria). Enter ou clique adiciona o produto à lista. Se não achar, oferece "Criar produto novo" com escolha de categoria.
- **Tabela da lista:** produtos agrupados por categoria, uma coluna por mercado com campo de preço, coluna de quantidade, coluna final **"Mais barato"** (nome do mercado, o preço e quanto poupa) e botão de remover. A célula do menor preço fica destacada em verde. No rodapé, dois totais por mercado: "itens em comum" e "tudo que tem preço".
- Preço digitado com vírgula ("5,49") ou ponto; ao sair do campo, formata como "5,49". Valor inválido fica com borda vermelha.
- Valores sempre em R$ no padrão brasileiro.
- Cada alteração de preço, quantidade ou lista recalcula a comparação na hora.
- Em telas pequenas, cada produto vira um cartão.

Existe um protótipo funcional em arquivo único (`prototipo.html`) que serve só de referência visual e de comportamento.
