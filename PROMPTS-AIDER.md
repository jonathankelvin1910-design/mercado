# Mercado com o Ornith 9B: passo a passo

Regras que funcionaram no controle-gastos:
- Um pedido pequeno por vez. Depois de cada um: `/diff`, teste, `/drop` (tira os arquivos) e `/clear`.
- Responda `y` só para arquivos dentro de `backend/app` ou `frontend/src`. Para `.env`, responda `n`.
- Se o Aider disser "request incomplete", rode `/chat-mode code` e envie só o pedido.
- O que está entre linhas `/add ...` são comandos do Aider. O texto do "Pedido" é uma mensagem separada.

---

## Etapa 0. Preparar a pasta (no Terminal do Mac)

```bash
mkdir -p ~/projetos/mercado/database ~/projetos/mercado/backend/app/routers
cd ~/projetos/mercado
git init
mv ~/Downloads/especificacao.md ~/Downloads/schema.sql ~/Downloads/prototipo.html . 2>/dev/null
mv schema.sql database/schema.sql
ls . database
```

Copie as configurações do Aider e os arquivos que já existem no outro projeto:

```bash
cp ../controle-gastos/.aider.model.settings.yml ../controle-gastos/.aider.conf.yml . 
cp ../controle-gastos/.gitignore .
cp ../controle-gastos/backend/requirements.txt backend/
cp ../controle-gastos/backend/.env.example backend/
cp ../controle-gastos/backend/app/database.py backend/app/
touch backend/app/__init__.py backend/app/routers/__init__.py
grep -n "getenv\|environ" backend/app/database.py
```

A última linha mostra os nomes das variáveis do banco. Se o nome do banco não for fixo no arquivo, ele vem do `.env`.

Crie o banco e dê acesso ao usuário `gastos` (o root do MySQL no Mac normalmente entra sem senha):

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS mercado CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON mercado.* TO 'gastos'@'localhost'; FLUSH PRIVILEGES;"
mysql -u gastos -p mercado < database/schema.sql
mysql -u gastos -p mercado -e "SELECT COUNT(*) AS produtos FROM produtos; SELECT COUNT(*) AS na_lista FROM lista_itens;"
```

Esperado: 91 produtos e 16 itens na lista.

Crie o `.env` do backend (copie o `.env.example`, troque `DB_NAME` para `mercado` e coloque a sua senha). Depois o ambiente Python:

```bash
cp backend/.env.example backend/.env
open -e backend/.env
cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cd ..
```

Primeiro commit:

```bash
git add -A && git commit -m "chore: estrutura inicial, especificação e schema do banco"
```

Abra o Aider com o 9B, do mesmo jeito que você abre no controle-gastos (se não lembrar o comando, rode `history | grep aider`).

---

## Etapa 2. Backend

### 2.1 Modelos
```
/add backend/app/models.py backend/app/database.py
/read-only database/schema.sql
```
Pedido:
```
Em backend/app/models.py, crie os modelos SQLAlchemy das tabelas do arquivo database/schema.sql: Categoria, Mercado, Produto, ListaItem e Preco. Use a Base de database.py. Em Produto, relacione com Categoria. Em ListaItem, a chave primária é produto_id. Em Preco, a chave primária é composta por produto_id e mercado_id, e o valor é Numeric(10, 2). Não crie rotas.
```
Depois: `/diff`, `/drop`, `/clear`.

### 2.2 Esquemas
```
/add backend/app/schemas.py
```
Pedido:
```
Em backend/app/schemas.py, crie esquemas Pydantic v2: MercadoOut (id, posicao, nome), MercadoUpdate (nome com strip e no máximo 30 caracteres, pode ser vazio), CategoriaOut (id, nome, ordem), ProdutoOut (id, nome, categoria_id, categoria_nome, quantidade_sugerida, na_lista booleano), ProdutoCreate (nome com strip, de 2 a 80 caracteres, e categoria_id), ListaAdd (produto_id), ListaQuantidade (quantidade inteira de 1 a 999), PrecoSet (produto_id, mercado_id, valor opcional: None apaga; se informado, maior que 0 e no máximo 99999.99). Use Annotated e Decimal.
```

### 2.3 Mercados e categorias
```
/add backend/app/crud.py backend/app/routers/mercados.py backend/app/routers/categorias.py backend/app/routers/__init__.py backend/app/models.py backend/app/schemas.py
```
Pedido:
```
Crie em crud.py as funções listar_mercados, atualizar_nome_mercado e listar_categorias (ordenadas por ordem). Crie os routers mercados.py (GET /mercados/ e PUT /mercados/{id}, 404 se não existir) e categorias.py (GET /categorias/). Registre os dois em routers/__init__.py. Siga o mesmo padrão de sessão (Depends(get_db)) de database.py.
```

### 2.4 main.py e primeiro teste
```
/add backend/app/main.py
```
Pedido:
```
Em backend/app/main.py, crie a aplicação FastAPI com título "Mercado", CORS liberado só para http://localhost:5173, Base.metadata.create_all na inicialização, a rota GET /health que devolve {"status": "ok"} e inclua os routers mercados e categorias.
```
Teste no Terminal (em outra aba):
```bash
cd ~/projetos/mercado/backend && source .venv/bin/activate && uvicorn app.main:app --reload
```
Abra `http://localhost:8000/docs` e teste `GET /mercados/` (devem vir 6) e `GET /categorias/` (devem vir 8). Commit:
```bash
git add -A && git commit -m "feat: modelos, mercados e categorias"
```

