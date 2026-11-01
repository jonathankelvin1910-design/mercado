from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Categoria, Mercado


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
