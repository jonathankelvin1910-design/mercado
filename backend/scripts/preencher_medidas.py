from sqlalchemy import text

from app.database import engine
from scripts.medidas import medida_do_nome


def coluna_existe(conn, tabela, coluna):
    sql = text(
        "SELECT COUNT(*) FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = :t AND column_name = :c"
    )
    return conn.execute(sql, {"t": tabela, "c": coluna}).scalar() > 0


def main():
    with engine.begin() as conn:
        if not coluna_existe(conn, "produtos", "unidade"):
            conn.execute(
                text(
                    "ALTER TABLE produtos ADD COLUMN unidade VARCHAR(2) NULL, "
                    "ADD COLUMN tamanho_padrao DECIMAL(12,3) NULL"
                )
            )
            print("Colunas criadas em produtos")
        if not coluna_existe(conn, "precos", "tamanho"):
            conn.execute(text("ALTER TABLE precos ADD COLUMN tamanho DECIMAL(12,3) NULL"))
            print("Coluna criada em precos")

        linhas = conn.execute(text("SELECT id, nome FROM produtos WHERE unidade IS NULL")).all()
        preenchidos = 0
        for produto_id, nome in linhas:
            unidade, tamanho = medida_do_nome(nome)
            if unidade is None:
                continue
            conn.execute(
                text("UPDATE produtos SET unidade = :u, tamanho_padrao = :t WHERE id = :i"),
                {"u": unidade, "t": tamanho, "i": produto_id},
            )
            preenchidos += 1
        print(f"{preenchidos} produtos com medida preenchida")


if __name__ == "__main__":
    main()