### 2.5 Produtos (busca e criação)
```
/add backend/app/crud.py backend/app/routers/produtos.py backend/app/routers/__init__.py backend/app/main.py
```
Pedido:
```
Crie em crud.py: buscar_produtos(db, busca) que filtra Produto.nome com ilike %busca% (o collation do MySQL já ignora acentos), limita a 8, ordena por nome e marca na_lista consultando ListaItem; e criar_produto(db, dados) que levanta erro se o nome já existir. Crie routers/produtos.py com GET /produtos/?busca= e POST /produtos/ (201; 409 se o nome existir; 404 se a categoria não existir). Registre o router em __init__.py e main.py.
```

### 2.6 Lista
```
/add backend/app/crud.py backend/app/routers/lista.py backend/app/routers/__init__.py backend/app/main.py
```
Pedido:
```
Crie em crud.py: listar_lista(db) que devolve, para cada item da lista, produto_id, nome, categoria_nome, categoria_ordem, quantidade e um dicionário precos {mercado_id: valor}; adicionar_na_lista(db, produto_id) com a quantidade_sugerida do produto; alterar_quantidade; remover_da_lista. Crie routers/lista.py com GET /lista/, POST /lista/ (201, 404 se o produto não existir, 409 se já estiver na lista), PATCH /lista/{produto_id} e DELETE /lista/{produto_id} (204, 404 se não estiver na lista). Registre o router.
```

### 2.7 Preços
```
/add backend/app/crud.py backend/app/routers/precos.py backend/app/routers/__init__.py backend/app/main.py
```
Pedido:
```
Crie em crud.py: definir_preco(db, produto_id, mercado_id, valor) que faz upsert, ou apaga o registro se valor for None; e apagar_todos_precos(db). Crie routers/precos.py com PUT /precos/ (404 se produto ou mercado não existir) e DELETE /precos/ (204). Registre o router.
```
Teste no `/docs`: defina 2 preços para o mesmo produto e confira com `GET /lista/`. Commit.

### 2.8 Comparação (o passo mais difícil: se o 9B errar, tente de novo com a regra repartida)
```
/add backend/app/comparacao.py backend/app/routers/comparacao.py backend/app/routers/__init__.py backend/app/main.py
/read-only backend/app/crud.py especificacao.md
```
Pedido:
```
Em backend/app/comparacao.py, crie a função calcular_comparacao(itens, mercados) que segue exatamente a seção "Regras da comparação" do especificacao.md. Entrada: itens = lista de dicionários {produto_id, nome, quantidade, precos: {mercado_id: Decimal}} (como devolve listar_lista) e mercados = lista de {id, posicao, nome}. Mercado sem nome usa "Mercado {posicao}". Saída: dicionário com mercados_com_preco, itens_em_comum (quantidade), ranking (lista ordenada com mercado_id, nome, total, diferenca, diferenca_percentual), vencedores (lista de nomes), compra_dividida, economia_dividindo, itens_fora (quantidade), totais_preenchidos (por mercado: total e quantidade de itens) e por_item (por produto_id: menor_preco, mercados_mais_baratos, poupa, destacar). Use Decimal. Sem acesso ao banco dentro dessa função.
```
Em seguida, outro pedido (sem os arquivos de comparação):
```
Crie routers/comparacao.py com GET /comparacao/ que chama listar_lista, listar_mercados e calcular_comparacao, e devolve o resultado. Registre o router.
```
Teste: no `/docs`, com 2 mercados e 3 produtos de preços conhecidos, confira o total e o vencedor à mão. Depois:
```bash
git add -A && git commit -m "feat: produtos, lista, preços e comparação"
```
Confirme comigo antes da etapa 3.

---

## Etapa 3. Frontend

Crie o projeto Vite (no Terminal, fora do Aider):
```bash
cd ~/projetos/mercado
npm create vite@latest frontend -- --template react
cd frontend && npm install && npm install axios && cd ..
```
Copie o CSS do outro projeto como ponto de partida e o cliente HTTP:
```bash
cp ../controle-gastos/frontend/src/index.css frontend/src/index.css
mkdir -p frontend/src/api frontend/src/utils frontend/src/components
cp ../controle-gastos/frontend/src/api/*.js frontend/src/api/ && ls frontend/src/api
```
Reabra o Aider na pasta `~/projetos/mercado` e apague o conteúdo de exemplo do Vite (`App.css` e o texto de `App.jsx`).

