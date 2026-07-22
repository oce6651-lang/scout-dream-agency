## Project Football Agent — Plano do MVP

Jogo web de gerenciamento de empresário de futebol, inspirado em Football Agent (mobile) e Football Academy Manager. Estética: dark mode zinc + accent emerald (dire\u00e7\u00e3o "Console t\u00e1tico"), mobile-first. Persist\u00eancia local (localStorage), sem login. Foco Brasil.

### Escopo do MVP (o que ser\u00e1 jog\u00e1vel na primeira entrega)

Loop principal:
1. Menu inicial \u2192 Criador de empres\u00e1rio \u2192 Dashboard.
2. Explorar talentos (6 locais) \u2192 Observar (3 n\u00edveis) \u2192 Conversar \u2192 Assinar contrato.
3. Meus jogadores (portf\u00f3lio + hist\u00f3rico).
4. Mercado (propostas de clubes: aceitar/negociar/recusar \u2192 comiss\u00e3o).
5. Notícias auto-geradas por semana.
6. Minha ag\u00eancia (n\u00edvel, reputa\u00e7\u00e3o, funcion\u00e1rios b\u00e1sicos).
7. Avan\u00e7ar semana \u2192 avan\u00e7o de tempo, evolu\u00e7\u00e3o de jogadores, gera\u00e7\u00e3o de propostas/notícias, sal\u00e1rios/custos.
8. Save autom\u00e1tico + m\u00faltiplos slots (3 saves) + continuar.

Fora do MVP (arquitetura preparada, sem UI dedicada): conquistas avan\u00e7adas, calend\u00e1rio detalhado com eventos, patrocínios, advogado/assistente com efeitos complexos. Ficam como stubs f\u00e1ceis de expandir.

### Telas

```
/                       Menu (Novo jogo / Continuar / Configurações / Créditos)
/novo                   Criador de empresário (formulário multi-step)
/jogo                   Dashboard principal
/jogo/explorar          Escolher local + gerar lista de talentos
/jogo/jogador/$id       Ficha do jogador (observar, conversar, contratar)
/jogo/meus              Meus jogadores (portfólio)
/jogo/meus/$id          Detalhe + histórico do cliente
/jogo/mercado           Propostas recebidas
/jogo/agencia           Ag\u00eancia + funcion\u00e1rios
/jogo/noticias          Feed de not\u00edcias
/jogo/calendario        Ano/m\u00eas/semana + eventos
/jogo/configuracoes     Saves, exportar, reiniciar
/creditos               Créditos
```

Todas as telas herdam layout mobile (max-w-md centralizado), header com KPI compacto e navega\u00e7\u00e3o por bot\u00e3o de voltar.

### Modelo de dados (TypeScript, com IDs)

Formato de ID: `AGT000001`, `AGN000001`, `PLR000001`, `CLB000001`, `NWS000001`, `OFR000001`, `STF000001`. Contadores por tipo salvos junto do save.

```ts
type Empresario = { id; nome; sobrenome; idade; nacionalidade; estado; cidade; agenciaId; dinheiro; prestigio; nivel; experiencia };
type Agencia    = { id; nome; cidade; anoFundacao; nivel; reputacao; clientesIds:string[]; funcionariosIds:string[] };
type Atributos  = { velocidade; passe; finalizacao; defesa; fisico; tecnica; mental };
type Jogador    = { id; nome; sobrenome; idade; nacionalidade; cidade; posicao; peDominante; clubeAtualId?; empresarioId?; potencial; potencialConhecido: 'none'|'estimativa'|'faixa'|'exato'; atributos:Atributos; personalidade; salario; valorMercado; historico:HistoricoEntry[] };
type Clube      = { id; nome; pais; nivel; orcamento; categoria:'base'|'principal'|'gigante'; necessidades:Posicao[] };
type Proposta   = { id; clubeId; jogadorId; valor; salario; comissaoPct; expiraSemana };
type Noticia    = { id; semana; titulo; corpo; tipo };
type Funcionario= { id; tipo:'olheiro'|'advogado'|'assistente'; nome; nivel; salario };
type Tempo      = { ano; mes:1..12; semana:1..4 };
type SaveState  = { empresario; agencia; jogadores:Jogador[]; clubes:Clube[]; propostas:Proposta[]; noticias:Noticia[]; funcionarios:Funcionario[]; tempo; counters:Record<string,number>; historicoFinanceiro:{semana; delta; motivo}[] };
```

