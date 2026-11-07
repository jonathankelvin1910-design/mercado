import re
from decimal import Decimal

PADRAO = re.compile(r"(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|un|rolos?)\b", re.I)
SEM_MEDIDA = ("Saco de lixo",)


def medida_do_nome(nome):
    if nome.startswith(SEM_MEDIDA):
        return None, None
    achado = PADRAO.search(nome)
    if not achado:
        return None, None
    valor = Decimal(achado.group(1).replace(",", "."))
    un = achado.group(2).lower()
    if un == "kg":
        return "g", valor * 1000
    if un == "g":
        return "g", valor
    if un == "l":
        return "ml", valor * 1000
    if un == "ml":
        return "ml", valor
    if un == "un":
        return "un", valor
    return "m", None
