from decimal import Decimal
from typing import Annotated, Optional

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


class MercadoOut(BaseModel):
    id: int
    posicao: int
    nome: str

    model_config = ConfigDict(from_attributes=True)


class MercadoUpdate(BaseModel):
    nome: Annotated[str, StringConstraints(strip_whitespace=True, min_length=0, max_length=30)]


class CategoriaOut(BaseModel):
    id: int
    nome: str
    ordem: int

    model_config = ConfigDict(from_attributes=True)


class ProdutoOut(BaseModel):
    id: int
    nome: str
    categoria_id: int
    categoria_nome: str
    quantidade_sugerida: int
    na_lista: bool


class ProdutoCreate(BaseModel):
    nome: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=80)]
    categoria_id: int


class ListaAdd(BaseModel):
    produto_id: int


class ListaQuantidade(BaseModel):
    quantidade: Annotated[int, Field(ge=1, le=999)]


class PrecoSet(BaseModel):
    produto_id: int
    mercado_id: int
    valor: Optional[Annotated[Decimal, Field(gt=0, le=Decimal('99999.99'))]] = None
