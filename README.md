# BuscAnime

Catálogo web de animes com dados da API AniList, com filtro por formato, busca por texto e nota destacada por cor.

## Estado atual

Fundação concluída: instalação limpa, regras automáticas, tokens de design, layout base responsivo e documentação. O catálogo ainda não existe; ele chega nas próximas branches, listadas na [spec da fundação](docs/specs/000-foundation/spec.md#ordem-das-branches).

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

Roda, na ordem do merge: lint, typecheck, testes, testes das regras de lint, build, limite de tamanho e testes de interface. Cada etapa também roda separada:

| Comando | O que faz |
| --- | --- |
| `npm run lint` | ESLint em `src` e `e2e` |
| `npm run typecheck` | TypeScript estrito |
| `npm test` | Vitest com Testing Library e MSW |
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

As próximas etapas estão na [spec da fundação](docs/specs/000-foundation/spec.md#ordem-das-branches).
