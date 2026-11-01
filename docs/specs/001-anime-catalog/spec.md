# Spec 001: Catálogo de animes

Branch: `feat/anime-catalog`. Decisões anteriores em [000-pre-development](../../decisions/000-pre-development.md); regras da API em [anilist.md](../../api/anilist.md).

## Objetivo

Exibir a primeira página de animes da AniList em cards, com capa, título, gêneros e nota por cor, dentro do layout existente.

## Dúvidas resolvidas

| Dúvida | Tipo | Decisão | Alternativa descartada |
| --- | --- | --- | --- |
| Ordem da lista | Comportamento | Popularidade (`POPULARITY_DESC`): lista estável | Em alta (`TRENDING_DESC`): lista atual, como a do design |
| Película sobre a capa | Visual e contraste | Película de 60% atrás do texto, que acompanha a altura dele e se dissolve em 24px; o resto da capa fica limpo | Película uniforme de 60% em toda a capa: mais simples e mais escura |
| Título longo | Visual | Corte em 3 linhas com reticências, como no design | Inteiro, com o card crescendo a partir de 270px |
| Quantidade de gêneros | Visual | Até 3, como no design, na ordem da API | Todos, de até 6 ou mais, com quebra de linha |

Sem dúvida legal nova: `isAdult: false` e a limitação de "Ecchi" seguem como decididas. Capas reais não entram no repositório.

## Fora do escopo

Filtro, busca, "Ver mais", repetir a consulta com erro e estado de lista vazia. Cada um tem branch própria.

## Consulta

- `Page(page: 1, perPage: 12)` e `media(type: ANIME, isAdult: false, sort: [POPULARITY_DESC])`.
- Campos: `pageInfo.hasNextPage`, `id`, `title.romaji`, `coverImage.large`, `coverImage.extraLarge`, `averageScore` e `genres`.
- `hasNextPage` só é usado a partir de `feat/load-more`; entra agora para o contrato não mudar depois.

## Dados

| Peça | Local | Responsabilidade |
| --- | --- | --- |
| Cliente | `shared/api/graphqlClient.ts` | `POST` com `credentials: 'omit'` e `signal`; erros tipados para rede, status HTTP e `errors` |
| Consulta | `features/anime-catalog/api/` | Query nomeada, schema com `zod/mini` e conversão para `Anime` |
| Modelo | `features/anime-catalog/model/` | Tipo `Anime` e regra de cor da nota |
| Hook | `features/anime-catalog/hooks/useAnimeCatalog.ts` | TanStack Query, com cache só em memória |
| Provider | `app/` | `QueryClientProvider` |

Política do TanStack Query: dados válidos por 5 minutos; sem nova consulta ao focar a janela; até 2 novas tentativas só em erro de rede e 5xx, nunca em 4xx, para respeitar o limite de 30 requisições por minuto.

Dados nulos: `romaji` nulo exibe "Título indisponível"; capa nula deixa o fundo em `ink`. Uma resposta fora do schema é tratada como erro.

## Tela

| Elemento | Regra |
| --- | --- |
| Grade | `ul` de 1, 2, 3 e 4 colunas em 0, 600, 900 e 1200px, com `gap-lg` e largura máxima de 1316px |
| Card | `li` com `article`, mínimo de 270px, raio de 8px e capa ocupando todo o fundo com `object-cover` |
| Capa | `alt=""`, porque o título está ao lado; `srcset` com `large` e `extraLarge`, e `sizes` pela grade; as 4 primeiras com carregamento imediato, as demais com `loading="lazy"` |
| Título | `h2` branco, 24px, cortado em 3 linhas só visualmente: leitores de tela recebem o texto inteiro, e o atributo `title` o mostra ao passar o mouse |
| Gêneros | Até 3 `Chip`, em `shared/ui`: branco sobre `primary-light`, 12px, com `lang="en"` |
| Nota | Selo no canto inferior direito, com `85%` em negrito de 20px e o rótulo "Nota" só para leitores de tela |
| Sem nota | Selo em `neutral-100` com "Sem nota" em `ink` |
| Carregando | 12 `Skeleton`, em `shared/ui`, na mesma grade, com "Carregando catálogo" só para leitores de tela; o `index.html` passa de 8 para 12 |
| Erro | Só o mínimo, até `feat/feedback-states`: "Não foi possível carregar o catálogo." com `role="alert"` |

| Nota | Fundo | Texto |
| --- | --- | --- |
| Abaixo de 50 | `danger` | `white`: 3,46:1, válido como texto grande em negrito |
| De 50 a 80 | `warning` | `ink` |
| Acima de 80 | `success` | `ink` |

Novo token: `scrim`, preto com 60% de opacidade. O branco sobre ele dá ao menos 5,7:1 mesmo sobre uma capa totalmente branca. O `body` passa a usar `ink` e 14px como base.

## Critérios de aceite

- A página mostra 12 cards da API com capa, título, até 3 gêneros e nota.
- Notas 49, 50, 80 e 81 caem nas cores certas, e nota nula mostra "Sem nota".
- Título de 85 caracteres fica em até 3 linhas com reticências em 320px, sem rolagem horizontal, e continua inteiro para leitores de tela.
- O skeleton aparece enquanto a consulta não termina, sem spinner.
- Rede, status HTTP, `errors` com status 200 e resposta fora do schema mostram a mensagem de erro.
- A requisição não envia cookies nem solicita `description`.
- `axe-core` passa sem violações, com a lista, com o skeleton e com o erro.
- O JS inicial segue até 100 KB gzip.

## Testes

- **Vitest:** regra da nota nos limites, conversão com nulos, cliente nos três tipos de erro, política de novas tentativas e componentes com MSW. Requisição sem handler reprova o teste, mesmo se o TanStack Query tratar a rejeição.
- **Playwright:** em arquivo próprio, `e2e/catalog.spec.ts`, com API e imagens interceptadas e capas geradas, nas 8 telas acordadas.
- **Contrato:** `npm run test:contract` consulta a API real com o schema. Fica fora do `verify`, para o merge não depender da rede, e roda uma vez antes do merge.
- **Avaliação:** além das capturas com capas geradas, uma captura em 1366px com a API real, fora do repositório.

## Documentação

Atualizar `README.md`, `docs/architecture.md`, `docs/api/anilist.md`, `docs/design/tokens.md`, `DECISIONS.md`, `AI_LOG.md` e `CLAUDE.md`, inclusive o novo comando e os desvios: película e selo "Sem nota".
