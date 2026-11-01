# Tokens e desvios do design

O design é a referência visual: base de layout, cores e arredondamentos, sem reprodução literal de cada pixel. Os tokens ficam em `src/shared/styles/index.css`, dentro de `@theme`, com `--*: initial` para remover as escalas padrão do Tailwind. Só existem os valores abaixo.

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
| Espaçamento | `xs`, `sm`, `md`, `lg`, `xl` | 4, 8, 12, 16 e 24px | `p-lg`, `gap-sm` |
| Altura de controle | `control-sm`, `control-md`, `control-lg` | 32, 40 e 48px | `h-control-md` |
| Altura de controle | `control-touch` | 44px | `pointer-coarse:min-h-control-touch` |
| Card | `card` | 270px | `min-h-card` |
| Raio | `sm`, `md` | 4 e 8px | `rounded-sm` |
| Tipografia | `font-sans` | Mulish Variable | Fonte padrão |
| Tipografia | `xs`, `sm`, `md`, `lg`, `xl` | 12, 14, 20, 24 e 40px | `text-xs` |
| Tipografia | `regular`, `semibold`, `bold` | 400, 600 e 700 | `font-regular` |
| Breakpoints | `sm`, `md`, `lg` | 600, 900 e 1200px | `sm:`, `md:`, `lg:` |
| Largura máxima | `content` | 1316px | `max-w-content` |
| Animação | `animate-pulse` | `pulse` de 2s, com opacidade em 50% no meio | `motion-safe:animate-pulse` |

A `Logo` usa `text-xl` (40px) no cabeçalho e `text-lg` (24px) no rodapé.

## Desvios do design

Os desvios de cor, contraste, espaçamento, altura e rodapé estão na [tabela de decisões](../decisions/000-pre-development.md#desvios-do-design). Os da fundação, além dela:

| Item | Design | Implementação | Motivo |
| --- | --- | --- | --- |
| Aviso de privacidade | Não existe | `<details>` nativo, com a seta de expansão mantida | Elemento nativo; a seta indica que o aviso abre |
| Skip link | Não existe | Sobrepõe o cabeçalho ao receber foco, com fundo branco e texto primário | Um contorno branco em página branca seria invisível |
| Aviso e link no rodapé | Não existe | Alvo de toque de 44px em telas `pointer: coarse` | Área de toque |

## Como adicionar um token

1. Confirme que nenhum token existente serve.
2. Acrescente-o em `@theme`, no grupo certo, e registre-o na tabela acima.
3. Se o valor vier do design e reprovar no contraste, registre o desvio na tabela de decisões.
