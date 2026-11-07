from fastapi import APIRouter, Depends, HTTPException

from app.crud import definir_preco, apagar_todos_precos
from app.database import get_db
from app.schemas import PrecoSet

router = APIRouter(prefix="/precos", tags=["precos"])


@router.put("/")
def definir(payload: PrecoSet, db=Depends(get_db)):
    try:
        preco = definir_preco(
            db, payload.produto_id, payload.mercado_id, payload.valor, payload.tamanho
        )
    except ValueError as exc:
        if exc.args and exc.args[0] == "produto_inexistente":
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        if exc.args and exc.args[0] == "mercado_inexistente":
            raise HTTPException(status_code=404, detail="Mercado não encontrado")
        raise
    return {
        "produto_id": payload.produto_id,
        "mercado_id": payload.mercado_id,
        "valor": None if preco is None else float(preco.valor),
        "tamanho": None
        if preco is None or preco.tamanho is None
        else float(preco.tamanho),
    }


@router.delete("/", status_code=204)
def limpar(db=Depends(get_db)):
    apagar_todos_precos(db)
