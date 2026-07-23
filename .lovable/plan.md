## Reformulação do loop de scouting e agência

Refino do MVP com novo loop de descoberta baseado em partidas/treinos, progressão de locais desbloqueáveis, upgrades de agência, histórico de carreira dos jogadores e resumo de fim de ano.

### 1. Locais desbloqueáveis por progresso

Substituir a lista fixa atual de `LOCAIS` por locais com requisitos (nível da agência / reputação / prestígio):

| Local | Desbloqueio | Faixa etária | Overall base |
|---|---|---|---|
| Quadra de bairro | inicial | 8–35 (livre) | baixo |
| Campo municipal | inicial | 8–40 | baixo |
| Escolinha de futebol | Agência nv 2 | 8–14 | baixo/médio |
| Várzea Sub-17 | Agência nv 2 | 15–17 | médio |
| Várzea Sub-20 | Agência nv 3 | 18–20 | médio |
| Várzea Sub-23 | Agência nv 3 | 21–23 | médio/alto |
| Várzea Livre | Agência nv 4 | 18–32 | médio/alto |
| Veterano | Agência nv 4 | 33–40 | alto (sem potencial) |
| Academia de futebol | Agência nv 5 | 15–19 | alto |

Cada local mostra ícone de cadeado + requisito quando indisponível.

### 2. Nova mecânica: assistir partida/treino

Fluxo:
1. Jogador escolhe local → paga custo.
2. Sistema gera **22 atletas** (2 times de 11) para partida OU **grupo de treino de ~16** para escolinha, com posições coerentes (GOL, ZAG, LD, LE, VOL, MC, MEI, PD, PE, ATA).
3. Tela de "partida" simulada: placar + destaques (gols, defesas, dribles) baseados em atributos, animação simples de progresso.
4. Ao fim, cada atleta recebe uma **nota de desempenho** (6.0–9.5) visível.
5. Um subconjunto (2–5) demonstra **interesse** em conversar; só esses podem ir para observação/contratação.
6. Os demais somem do resultado (não recrutáveis nesta rodada).

**Limite: 2 partidas/treinos por semana.** Contador exibido no dashboard e no header da tela Explorar; ao esgotar, botões ficam desabilitados até avançar semana.

### 3. Upgrades da agência

Nova aba em `/jogo/agencia` com **instalações** além de funcionários:

| Instalação | Efeito por nível |
|---|---|
| Alojamento | +N vagas para clientes sem clube (reduz risco de perda; pequeno bônus de moral/evolução) |
| Escritório | +ações por semana (ex.: +1 partida assistível no nível 3, +limite de propostas paralelas) |
| Central de olheiros | Descoberta passiva semanal: N jogadores aleatórios entram na lista de "olheiros trouxeram" com qualidade proporcional ao nível |
| Sala de análise | Reduz custo de observação e aumenta precisão do relatório |
| Departamento jurídico | Melhora comissões negociadas e reduz risco de perder cliente |

Cada upgrade: custo em R$, tempo (semanas) e nível máx (ex.: 5). Nível da agência = média dos níveis das instalações (destrava locais).

### 4. Histórico de carreira dos jogadores

Substituir a rota **Relatório Financeiro** por **Histórico da Agência** (`/jogo/historico`):

- Lista todos os jogadores que já passaram pela agência (ativos + ex-clientes).
- Detalhe por jogador com timeline anual:
  - Ano, idade, clube, categoria (Sub-17/20/Profissional/Veterano)
  - Jogos, gols, assistências (gerados sinteticamente a cada ano com base em posição + atributos + nível do clube)
  - Overall no fim do ano
  - Eventos (transferência, renovação, aposentadoria)
- Novo tipo `CareerYear` no `Jogador.historicoCarreira[]`, populado no resumo de fim de ano.

### 5. Saldo negativo em vermelho

`KpiCard` e header do dashboard: quando `empresario.dinheiro < 0`, valor renderiza em `text-red-500` com prefixo "-R$". Aplica-se em todas as telas que mostram saldo.

### 6. Resumo de fim de ano

Nova rota modal `/jogo/fim-de-ano` disparada automaticamente quando `avancarSemana` cruza dezembro→janeiro:

- Cabeçalho: "Temporada {ano} encerrada".
- Seções, cada uma com lista rolável:
  1. **Envelhecimento**: cada cliente com idade antes → depois; ícone de aposentadoria para >37.
  2. **Evolução de atributos**: delta por atributo (verde/vermelho) e novo overall.
  3. **Mudança de categoria**: Sub-17 → Sub-20 → Sub-23 → Profissional → Veterano.
  4. **Clubes**: promoções/rebaixamentos sintéticos (leve variação de `nivel` dos clubes brasileiros).
  5. **Balanço**: comissão total do ano, custos, lucro.
- CTA "Continuar temporada" fecha o modal e volta ao dashboard.

### Arquivos afetados

**Tipos e engine**
- `src/game/types.ts`: adicionar `Instalacao`, `CareerYear`, `MatchResult`, campos `nivelRequerido` em local, `assistidosNaSemana`, `interessados` em jogador.
- `src/game/engine/scouting.ts`: refatorar `LOCAIS` com requisitos, adicionar `gerarPartida()` e `gerarTreino()` (22/16 atletas, times, posições balanceadas, notas).
- `src/game/engine/match.ts` (novo): simulação de partida — placar, destaques, notas, seleção de "interessados".
- `src/game/engine/facilities.ts` (novo): definição, custos e efeitos de instalações.
- `src/game/engine/evolution.ts`: gerar `CareerYear` (jogos/gols/assistências por posição+overall+clube) e mudanças de categoria.
- `src/game/engine/yearEnd.ts` (novo): consolida deltas para o resumo.
- `src/game/store.ts`: `assistidosNaSemana`, ações `assistirPartida`, `melhorarInstalacao`, gate `avancarSemana` → dispara `yearEnd` quando aplicável, expõe `resumoFimDeAno`.

**Rotas**
- `src/routes/_game.jogo.explorar.tsx`: cadeados por local, contador 2/semana.
- `src/routes/_game.jogo.partida.$id.tsx` (novo): tela de simulação + lista pós-jogo com nota + tag "Interessado".
- `src/routes/_game.jogo.agencia.tsx`: abas Funcionários / Instalações.
- `src/routes/_game.jogo.historico.tsx` (novo): lista + detalhe da carreira; substitui `_game.jogo.financeiro.tsx` (remover) e o tile do dashboard.
- `src/routes/_game.jogo.fim-de-ano.tsx` (novo).
- `src/routes/_game.jogo.index.tsx`: novo tile "Histórico", contador de partidas restantes, saldo vermelho quando negativo.
- `src/components/game/KpiCard.tsx`: prop/lógica para cor negativa.

### Fora do escopo desta iteração

- Estatísticas reais de partidas jogadas pelos clientes (usaremos números gerados coerentes).
- Central de olheiros com árvore mundial — no MVP entrega apenas +N descobertas semanais.
- Sistema de moral/lesões vinculado ao alojamento — apenas hook simples.
