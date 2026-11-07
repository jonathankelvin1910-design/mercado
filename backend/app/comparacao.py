from decimal import ROUND_HALF_UP, Decimal

ZERO = Decimal("0")
UM_DECIMAL = Decimal("0.1")
CENTAVO = Decimal("0.01")
QUATRO_CASAS = Decimal("0.0001")

# Unidade base -> (fator para exibir, rótulo exibido). g vira kg e ml vira L.
EXIBICAO = {
    "g": (Decimal(1000), "kg"),
    "ml": (Decimal(1000), "L"),
    "m": (Decimal(1), "m"),
    "un": (Decimal(1), "un"),
}


def _nome_mercado(mercado):
    nome = (mercado.get("nome") or "").strip()
    return nome or f"Mercado {mercado['posicao']}"


def _por_medida(item, posicoes):
    """Converte os preços de um item para o mesmo tamanho de embalagem.

    Só age quando algum mercado com preço tem tamanho informado. O tamanho de
    referência é o tamanho padrão do produto ou, se ele não existir, o do
    primeiro mercado (pela posição) que informou tamanho. Mercados sem tamanho
    informado usam o tamanho de referência.

    Devolve (preços equivalentes, info) ou (preços originais, None).
    """
    precos = item["precos"]
    tamanhos = {
        mid: t
        for mid, t in (item.get("tamanhos") or {}).items()
        if t and mid in precos
    }
    if not tamanhos:
        return precos, None

    referencia = item.get("tamanho_padrao")
    if not referencia:
        primeiro = min(tamanhos, key=lambda mid: posicoes.get(mid, 0))
        referencia = tamanhos[primeiro]

    fator, rotulo = EXIBICAO.get(item.get("unidade") or "un", (Decimal(1), "un"))
    equivalentes = {}
    por_medida = {}
    for mid, valor in precos.items():
        tamanho = tamanhos.get(mid) or referencia
        equivalentes[mid] = (valor * referencia / tamanho).quantize(
            CENTAVO, rounding=ROUND_HALF_UP
        )
        por_medida[mid] = (valor / tamanho * fator).quantize(
            QUATRO_CASAS, rounding=ROUND_HALF_UP
        )
    info = {
        "unidade": rotulo,
        "tamanho_referencia": referencia,
        "por_medida": por_medida,
    }
    return equivalentes, info


def calcular_comparacao(itens, mercados):
    """Compara os mercados para a lista de compras, sem acessar o banco.

    itens: [{produto_id, nome, quantidade, precos: {mercado_id: Decimal},
             unidade, tamanho_padrao, tamanhos: {mercado_id: Decimal}}]
            (unidade, tamanho_padrao e tamanhos são opcionais)
    mercados: [{id, posicao, nome}]
    """
    nomes = {m["id"]: _nome_mercado(m) for m in mercados}
    posicoes = {m["id"]: m["posicao"] for m in mercados}

    # Itens com preços já convertidos para o mesmo tamanho (quando há medida).
    medidas = {}
    efetivos = []
    for item in itens:
        precos, info = _por_medida(item, posicoes)
        medidas[item["produto_id"]] = info
        efetivos.append({**item, "precos": precos})
    itens = efetivos

    # Mercados que têm pelo menos um preço em algum item (na ordem de posicao).
    ids_com_preco = [
        m["id"]
        for m in sorted(mercados, key=lambda m: m["posicao"])
        if any(m["id"] in item["precos"] for item in itens)
    ]

    # Itens com preço em TODOS os mercados com preço.
    comparavel = len(ids_com_preco) >= 2
    em_comum = []
    if comparavel:
        em_comum = [
            item
            for item in itens
            if all(mid in item["precos"] for mid in ids_com_preco)
        ]
    if not em_comum:
        comparavel = False

    ranking = []
    vencedores = []
    compra_dividida = None
    economia = None

    if comparavel:
        totais = []
        for mid in ids_com_preco:
            total = sum(
                (item["precos"][mid] * item["quantidade"] for item in em_comum), ZERO
            )
            totais.append((mid, total))
        totais.sort(key=lambda par: par[1])
        menor_total = totais[0][1]

        for mid, total in totais:
            diferenca = total - menor_total
            percentual = (
                (diferenca / menor_total * 100).quantize(
                    UM_DECIMAL, rounding=ROUND_HALF_UP
                )
                if menor_total > 0
                else ZERO
            )
            ranking.append(
                {
                    "mercado_id": mid,
                    "nome": nomes[mid],
                    "total": total,
                    "diferenca": diferenca,
                    "diferenca_percentual": percentual,
                }
            )
        vencedores = [r["nome"] for r in ranking if r["total"] == menor_total]

        compra_dividida = sum(
            (
                min(item["precos"][mid] for mid in ids_com_preco) * item["quantidade"]
                for item in em_comum
            ),
            ZERO,
        )
        economia = menor_total - compra_dividida

    # Itens com algum preço que ficaram fora da comparação.
    ids_em_comum = {item["produto_id"] for item in em_comum}
    itens_fora = sum(
        1
        for item in itens
        if item["precos"] and item["produto_id"] not in ids_em_comum
    )

    # Total de tudo que cada mercado tem preço.
    totais_preenchidos = {}
    for mid in ids_com_preco:
        com_preco = [item for item in itens if mid in item["precos"]]
        totais_preenchidos[mid] = {
            "total": sum(
                (item["precos"][mid] * item["quantidade"] for item in com_preco), ZERO
            ),
            "itens": len(com_preco),
        }

    # Resumo por item.
    por_item = {}
    for item in itens:
        precos = item["precos"]
        if not precos:
            por_item[item["produto_id"]] = {
                "menor_preco": None,
                "mercados_mais_baratos": [],
                "poupa": ZERO,
                "destacar": False,
                "por_medida": None,
            }
            continue
        menor = min(precos.values())
        maior = max(precos.values())
        por_item[item["produto_id"]] = {
            "menor_preco": menor,
            "mercados_mais_baratos": [
                mid for mid in ids_com_preco if precos.get(mid) == menor
            ],
            "poupa": maior - menor,
            "destacar": len(precos) >= 2 and maior != menor,
            "por_medida": medidas[item["produto_id"]],
        }

    return {
        "mercados_com_preco": ids_com_preco,
        "itens_em_comum": len(em_comum),
        "ranking": ranking,
        "vencedores": vencedores,
        "compra_dividida": compra_dividida,
        "economia_dividindo": economia,
        "itens_fora": itens_fora,
        "totais_preenchidos": totais_preenchidos,
        "por_item": por_item,
    }
