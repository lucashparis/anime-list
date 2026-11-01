# Spec 004: Acabamento e passo a passo técnico

Bloco D, em sequência: `feat/product-polish` e `docs/technical-walkthrough`. A branch `chore/ci` (GitHub Actions) fica de fora e só entra se sobrar tempo. Base em [003-feedback-and-security](../003-feedback-and-security/spec.md).

## Dúvidas

Cada linha traz a decisão proposta. A URL de produção é `https://anime-list-silk.vercel.app/`, e o `engines` do Node fica como está, porque o deploy funcionou.

| Dúvida | Tipo | Decisão proposta | Alternativa |
| --- | --- | --- | --- |
| Prévia no GitHub | Ação sua | Eu gero a imagem de 1280×640 em `docs/assets/`; você a envia em Settings → Social preview, porque o GitHub não aceita upload por commit | Pular a prévia do repositório |
| Ícone | Visual | Monograma "BA" em Mulish: "B" branco e "A" amarelo (`warning`), sobre `primary`, como a marca | Só "B" branco: mais legível em 16px |
| Imagem de prévia (1200×630) | Visual e legal | Só a marca "BUSCANIME" e a frase "Encontre animes por formato e nome." sobre `primary`; nenhuma capa, porque as capas são da AniList | Colagem de capas: viola o uso das imagens de terceiros |
| Formatos do ícone | Escopo | `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` (180px); sem manifest nem PWA | Conjunto completo de PWA: fora do escopo |
| Aspecto legal | Legal | Sem dúvida nova: a imagem usa só a marca, e o aviso de privacidade segue como está | — |

## Fora do escopo

Manifest, PWA, GitHub Actions, tema escuro, página de detalhe, analytics e outros idiomas.

## `feat/product-polish`

- Ícones em `public/`, gerados por script com o Playwright a partir de um SVG da marca, sem dependência nova.
- Imagem de prévia `og-image.png` (1200×630) em `public/` e `github-social.png` (1280×640) em `docs/assets/`, ambas só com a marca.
- `index.html` com `og:title`, `og:description`, `og:image` (com `alt`), `og:url`, `og:type`, `og:locale` `pt_BR`, `twitter:card` `summary_large_image`, `canonical` e `theme-color` `#6324c6`.
- `robots.txt` permitindo tudo.
- `index.html` continua sem scripts nem estilos em linha, e a CSP não muda: imagens e ícones vêm da mesma origem.

Aceite:

- O navegador mostra o ícone na aba, em 16 e 32px, e o iPhone usa o `apple-touch-icon`.
- Um teste lê o `index.html` e confirma as meta tags com URL absoluta e `https`.
- As imagens têm o tamanho exato (1200×630 e 1280×640), verificado em teste.
- A prévia de um link no Slack ou no WhatsApp mostra título, descrição e imagem; verificação manual sua depois do deploy, junto com o teste no Safari do iPhone.
- `axe-core` e o limite de 100 KB gzip de JS seguem passando.
- Contraste do "A" amarelo sobre `primary` medido e registrado em [tokens.md](../../design/tokens.md): o ícone é um componente gráfico, com mínimo de 3:1.

## `docs/technical-walkthrough`

`docs/walkthrough.md`, em português, para quem vai avaliar o código:

1. O que é o produto e como rodar.
2. Mapa do repositório e fluxo de dados, em um diagrama curto.
3. As decisões que mais pesaram (Vite contra Next, URL como estado, Zod na borda, CSP), cada uma com um link para o registro completo.
4. Como a qualidade é garantida: regras de lint, testes, contrato, acessibilidade, limite de JS.
5. Como a IA foi usada, com link para o [AI_LOG](../../../AI_LOG.md).
6. Limitações conhecidas e próximos passos, com link para o [DECISIONS](../../../DECISIONS.md).

Aceite:

- Todos os links do documento funcionam, verificado por script.
- O documento cabe em uma leitura de 10 minutos, até 250 linhas.
- `README.md` e `CLAUDE.md` apontam para ele.

## Testes

- **Vitest:** meta tags do `index.html`, dimensões das imagens e existência dos ícones.
- **Playwright:** `e2e/product-polish.spec.ts` confirma que os ícones respondem com `200` e o tipo certo, sem violação de CSP.
- **Contrato:** a consulta não muda; não roda.
- Capturas das 8 telas e das duas imagens de prévia para você avaliar antes do merge.

## Documentação

`README.md` por branch, com o link de produção; no fim do bloco, `docs/architecture.md`, `docs/design/tokens.md`, `DECISIONS.md`, `AI_LOG.md` e `CLAUDE.md`.