### 3.1 Cliente HTTP e moeda
```
/add frontend/src/api/index.js frontend/src/utils/moeda.js
/read-only especificacao.md
```
Pedido:
```
Em frontend/src/api/index.js, deixe uma instância axios com baseURL http://localhost:8000 e exporte funções para cada rota da API do especificacao.md: getMercados, putMercado, getCategorias, getProdutos(busca), postProduto, getLista, postLista, patchLista, deleteLista, putPreco, deletePrecos, getComparacao. Em frontend/src/utils/moeda.js, exporte formatarMoeda(valor) com Intl.NumberFormat pt-BR em BRL e parsePreco(texto) que aceita "5,49", "5.49" e "R$ 1.234,50" e devolve número ou null (null se for menor ou igual a zero).
```

### 3.2 Mercados
```
/add frontend/src/components/Mercados.jsx
```
Pedido:
```
Crie o componente Mercados.jsx com props mercados e onRenomear(id, nome). Mostra 6 campos de texto em grade (rótulo "Mercado 1" a "Mercado 6", placeholder "Nome do mercado"). Ao digitar, chama onRenomear depois de 500 ms sem digitar (debounce). Use as variáveis CSS do index.css.
```

### 3.3 Busca de produto
```
/add frontend/src/components/BuscaProduto.jsx
```
Pedido:
```
Crie BuscaProduto.jsx com props categorias, onAdicionar(produto_id) e onCriar(nome, categoria_id). Um campo de texto: a cada tecla, chama getProdutos(busca) e mostra até 8 sugestões abaixo, cada uma com nome e categoria; produtos com na_lista ficam apagados e não clicáveis. Setas cima/baixo mudam a sugestão ativa, Enter ou clique adiciona, Escape fecha. Se o texto tem 2 ou mais letras e não existe produto com exatamente esse nome, mostra "Produto novo" com um select de categorias e o botão "Criar e adicionar". Depois de adicionar, limpa o campo e mantém o foco nele.
```

### 3.4 Tabela da lista (dividir em duas partes)
Parte A:
```
/add frontend/src/components/TabelaLista.jsx
```
```
Crie TabelaLista.jsx com props itens, mercados, comparacao, onPreco(produto_id, mercado_id, valor), onQuantidade(produto_id, q), onRemover(produto_id). Tabela com colunas: Produto, Qtd, os 6 mercados (nome do mercado ou "Mercado N"), Mais barato e remover. Agrupe os itens por categoria_nome, em ordem de categoria_ordem, com uma linha de título por categoria. Cada célula de mercado tem um input de preço (placeholder 0,00); ao sair do campo, use parsePreco: se válido, formata com vírgula e chama onPreco; se vazio, chama onPreco com null; se inválido, borda vermelha. Sem rodapé ainda.
```
Parte B (pedido seguinte, mesmo arquivo):
```
Em TabelaLista.jsx, use comparacao.por_item para preencher a coluna "Mais barato" de cada linha: nome do mercado mais barato, o preço e "poupa R$ X"; quando destacar for verdadeiro, pinte a célula do menor preço de verde. Adicione o rodapé com duas linhas de totais por mercado: "Total dos itens em comum" (de comparacao.ranking) e "Total de tudo que tem preço" (de totais_preenchidos, com "N de M itens").
```

### 3.5 Resultado
```
/add frontend/src/components/Resultado.jsx
```
Pedido:
```
Crie Resultado.jsx com a prop comparacao. Se não houver ranking, mostra um título e um texto explicando o que falta (nenhum preço; só um mercado com preço; nenhum item com preço em todos os mercados com preço). Se houver, mostra: o nome do mercado vencedor (ou "Empate: A e B"), o total em uma etiqueta amarela, o ranking em lista com posição, nome, total e a diferença em R$ e %, e as notas: itens comparados, itens fora da comparação e a economia comprando cada item no mercado mais barato (só se for maior que zero).
```

---

## Etapa 4. Juntar tudo

### 4.1 App.jsx
```
/add frontend/src/App.jsx
/read-only frontend/src/api/index.js
```
Pedido:
```
Em App.jsx, carregue mercados, categorias, lista e comparação ao abrir. Renderize, em ordem: título "Mercado", Mercados, Resultado, BuscaProduto, TabelaLista. Depois de qualquer alteração (preço, quantidade, adicionar, remover, renomear), chame a API e recarregue lista e comparação. Mostre uma mensagem de erro simples se a API não responder. Adicione os botões "Limpar preços" (com confirmação em dois cliques) que chama deletePrecos.
```

### 4.2 Rodar e conferir
Backend em uma aba, frontend em outra:
```bash
cd ~/projetos/mercado/backend && source .venv/bin/activate && uvicorn app.main:app --reload
cd ~/projetos/mercado/frontend && npm run dev
```
Abra `http://localhost:5173`. Confira: busca por "arr", adicionar um produto, digitar preços em 2 mercados e ver o "Mais barato" e o resultado.

### 4.3 README
Peça no Aider, sem arquivos adicionados além do README:
```
Escreva o README.md do projeto Mercado apenas sobre o sistema e suas funcionalidades (sem guia de instalação detalhado): o que faz, funcionalidades, regras da comparação em linguagem simples, arquitetura em diagrama de texto, modelo de dados, tabela da API e próximas ideias. Use o especificacao.md como fonte.
```

Commit final:
```bash
git add -A && git commit -m "feat: frontend e README"
```
