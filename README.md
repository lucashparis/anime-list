# BuscAnime

Catálogo web de animes com dados da API AniList, com filtro por formato, busca por texto e nota destacada por cor.

## Estado atual

O catálogo mostra os animes mais populares da AniList, 12 por vez, em cards com capa, título, até 3 gêneros e nota por cor, com skeleton durante o carregamento. Filtro por formato e busca por texto (enviada com Enter ou "Buscar") ficam na URL (`?format=MOVIE&q=naruto`). "Ver mais" acrescenta mais 12 animes à lista. Erro, 429, timeout de 10s, lista vazia e falha de renderização têm mensagem e botão próprios. O acabamento chega nas próximas branches, listadas na [spec da fundação](docs/specs/000-foundation/spec.md#ordem-das-branches).

## Como executar

Requer Node 24.22.2, versão fixada em [`.nvmrc`](.nvmrc).

```bash
nvm use
npm ci
npm run hooks:install
npx playwright install chromium
npm run dev
```

- `npm run hooks:install` ativa os hooks do Git apenas neste repositório. Veja [Git](docs/conventions/git.md).
- `npx playwright install chromium` baixa o navegador usado em `npm run test:e2e`.
- `npm run build` gera o build de produção, e `npm run preview` o serve.

## Como testar

```bash
npm run verify
```

Roda, na ordem do merge: lint, typecheck, testes, build, limite de tamanho e testes de interface. Os testes das regras de lint rodam pelo hook de commit quando a configuração do ESLint muda. Cada etapa também roda separada:

| Comando | O que faz |
| --- | --- |
| `npm run lint` | ESLint em `src` e `e2e` |
| `npm run typecheck` | TypeScript estrito |
| `npm test` | Vitest com Testing Library e MSW |
| `npm run test:contract` | Consulta a API real com o schema; fica fora do `verify` e exige rede |
| `npm run test:guards` | Prova de que cada regra de lint reprova o que deve |
| `npm run build` | Build de produção |
| `npm run size` | Limite de 100 KB gzip de JS inicial; rode o build antes |
| `npm run test:e2e` | Playwright em Chromium com axe; as capturas ficam em `test-results/layout/` |
| `npm run format:check` | Prettier, sem alterar arquivos |

Detalhes em [Testes](docs/conventions/testing.md).

## Documentação

[Arquitetura](docs/architecture.md), [convenções de código](docs/conventions/code.md), [acessibilidade](docs/conventions/accessibility.md), [segurança](docs/conventions/security.md), [tokens](docs/design/tokens.md), [API AniList](docs/api/anilist.md), [decisões e trade-offs](DECISIONS.md) e [uso de IA](AI_LOG.md).

## Linha do tempo

Cada linha corresponde a uma branch integrada à `main`.

| # | Branch | Entrega | Referência |
| --- | --- | --- | --- |
| 1 | `docs/pre-development-decisions` | Levantamento de design, API e obrigações legais; medições; decisões técnicas; spec da fundação | [Decisões](docs/decisions/000-pre-development.md) |
| 2 | `chore/project-foundation` | Instalação limpa, regras automáticas, tokens, layout base e documentação | [Spec](docs/specs/000-foundation/spec.md) |
| 3 | `feat/anime-catalog` | Cliente GraphQL, catálogo em cards, nota por cor, skeleton e teste de contrato | [Spec](docs/specs/001-anime-catalog/spec.md) |
| 4 | `feat/format-filter` | Filtro por formato em botões, com estado na URL | [Spec](docs/specs/002-catalog-discovery/spec.md#featformat-filter) |
| 5 | `feat/text-search` | Busca por texto enviada ao confirmar, ordenada por relevância e combinada com o filtro | [Spec](docs/specs/002-catalog-discovery/spec.md#feattext-search) |
| 6 | `feat/load-more` | "Ver mais" com skeleton, erro sem perder a lista e aviso para leitores de tela | [Spec](docs/specs/002-catalog-discovery/spec.md#featload-more) |
| 7 | `feat/feedback-states` | Timeout de 10s, nova tentativa, mensagem para o limite de requisições, lista vazia com limpeza de filtros e error boundary | [Spec](docs/specs/003-feedback-and-security/spec.md#featfeedback-states) |
| 8 | `chore/security-headers` | CSP sem `unsafe-inline`, cabeçalhos no `vercel.json`, capas só de `s4.anilist.co` e teste da CSP no navegador | [Spec](docs/specs/003-feedback-and-security/spec.md#choresecurity-headers) |

As próximas etapas estão na [spec da fundação](docs/specs/000-foundation/spec.md#ordem-das-branches).
