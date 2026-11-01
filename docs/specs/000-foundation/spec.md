# Spec 000: Fundação do projeto

Branch: `chore/project-foundation`. Decisões e motivos em [000-pre-development](../../decisions/000-pre-development.md).

## Objetivo

Deixar o projeto pronto para receber funcionalidades: instalação limpa, regras validadas automaticamente, tokens de design e documentação para desenvolvimento com IA.

## Fora do escopo

Consumo da API, cards, filtros, busca e paginação. Cada um tem spec própria.

## Ambiente

- Node 24.22.2 em `.nvmrc`; `engines.node` igual a `>=24.22.2 <25`.
- Dependências com versão exata (`save-exact=true`), e `engine-strict=true` no `.npmrc`.
- `overrides.minimatch` igual a `^11.0.1`; `allowScripts` apenas para `lefthook`.

## Idioma

| Conteúdo | Idioma |
| --- | --- |
| Branches, commits, nomes de arquivos, funções, variáveis, descrições de teste e mensagens técnicas | Inglês |
| Documentação e artefatos do projeto | Português |
| Todo texto da interface, inclusive `aria-label`, `alt`, placeholder e título da página | Português, mesmo quando o design estiver em inglês |
| Dados da API, como títulos e gêneros | Como a API retorna, sem tradução |
| Siglas sem equivalente em português, como OVA e ONA, e a marca BuscAnime | Mantidas |

O `<html>` declara `lang="pt-BR"`. Um trecho de dados em outro idioma, como um gênero, declara o próprio `lang`; nomes próprios, como títulos, são dispensados pela WCAG 3.1.2.

## Estrutura

```
src/
  app/                       providers, App e error boundary
  features/anime-catalog/    api, hooks, model e components
  shared/
    api/                     cliente fetch e erros tipados
    ui/                      Button, Chip, Logo e Skeleton
    styles/                  tokens
e2e/                         testes Playwright
docs/                        documentação
```

`features/anime-catalog` e os componentes de `shared/ui` chegam nas specs de cada funcionalidade. Esta spec cria apenas a pasta `shared/styles`, o `App` e o layout base.

## Regras de lint

| Regra | Valor |
| --- | --- |
| `@typescript-eslint/no-explicit-any` | Erro |
| Asserções inseguras e `@ts-ignore` | Erro, com `typescript-eslint` em modo `strictTypeChecked` |
| `max-lines-per-function` | 40, sem contar linhas em branco |
| `max-lines` | 200 por arquivo, sem contar linhas em branco |
| `complexity` | 10 |
| `max-params` | 3 |
| `no-restricted-imports` | `shared` não importa de `features` ou `app`; `features` não importa de `app` |
| `no-restricted-syntax` | `className` não aceita valores arbitrários (`[...]`); `if` não aceita `else` nem `else if` (seletor `IfStatement[alternate]`) |
| `no-nested-ternary` | Erro |
| `local/no-comments` | Regra local que reprova qualquer comentário em `src` e `e2e` |

Como `eslint-disable` também é um comentário, a regra local impede exceções no código. Para isso, `linterOptions.noInlineConfig` fica ativo; sem ele, o próprio `eslint-disable` desligaria a regra. Exceção inevitável exige alterar a configuração e registrar o motivo em `DECISIONS.md`.

Arquivos de teste podem exceder `max-lines-per-function`, porque um bloco `describe` reúne vários casos.

Desvios de fluxo usam cláusula de guarda com retorno antecipado. O ternário simples continua permitido para escolher um valor, como na renderização condicional em JSX, em que não cabe um `return`.

## TypeScript

`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch` e `verbatimModuleSyntax`.

## Tokens

Definidos em `shared/styles` com `@theme` do Tailwind, removendo as escalas padrão para que só estes valores existam.

| Grupo | Valores |
| --- | --- |
| Primária | `#6324C6`; clara `#774DC5` |
| Feedback | sucesso `#01ADA6`; alerta `#FFB800`; perigo `#E92151` |
| Neutros | `#FFFFFF`; `#E2E5E9`; `#8A94A6`; `#6B7280`; `#1A1A1A` |
| Espaçamento | 4, 8, 12, 16 e 24px |
| Raio | 4 e 8px |
| Tipografia | Mulish; 12, 14, 20, 24 e 40px; pesos 400, 600 e 700 |
| Altura de controle | 32, 40 e 48px; mínimo de 44px com `pointer: coarse` |
| Breakpoints | 600, 900 e 1200px |
| Largura máxima do conteúdo | 1316px |

## Layout base

