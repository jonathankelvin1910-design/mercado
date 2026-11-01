from decimal import Decimal
from typing import Annotated, Optional

from pydantic import BaseModel, Field


class MercadoOut(BaseModel):
    id: int
    posicao: int
    nome: str


class MercadoUpdate(BaseModel):
    nome: Annotated[str, Field(min_length=0, max_length=30, strip=True)]


class CategoriaOut(BaseModel):
    id: int
    nome: str
    ordem: int


class ProdutoOut(BaseModel):
    id: int
    nome: str
    categoria_id: int
    categoria_nome: str
    quantidade_sugerida: int
    na_lista: bool


class ProdutoCreate(BaseModel):
    nome: Annotated[str, Field(min_length=2, max_length=80, strip=True)]
    categoria_id: int


class ListaAdd(BaseModel):
    produto_id: int


class ListaQuantidade(BaseModel):
    quantidade: int


class PrecoSet(BaseModel):
    produto_id: int
    mercado_id: int
    valor: Optional[Annotated[Decimal, Field(gt=0, le=Decimal('99999.99'))]] = None
