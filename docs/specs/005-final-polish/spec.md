# Spec 005: Lapidação final

Branch: `feat/final-polish`. Nasce do levantamento de código e do Lighthouse feitos depois do Bloco D. Base em [004-polish-and-walkthrough](../004-polish-and-walkthrough/spec.md).

## Decisões

| Item | Tipo | Decisão |
| --- | --- | --- |
| Card clicável | Comportamento | O título vira um link "esticado" que cobre o card inteiro e abre a página do anime na AniList em nova aba, com `rel="noreferrer"` e "(abre em nova aba)" para leitores de tela. Sem `siteUrl` válido, o card segue sem link |
| Origem do link | Segurança | O schema aceita só `https://anilist.co/`; qualquer outra URL vira link nulo |
| Movimento ao passar o mouse | Visual | Botões: cor em 150ms e leve afundamento ao clicar. Cards: sobem 4px, ganham sombra e a capa amplia 5%. Tudo dentro de `motion-safe`, e em `hover: hover` para não grudar em telas de toque |
| Cursor | Visual | `cursor-pointer` em botões e cards clicáveis; `cursor-not-allowed` continua nos desabilitados |
| Foco depois de enviar a busca | Acessibilidade | O campo deixa de ser recriado e mantém o foco. "Limpar busca e filtro" e "Tentar novamente" devolvem o foco ao campo de busca e à lista |
| Limite da busca | Segurança | 100 caracteres no campo e na leitura da URL |
| Cache dos assets | Desempenho | `Cache-Control: public, max-age=31536000, immutable` em `/assets/*` |
| Título da aba | Acessibilidade | `BuscAnime: catálogo de animes`, com ` · Filme` e ` · "naruto"` quando houver filtro e busca |
| Estrutura de títulos | Acessibilidade | `h2` "Catálogo de animes" só para leitores de tela; os títulos dos cards passam a `h3` |
| Licença | Legal | `LICENSE` MIT em nome de Lucas Paris, com `license`, `description` e `repository` no `package.json`. A escolha é sua e pode ser trocada |
| Imagens | Desempenho | Medir antes e depois de cada ajuste com o Lighthouse e manter só o que melhora a nota ou a nitidez |

## Critérios de aceite

- Depois de enviar a busca, o foco continua no campo; o mesmo vale depois de limpar os filtros e de tentar de novo.
- Um link com `?q=` de 10 mil caracteres usa só os 100 primeiros.
- Clicar em um card abre a página da AniList em nova aba; um `siteUrl` de outra origem não gera link.
- Passar o mouse sobre botões e cards mostra o cursor de mão e a animação, que some com `prefers-reduced-motion`.
- O `vercel.json` marca `/assets/*` como imutável, e um teste prova isso sem tocar nos demais cabeçalhos.
- `axe-core` sem violações, sem rolagem horizontal de 320 a 1920px e JS inicial até 100 KB gzip.
- O Lighthouse (mobile e desktop) é medido de novo e registrado, com o que mudou e o que não mudou.

## Fora do escopo

GitHub Actions, relatório de cobertura e capturas no `README`, que continuam como pendências opcionais.
