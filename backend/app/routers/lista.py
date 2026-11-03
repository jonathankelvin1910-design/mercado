from fastapi import APIRouter, Depends, HTTPException

from app.crud import (
    adicionar_na_lista,
    alterar_quantidade,
    remover_da_lista,
    listar_lista,
)
from app.database import get_db
from app.schemas import ListaAdd, ListaItemOut, ListaQuantidade

router = APIRouter(prefix="/lista", tags=["lista"])


def _item(db, produto_id: int):
    """Devolve o dicionário de listar_lista(db) cujo produto_id for igual ao informado."""
    for item in listar_lista(db):
        if item["produto_id"] == produto_id:
            return item
    return None


@router.get("/", response_model=list[ListaItemOut])
def listar(db=Depends(get_db)):
    return listar_lista(db)


@router.post("/", response_model=ListaItemOut, status_code=201)
def adicionar(payload: ListaAdd, db=Depends(get_db)):
    try:
        adicionar_na_lista(db, payload.produto_id)
    except ValueError as exc:
        if exc.args and exc.args[0] == "produto_inexistente":
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        if exc.args and exc.args[0] == "ja_na_lista":
            raise HTTPException(status_code=409, detail="Produto já está na lista")
        raise
    return _item(db, payload.produto_id)


@router.patch("/{produto_id}", response_model=ListaItemOut)
def alterar(produto_id: int, payload: ListaQuantidade, db=Depends(get_db)):
    item = alterar_quantidade(db, produto_id, payload.quantidade)
    if item is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return _item(db, produto_id)


@router.delete("/{produto_id}", status_code=204)
def remover(produto_id: int, db=Depends(get_db)):
    if not remover_da_lista(db, produto_id):
        raise HTTPException(status_code=404, detail="Produto não encontrado")