### Dados semente (Brasil)

- **Estados e cidades**: um m\u00f3dulo `src/game/data/brasil.ts` com todos os 27 estados; cada estado com uma lista de 8\u201320 cidades reais principais (inclui Tr\u00eas Passos-RS).
- **Clubes**: ~24 clubes brasileiros (S\u00e9rie A + tradicionais) + 8 europeus como \u201ctop\u201d para propostas internacionais tardias. Cada um com n\u00edvel/or\u00e7amento/categoria.
- **Nomes e sobrenomes brasileiros**: listas para geraç\u00e3o aleat\u00f3ria.
- **Posi\u00e7\u00f5es**: GOL, ZAG, LD, LE, VOL, MC, MEI, PD, PE, ATA.

### Sistemas de jogo

**Tempo**: `avancarSemana()` incrementa semana; a cada 4 vira m\u00eas; a cada 12 meses vira ano \u2192 envelhece jogadores, evolui atributos limitados por potencial, atualiza categorias de base (Sub-15/17/20/profissional), expira propostas antigas.

**Gera\u00e7\u00e3o de talentos**: `explorar(local)` gera 5\u201330 jogadores. Local afeta faixa et\u00e1ria e qualidade base:
- Escolinha: 8\u201312, qualidade baixa/m\u00e9dia
- Escola: 10\u201314
- V\u00e1rzea: 14\u201322, alta vari\u00e2ncia
- Campo Municipal: 12\u201318
- Quadra: 10\u201316 (t\u00e9cnica alta)
- Academia de futebol: 15\u201319, m\u00e9dia/alta

Potencial 40\u2013100; jogadores com potencial >85 s\u00e3o raros (~2%).

**Observa\u00e7\u00e3o**: 3 n\u00edveis com custo em R$ e semanas. Cada n\u00edvel revela mais atributos e estreita a faixa do potencial. Olheiro contratado melhora precis\u00e3o.

**Contrata\u00e7\u00e3o**: chance de aceitar = f(prestigio, dist\u00e2ncia geogr\u00e1fica, qualidade da proposta, personalidade). Menores de idade exigem \u201caprova\u00e7\u00e3o dos respons\u00e1veis\u201d (modifica a f\u00f3rmula). Assina contrato \u2192 jogador vira cliente.

**Evolu\u00e7\u00e3o**: por ano, cada atributo cresce com base em (potencial - m\u00e9dia atual) * fator + rand. Craques crescem mais r\u00e1pido; ap\u00f3s ~28 anos come\u00e7am a declinar.

**Mercado**: a cada semana, clubes cujas necessidades batem com jogadores da ag\u00eancia geram propostas. Valor = f(atributos, idade, potencial conhecido, categoria do clube). Comiss\u00e3o padr\u00e3o 10\u201315%.

**Finan\u00e7as**: entradas (comiss\u00f5es, patroc\u00ednio conforme prest\u00edgio) e sa\u00eddas semanais (sal\u00e1rios funcion\u00e1rios, scouting, administrativo). Hist\u00f3rico visualiz\u00e1vel.

**Not\u00edcias**: gerador de eventos por semana baseado em a\u00e7\u00f5es (nova assinatura, venda, clube monitorando cliente, talento raro descoberto).

**Save**: `localStorage` chaves `pfa:save:1|2|3` + `pfa:current`. Salvamento autom\u00e1tico ap\u00f3s cada a\u00e7\u00e3o relevante e ao avan\u00e7ar semana.

### Arquitetura t\u00e9cnica

