# Acessibilidade e responsividade

Referência: WCAG 2.2 AA. A LBI (Lei 13.146/2015, art. 63) exige sites acessíveis e não define parâmetro técnico, por isso adotamos esta norma. Acessibilidade e contraste prevalecem sobre a fidelidade ao design.

## Checklist por tela

- [ ] `lang="pt-BR"` no `<html>`; trechos de dados em outro idioma, como gêneros, com o próprio `lang`.
- [ ] Landmarks: `header`, `main` e `footer`, e um único `h1`.
- [ ] Skip link como primeiro item do Tab, levando o foco ao `main`.
- [ ] Todo controle alcançável e operável pelo teclado, com foco visível (`outline` de 2px).
- [ ] Contraste de 4,5:1 para texto e de 3:1 para texto grande e bordas de controle. Texto em fundo amarelo ou verde usa `#1A1A1A`.
- [ ] Alvos de toque com pelo menos 44px de altura em telas `pointer: coarse`.
- [ ] Sem rolagem horizontal de 320px a 1920px, em paisagem no celular e com zoom de 200%.
- [ ] Cor nunca é a única informação: a nota aparece como número, além da cor.
- [ ] `prefers-reduced-motion` respeitado: o skeleton só anima com `motion-safe:`.
- [ ] Skeleton em todo carregamento, sem spinner.
- [ ] Mensagem em `noscript` quando o JavaScript está desativado.
- [ ] Imagens com `alt` em português; decorativas com `alt=""`.
- [ ] Texto da interface em português, inclusive `aria-label`, `alt` e placeholder.
- [ ] `@axe-core/playwright` sem violações.
- [ ] Capturas de `test-results/layout/` revisadas por uma pessoa.

## Como o projeto garante

| Item | Onde |
| --- | --- |
| Regras estáticas de JSX | `eslint-plugin-jsx-a11y-x` |
| Violações no navegador | `@axe-core/playwright` em todas as larguras |
| Teclado, foco, alvos de toque e `noscript` | `e2e/layout.spec.ts` |
| Papéis e textos acessíveis | Testing Library, que busca pelo que o usuário percebe |

## Limites

O Playwright roda em Chromium. Leitores de tela, o Safari do iOS e o comportamento real do teclado virtual precisam de conferência manual.
