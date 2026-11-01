from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base
from app.routers import router_mercados, router_categorias, router_produtos

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mercado")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_mercados)
app.include_router(router_categorias)
app.include_router(router_produtos)


@app.get("/health")
def health():
    return {"status": "ok"}
