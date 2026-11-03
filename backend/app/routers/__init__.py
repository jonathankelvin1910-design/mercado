from app.routers.categorias import router as router_categorias
from app.routers.mercados import router as router_mercados
from app.routers.produtos import router as router_produtos
from app.routers.lista import router as router_lista
from app.routers.precos import router as router_precos
from app.routers.comparacao import router_comparacao

__all__ = [
    "router_categorias",
    "router_mercados",
    "router_produtos",
    "router_lista",
    "router_precos",
    "router_comparacao",
]
