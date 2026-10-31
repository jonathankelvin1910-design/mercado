-- Mercado: banco de dados com produtos de exemplo
CREATE DATABASE IF NOT EXISTS mercado CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mercado;

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  ordem INT NOT NULL
);

CREATE TABLE IF NOT EXISTS mercados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  posicao TINYINT NOT NULL UNIQUE,
  nome VARCHAR(30) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL UNIQUE,
  categoria_id INT NOT NULL,
  quantidade_sugerida INT NOT NULL DEFAULT 1,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS lista_itens (
  produto_id INT PRIMARY KEY,
  quantidade INT NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS precos (
  produto_id INT NOT NULL,
  mercado_id INT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (produto_id, mercado_id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  FOREIGN KEY (mercado_id) REFERENCES mercados(id) ON DELETE CASCADE
);

-- Categorias
INSERT IGNORE INTO categorias (nome, ordem) VALUES
  ('Mercearia', 1),
  ('Padaria e matinais', 2),
  ('Hortifrúti', 3),
  ('Carnes e ovos', 4),
  ('Laticínios e frios', 5),
  ('Bebidas', 6),
  ('Limpeza', 7),
  ('Higiene', 8);

-- Seis mercados: os 3 primeiros já com nome, os 3 últimos para o usuário preencher
INSERT IGNORE INTO mercados (posicao, nome) VALUES
  (1, 'Assaí'), (2, 'Atacadão'), (3, 'Novo Atacarejo'), (4, ''), (5, ''), (6, '');

-- Produtos (preço é por embalagem; a quantidade sugerida pode ser alterada na lista)
INSERT IGNORE INTO produtos (nome, categoria_id, quantidade_sugerida) VALUES
  ('Arroz branco 5 kg', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 2),
  ('Feijão carioca 1 kg', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 2),
  ('Feijão preto 1 kg', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Macarrão espaguete 500 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 3),
  ('Macarrão parafuso 500 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Açúcar refinado 1 kg', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 2),
  ('Sal refinado 1 kg', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Óleo de soja 900 ml', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 2),
  ('Azeite de oliva 500 ml', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Farinha de trigo 1 kg', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Farinha de mandioca 1 kg', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Fubá 500 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Goma de tapioca 1 kg', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Molho de tomate 340 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 2),
  ('Extrato de tomate 300 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Milho verde em lata 170 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Sardinha em lata 125 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Atum em lata 170 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Vinagre 750 ml', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Maionese 500 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Ketchup 380 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Café torrado 500 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Achocolatado em pó 400 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Leite condensado 395 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1),
  ('Creme de leite 200 g', (SELECT id FROM categorias WHERE nome = 'Mercearia'), 1);

INSERT IGNORE INTO produtos (nome, categoria_id, quantidade_sugerida) VALUES
  ('Pão de forma 500 g', (SELECT id FROM categorias WHERE nome = 'Padaria e matinais'), 1),
  ('Pão francês 1 kg', (SELECT id FROM categorias WHERE nome = 'Padaria e matinais'), 1),
  ('Biscoito cream cracker 400 g', (SELECT id FROM categorias WHERE nome = 'Padaria e matinais'), 1),
  ('Biscoito maisena 400 g', (SELECT id FROM categorias WHERE nome = 'Padaria e matinais'), 1),
  ('Biscoito recheado 140 g', (SELECT id FROM categorias WHERE nome = 'Padaria e matinais'), 1),
  ('Cereal matinal 300 g', (SELECT id FROM categorias WHERE nome = 'Padaria e matinais'), 1),
  ('Aveia em flocos 200 g', (SELECT id FROM categorias WHERE nome = 'Padaria e matinais'), 1),
  ('Margarina 500 g', (SELECT id FROM categorias WHERE nome = 'Padaria e matinais'), 1);

INSERT IGNORE INTO produtos (nome, categoria_id, quantidade_sugerida) VALUES
  ('Tomate 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Cebola 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Batata inglesa 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Cenoura 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Alho 100 g', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Pimentão verde 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Repolho 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Alface unidade', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Coentro maço', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Macaxeira 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Inhame 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Banana prata 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Maçã 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Laranja 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Limão 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Mamão 1 kg', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1),
  ('Abacaxi unidade', (SELECT id FROM categorias WHERE nome = 'Hortifrúti'), 1);

INSERT IGNORE INTO produtos (nome, categoria_id, quantidade_sugerida) VALUES
  ('Ovos cartela 30 un', (SELECT id FROM categorias WHERE nome = 'Carnes e ovos'), 1),
  ('Peito de frango 1 kg', (SELECT id FROM categorias WHERE nome = 'Carnes e ovos'), 2),
  ('Frango inteiro 1 kg', (SELECT id FROM categorias WHERE nome = 'Carnes e ovos'), 1),
  ('Coxa e sobrecoxa 1 kg', (SELECT id FROM categorias WHERE nome = 'Carnes e ovos'), 1),
  ('Carne moída 1 kg', (SELECT id FROM categorias WHERE nome = 'Carnes e ovos'), 1),
  ('Acém 1 kg', (SELECT id FROM categorias WHERE nome = 'Carnes e ovos'), 1),
  ('Charque 500 g', (SELECT id FROM categorias WHERE nome = 'Carnes e ovos'), 1),
  ('Linguiça toscana 1 kg', (SELECT id FROM categorias WHERE nome = 'Carnes e ovos'), 1),
  ('Filé de tilápia 1 kg', (SELECT id FROM categorias WHERE nome = 'Carnes e ovos'), 1);

INSERT IGNORE INTO produtos (nome, categoria_id, quantidade_sugerida) VALUES
  ('Leite integral 1 L', (SELECT id FROM categorias WHERE nome = 'Laticínios e frios'), 6),
  ('Leite em pó 400 g', (SELECT id FROM categorias WHERE nome = 'Laticínios e frios'), 1),
  ('Manteiga 200 g', (SELECT id FROM categorias WHERE nome = 'Laticínios e frios'), 1),
  ('Requeijão 200 g', (SELECT id FROM categorias WHERE nome = 'Laticínios e frios'), 1),
  ('Iogurte natural 170 g', (SELECT id FROM categorias WHERE nome = 'Laticínios e frios'), 1),
  ('Queijo mussarela 1 kg', (SELECT id FROM categorias WHERE nome = 'Laticínios e frios'), 1),
  ('Queijo coalho 1 kg', (SELECT id FROM categorias WHERE nome = 'Laticínios e frios'), 1),
  ('Presunto 1 kg', (SELECT id FROM categorias WHERE nome = 'Laticínios e frios'), 1),
  ('Mortadela 1 kg', (SELECT id FROM categorias WHERE nome = 'Laticínios e frios'), 1);

INSERT IGNORE INTO produtos (nome, categoria_id, quantidade_sugerida) VALUES
  ('Refrigerante 2 L', (SELECT id FROM categorias WHERE nome = 'Bebidas'), 2),
  ('Suco de caixinha 1 L', (SELECT id FROM categorias WHERE nome = 'Bebidas'), 1),
  ('Água mineral 1,5 L', (SELECT id FROM categorias WHERE nome = 'Bebidas'), 1),
  ('Cerveja lata 350 ml', (SELECT id FROM categorias WHERE nome = 'Bebidas'), 1),
  ('Água de coco 1 L', (SELECT id FROM categorias WHERE nome = 'Bebidas'), 1);

INSERT IGNORE INTO produtos (nome, categoria_id, quantidade_sugerida) VALUES
  ('Detergente 500 ml', (SELECT id FROM categorias WHERE nome = 'Limpeza'), 3),
  ('Sabão em pó 1 kg', (SELECT id FROM categorias WHERE nome = 'Limpeza'), 1),
  ('Sabão em barra 5 un', (SELECT id FROM categorias WHERE nome = 'Limpeza'), 1),
  ('Amaciante 2 L', (SELECT id FROM categorias WHERE nome = 'Limpeza'), 1),
  ('Água sanitária 2 L', (SELECT id FROM categorias WHERE nome = 'Limpeza'), 1),
  ('Desinfetante 2 L', (SELECT id FROM categorias WHERE nome = 'Limpeza'), 1),
  ('Multiuso 500 ml', (SELECT id FROM categorias WHERE nome = 'Limpeza'), 1),
  ('Esponja de cozinha 3 un', (SELECT id FROM categorias WHERE nome = 'Limpeza'), 1),
  ('Papel toalha 2 rolos', (SELECT id FROM categorias WHERE nome = 'Limpeza'), 1),
  ('Saco de lixo 30 L', (SELECT id FROM categorias WHERE nome = 'Limpeza'), 1);

INSERT IGNORE INTO produtos (nome, categoria_id, quantidade_sugerida) VALUES
  ('Papel higiênico 12 rolos', (SELECT id FROM categorias WHERE nome = 'Higiene'), 1),
  ('Sabonete 85 g', (SELECT id FROM categorias WHERE nome = 'Higiene'), 1),
  ('Shampoo 350 ml', (SELECT id FROM categorias WHERE nome = 'Higiene'), 1),
  ('Condicionador 350 ml', (SELECT id FROM categorias WHERE nome = 'Higiene'), 1),
  ('Creme dental 90 g', (SELECT id FROM categorias WHERE nome = 'Higiene'), 1),
  ('Desodorante 150 ml', (SELECT id FROM categorias WHERE nome = 'Higiene'), 1),
  ('Escova de dente unidade', (SELECT id FROM categorias WHERE nome = 'Higiene'), 1),
  ('Absorvente pacote', (SELECT id FROM categorias WHERE nome = 'Higiene'), 1);

-- Lista inicial
INSERT IGNORE INTO lista_itens (produto_id, quantidade)
SELECT id, quantidade_sugerida FROM produtos WHERE nome IN (
  'Arroz branco 5 kg',
  'Feijão carioca 1 kg',
  'Macarrão espaguete 500 g',
  'Açúcar refinado 1 kg',
  'Óleo de soja 900 ml',
  'Café torrado 500 g',
  'Leite integral 1 L',
  'Farinha de mandioca 1 kg',
  'Ovos cartela 30 un',
  'Peito de frango 1 kg',
  'Tomate 1 kg',
  'Cebola 1 kg',
  'Detergente 500 ml',
  'Sabão em pó 1 kg',
  'Papel higiênico 12 rolos',
  'Refrigerante 2 L'
);
