from fastapi import APIRouter, Depends

from app.crud import listar_categorias
from app.database import get_db
from app.schemas import CategoriaOut

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get("/", response_model=list[CategoriaOut])
def listar(db=Depends(get_db)):
    return listar_categorias(db)
