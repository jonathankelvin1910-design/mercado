from fastapi import APIRouter, Depends, HTTPException

from app.crud import atualizar_nome_mercado, listar_mercados
from app.database import get_db
from app.schemas import MercadoOut, MercadoUpdate

router = APIRouter(prefix="/mercados", tags=["mercados"])


@router.get("/", response_model=list[MercadoOut])
def listar(db=Depends(get_db)):
    return listar_mercados(db)


@router.put("/{id}", response_model=MercadoOut)
def atualizar_mercado(id: int, payload: MercadoUpdate, db=Depends(get_db)):
    resultado = atualizar_nome_mercado(db, id, payload.nome)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Mercado não encontrado")
    return resultado
