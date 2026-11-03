# API AniList

Endpoint GraphQL: `https://graphql.anilist.co`. Capas em `https://s4.anilist.co`. O cliente fica em `src/shared/api/graphqlClient.ts`, e a consulta do catálogo em `src/features/anime-catalog/api/fetchAnimeCatalog.ts`. Fontes e levantamento completo em [000-pre-development](../decisions/000-pre-development.md#api-anilist).

## Padrão de GraphQL

1. Query fixa e nomeada, em um único arquivo.
2. Entrada do usuário só em variáveis.
3. Solicitar apenas os campos usados na tela.
4. Omitir variáveis vazias.
5. Paginar apenas com `hasNextPage`.
6. Tratar erros em um único cliente: rede, tempo esgotado, status HTTP e `errors`.
7. Converter a resposta para o modelo `Anime` antes de chegar à tela.

Sem GraphQL Codegen, uma mudança no schema não é detectada na compilação. O Zod e um teste de contrato contra a API real (`npm run test:contract`) cobrem esse risco.

## Consulta do catálogo

`AnimeCatalog` pede 12 itens por página, com `type: ANIME` e `isAdult: false` fixos. Variáveis: `page`, `perPage`, `sort` e, só quando houver valor, `format` e `search`. Sem texto, `sort` é `POPULARITY_DESC`; com texto, `SEARCH_MATCH`, porque a popularidade enterra os resultados relevantes. "Ver mais" pede `page + 1` enquanto `hasNextPage` for verdadeiro, e a lista junta as páginas sem repetir `id`. Campos: `pageInfo.hasNextPage`, `id`, `title.romaji`, `coverImage.large`, `coverImage.extraLarge`, `coverImage.color`, `averageScore`, `genres` e `siteUrl`.

| Falha | Tipo do `ApiError` | Nova tentativa |
| --- | --- | --- |
| Rede | `network` | Até 2 |
| Sem resposta em 10s | `timeout` | Nenhuma |
| Status 5xx | `http` | Até 2 |
| Status 4xx, inclusive 429 | `http` | Nenhuma, para respeitar o limite de requisições |
| Campo `errors` com status 200 | `graphql` | Nenhuma |
| Corpo fora do schema | `schema` | Nenhuma |

As capas só valem se começarem com `https://s4.anilist.co/`; outra URL vira capa nula. Cada requisição tem 10 segundos para responder. Uma consulta que falhou não repete sozinha ao montar de novo: só o botão "Tentar novamente" a repete.

Os dados ficam válidos por 5 minutos, e focar a janela não dispara nova consulta. As consultas usam `networkMode: 'always'`: no padrão do TanStack Query, perder a conexão pausa a consulta sem erro, e a tela ficaria no skeleton indefinidamente.

## Comportamentos verificados

Verificados com requisições reais.

| Comportamento | Consequência |
| --- | --- |
| Limite atual de 30 requisições por minuto, informado no header | Busca dispara ao enviar, nunca a cada tecla |
| `search: ""` retorna lista vazia; `null` retorna tudo | Variáveis vazias são omitidas |
| `search` compara palavras completas, não o começo delas: `Nar` e `Narut` não trazem Naruto, e `Shingeki no Kyo` funciona porque "Shingeki" está inteira. A tolerância a erros é irregular (`Bleac` traz BLEACH), e não há outro filtro de título | A lista vazia orienta a escrever a palavra inteira |
| `total` e `lastPage` não são confiáveis, segundo a documentação | Paginação usa apenas `hasNextPage`; sem contador de resultados |
| `averageScore`, `format` e `title.english` podem ser nulos | Nota nula tem estado próprio; título usa `romaji` |
| Formato inválido retorna erro 400; a documentação avisa que pode haver erro com status 200 | Cliente verifica o status e o campo `errors` |
| `description` contém HTML | O campo não é solicitado, eliminando um vetor de XSS |
| Resposta tenta gravar cookie de sessão | Requisições usam `credentials: 'omit'` |
| Termos proíbem usar a API como armazenamento | Cache somente em memória |
| `isAdult` filtra conteúdo adulto, mas "Ecchi" não é considerado adulto | `isAdult: false` sempre; limitação registrada |

## Tamanho da consulta

Uma consulta de 12 itens com só os campos da tela pesa 3,5 KB (1 KB em gzip). Com um conjunto amplo de campos, 36 KB (10,5 KB em gzip).

## Formatos

| Interface | Valor na API |
| --- | --- |
| Todos os formatos | Omitido |
| Série de TV | `TV` |
| Filme | `MOVIE` |
| Curta de TV | `TV_SHORT` |
| Especial | `SPECIAL` |
| OVA | `OVA` |
| ONA | `ONA` |
| Música | `MUSIC` |
