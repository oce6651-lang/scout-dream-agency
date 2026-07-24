# Project Football Agent — pass "mais profissional"

Refatoração ampla focada em progressão realista, mercado difícil e envelhecimento com consequências. Nada de reescrever a arquitetura — só ajustar sistemas existentes e adicionar peneiras.

## 1. Novos locais de scouting (src/game/engine/scouting.ts)

Várzea desbloqueada desde o início; teto de qualidade e potencial cresce com o nível da agência.

| Local | Nível req | Tipo | Idade | Qualidade base | Pot. teto |
|---|---|---|---|---|---|
| Pelada de rua | 1 | partida | 10–35 | 25 | 55 |
| Quadra de bairro | 1 | partida | 10–35 | 28 | 60 |
| Campo municipal | 1 | partida | 12–40 | 32 | 65 |
| Várzea Sub-17 | 1 | partida | 15–17 | 38 | 78 |
| Várzea Sub-20 | 1 | partida | 18–20 | 40 | 76 |
| Várzea livre | 1 | partida | 18–34 | 42 | 72 |
| Escolinha de futebol | 2 | treino | 8–14 | 42 | 88 |
| Torneio interescolar | 2 | partida | 12–16 | 44 | 82 |
| Copa regional Sub-17 | 3 | partida | 15–17 | 52 | 88 |
| Copa regional Sub-20 | 3 | partida | 18–20 | 55 | 86 |
| Torneio de veteranos | 3 | partida | 33–40 | 58 | 70 |
| Base de clube pequeno | 4 | treino | 13–19 | 60 | 92 |
| Base de clube grande | 5 | treino | 13–19 | 68 | 99 |
| Academia de elite | 5 | treino | 15–19 | 72 | 99 |

Curva de potencial dos locais fica mais dura no início (menos "raros"), mais generosa nos locais avançados.

## 2. Peneiras (novo sistema)

`src/game/engine/tryouts.ts` + rota `src/routes/_game.jogo.peneiras.tsx` + tile no dashboard.

- Para cada jogador **da agência sem clube**, o empresário paga custo para inscrever numa peneira de um clube compatível (nível do clube ≤ overall/10 + 1, limitado pelo prestígio).
- Chance de aprovação depende de: overall vs nível do clube, observação, personalidade, sorte, e bônus do "Sala de análise" / "Jurídico".
- Consome 1 turno de peneira/semana (limite = 1 + nível da agência).
- Resultado gera notícia, e se aprovado abre proposta única daquele clube (sem multiplicar em `mercado`).

## 3. Mercado mais duro (src/game/engine/market.ts)

- Corta chance base pela metade; ganho por prestígio reduzido.
- Só gera proposta se **jogador é "conhecido"**: `observacaoNivel >= 1` **ou** `historicoCarreira.length > 0` **ou** já teve clube. Desconhecidos ficam só com peneiras.
- Filtro de clube por nível fica mais restrito (±2 em vez de ±3).
- **1 transferência por ano por jogador**: novo campo `ultimaTransferenciaAno` no `Jogador`. `aceitarProposta` rejeita se `ano === ultimaTransferenciaAno`. Propostas para esses jogadores nem são geradas.
- Clubes grandes (`nivel >= 8`) só propõem para jogadores com overall ≥ 75.

## 4. Evolução por idade (src/game/engine/evolution.ts)

Substitui a lógica binária "≥30 declina". Curva contínua:

- 15–20: ganho alto, sem regressão.
- 21–25: ganho médio.
- 26–28: ganho baixo, sem regressão.
- 29–31: estagnação, regressão leve em atributos físicos (velocidade, físico).
- 32–34: regressão média em físicos, leve nos demais.
- 35+: regressão forte, chance de aposentadoria cresce com idade.

Ganho também escala com potencial restante e com nível de "Sala de análise" da agência (bônus pequeno).

## 5. Assinatura mais realista (src/game/engine/signing.ts)

- Jovens promissores (idade < 18 e potencial alto) mais fáceis.
- Jogadores > 30 mais céticos (menos base).
- "Conhecidos" (já tiveram clube) exigem mais prestígio.

## 6. Ajustes de UI

- `explorar.tsx`: agrupar locais por categoria (Amador / Base / Elite) com header, e ordenar por nível requerido.
- Dashboard `_game.jogo.index.tsx`: novo tile "Peneiras".
- `meus/$id`: mostrar "última transferência" e badge "sem transferência disponível este ano" quando aplicável.
- `PlayerCard`: badge "Livre" quando sem clube.

## 7. Migração save

- Bump `version: 2 → 3` em `SaveState` (types + store).
- Migração: para cada jogador, definir `ultimaTransferenciaAno = 0`.
- Backfill de campos usados por peneiras/histórico.

## 8. Balanceamento numérico

- Custos dos locais amadores caem (várzea acessível cedo).
- Custos de peneiras: R$ 500 (base) até R$ 5.000 (clube grande).
- Comissões via peneira ficam menores que via proposta espontânea (empresário precisa correr atrás).

## Aspectos técnicos

- Tudo TS estrito; nenhuma mudança em rotas raiz nem em `router.tsx`.
- Nenhuma alteração de backend / Cloud.
- Bump da versão do save + migração inline no `useGame` (mesma pattern do v1→v2).
- Verificação final: `tsgo` + smoke via Playwright na rota `/jogo/explorar` e `/jogo/peneiras`.

Confirma que quer que eu implemente tudo isso? Se preferir cortar algo (ex.: adiar peneiras), me diz antes de eu começar.