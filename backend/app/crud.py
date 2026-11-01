from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Categoria, ListaItem, Mercado, Produto


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
    na_lista = select(ListaItem.produto_id)

    stmt = (
        select(Produto)
        .join(Categoria, Produto.categoria_id == Categoria.id)
        .where(
            Produto.nome.ilike(f"%{busca}%"),
            Produto.id.in_(na_lista),
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
            "na_lista": True,
        }
        for produto in produtos
    ]
