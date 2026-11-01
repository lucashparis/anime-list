# BuscAnime

Catálogo web de animes com dados da API AniList: filtro por formato, busca por texto e nota destacada por cor. React 19, Vite 8, TypeScript estrito, Tailwind 4, TanStack Query e Zod.

Estado atual: fundação concluída (layout base, tokens, regras automáticas). O catálogo vem nas próximas branches, listadas na [spec da fundação](docs/specs/000-foundation/spec.md#ordem-das-branches).

## Comandos

Requer Node 24.22.2 (`.nvmrc`). Rode tudo na raiz do repositório.

| Comando | Para que serve |
| --- | --- |
| `npm ci` | Instala as dependências |
| `npm run hooks:install` | Instala os hooks do Git, apenas neste repositório |
| `npx playwright install chromium` | Baixa o navegador dos testes de interface |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm run preview` | Build de produção e servidor do build |
| `npm run lint` / `npm run typecheck` | ESLint e TypeScript |
| `npm test` | Vitest |
| `npm run test:guards` | Prova de que cada regra de lint reprova o que deve; roda pelo hook quando a configuração do ESLint muda |
| `npm run test:e2e` | Playwright em Chromium, com axe |
| `npm run size` | Limite de 100 KB gzip de JS inicial |
| `npm run format` / `npm run format:check` | Prettier |
| `npm run verify` | Lint, typecheck, testes, build, size e e2e, como no merge |

## Regras

1. Idioma: código, commits e branches em inglês; documentação e interface em português; dados da API sem tradução.
2. Spec aprovada antes do código; plano só quando o risco justificar.
3. Sem `else` nem `else if`: use cláusula de guarda com retorno antecipado.
4. Sem comentários em `src` e `e2e`: o nome do código explica.
5. Sem `any`, `@ts-ignore` nem `eslint-disable`.
6. Sem ternário aninhado; ternário simples só para escolher um valor.
7. Funções até 40 linhas, arquivos até 200, complexidade até 10 e até 3 parâmetros.
8. Sem spinner: todo carregamento usa skeleton.
9. Sem prop drilling: quem usa o dado chama o hook.
10. Componentes por composição, com variantes em mapa tipado.
11. Estilo só com tokens do Tailwind, sem valores arbitrários em `className`.
12. Dependências em `shared` nunca apontam para `features` ou `app`; `features` nunca aponta para `app`.
13. Acessibilidade WCAG 2.2 AA e sem rolagem horizontal, de 320px a 1920px.
14. Versões exatas no npm; nunca `--force` nem `--legacy-peer-deps`.
15. Nunca alterar a configuração global do Git nem usar `--no-verify`.
16. Merge na `main` só com `--no-ff` e depois da avaliação do responsável pelo projeto.
17. Atualizar o `README.md` na própria branch.

## Fluxo de trabalho

- Durante o desenvolvimento, rode só os testes do que mudou; o `npm run verify` completo roda uma vez, antes do merge.
- Validação em clone limpo só quando as dependências mudam.
- Uma revisão por branch e, no máximo, um ciclo de correção.
- O responsável pelo projeto avalia as capturas antes de cada merge.

## Estrutura

```
src/app/        App, layout e providers
src/features/   uma pasta por funcionalidade (ainda não criada)
src/shared/     ui e styles (api chega com o catálogo), sem dependência de app ou features
e2e/            Playwright
tools/eslint/   regra local no-comments e testes das regras
docs/           documentação
```

## Documentação

Carregue só o que a tarefa precisar.

- [Arquitetura](docs/architecture.md)
- [Código](docs/conventions/code.md)
- [Git](docs/conventions/git.md)
- [Testes e definição de pronto](docs/conventions/testing.md)
- [Acessibilidade](docs/conventions/accessibility.md)
- [Segurança](docs/conventions/security.md)
- [Tokens e desvios do design](docs/design/tokens.md)
- [API AniList](docs/api/anilist.md)
- [Decisões anteriores ao desenvolvimento](docs/decisions/000-pre-development.md)
- [Spec da fundação](docs/specs/000-foundation/spec.md)
- [Decisões e trade-offs](DECISIONS.md)
- [Uso de IA](AI_LOG.md)
