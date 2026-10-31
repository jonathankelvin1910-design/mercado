from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    SmallInteger,
    String,
    Numeric,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from .database import Base


class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(50), nullable=False, unique=True)
    ordem = Column(Integer, nullable=False)


class Mercado(Base):
    __tablename__ = "mercados"

    id = Column(Integer, primary_key=True, autoincrement=True)
    posicao = Column(SmallInteger, nullable=False, unique=True)
    nome = Column(String(30), nullable=False, default="")


class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(80), nullable=False, unique=True)
    categoria_id = Column(
        Integer,
        nullable=False,
        ForeignKey("categorias.id"),
    )
    quantidade_sugerida = Column(Integer, nullable=False, default=1)

    categoria = relationship("Categoria")


class ListaItem(Base):
    __tablename__ = "lista_itens"

    produto_id = Column(
        Integer,
        primary_key=True,
        ForeignKey("produtos.id"),
    )
    quantidade = Column(Integer, nullable=False, default=1)
    criado_em = Column(DateTime, nullable=False, default=datetime.now)

    produto = relationship("Produto")


class Preco(Base):
    __tablename__ = "precos"

    produto_id = Column(
        Integer,
        primary_key=True,
        ForeignKey("produtos.id"),
    )
    mercado_id = Column(
        Integer,
        primary_key=True,
        ForeignKey("mercados.id"),
    )
    valor = Column(Numeric(10, 2), nullable=False)

    produto = relationship("Produto")
    mercado = relationship("Mercado")
