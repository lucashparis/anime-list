# Tokens e desvios do design

O design é seguido em layout, cores, tipografia e proporções. Os valores irregulares do frame (10, 11, 15, 19 e 25px) viram a escala de tokens, e a acessibilidade vence quando há conflito. Os tokens ficam em `src/shared/styles/index.css`, dentro de `@theme`, com `--*: initial` para remover as escalas padrão do Tailwind. Só existem os valores abaixo.

## Tokens

| Grupo | Token | Valor | Uso no Tailwind |
| --- | --- | --- | --- |
| Primária | `primary` | `#6324C6` | `bg-primary`, `text-primary` |
| Primária | `primary-light` | `#774DC5` | `bg-primary-light` |
| Feedback | `success` | `#01ADA6` | `bg-success` |
| Feedback | `warning` | `#FFB800` | `bg-warning`, `text-warning` |
| Feedback | `danger` | `#E92151` | `bg-danger` |
| Neutros | `white` | `#FFFFFF` | `bg-white`, `text-white` |
| Neutros | `neutral-100` | `#E2E5E9` | `bg-neutral-100` |
| Neutros | `neutral-400` | `#8A94A6` | Borda de campo |
| Neutros | `neutral-500` | `#6B7280` | Placeholder |
| Neutros | `ink` | `#1A1A1A` | `text-ink` |
| Película | `scrim` | Preto com 60% de opacidade | `bg-scrim`, `from-scrim` |
| Espaçamento | `xs`, `sm`, `md`, `lg`, `xl` | 4, 8, 12, 16 e 24px | `p-lg`, `gap-sm` |
| Altura de controle | `control-sm`, `control-md`, `control-lg` | 32, 40 e 48px | `h-control-md` |
| Altura de controle | `control-touch` | 44px | `pointer-coarse:min-h-control-touch` |
| Card | `card` | 270px | `min-h-card` |
| Sombra | `card` | `0 8px 16px` com 25% de preto | `hover:shadow-card` |
| Espaçamento | `spacing` (base) | 4px | Faz utilitários numéricos como `inset-0` valerem; sem ele, o `--*: initial` os anulava |
| Raio | `sm`, `md` | 4 e 8px | `rounded-sm` |
| Tipografia | `font-sans` | Mulish Variable | Fonte padrão |
| Tipografia | `xs`, `sm`, `md`, `lg`, `xl` | 12, 14, 20, 24 e 40px | `text-xs` |
| Tipografia | `regular`, `semibold`, `bold` | 400, 600 e 700 | `font-regular` |
| Tipografia | `tight` | Altura de linha de 1,25 | `leading-tight` |
| Breakpoints | `sm`, `md`, `lg` | 600, 900 e 1200px | `sm:`, `md:`, `lg:` |
| Largura máxima | `content` | 1316px | `max-w-content` |
| Largura máxima | `search` | 1012px, a linha da busca com o botão no design | `max-w-search` |
| Animação | `animate-pulse` | `pulse` de 2s, com opacidade em 50% no meio | `motion-safe:animate-pulse` |
| Animação | `animate-reveal-late` | `reveal-late` de 8s, em um passo, de oculto para visível | `invisible animate-reveal-late` |

A `Logo` usa `text-xl` (40px) no cabeçalho e `text-lg` (24px) no rodapé. O `body` usa `ink` e `text-sm` (14px) como base.

## Desvios do design

Os desvios de cor, contraste, espaçamento, altura e rodapé estão na [tabela de decisões](../decisions/000-pre-development.md#desvios-do-design). Os da fundação e do catálogo, além dela:

| Item | Design | Implementação | Motivo |
| --- | --- | --- | --- |
| Aviso de privacidade | Não existe | `<details>` nativo, com a seta de expansão mantida | Elemento nativo; a seta indica que o aviso abre |
| Skip link | Não existe | Sobrepõe o cabeçalho ao receber foco, com fundo branco e texto primário | Um contorno branco em página branca seria invisível |
| Aviso e link no rodapé | Não existe | Alvo de toque de 44px em telas `pointer: coarse` | Área de toque |
| Link da AniList | Não existe | Abre em nova aba, com `(abre em nova aba)` visível só para leitores de tela | Quem lê o catálogo não perde a página |
| Mensagem de carregamento lento | Não existe | Parágrafo no `index.html` que aparece após 8 segundos se o JS não carregar, inclusive com movimento reduzido, e some quando o React monta. O CSS entra por `<link>` no `index.html`, para valer antes do JS também no `npm run dev` | Avisa quem está sem conexão; não é movimento, por isso não usa `motion-safe` |
| Dica da busca sem resultado | Não existe | Segunda frase na lista vazia, só quando há busca, com o mesmo texto e 8px de distância | A API só reconhece palavras completas, e sem a dica "Nar" parece não ter resultados |
| Película sobre a capa | Escurecimento sem contraste garantido | `scrim` atrás do texto, acompanhando a altura dele e dissolvendo em 24px | Branco sobre o `scrim` dá ao menos 5,7:1, mesmo em capa branca e título longo |
| Ícone e prévia do link | Não existe | Monograma "BA" ("B" branco e "A" `warning`) sobre `primary`; a prévia traz só a marca e a frase, sem capas | O "A" amarelo dá 4,66:1 e o "B" branco 8,08:1 sobre `primary`, acima dos 3:1 de um componente gráfico; as capas são da AniList |
| Card clicável | Não existe | Título como link esticado até a AniList, em nova aba; ao passar o mouse o card sobe 4px, ganha sombra e a capa amplia 5%, só com `motion-safe` | Quem avalia espera abrir o anime; a animação some com movimento reduzido |
| Botões | Sem estado de hover | Cursor de mão, cor em 150ms e afundamento ao clicar; `cursor-not-allowed` nos desabilitados | Sinal de que o elemento é clicável |
| Fundo do card | `ink` | Cor média da capa (`coverImage.color`) enquanto a imagem carrega | A imagem não "pisca" sobre o preto; o texto fica sobre o `scrim`, com o mesmo contraste |
| Nota nula | Não existe | Selo em `neutral-100` com "Sem nota" em `ink` | A API pode não ter nota, e a cor não pode ser a única informação |

## Como adicionar um token

1. Confirme que nenhum token existente serve.
2. Acrescente-o em `@theme`, no grupo certo, e registre-o na tabela acima.
3. Se o valor vier do design e reprovar no contraste, registre o desvio na tabela de decisões.
