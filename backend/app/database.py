from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker
from pydantic_settings import BaseSettings, SettingsConfigDict

# Caminho absoluto do backend/.env, independente de onde o servidor for iniciado
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    """Carrega as credenciais do banco e da aplicação a partir do .env."""

    model_config = SettingsConfigDict(
        env_file=ENV_FILE, env_file_encoding="utf-8", extra="ignore"
    )

    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = ""
    db_name: str = "controle_gastos"

    @property
    def database_url(self) -> URL:
        # URL.create trata caracteres especiais da senha (@, #, /, :)
        return URL.create(
            drivername="mysql+pymysql",
            username=self.db_user,
            password=self.db_password,
            host=self.db_host,
            port=self.db_port,
            database=self.db_name,
        )


settings = Settings()

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependência FastAPI que fornece uma sessão do banco por requisição."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()