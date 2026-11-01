from fastapi import APIRouter, Depends, HTTPException

from app.crud import buscar_produtos, criar_produto
from app.database import get_db
from app.schemas import ProdutoCreate, ProdutoOut

router = APIRouter(prefix="/produtos", tags=["produtos"])


@router.get("/", response_model=list[ProdutoOut])
def listar(busca: str = "", db=Depends(get_db)):
    if not busca:
        return []
    return buscar_produtos(db, busca)


@router.post("/", response_model=ProdutoOut, status_code=201)
def criar(payload: ProdutoCreate, db=Depends(get_db)):
    try:
        produto = criar_produto(db, payload)
    except ValueError as exc:
        if exc.args and exc.args[0] == "nome_existente":
            raise HTTPException(status_code=409, detail="Nome já existe")
        if exc.args and exc.args[0] == "categoria_inexistente":
            raise HTTPException(status_code=404, detail="Categoria não encontrada")
        raise
    return {
        "id": produto.id,
        "nome": produto.nome,
        "categoria_id": produto.categoria_id,
        "categoria_nome": produto.categoria.nome,
        "quantidade_sugerida": produto.quantidade_sugerida,
        "na_lista": False,
    }
