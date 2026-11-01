# Segurança

O aplicativo é estático, sem servidor, sem contas e sem segredos. A API da AniList é pública e dispensa chave.

## Já aplicado

- Link externo para a AniList com `rel="noreferrer"`.
- `index.html` sem scripts em linha, o que permite uma CSP sem `unsafe-inline`.
- Versões exatas de dependências, `npm ci` sem alertas e `npm audit` sem vulnerabilidades.
- Fonte servida pelo próprio aplicativo (Fontsource), sem terceiro adicional.
- Cabeçalhos no `vercel.json`, para todas as rotas, com a CSP abaixo, `Strict-Transport-Security` de 2 anos (sem `includeSubDomains` nem `preload`), `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` e `Permissions-Policy` sem câmera, microfone, geolocalização, pagamento e USB.
- Timeout de 10 segundos em cada requisição à API.
- `/assets/*` com `Cache-Control: public, max-age=31536000, immutable`: os arquivos têm hash no nome.
- Texto da busca limitado a 100 caracteres, no campo e na leitura da URL; links para a AniList só se começarem com `https://anilist.co/`, e cores de capa só como `#rrggbb`.
- Capas aceitas só de `https://s4.anilist.co/`: qualquer outra URL vira capa nula.

## Política de segurança de conteúdo

| Diretiva | Valor |
| --- | --- |
| `default-src`, `script-src`, `style-src`, `font-src` | `'self'` |
| `img-src` | `'self' https://s4.anilist.co` |
| `connect-src` | `'self' https://graphql.anilist.co` |
| `object-src`, `frame-ancestors` | `'none'` |
| `base-uri`, `form-action` | `'self'` |

Sem `unsafe-inline`, `unsafe-eval` nem `data:`. Não há `report-uri`, porque o projeto não tem coletor. Um teste do Vitest reprova uma política mais frouxa, e o Playwright serve o build com os cabeçalhos do `vercel.json` e prova que o catálogo, o filtro, a busca e "Ver mais" não geram violação. O `vercel.json` só vale na Vercel: `npm run preview` não aplica os cabeçalhos.

## Dados externos

Tudo que chega da AniList é tratado como não confiável.

| Regra | Como |
| --- | --- |
| Validar a resposta em tempo de execução | Zod na borda do cliente, antes do modelo `Anime` |
| Não receber HTML | O campo `description` não é solicitado |
| Nunca montar a query com entrada do usuário | Entrada só em variáveis GraphQL |
| Nunca renderizar HTML da API | Sem `dangerouslySetInnerHTML`; React escapa o texto |
| Não enviar nem receber cookies | `credentials: 'omit'` |
| Não usar a API como armazenamento | Cache somente em memória, sem `localStorage` para dados da API |
| Conteúdo adulto fora da lista | `isAdult: false` sempre; "Ecchi" não é considerado adulto pela API, limitação registrada |
| Respeitar o limite de 30 requisições por minuto | Busca dispara ao enviar, nunca a cada tecla |

## Privacidade

Sem contas, analytics nem cookies próprios (LGPD). O aviso no rodapé informa que o navegador se conecta à AniList, que recebe o IP e os termos buscados. A necessidade de aferição de idade prevista na ECA Digital não foi confirmada e exige avaliação jurídica antes de uso comercial.

## Dependências

- `overrides.minimatch` em `^11.0.1` afeta só ferramentas de desenvolvimento.
- `allowScripts` aprova apenas `lefthook`.
- `eslint-plugin-jsx-a11y-x` é um projeto jovem, aceito porque só atua em desenvolvimento.
- Antes de atualizar uma dependência, rode `npm audit` e `npm run verify`.
