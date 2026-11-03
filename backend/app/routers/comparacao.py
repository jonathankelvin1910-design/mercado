from fastapi import APIRouter, Depends

from app.comparacao import calcular_comparacao
from app.crud import listar_lista, listar_mercados
from app.database import get_db

router_comparacao = APIRouter(prefix="/comparacao", tags=["comparacao"])


@router_comparacao.get("/")
def obter(db=Depends(get_db)):
    itens = listar_lista(db)

    mercados = [
        {"id": m.id, "posicao": m.posicao, "nome": m.nome}
        for m in listar_mercados(db)
    ]

    return calcular_comparacao(itens, mercados)
