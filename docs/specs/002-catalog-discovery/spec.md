# Spec 002: Descoberta no catálogo

Bloco B, em sequência: `feat/format-filter`, `feat/text-search` e `feat/load-more`. Base em [001-anime-catalog](../001-anime-catalog/spec.md); regras da API em [anilist.md](../../api/anilist.md).

## Dúvidas

Cada linha traz a decisão proposta. Aprovar a spec aprova todas.

| Dúvida | Tipo | Decisão proposta | Alternativa |
| --- | --- | --- | --- |
| Controle do filtro | Visual | Fileira de botões com `aria-pressed`, 8 opções, quebrando linha; selecionado em `primary` com texto branco | `select` nativo: menos código, mas esconde as opções |
| Posição dos controles | Visual | Acima da grade, com a mesma largura máxima: busca em cima, filtros embaixo, empilhados em qualquer largura | Lado a lado a partir de 900px |
| Quando a busca dispara | Comportamento | Ao enviar (Enter ou botão "Buscar"), como decidido para o limite de 30 req/min | A cada tecla com atraso |
| Busca e filtro juntos | Comportamento | Combinam: trocar um mantém o outro | Trocar o filtro limpa a busca |
| Ordem com busca | Comportamento | `SEARCH_MATCH` com texto; `POPULARITY_DESC` sem texto | Manter popularidade: resultados menos relevantes |
| Estado na URL | Comportamento | `?format=MOVIE&q=naruto`; cada mudança cria uma entrada no histórico; formato inválido na URL é ignorado; texto é cortado nas pontas e vazio sai da URL | Só estado em memória |
| Sem resultados | Comportamento | Mensagem simples "Nenhum anime encontrado." com `role="status"`; versão final em `feat/feedback-states` | Adiar para o Bloco C e mostrar grade vazia |
| "Ver mais" | Comportamento | Acrescenta 12 itens abaixo; some quando `hasNextPage` é falso; durante o carregamento mostra 12 skeletons abaixo da lista, sem spinner | Substituir a página: perde o contexto |
| Erro ao carregar mais | Comportamento | Mantém a lista e mostra "Não foi possível carregar mais animes." com `role="alert"` acima do botão, que tenta de novo | Trocar a tela inteira pelo erro |
| Foco e leitor de tela em "Ver mais" | Visual e acessibilidade | O foco fica no botão; `role="status"` anuncia "12 animes carregados" | Mover o foco para o primeiro item novo |
| Texto da busca | Legal | Sem nova dúvida: o aviso de privacidade do rodapé já informa que os termos buscados chegam à AniList; confirmo o texto na branch | — |

## Fora do escopo

Timeout, nova tentativa manual na primeira carga e estados finais de vazio e erro (`feat/feedback-states`); cabeçalhos de segurança; contador de resultados (a API não o garante).

## `feat/format-filter`

- `formats.ts` em `features/anime-catalog/model/` com o mapa tipado rótulo → valor da API, conforme [anilist.md](../../api/anilist.md#formatos).
- `useCatalogSearchParams` lê e grava `format` e `q` na URL com `URLSearchParams`; o `queryKey` de `useAnimeCatalog` passa a incluir os dois.
- `fetchAnimeCatalog` recebe um objeto `{ format, search }` e omite variáveis vazias; a query ganha `$format: MediaFormat`.
- `FormatFilter` em `features/anime-catalog/components/`, com botão em `shared/ui` e variantes em mapa tipado. Alvo de toque de 44px em telas de toque.

Aceite:

- "Todos os formatos" vem selecionado por padrão e não envia `format`.
- Escolher "Filme" envia `format: MOVIE`, atualiza a URL e troca a lista, com skeleton durante o carregamento.
- Abrir `?format=MOVIE` já mostra o filtro aplicado; `?format=XYZ` equivale a todos os formatos.
- Voltar no navegador restaura o filtro anterior.
- Cada botão tem `aria-pressed` correto e navegação por Tab, com foco visível.

## `feat/text-search`

- `SearchForm` com `<form role="search">`, `input type="search"` com rótulo visível ou associado, botão "Buscar", placeholder e borda com os contrastes de [tokens.md](../../design/tokens.md).
- A consulta usa `$search: String` e `sort` por variável: `SEARCH_MATCH` com texto, `POPULARITY_DESC` sem.
- Texto vazio ou só com espaços não envia `search` (a API devolve lista vazia para `""`).
- Uma busca nova cancela a anterior pelo `signal`.
- Mensagem "Nenhum anime encontrado." quando a lista vem vazia.

Aceite:

- Digitar não dispara requisição; Enter ou "Buscar" dispara uma só.
- A requisição leva `search` em variável e `sort: SEARCH_MATCH`; sem texto, volta a `POPULARITY_DESC`.
- Busca e formato juntos enviam as duas variáveis; a URL mostra `format` e `q`.
- `?q=naruto` abre já buscando e preenche o campo.
- Texto de 200 caracteres não gera rolagem horizontal em 320px.
- Busca sem resultado mostra a mensagem, sem erro.

## `feat/load-more`

- `useAnimeCatalog` passa a usar `useInfiniteQuery` com `page` como parâmetro e `hasNextPage` da API; lista achatada na saída do hook.
- `LoadMoreButton` com texto "Ver mais", texto `ink` sobre amarelo (10,04:1) conforme as decisões de contraste, altura de 48px.
- Trocar filtro ou busca volta à primeira página.

Aceite:

- Com `hasNextPage` verdadeiro, o botão aparece; um clique pede a página 2 com o mesmo filtro e a mesma busca e acrescenta 12 cards, sem repetir ids.
- Durante o pedido, 12 skeletons aparecem abaixo da lista e o botão não dispara outro pedido.
- Com `hasNextPage` falso, o botão não aparece.
- Falha ao carregar mais mantém os cards e mostra o alerta, e o botão tenta de novo.
- Depois de carregar, o leitor de tela recebe "12 animes carregados" e o foco continua no botão.

## Testes

- **Vitest:** mapa de formatos, leitura e escrita da URL (inclusive valores inválidos), conversão da consulta com variáveis vazias omitidas, hook com várias páginas, componentes com MSW.
- **Playwright:** arquivos próprios (`e2e/format-filter.spec.ts`, `e2e/text-search.spec.ts`, `e2e/load-more.spec.ts`) com o `test` de `e2e/support/anilist.ts`, em 320, 768 e 1366px, com axe, durante o trabalho. As 8 telas completas só no merge.
- **Contrato:** `npm run test:contract` roda uma vez antes dos merges, porque a consulta muda.

## Documentação

Por branch, no `README.md`; no fim do bloco, `docs/architecture.md`, `docs/api/anilist.md` (consulta com `format`, `search`, `sort` e página), `docs/design/tokens.md` se surgir token, `DECISIONS.md`, `AI_LOG.md` e `CLAUDE.md` (estado atual).
