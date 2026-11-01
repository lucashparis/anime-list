# Testes

## O que testar em cada camada

| Camada | Ferramenta | O que cobrir |
| --- | --- | --- |
| Regras e modelos (`model`, `api`) | Vitest | Conversão da resposta, regra de cor da nota, montagem das variáveis |
| Componentes e hooks | Vitest, Testing Library, jsdom e MSW | Papéis e textos acessíveis, estados de carregamento, vazio e erro, interação com `userEvent` |
| Tela inteira | Playwright e `@axe-core/playwright` | Layout nas larguras acordadas, teclado, `noscript`, idioma e violações WCAG 2.2 AA |
| Regras de lint | `node --test` | Cada regra reprova o que deve (`npm run test:guards`) |
| Tamanho | size-limit | JS inicial até 100 KB gzip |

Teste o que o usuário percebe: busque por papel e texto acessível, nunca por classe ou estrutura interna. Descrições de teste em inglês.

## Comandos

| Comando | O que roda |
| --- | --- |
| `npm test` | Vitest, em `src/**/*.test.{ts,tsx}` |
| `npm run test:guards` | Testes das regras de lint em `tools/eslint/guards.test.mjs`; roda pelo hook de `pre-commit` quando `eslint.config.js` ou `tools/eslint/**` mudam |
| `npm run test:e2e` | Playwright; compila o projeto e sobe o `preview` na porta 4173 |
| `npm run size` | size-limit sobre `dist/assets/*.js` (rode `npm run build` antes) |
| `npm run verify` | Lint, typecheck, testes, build, size e e2e, na ordem usada pelo `pre-merge-commit` |

## Quando rodar o quê

- Durante o desenvolvimento, rode só os testes do que mudou.
- O `npm run verify` completo roda uma vez, antes do merge.
- `npm run test:guards` roda pelo hook de `pre-commit` quando a configuração do ESLint muda.
- A validação em clone limpo só é necessária quando as dependências mudam.
- Uma revisão por branch e, no máximo, um ciclo de correção.
- O responsável pelo projeto avalia as capturas de `test-results/layout/` antes de cada merge.

## Vitest e MSW

- O ambiente está em `src/test/setup.ts`; o servidor MSW, em `src/test/server.ts`.
- No MSW 3, a opção de requisição sem handler é `onUnhandledFrame`, e não `onUnhandledRequest`. O setup usa `onUnhandledFrame: 'error'`, então uma chamada de rede não prevista reprova o teste.
- Os handlers são zerados a cada teste.

## Playwright

- Roda apenas em Chromium. O Safari do iOS e o WebKit não têm cobertura automática; confira à mão antes de publicar.
- Larguras: 320, 375, 768, 1024, 1366 e 1920px, celular em paisagem e zoom de 200%.
- `getByText` do Playwright ignora o conteúdo de `noscript`. Para a mensagem sem JavaScript, use `page.locator('noscript p')`.
- Cada largura salva uma captura de página inteira em `test-results/layout/`. A pasta não vai para o Git, e as capturas servem para revisão humana: abra-as antes de dar a tela como pronta.
- Falhas e rastros ficam em `test-results/playwright/`.
- O axe roda com as tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` e `wcag22aa`, com o aviso de privacidade aberto.

## Regras de lint

O teste de `tools/eslint/guards.test.mjs` executa o ESLint em um processo filho para cada caso. Rodar em um único processo falha, porque o serviço de projeto do `typescript-eslint` guarda em cache os arquivos que ainda não existiam.

## Definição de pronto

1. Spec aprovada antes do código.
2. Lint, TypeScript, Vitest e size-limit sem erros.
3. Playwright validando o layout nas larguras acordadas e os cenários da API, com capturas revisadas.
4. `axe-core` sem violações.
5. Nenhum spinner, comentário, `else` ou `any` no código.
6. Interface em português, conferida nas capturas do Playwright; código e Git em inglês.
7. `README.md` atualizado na própria branch: estado atual, comandos novos e uma linha na linha do tempo.
8. Merge com `--no-ff` na `main`, citando a spec, depois da avaliação do responsável pelo projeto.
