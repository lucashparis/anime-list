# Spec 003: Estados de tela e cabeçalhos de segurança

Bloco C, em sequência: `feat/feedback-states` e `chore/security-headers`. Base em [002-catalog-discovery](../002-catalog-discovery/spec.md); regras de segurança em [security.md](../../conventions/security.md).

## Dúvidas

Cada linha traz a decisão proposta. Aprovar a spec aprova todas.

| Dúvida | Tipo | Decisão proposta | Alternativa |
| --- | --- | --- | --- |
| Falha da primeira página | Comportamento | Mensagem e botão "Tentar novamente", que repete a consulta com skeleton | Só a mensagem, como hoje |
| Limite de requisições (429) | Comportamento | Mensagem própria: "Muitas consultas em pouco tempo. Aguarde um minuto e tente de novo." | Mesma mensagem genérica |
| Timeout | Comportamento | 10 segundos por requisição, tratado como falha de rede, sem nova tentativa automática, para o skeleton não passar de 10s | 2 novas tentativas, como na rede: até 30s de skeleton |
| Lista vazia | Comportamento e visual | Mensagem com o termo ("Nenhum anime encontrado para “naruto”.", sem termo "Nenhum anime encontrado.") e botão "Limpar busca e filtro" | Só a mensagem atual |
| "Ver mais" depois de um erro | Comportamento | O rótulo do botão vira "Tentar novamente" | Manter "Ver mais" |
| Erro inesperado de renderização | Comportamento | Error boundary no `app`, com "Algo deu errado." e botão "Recarregar a página" | Tela em branco |
| Capa fora de `s4.anilist.co` | Segurança | O schema aceita só `https://s4.anilist.co/`; qualquer outra vira capa nula (fundo `ink`), sem derrubar a lista | Aceitar qualquer URL e confiar na CSP |
| Política de cabeçalhos | Segurança | CSP sem `unsafe-inline`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options`, `Permissions-Policy` fechada e `frame-ancestors 'none'`; sem relatório de violações | Incluir `report-uri`: exige coletor, o que o projeto não tem |
| HSTS | Segurança | `max-age` de 2 anos, sem `includeSubDomains` nem `preload`, porque não controlo o domínio final | Com `preload`: irreversível na prática |
| Aspecto legal | Legal | Sem dúvida nova: os textos de erro não coletam dados e o aviso de privacidade segue como está | — |

## Fora do escopo

Prévia do link, ícones e acabamento (`feat/product-polish`); GitHub Actions e publicação; rastreamento de erros, que exigiria um serviço externo e um aviso de privacidade novo.

## `feat/feedback-states`

- `graphqlClient`: `AbortSignal.timeout(10_000)` combinado com o `signal` da consulta. A expiração vira `ApiError` do tipo `timeout`, que a política de novas tentativas não repete; o cancelamento por troca de filtro continua silencioso.
- `useAnimeCatalog` com `retryOnMount: false`: uma consulta que falhou só repete pelo botão, inclusive no 429.
- `CatalogError` em `features/anime-catalog/components/`, com mensagem por tipo de erro (429, outros) e botão que chama `refetch` do hook.
- `EmptyCatalog` com botão que limpa `q` e `format` de uma vez, via `useCatalogFilters`.
- `LoadMore`: rótulo "Tentar novamente" depois de um erro.
- `ErrorBoundary` em `app/`, em volta do catálogo, sem dependência nova.
- Os textos de estado usam `role="alert"` para erro e `role="status"` para vazio.

Aceite:

- Com a API pendurada por mais de 10s, aparece o erro com "Tentar novamente"; o skeleton não passa de 10s.
- Trocar o filtro ou a busca durante o pedido não mostra erro.
- "Tentar novamente" mostra o skeleton e, se a API voltar, a lista.
- Resposta 429 mostra a mensagem do limite e não repete a consulta sozinha.
- Busca sem resultado cita o termo, e "Limpar busca e filtro" volta à lista de popularidade com a URL limpa.
- Depois de um erro em "Ver mais", o botão diz "Tentar novamente" e a lista fica intacta.
- Um erro lançado na renderização mostra o fallback, sem tela em branco.
- `axe-core` passa sem violações em erro, vazio e fallback, em 320, 768 e 1366px, sem rolagem horizontal.
- Durante a nova tentativa o botão continua na tela, com o foco, abaixo do skeleton; quando a lista chega, o botão sai.

## `chore/security-headers`

- `vercel.json` com os cabeçalhos para todas as rotas. CSP: `default-src 'self'`; `script-src 'self'`; `style-src 'self'`; `font-src 'self'`; `img-src 'self' https://s4.anilist.co`; `connect-src 'self' https://graphql.anilist.co`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`.
- Schema das capas restrito a `https://s4.anilist.co/`, com teste.
- Teste que lê o `vercel.json` e reprova `unsafe-inline`, `unsafe-eval` e curinga nas origens.
- Teste no Playwright que serve o build com a CSP do `vercel.json` e prova que não há violação no console, com fontes, capas, consulta e a mensagem de carregamento lento.
- `docs/conventions/security.md` passa de "Previsto" para "Já aplicado".

Aceite:

- Com a CSP aplicada, o catálogo, o filtro, a busca e "Ver mais" funcionam sem violação no console.
- Uma capa de outra origem não é carregada e o card mostra o fundo `ink`.
- Uma `<script>` em linha injetada em tempo de teste é bloqueada.
- O `vercel.json` é JSON válido e tem os 6 cabeçalhos.

## Testes

- **Vitest:** cliente com timeout e cancelamento, política de nova tentativa, mensagem por tipo de erro, componentes de erro e vazio, error boundary, schema das capas e conteúdo do `vercel.json`.
- **Playwright:** arquivos próprios (`e2e/feedback-states.spec.ts`, `e2e/security-headers.spec.ts`), em 320, 768 e 1366px, com axe. As 8 telas completas só no merge.
- **Contrato:** não muda a consulta; `npm run test:contract` só roda se o schema das capas afetar a resposta real, e roda uma vez antes do merge.

## Documentação

`README.md` por branch; no fim do bloco, `docs/architecture.md`, `docs/api/anilist.md` (timeout e erros), `docs/conventions/security.md`, `DECISIONS.md`, `AI_LOG.md` e `CLAUDE.md`. Corrigir a [spec da fundação](../000-foundation/spec.md): a mensagem de 8s fica oculta sem JS e o GitHub Actions ainda não existe.
