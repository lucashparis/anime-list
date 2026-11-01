# Arquitetura

Aplicativo React estático, construído com Vite. Não há servidor próprio: cada navegador chama a API da AniList e consome a própria cota. Motivos em [000-pre-development](decisions/000-pre-development.md#arquitetura).

## Camadas

Arquitetura por funcionalidade, no modelo do [Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md). A dependência vai em um só sentido:

```
app  →  features  →  shared
```

| Camada | Responsabilidade | Pode importar de |
| --- | --- | --- |
| `app` | Composição da página, layout e providers | `features`, `shared` |
| `features` | Uma pasta por funcionalidade, com `api`, `hooks`, `model` e `components` | `shared` |
| `shared` | Componentes genéricos, tokens e cliente HTTP | Nada acima dele |

O ESLint reprova o sentido contrário com `no-restricted-imports`.

## Fluxo de dados

```
componente → hook → TanStack Query → cliente fetch → AniList
                                          ↓
              componente ← modelo Anime ← Zod
```

1. O componente que usa o dado chama o hook, sem repassar props por vários níveis.
2. O hook usa o TanStack Query, que guarda o cache em memória.
3. O cliente em `shared/api` faz o `fetch` e trata rede, status HTTP e o campo `errors`.
4. O Zod valida a resposta em tempo de execução.
5. A resposta vira o modelo `Anime` antes de chegar à tela.

Filtro e busca ficarão na URL, com `URLSearchParams`. As regras de GraphQL estão em [anilist.md](api/anilist.md).

## Mapa de pastas

Existe hoje:

```
src/
  main.tsx                   ponto de entrada
  app/
    App.tsx                  skip link, header, main e footer
    AppProviders.tsx         provider do TanStack Query
    layout/                  Header e Footer
  features/anime-catalog/
    api/                     query, schema e conversão para Anime
    hooks/                   useAnimeCatalog
    model/                   tipo Anime e regra de cor da nota
    components/              lista, card, selo da nota e skeleton
  shared/
    api/                     cliente GraphQL, erros tipados e padrões do TanStack Query
    styles/index.css         tokens do @theme
    ui/                      Logo, Chip e Skeleton
  test/                      setup do Vitest, MSW e dados de teste
e2e/
  layout.spec.ts             layout, axe, idioma e noscript
  catalog.spec.ts            catálogo, estados da API e capturas
  support/                   API interceptada e lista de telas
tools/eslint/                regra no-comments e testes das regras
index.html                   metadados, preconnect e skeleton estático
vitest.contract.config.ts    teste de contrato contra a API real
```

Previsto, na ordem das [branches](specs/000-foundation/spec.md#ordem-das-branches):

- `src/shared/ui/`: `Button`, criado com a primeira funcionalidade que o usar.
- `src/app/`: error boundary.

## Carregamento

O `index.html` traz um skeleton estático, exibido antes do JS, e uma mensagem em `noscript`. O `preconnect` para `graphql.anilist.co` e `s4.anilist.co` adianta a conexão. Isso compensa o custo aceito do Vite: o primeiro card chega depois.
