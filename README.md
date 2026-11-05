# Mercado: comparador de preços da feira do mês

Aplicação web para montar a lista de compras do mês, digitar o preço de cada produto em até 6 mercados e descobrir em qual deles a compra sai mais barata.

**Tecnologias:** MySQL 8 · Python + FastAPI + SQLAlchemy + PyMySQL · React (Vite) + Axios

## O que ela faz

- **Seis mercados** configuráveis (os três primeiros já vêm nomeados: Assaí, Atacadão e Novo Atacarejo; os outros você nomeia).
- **Catálogo com 91 produtos** em 8 categorias (Mercearia, Padaria e matinais, Hortifrúti, Carnes e ovos, Laticínios e frios, Bebidas, Limpeza e Higiene) e uma lista inicial de 16 itens básicos.
- **Busca com autocomplete** para adicionar produtos à lista, sem diferenciar acentos. Se o produto não existe, dá para criar um novo escolhendo a categoria.
- **Tabela da lista** agrupada por categoria, com um campo de preço por mercado, quantidade e botão de remover. O preço é por embalagem e a quantidade multiplica.
- **Comparação automática** a cada alteração: mercado mais barato, ranking com a diferença em R$ e em %, menor preço de cada item e quanto se poupa, e totais no rodapé.
- **Compra dividida:** quanto sairia a compra se cada item fosse comprado no mercado mais barato dele.

## Como a comparação funciona

1. Um mercado "tem preço" quando pelo menos um item da lista tem preço nele.
2. **Itens em comum** são os que têm preço em todos os mercados que têm preço. A comparação exige pelo menos 2 mercados e 1 item em comum.
3. O total de cada mercado soma `preço × quantidade` dos itens em comum. Vence o menor total (empates dividem a vitória).
4. Por item, o menor preço só é destacado quando há 2 ou mais preços diferentes. "Poupa" é o maior preço menos o menor.
5. Itens com preço que não estão em comum aparecem como "fora da comparação", e um segundo rodapé soma tudo o que cada mercado tem preço.

Os cálculos usam `Decimal` no backend (`backend/app/comparacao.py`), nunca `float`.

## Estrutura

```
mercado/
├── database/schema.sql      # tabelas e dados iniciais
├── backend/
│   └── app/
│       ├── main.py          # aplicação FastAPI
│       ├── database.py      # conexão (lê o .env)
│       ├── models.py        # modelos SQLAlchemy
│       ├── schemas.py       # validação (Pydantic)
│       ├── crud.py          # acesso ao banco
│       ├── comparacao.py    # regras da comparação
│       └── routers/         # mercados, categorias, produtos, lista, precos, comparacao
└── frontend/
    └── src/
        ├── App.jsx
        ├── api/api.js
        ├── utils/moeda.js
        └── components/      # Mercados, Resultado, BuscaProduto, TabelaLista
```

## Como rodar

Requisitos: Python 3.11+, Node.js 20+ e MySQL 8.

### 1. Banco de dados

No MySQL, crie o banco e um usuário próprio (sem privilégios de administrador):

```sql
CREATE DATABASE IF NOT EXISTS mercado CHARACTER SET utf8mb4;
CREATE USER 'mercado_app'@'localhost' IDENTIFIED BY 'escolha-uma-senha';
GRANT ALL PRIVILEGES ON mercado.* TO 'mercado_app'@'localhost';
```

Depois carregue as tabelas e os dados iniciais:

```bash
mysql -u mercado_app -p mercado < database/schema.sql
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Crie o arquivo `backend/.env` (ele não vai para o Git):

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=mercado_app
DB_PASSWORD=a-senha-que-você-escolheu
DB_NAME=mercado
```

Suba a API:

```bash
uvicorn app.main:app --reload
```

A documentação interativa fica em <http://localhost:8000/docs>.

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra <http://localhost:5173>.

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verificação de saúde |
| GET | `/mercados/` | Lista os 6 mercados |
| PUT | `/mercados/{id}` | Altera o nome (até 30 caracteres) |
| GET | `/categorias/` | Lista as categorias em ordem |
| GET | `/produtos/?busca=arr` | Busca por parte do nome, com o campo `na_lista` |
| POST | `/produtos/` | Cria produto (`nome`, `categoria_id`); 409 se o nome já existir |
| GET | `/lista/` | Itens da lista com preços por mercado |
| POST | `/lista/` | Adiciona produto à lista |
| PATCH | `/lista/{produto_id}` | Altera a quantidade (1 a 999) |
| DELETE | `/lista/{produto_id}` | Remove da lista |
| PUT | `/precos/` | Define o preço (`valor` nulo apaga; válido: maior que 0 e até 99999.99) |
| DELETE | `/precos/` | Apaga todos os preços |
| GET | `/comparacao/` | Resultado completo da comparação |

## Segurança e boas práticas

- Credenciais do banco ficam em `backend/.env`, fora do Git.
- A aplicação usa um usuário próprio do MySQL, sem privilégios de administrador.
- CORS liberado apenas para `http://localhost:5173`.
- Entradas validadas com Pydantic; consultas feitas pelo SQLAlchemy (sem SQL montado por texto).
- Valores monetários em `Decimal`/`DECIMAL(10,2)`, nunca em ponto flutuante.

## Licença

MIT.
