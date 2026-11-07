from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models import Categoria, ListaItem, Mercado, Preco, Produto


def listar_mercados(db: Session):
    """Retorna todos os mercados ordenados por posicao."""
    return db.scalars(select(Mercado).order_by(Mercado.posicao)).all()


def atualizar_nome_mercado(db: Session, mercado_id: int, nome: str) -> Optional[Mercado]:
    """Atualiza o nome do mercado. Retorna o mercado atualizado ou None se não existir."""
    mercado = db.get(Mercado, mercado_id)
    if mercado is None:
        return None
    mercado.nome = nome
    db.commit()
    db.refresh(mercado)
    return mercado


def listar_categorias(db: Session):
    """Retorna todas as categorias ordenadas por ordem."""
    return db.scalars(select(Categoria).order_by(Categoria.ordem)).all()


def buscar_produtos(db: Session, busca: str):
    """Retorna uma lista de dicionários com produtos que correspondem à busca."""
    ids_na_lista = set(db.scalars(select(ListaItem.produto_id)).all())

    stmt = (
        select(Produto)
        .join(Categoria, Produto.categoria_id == Categoria.id)
        .where(
            Produto.nome.ilike(f"%{busca}%"),
        )
        .order_by(Produto.nome)
        .limit(8)
    )
    produtos = db.scalars(stmt).all()

    return [
        {
            "id": produto.id,
            "nome": produto.nome,
            "categoria_id": produto.categoria_id,
            "categoria_nome": produto.categoria.nome,
            "quantidade_sugerida": produto.quantidade_sugerida,
            "na_lista": produto.id in ids_na_lista,
        }
        for produto in produtos
    ]


def criar_produto(db: Session, dados):
    """Cria um novo produto, lendo a medida do nome (ex.: 200 g, 1 L)."""
    from app.medidas import medida_do_nome

    produto_existente = db.scalars(
        select(Produto).where(func.lower(Produto.nome) == func.lower(dados.nome))
    ).first()
    if produto_existente is not None:
        raise ValueError("nome_existente")

    categoria = db.get(Categoria, dados.categoria_id)
    if categoria is None:
        raise ValueError("categoria_inexistente")

    unidade, tamanho_padrao = medida_do_nome(dados.nome)
    produto = Produto(
        nome=dados.nome,
        categoria_id=dados.categoria_id,
        quantidade_sugerida=1,
        unidade=unidade,
        tamanho_padrao=tamanho_padrao,
    )
    db.add(produto)
    db.commit()
    db.refresh(produto)
    return produto


def listar_lista(db: Session):
    """Retorna os itens da lista de compras ordenados por categoria e nome do produto."""
    stmt = (
        select(ListaItem, Produto, Categoria)
        .join(Produto, ListaItem.produto_id == Produto.id)
        .join(Categoria, Produto.categoria_id == Categoria.id)
        .order_by(Categoria.ordem, Produto.nome)
    )
    itens = db.execute(stmt).all()

    resultado = []
    for item, produto, categoria in itens:
        linhas_preco = db.scalars(
            select(Preco).where(Preco.produto_id == produto.id)
        ).all()
        precos = {p.mercado_id: p.valor for p in linhas_preco}
        tamanhos = {
            p.mercado_id: p.tamanho for p in linhas_preco if p.tamanho is not None
        }
        resultado.append(
            {
                "produto_id": item.produto_id,
                "nome": produto.nome,
                "categoria_id": categoria.id,
                "categoria_nome": categoria.nome,
                "categoria_ordem": categoria.ordem,
                "quantidade": item.quantidade,
                "precos": precos,
                "unidade": produto.unidade,
                "tamanho_padrao": produto.tamanho_padrao,
                "tamanhos": tamanhos,
            }
        )
    return resultado


def adicionar_na_lista(db: Session, produto_id: int):
    """Adiciona um produto à lista usando a quantidade_sugerida."""
    produto = db.get(Produto, produto_id)
    if produto is None:
        raise ValueError("produto_inexistente")

    item = db.get(ListaItem, produto_id)
    if item is not None:
        raise ValueError("ja_na_lista")

    item = ListaItem(produto_id=produto_id, quantidade=produto.quantidade_sugerida)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def alterar_quantidade(db: Session, produto_id: int, quantidade: int):
    """Atualiza a quantidade de um produto na lista. Retorna o item atualizado ou None."""
    item = db.get(ListaItem, produto_id)
    if item is None:
        return None
    item.quantidade = quantidade
    db.commit()
    db.refresh(item)
    return item


def remover_da_lista(db: Session, produto_id: int) -> bool:
    """Remove um produto da lista. Retorna True se removeu, False se não estava na lista."""
    item = db.get(ListaItem, produto_id)
    if item is None:
        return False
    db.delete(item)
    db.commit()
    return True


def definir_preco(db: Session, produto_id: int, mercado_id: int, valor, tamanho=None):
    """Define o preço de um produto em um mercado.

    Levanta ValueError("produto_inexistente") se o produto não existir e
    ValueError("mercado_inexistente") se o mercado não existir. Se valor for None,
    remove o registro de preço (se existir) e devolve None. Caso contrário, faz
    upsert (atualiza o valor se o registro existir, ou cria um novo), faz commit e
    devolve o Preco.
    """
    produto = db.get(Produto, produto_id)
    if produto is None:
        raise ValueError("produto_inexistente")

    mercado = db.get(Mercado, mercado_id)
    if mercado is None:
        raise ValueError("mercado_inexistente")

    if valor is None:
        preco = db.get(Preco, (produto_id, mercado_id))
        if preco is not None:
            db.delete(preco)
            db.commit()
        return None

    preco = db.get(Preco, (produto_id, mercado_id))
    if preco is None:
        preco = Preco(
            produto_id=produto_id, mercado_id=mercado_id, valor=valor, tamanho=tamanho
        )
        db.add(preco)
    else:
        preco.valor = valor
        preco.tamanho = tamanho
    db.commit()
    db.refresh(preco)
    return preco


def apagar_todos_precos(db: Session):
    """Apaga todos os registros de preço e faz commit."""
    db.query(Preco).delete()
    db.commit()
