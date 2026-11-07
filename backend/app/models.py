from sqlalchemy import (
    TIMESTAMP,
    Column,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    func,
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
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)
    quantidade_sugerida = Column(Integer, nullable=False, default=1)
    unidade = Column(String(2), nullable=True)
    tamanho_padrao = Column(Numeric(12, 3), nullable=True)

    categoria = relationship("Categoria")


class ListaItem(Base):
    __tablename__ = "lista_itens"

    produto_id = Column(
        Integer, ForeignKey("produtos.id", ondelete="CASCADE"), primary_key=True
    )
    quantidade = Column(Integer, nullable=False, default=1)
    criado_em = Column(TIMESTAMP, nullable=False, server_default=func.now())

    produto = relationship("Produto")


class Preco(Base):
    __tablename__ = "precos"

    produto_id = Column(
        Integer, ForeignKey("produtos.id", ondelete="CASCADE"), primary_key=True
    )
    mercado_id = Column(
        Integer, ForeignKey("mercados.id", ondelete="CASCADE"), primary_key=True
    )
    valor = Column(Numeric(10, 2), nullable=False)
    tamanho = Column(Numeric(12, 3), nullable=True)

    produto = relationship("Produto")
    mercado = relationship("Mercado")
