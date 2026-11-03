# Passo a passo técnico

Guia de leitura para quem avalia o código do BuscAnime. Em 10 minutos dá para entender o que existe, por que foi feito assim e onde conferir.

## 1. O produto

Catálogo de animes com dados da API pública da AniList: cards com capa, título, até 3 gêneros e nota por cor; filtro por formato; busca por texto; "Ver mais". Está em produção em <https://anime-list-silk.vercel.app/>.

Para rodar localmente, use Node 24.22.2 (`.nvmrc`):

```
nvm install 24.22.2
nvm use 24.22.2
npm ci
npm run dev
```

Os demais comandos estão no [README](../README.md#como-executar) e no [CLAUDE.md](../CLAUDE.md#comandos). Para conferir tudo como no merge, rode `npm run verify` (cerca de 45 segundos).

## 2. Mapa do código

```
src/app/        composição da página, layout, providers e error boundary
src/features/   anime-catalog: api, hooks, model e components
src/shared/     cliente GraphQL, hooks genéricos, ui e tokens de estilo
e2e/            Playwright, com axe
tools/          regra local de lint e gerador de ícones
vercel.json     cabeçalhos de segurança
```

A dependência vai em um só sentido, `app → features → shared`, e o ESLint reprova o contrário. Detalhes em [architecture.md](architecture.md).

Fluxo de dados de uma consulta:

```
URL (?format=MOVIE&q=naruto)
   ↓ useUrlSearchParams → useCatalogFilters
componente → useAnimeCatalog (TanStack Query, página a página)
   ↓
fetchAnimeCatalog → requestGraphql (timeout de 10s, sem cookies)
   ↓
AniList → Zod valida → modelo Anime → componentes
```

Pontos para ler no código:

- [`fetchAnimeCatalog.ts`](../src/features/anime-catalog/api/fetchAnimeCatalog.ts): query fixa, entrada só em variáveis, schema e conversão para `Anime`.
- [`graphqlClient.ts`](../src/shared/api/graphqlClient.ts): único lugar que trata rede, timeout, status HTTP e `errors`.
- [`useCatalogFilters.ts`](../src/features/anime-catalog/hooks/useCatalogFilters.ts): filtro e busca como estado da URL.
- [`CatalogResults.tsx`](../src/features/anime-catalog/components/CatalogResults.tsx): skeleton, erro, lista vazia e lista.

## 3. As decisões que mais pesaram

| Decisão | Por quê | Onde está o registro |
| --- | --- | --- |
| Vite em vez de Next 16 | Menos JS e interativo mais cedo em rede lenta: 99 KB contra 174 KB e 3,8s contra 8,1s, medidos | [Vite e Next 16](decisions/000-pre-development.md#vite-e-next-16) |
| Design seguido, com acessibilidade acima dele | O layout segue o frame; várias cores de texto do design reprovavam no WCAG AA e foram corrigidas, e os rótulos estão em português | [Desvios do design](decisions/000-pre-development.md#desvios-do-design) |
| Filtro e busca na URL | Link compartilhável e botão voltar, sem biblioteca de rotas | [architecture.md](architecture.md#fluxo-de-dados) |
| Busca só ao enviar | A API limita a 30 requisições por minuto | [anilist.md](api/anilist.md#comportamentos-verificados) |
| Zod na borda e teste de contrato | Não há GraphQL Codegen, então uma mudança no schema só seria vista em produção | [anilist.md](api/anilist.md) |
| CSP sem `unsafe-inline` | A página não tem script nem estilo em linha, e as capas só vêm de `s4.anilist.co` | [security.md](conventions/security.md#política-de-segurança-de-conteúdo) |
| Skeleton, nunca spinner | A tela não muda de forma quando os dados chegam | [code.md](conventions/code.md) |

Todas as escolhas com custo aceito estão na tabela de trade-offs do [DECISIONS.md](../DECISIONS.md#trade-offs).

## 4. Como a qualidade é garantida

| Camada | O que faz | Comando |
| --- | --- | --- |
| Lint | Regras de arquitetura, sem `any`, `else`, comentários nem valores arbitrários em `className` | `npm run lint` |
| Regras de lint | Prova de que cada regra reprova o que deve | `npm run test:guards` |
| Tipos | TypeScript estrito | `npm run typecheck` |
| Unitários e de componente | Vitest com MSW; requisição sem handler reprova o teste | `npm test` |
| Contrato | Consulta a API real com o schema; fora do `verify` | `npm run test:contract` |
| Interface | Playwright em Chromium, axe WCAG 2.2 AA, 8 tamanhos de tela e CSP real | `npm run test:e2e` |
| Tamanho | JS inicial até 100 KB gzip (hoje 88,2 KB) | `npm run size` |

Os hooks do Git rodam Prettier, ESLint e commitlint a cada commit, e o `verify` completo a cada merge. As convenções estão em [testing.md](conventions/testing.md) e [accessibility.md](conventions/accessibility.md).

## 5. Como a IA foi usada

O desenvolvimento foi feito com o Claude Code, com spec aprovada antes do código, em blocos de branches e uma revisão por bloco. O [AI_LOG.md](../AI_LOG.md) registra a divisão entre os modelos, o custo das revisões, o que foi verificado por medição, o que foi corrigido e o que foi rejeitado. As specs estão em [docs/specs](specs/001-anime-catalog/spec.md).

## 6. Limitações conhecidas e próximos passos

- A lista é por popularidade, e a busca altera a ordem para relevância.
- "Ecchi" não é considerado adulto pela API, então `isAdult: false` não o exclui.
- A aferição de idade da ECA Digital não foi confirmada e exige avaliação jurídica antes de uso comercial.
- O Playwright cobre só Chromium: o Safari do iPhone é conferido à mão.
- O GitHub Actions ainda não existe: as verificações rodam no hook de merge local.
- A busca só consulta ao enviar, de propósito: o limite de 30 requisições por minuto é baixo, e a busca instantânea não está planejada ([trade-offs](../DECISIONS.md#trade-offs)).
- Fora do escopo: página de detalhe, tema escuro, outros idiomas, contas e PWA.

A lista completa, com o que ficou registrado em cada revisão, está em [DECISIONS.md](../DECISIONS.md#o-que-faria-com-mais-tempo).