- Cabeçalho e rodapé responsivos com `Logo`, de 40px e 24px.
- Rodapé no fim da página em telas altas, com direitos, atribuição à AniList e aviso de privacidade em `<details>` nativo.
- `main` vazio nesta etapa, com skip link e landmarks.
- Skeleton estático no `index.html`, exibido antes do JS.
- Mensagem de carregamento lento no `index.html`: se o JS não carregar em 8 segundos, o texto "O carregamento está demorando. Verifique sua conexão e recarregue a página." aparece só com CSS, também com movimento reduzido, e some quando o React monta.
- Link da AniList no rodapé abre em nova aba, com `(abre em nova aba)` para leitores de tela.
- `preconnect` para `graphql.anilist.co` e `s4.anilist.co`.

## Testes

- Vitest com jsdom e Testing Library; MSW configurado para as próximas specs.
- Playwright em 320, 375, 768, 1024, 1366 e 1920px, além de celular em paisagem e zoom de 200%.
- `@axe-core/playwright` em toda tela, sem violações WCAG 2.2 AA.

## Automação local

| Momento | Verificação |
| --- | --- |
| `pre-commit` | Prettier e ESLint nos arquivos alterados |
| `commit-msg` | commitlint |
| `pre-merge-commit` | TypeScript, Vitest, Playwright, build e size-limit |

As verificações pesadas rodam no merge porque o desenvolvimento acontece em branches locais até a publicação. O GitHub Actions executa as mesmas verificações depois da publicação. O `size-limit` reprova acima de 100 KB gzip de JS inicial.

Se o Git da máquina tiver `core.hooksPath` global, o Lefthook não instala os hooks do projeto e não há aviso na instalação. Por isso, `npm run hooks:install` define o caminho apenas no repositório e instala os hooks, sem alterar a configuração global.

## Documentação

| Arquivo | Conteúdo |
| --- | --- |
| `README.md` | O que é, estado atual, como executar, como testar e linha do tempo. Já existe desde `docs/pre-development-decisions` e é atualizado em cada branch |
| `CLAUDE.md` | Até 100 linhas: visão geral, comandos, regras, incluindo o resumo de idioma, e links, sem `@import` |
| `DECISIONS.md` | Resumo, trade-offs, o que foi além do mínimo e evoluções futuras |
| `AI_LOG.md` | Ferramentas, organização e o que foi verificado, corrigido ou rejeitado |
| `docs/architecture.md` | Camadas, fluxo de dados e mapa de pastas |
| `docs/conventions/code.md` | Padrões de componentes, tabela completa de idioma e exemplos curtos |
| `docs/conventions/git.md` | Branches, commits e merge |
| `docs/conventions/testing.md` | O que testar em cada camada e definição de pronto |
| `docs/conventions/accessibility.md` | Checklist de acessibilidade e responsividade |
| `docs/conventions/security.md` | CSP, headers e dados externos |
| `docs/design/tokens.md` | Tokens e desvios do design |
| `docs/api/anilist.md` | Comportamentos verificados e padrão de GraphQL |
| `docs/walkthrough.md` | Passo a passo técnico do projeto, criado na última branch |

## Definição de pronto de cada funcionalidade

1. Spec e plano aprovados antes do código.
2. Lint, TypeScript, Vitest e size-limit sem erros.
3. Playwright validando o layout nas larguras acordadas e os cenários da API, com capturas revisadas.
4. `axe-core` sem violações.
5. Nenhum spinner, comentário, `else` ou `any` no código.
6. Interface em português, conferida nas capturas do Playwright; código e Git em inglês.
7. `README.md` atualizado na própria branch: estado atual, comandos novos e uma linha na linha do tempo.
8. Merge com `--no-ff` na `main`, citando a spec.

## Ordem das branches

1. `docs/pre-development-decisions`
2. `chore/project-foundation`
3. `feat/anime-catalog`
4. `feat/format-filter`
5. `feat/text-search`
6. `feat/load-more`
7. `feat/feedback-states`
8. `chore/security-headers`
9. `feat/product-polish`
10. `docs/technical-walkthrough`

## Critérios de aceite

- Em um clone limpo, `npm ci` termina com 0 alertas e `npm audit` com 0 vulnerabilidades.
- `npm run lint`, `typecheck`, `test`, `test:e2e`, `build` e `size` passam.
- Um arquivo com `any`, comentário, `else`, ternário aninhado, import proibido ou `className` arbitrário faz o lint falhar.
- Um commit fora do padrão é rejeitado.
- O layout base não tem rolagem horizontal em nenhuma largura testada.
- O skeleton aparece antes do JS, verificado com JavaScript desativado.
- A página declara `lang="pt-BR"`, verificado no Playwright.