- **Rotas TanStack**: arquivos em `src/routes/` conforme lista acima. `index.tsx` vira o menu. Rota pai `/jogo` (`_gameLayout` via prefixo underscore `src/routes/_game.tsx` com `<Outlet />` + header + gate \u201ctem save?\u201d, sen\u00e3o redireciona para `/novo`).
- **Estado global**: Zustand store `useGame` em `src/game/store.ts` \u2014 cont\u00e9m `SaveState`, seletores, e a\u00e7\u00f5es puras (`avancarSemana`, `explorar`, `observar`, `contratar`, `responderProposta`). Middleware persist salva em `localStorage`.
- **Motor de jogo**: fun\u00e7\u00f5es puras em `src/game/engine/*.ts` (tempo, scouting, evolu\u00e7\u00e3o, mercado, financeiro, ids). Testáveis, sem depend\u00eancia de React.
- **RNG determin\u00edstico** (opcional): `mulberry32` com seed no save para reprodutibilidade.
- **Design tokens**: atualizar `src/styles.css` para tema dark padr\u00e3o (background `oklch(0.14 0.02 260)`, primary emerald, cards zinc-900). Fonte Instrument Sans via `<link>` em `__root.tsx`.
- **Componentes UI**: `KpiCard`, `ActionTile`, `PlayerCard`, `Screen` (wrapper com header/back), `PrimaryCTA`.
- **Head metadata**: cada rota com t\u00edtulo/desc pr\u00f3prios; sem og:image (nenhuma imagem confi\u00e1vel gerada).

### Estrutura de arquivos

```
src/
  routes/
    __root.tsx                (atualiza head + fonte + dark class no body)
    index.tsx                 (menu principal)
    novo.tsx                  (criador de empres\u00e1rio)
    creditos.tsx
    _game.tsx                 (layout /jogo)
    _game.jogo.index.tsx      -> /jogo (dashboard)
    _game.jogo.explorar.tsx
    _game.jogo.jogador.$id.tsx
    _game.jogo.meus.tsx
    _game.jogo.meus.$id.tsx
    _game.jogo.mercado.tsx
    _game.jogo.agencia.tsx
    _game.jogo.noticias.tsx
    _game.jogo.calendario.tsx
    _game.jogo.configuracoes.tsx
  game/
    types.ts
    store.ts
    ids.ts
    rng.ts
    data/brasil.ts
    data/clubes.ts
    data/nomes.ts
    engine/time.ts
    engine/scouting.ts
    engine/observation.ts
    engine/signing.ts
    engine/evolution.ts
    engine/market.ts
    engine/finance.ts
    engine/news.ts
  components/game/
    Screen.tsx
    KpiCard.tsx
    ActionTile.tsx
    PlayerCard.tsx
    AttributeBar.tsx
    PrimaryCTA.tsx
  styles.css                  (tokens dark + emerald)
```

Obs.: uso o prefixo pathless `_game` como layout (n\u00e3o para gate de auth); `_authenticated` fica intocado.

### Pacotes a instalar

- `zustand` para o store persistente.

### Est\u00e9tica (fixa)

- Background `bg-zinc-950`, cards `bg-zinc-900 ring-1 ring-white/5 rounded-xl`.
- Accent `emerald-500/600`. Texto principal `zinc-100`, secund\u00e1rio `zinc-400/500`.
- Fonte: Instrument Sans (Google Fonts via `<link>` no `__root`).
- CTA "Avan\u00e7ar Semana" fixado no rodap\u00e9 dentro do layout `/jogo`.
- Tiles do dashboard: exatamente os 6 do brief + a\u00e7\u00e3o larga (Relat\u00f3rios financeiros), CTA Avan\u00e7ar Semana fixo.

### Entrega

App jog\u00e1vel de ponta a ponta: criar empres\u00e1rio \u2192 explorar \u2192 observar \u2192 contratar \u2192 receber propostas \u2192 vender \u2192 ganhar comiss\u00e3o \u2192 subir prest\u00edgio. Progresso persiste em localStorage. C\u00f3digo organizado para expans\u00e3o (funcion\u00e1rios avan\u00e7ados, conquistas, patroc\u00ednios, mais pa\u00edses).
