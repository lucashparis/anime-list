# Plano de implementação: fundação do projeto

> **Para agentes:** use `superpowers:subagent-driven-development` ou `superpowers:executing-plans` para executar tarefa por tarefa. Os passos usam caixas de seleção (`- [ ]`).

**Objetivo:** deixar o BuscAnime pronto para receber funcionalidades, com instalação limpa, regras validadas automaticamente, tokens, layout base e documentação para desenvolvimento com IA.

**Arquitetura:** app React estático com Vite, dependências em um só sentido (`app`, `features`, `shared`), tokens no `@theme` do Tailwind e um skeleton em HTML exibido antes do JS.

**Stack:** Node 24.22.2, React 19, Vite 8, TypeScript 6, Tailwind 4, Vitest, Playwright, ESLint 10 e Lefthook.

**Spec:** [spec.md](spec.md). Motivos em [000-pre-development](../../decisions/000-pre-development.md).

## Restrições globais

- Branch `chore/project-foundation`, com merge na `main` usando `--no-ff`.
- Código, nomes, descrições de teste, branches e commits em inglês; interface e documentação em português.
- Sem comentários, `any` ou `else`, nem ternário aninhado, em `src` e `e2e`. Funções com até 40 linhas, arquivos com até 200, complexidade até 10 e até 3 parâmetros.
- Nunca usar `--force` ou `--legacy-peer-deps` no npm.
- Nunca alterar a configuração global do Git. O `core.hooksPath` é definido apenas no repositório.
- Commits em Conventional Commits, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Sem push: o repositório continua local até a publicação.
- Nada nos arquivos pode tratar o projeto como outra coisa que não um produto real.
- Playwright roda em Chromium, para manter o hook de merge rápido.

## Fora deste plano

- `QueryClientProvider` e `features/anime-catalog`: entram em `feat/anime-catalog`.
- Error boundary: entra em `feat/feedback-states`.
- `Button`, `Chip` e `Skeleton` de `shared/ui`: entram com a primeira funcionalidade que os usar.
- CSP, headers e `vercel.json`: entram em `chore/security-headers`.
- Workflow do GitHub Actions: entra na publicação, quando pode ser executado de verdade.

## Foco da revisão

Situações que a spec implica e que têm teste nas tarefas indicadas:

1. Aviso de privacidade aberto em 320px: a página continua sem rolagem horizontal (Tarefa 4).
2. Navegação só por teclado: o primeiro Tab mostra o skip link, e Enter leva o foco ao `main` (Tarefa 4).
3. JavaScript desativado: além do skeleton, uma mensagem explica o que fazer (Tarefa 4).
4. `prefers-reduced-motion`: o skeleton não anima (Tarefa 4).
5. Tela de toque: link e resumo do aviso têm pelo menos 44px de altura (Tarefa 4).

## Arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `package.json`, `package-lock.json`, `.npmrc` | Versões exatas, scripts e ambiente |
| `tsconfig.json`, `vite.config.ts` | TypeScript estrito, alias `@/`, build e Vitest |
| `eslint.config.js`, `tools/eslint/no-comments.js` | Regras de lint |
| `tools/eslint/guards.test.mjs` | Prova de que cada regra reprova o que deve |
| `.prettierrc.json`, `.prettierignore` | Formatação |
| `index.html` | Metadados, `preconnect`, skeleton estático e `noscript` |
| `src/main.tsx` | Ponto de entrada |
| `src/app/App.tsx` | Composição da página e skip link |
| `src/app/layout/Header.tsx`, `Footer.tsx` | Cabeçalho e rodapé |
| `src/shared/ui/Logo.tsx` | Marca nos dois tamanhos |
| `src/shared/styles/index.css` | Tokens e estilos base |
| `src/test/setup.ts`, `src/test/server.ts` | Ambiente do Vitest e MSW |
| `playwright.config.ts`, `e2e/layout.spec.ts` | Validação no navegador |
| `lefthook.yml`, `commitlint.config.js`, `.size-limit.json` | Automação local |
| `README.md`, `CLAUDE.md`, `DECISIONS.md`, `AI_LOG.md`, `docs/**` | Documentação |

---

## Tarefa 1: Instalação limpa e TypeScript

**Arquivos:**
- Criar: `package.json`, `.npmrc`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/app/App.tsx`

**Interfaces:**
- Produz: alias `@/` para `src/`; scripts `dev`, `build`, `preview`, `typecheck`; `App` como export nomeado.

- [ ] **Passo 1: Criar `.npmrc`**

```ini
save-exact=true
engine-strict=true
fund=false
```

- [ ] **Passo 2: Criar `package.json`**

`name` igual a `buscanime`, `private: true`, `type: module`, `engines.node` igual a `>=24.22.2 <25`, `overrides.minimatch` igual a `^11.0.1` e `allowScripts` igual a `{ "lefthook@2.2.2": true }`.

Versões exatas:

| Tipo | Pacotes |
| --- | --- |
| `dependencies` | `react` e `react-dom` 19.3.1; `@tanstack/react-query` 5.105.0; `zod` 4.6.7; `@fontsource-variable/mulish` 5.3.0 |
| Build | `vite` 8.3.5; `@vitejs/plugin-react` 6.1.2; `tailwindcss` e `@tailwindcss/vite` 4.3.3; `typescript` 6.0.3 |
| Testes | `vitest` 5.0.5; `jsdom` 30.1.3; `msw` 3.0.3; `@testing-library/react` 16.3.3; `@testing-library/jest-dom` 7.0.1; `@testing-library/user-event` 14.6.8; `@playwright/test` 1.64.1; `@axe-core/playwright` 4.14.0 |
| Qualidade | `eslint` 10.14.0; `@eslint/js` 10.0.1; `typescript-eslint` 8.72.1; `eslint-plugin-jsx-a11y-x` 0.2.0; `eslint-plugin-react-hooks` 7.1.1; `prettier` 3.9.10; `@commitlint/cli` e `@commitlint/config-conventional` 21.2.4; `lefthook` 2.2.2; `size-limit` e `@size-limit/file` 14.3.0 |
| Tipos | `@types/react` e `@types/react-dom` 19.3.0; `@types/node` 24.19.2 |

Scripts: `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`), `typecheck` (`tsc --noEmit`).

- [ ] **Passo 3: Proteger a pasta global de hooks antes da primeira instalação**

Run: `git config --local core.hooksPath .git/hooks`
Expected: `git config --local core.hooksPath` imprime `.git/hooks`, e `git config --global core.hooksPath` continua igual.

- [ ] **Passo 4: Instalar e gerar o lockfile**

Run: `npm install`
Expected: termina sem `npm warn` e sem `ERESOLVE`.

- [ ] **Passo 5: Criar `tsconfig.json`**

`target` ES2022; `lib` ES2023, DOM e DOM.Iterable; `module` ESNext; `moduleResolution` bundler; `jsx` react-jsx; `noEmit`; `skipLibCheck`; `paths` com `@/*` para `./src/*`, sem `baseUrl`; `types` com `vite/client`, `node` e `@testing-library/jest-dom/vitest`; `include` com `src`, `e2e`, `vite.config.ts` e `playwright.config.ts`. Mais as opções da spec: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch` e `verbatimModuleSyntax`.

- [ ] **Passo 6: Criar `vite.config.ts`, `index.html`, `src/main.tsx` e `src/app/App.tsx`**

`vite.config.ts` usa `defineConfig` de `vitest/config`, os plugins `react()` e `tailwindcss()` e o alias `@` com `fileURLToPath(new URL('./src', import.meta.url))`. `index.html` é mínimo por enquanto, com `lang="pt-BR"` e `<div id="root">`. `main.tsx` monta `<App />` em `StrictMode` e lança `Error('Root element not found')` se `#root` não existir. `App` retorna um `<main>` vazio.

- [ ] **Passo 7: Validar a instalação limpa**

Run: `rm -rf node_modules && npm ci 2>&1 | tee ci.log; grep -ci "warn" ci.log; npm audit; rm ci.log`
Expected: contagem de `warn` igual a 0 e `found 0 vulnerabilities`.

- [ ] **Passo 8: Validar TypeScript e build**

Run: `npm run typecheck && npm run build`
Expected: os dois terminam sem erro, e `dist/index.html` é gerado.

- [ ] **Passo 9: Commit**

```bash
git add .npmrc package.json package-lock.json tsconfig.json vite.config.ts index.html src
git commit -m "chore: set up clean install and strict TypeScript"
```

---

## Tarefa 2: Regras de lint com prova automatizada

**Arquivos:**
- Criar: `tools/eslint/no-comments.js`, `tools/eslint/guards.test.mjs`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`
- Modificar: `package.json`

**Interfaces:**
- Produz: scripts `lint` (`eslint src e2e`), `test:guards` (`node --test tools/eslint/guards.test.mjs`), `format` e `format:check`.

- [ ] **Passo 1: Escrever o teste das regras**

Usa `node:test` e a classe `ESLint`. Cada caso grava um arquivo temporário no caminho indicado, roda `lintFiles`, compara o `ruleId` e apaga o arquivo em `finally`. Os casos rodam em sequência.

| Caso | Caminho | Código | `ruleId` esperado |
| --- | --- | --- | --- |
| `any` | `src/guard-sample.ts` | `export const a = 1 as any;` | `@typescript-eslint/no-explicit-any` |
| Comentário | `src/guard-sample.ts` | `// note` | `local/no-comments` |
| Comentário em JSX | `src/guard-sample.tsx` | `export const a = <div>{/* note */}</div>;` | `local/no-comments` |
| `eslint-disable` | `src/guard-sample.ts` | `/* eslint-disable */ export const a = 1 as any;` | `local/no-comments` e `no-explicit-any` |
| `else` | `src/guard-sample.ts` | função com `if` e `else` | `no-restricted-syntax` |
| `else if` | `src/guard-sample.ts` | função com `if` e `else if` | `no-restricted-syntax` |
| Ternário aninhado | `src/guard-sample.ts` | `a ? 1 : b ? 2 : 3` | `no-nested-ternary` |
| `shared` importando `features` | `src/shared/guard-sample.ts` | `import '@/features/x';` | `no-restricted-imports` |
| `shared` importando `app` | `src/shared/guard-sample.ts` | `import '../app/App';` | `no-restricted-imports` |
| `features` importando `app` | `src/features/guard-sample.ts` | `import '@/app/App';` | `no-restricted-imports` |
| Classe arbitrária em string | `src/guard-sample.ts` | `export const a = 'w-[10px]';` | `no-restricted-syntax` |
| Classe arbitrária em template | `src/guard-sample.ts` | ``export const a = `bg-[#fff]`;`` | `no-restricted-syntax` |
| Função longa | `src/guard-sample.ts` | função com 41 linhas | `max-lines-per-function` |
| Arquivo longo | `src/guard-sample.ts` | 201 linhas de `export const` | `max-lines` |
| Quatro parâmetros | `src/guard-sample.ts` | `(a, b, c, d)` tipados | `max-params` |
| Complexidade 11 | `src/guard-sample.ts` | função com 10 `if` em sequência | `complexity` |
| Imagem sem `alt` | `src/guard-sample.tsx` | `export const a = <img src="a.png" />;` | `jsx-a11y-x/alt-text` |
| Código válido | `src/guard-sample.ts` | query com `[MediaSort]`, cláusula de guarda e ternário simples | Nenhum erro |

- [ ] **Passo 2: Rodar o teste e confirmar a falha**

Run: `node --test tools/eslint/guards.test.mjs`
Expected: FAIL, porque `eslint.config.js` ainda não existe.

- [ ] **Passo 3: Criar `tools/eslint/no-comments.js`**

Exporta `noComments`, uma regra que, em `Program`, reporta cada item de `context.sourceCode.getAllComments()` com a mensagem `Comments are not allowed`.

- [ ] **Passo 4: Criar `eslint.config.js`**

```js
const ARBITRARY_UTILITY = String.raw`/-\[|(^|\s)\[[^\]]*:/`;

const restrictedSyntax = [
  { selector: 'IfStatement[alternate]', message: 'Use an early return instead of else' },
  { selector: `Literal[value=${ARBITRARY_UTILITY}]`, message: 'Use a design token instead of an arbitrary value' },
  { selector: `TemplateElement[value.raw=${ARBITRARY_UTILITY}]`, message: 'Use a design token instead of an arbitrary value' },
];
```

Blocos, nesta ordem:

1. `ignores` com `dist`, `coverage`, `playwright-report` e `test-results`.
2. `linterOptions: { noInlineConfig: true }`. Sem isso, um `eslint-disable` desligaria a própria regra `local/no-comments`.
3. Em `src/**/*.{ts,tsx}` e `e2e/**/*.ts`: `js.configs.recommended`, `tseslint.configs.strictTypeChecked` com `projectService: true` e `tsconfigRootDir: import.meta.dirname`, `jsxA11y.configs.recommended`, `reactHooks.configs.flat.recommended`, o plugin `local` com `{ rules: { 'no-comments': noComments } }` e as regras da spec: `no-explicit-any`; `max-lines-per-function` (`max: 40`, `skipBlankLines: true`); `max-lines` (`max: 200`, `skipBlankLines: true`); `complexity` 10; `max-params` 3; `no-nested-ternary`; `no-restricted-syntax` com `restrictedSyntax`; `local/no-comments`.
4. Em `src/shared/**`: `no-restricted-imports` com os padrões `**/features/**` e `**/app/**`, e a mensagem `shared must not depend on features or app`.
5. Em `src/features/**`: `no-restricted-imports` com `**/app/**`, e a mensagem `features must not depend on app`.
6. Em `**/*.test.{ts,tsx}` e `e2e/**/*.ts`: `max-lines-per-function` desligada.

- [ ] **Passo 5: Rodar o teste e confirmar que passa**

Run: `npm run test:guards`
Expected: todos os casos passam, e `git status --short` não mostra `guard-sample`.

- [ ] **Passo 6: Criar a formatação e validar o projeto**

`.prettierrc.json`: `singleQuote` true e `printWidth` 100. `.prettierignore`: `dist`, `coverage`, `playwright-report`, `test-results`, `package-lock.json` e `*.md`. Scripts: `format` (`prettier --write .`) e `format:check` (`prettier --check .`).

Run: `npm run format && npm run lint && npm run format:check`
Expected: sem erros.

- [ ] **Passo 7: Commit**

```bash
git add tools eslint.config.js .prettierrc.json .prettierignore package.json src vite.config.ts tsconfig.json index.html
git commit -m "chore: enforce code rules with lint guards"
```

---

## Tarefa 3: Tokens, ambiente de testes e `Logo`

**Arquivos:**
- Criar: `src/shared/styles/index.css`, `src/test/setup.ts`, `src/test/server.ts`, `src/shared/ui/Logo.tsx`, `src/shared/ui/Logo.test.tsx`
- Modificar: `vite.config.ts`, `src/main.tsx`, `package.json`

**Interfaces:**
- Produz: `Logo({ size }: { size: 'sm' | 'lg' })`; `server`, o `setupServer()` do MSW sem handlers; utilitários de tema da tabela abaixo; script `test` (`vitest run`).

Tokens em `@theme`, começando por `--*: initial` e `--default-font-family: var(--font-sans)`:

| Grupo | Variáveis |
| --- | --- |
| Cor | `--color-primary` `#6324C6`; `--color-primary-light` `#774DC5`; `--color-success` `#01ADA6`; `--color-warning` `#FFB800`; `--color-danger` `#E92151`; `--color-white` `#FFFFFF`; `--color-neutral-100` `#E2E5E9`; `--color-neutral-400` `#8A94A6`; `--color-neutral-500` `#6B7280`; `--color-ink` `#1A1A1A` |
| Espaçamento | `--spacing-xs` 4px; `--spacing-sm` 8px; `--spacing-md` 12px; `--spacing-lg` 16px; `--spacing-xl` 24px |
| Controles | `--spacing-control-sm` 32px; `--spacing-control-md` 40px; `--spacing-control-lg` 48px; `--spacing-control-touch` 44px |
| Card | `--spacing-card` 270px |
| Raio | `--radius-sm` 4px; `--radius-md` 8px |
| Tipografia | `--font-sans` `'Mulish Variable', sans-serif`; `--text-xs` 12px; `--text-sm` 14px; `--text-md` 20px; `--text-lg` 24px; `--text-xl` 40px; `--font-weight-regular` 400; `--font-weight-semibold` 600; `--font-weight-bold` 700 |
| Layout | `--breakpoint-sm` 600px; `--breakpoint-md` 900px; `--breakpoint-lg` 1200px; `--container-content` 1316px |
| Movimento | `--animate-pulse` com `@keyframes` que reduz a opacidade para 0.5 em 50% |

- [ ] **Passo 1: Escrever o teste do `Logo`**

```tsx
it('exposes the brand name as one accessible text', () => {
  render(<Logo size="lg" />);
  expect(screen.getByText((_, element) => element?.textContent === 'BuscAnime' && element.tagName === 'SPAN')).toBeInTheDocument();
});

it.each([
  ['lg', 'text-xl'],
  ['sm', 'text-lg'],
] as const)('applies the %s size', (size, className) => {
  const { container } = render(<Logo size={size} />);
  expect(container.firstElementChild).toHaveClass(className);
});
```

- [ ] **Passo 2: Configurar o Vitest e confirmar a falha**

Em `vite.config.ts`: `test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', include: ['src/**/*.test.{ts,tsx}'] }`. `setup.ts` importa `@testing-library/jest-dom/vitest`, chama `server.listen({ onUnhandledRequest: 'error' })` no `beforeAll`, `server.resetHandlers()` e `cleanup()` no `afterEach`, e `server.close()` no `afterAll`.

Run: `npm test`
Expected: FAIL, porque `Logo` não existe.

- [ ] **Passo 3: Implementar `Logo` e os tokens**

`Logo` renderiza um `span` externo com `uppercase font-regular`, a classe do tamanho vinda de um `Record<LogoSize, string>` (`lg`: `text-xl`; `sm`: `text-lg`), o texto `Busc` em `text-white` e um `span` interno com `Anime` em `text-warning`.

`index.css` começa com `@import 'tailwindcss';` e `@import '@fontsource-variable/mulish/wght.css';`, seguidos do `@theme`. `main.tsx` importa `@/shared/styles/index.css`.

- [ ] **Passo 4: Confirmar que passa**

Run: `npm test && npm run lint && npm run typecheck`
Expected: PASS em todos.

- [ ] **Passo 5: Confirmar que a escala padrão foi removida**

O Tailwind só gera classes que encontra nos arquivos, então a prova precisa usá-las. Criar `src/token-sample.txt` com `p-sm p-4 bg-primary bg-red-500 rounded-md rounded-lg`.

Run: `npm run build; for c in 'p-sm' 'bg-primary' 'rounded-md' 'p-4' 'bg-red-500' 'rounded-lg'; do printf '%s=' "$c"; grep -c -- "\.$c" dist/assets/*.css; done; rm src/token-sample.txt`
Expected: 1 para `p-sm`, `bg-primary` e `rounded-md`; 0 para `p-4`, `bg-red-500` e `rounded-lg`.

- [ ] **Passo 6: Commit**

```bash
git add src vite.config.ts package.json
git commit -m "feat: add design tokens and logo"
```

---

## Tarefa 4: Layout base com validação no navegador

**Arquivos:**
- Criar: `src/app/layout/Header.tsx`, `src/app/layout/Footer.tsx`, `src/app/App.test.tsx`, `playwright.config.ts`, `e2e/layout.spec.ts`
- Modificar: `src/app/App.tsx`, `index.html`, `package.json`

**Interfaces:**
- Consome: `Logo`; utilitários de tema da Tarefa 3.
- Produz: `Header()`, `Footer()`; `main#main-content` com `tabIndex={-1}`, onde as próximas specs renderizam; script `test:e2e` (`playwright test`).

Textos da interface:

| Elemento | Texto |
| --- | --- |
| Título da página | BuscAnime: catálogo de animes |
| Descrição (`meta`) | Encontre animes por formato e nome, com a nota de cada título. |
| Skip link | Pular para o conteúdo |
| Direitos, em `uppercase` | Todos os direitos reservados |
| Atribuição | Dados fornecidos pela AniList, com link para `https://anilist.co` e `rel="noreferrer"` |
| Resumo do aviso | Aviso de privacidade |
| Corpo do aviso | O BuscAnime não tem contas, analytics nem cookies próprios. Para carregar o catálogo, seu navegador se conecta à AniList, que recebe seu IP e os termos buscados. |
| `noscript` | Ative o JavaScript para ver o catálogo do BuscAnime. |

- [ ] **Passo 1: Escrever o teste do `App`**

```tsx
it('exposes the page landmarks and heading', () => {
  render(<App />);
  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BuscAnime');
});

it('credits AniList without leaking the referrer', () => {
  render(<App />);
  const link = screen.getByRole('link', { name: 'AniList' });
  expect(link).toHaveAttribute('href', 'https://anilist.co');
  expect(link).toHaveAttribute('rel', 'noreferrer');
});

it('reveals the privacy notice on demand', async () => {
  render(<App />);
  await userEvent.click(screen.getByText('Aviso de privacidade'));
  expect(screen.getByText(/recebe seu IP e os termos buscados/)).toBeVisible();
});

it('offers a skip link to the main content', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveAttribute('href', '#main-content');
});
```

- [ ] **Passo 2: Rodar e confirmar a falha**

Run: `npm test -- src/app/App.test.tsx`
Expected: FAIL, porque os elementos não existem.

- [ ] **Passo 3: Implementar `Header`, `Footer` e `App`**

- `App`: coluna com `min-h-dvh` contendo skip link, `Header`, `main` com `flex-1` e `Footer`. O skip link usa `sr-only` e `focus:not-sr-only`.
- `Header`: `header` com `bg-primary` e `Logo size="lg"` centralizado dentro de um `h1`.
- `Footer`: `footer` com `bg-primary`, `text-white`, texto centralizado, `Logo size="sm"`, direitos e atribuição em `text-xs`, e aviso em `<details>` nativo. O link e o `summary` usam `pointer-coarse:min-h-control-touch` e `inline-flex items-center`.
- Link, resumo e skip link têm foco visível com `focus-visible:outline-2 focus-visible:outline-white`.

- [ ] **Passo 4: Rodar e confirmar que passa**

Run: `npm test && npm run lint && npm run typecheck`
Expected: PASS em todos.

- [ ] **Passo 5: Completar `index.html`**

`lang="pt-BR"`, charset, viewport, título, descrição, `preconnect` para `https://graphql.anilist.co` com `crossorigin`, porque o `fetch` usa CORS, e para `https://s4.anilist.co` sem `crossorigin`, porque as imagens não usam. `noscript` com a mensagem antes de `#root`.

Dentro de `#root`, um `div` com `data-testid="page-skeleton"` e `aria-hidden="true"`: cabeçalho com `BuscAnime` nas mesmas classes do `Logo` grande e uma grade `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-lg max-w-content` com 8 blocos `min-h-card rounded-md bg-neutral-100 motion-safe:animate-pulse`. Sem CSS ou script inline, para a CSP futura.

- [ ] **Passo 6: Escrever os testes no navegador**

`playwright.config.ts`: projeto Chromium; `use.baseURL` igual a `http://localhost:4173`; `webServer` com `npm run build && npm run preview -- --port 4173 --strictPort`, `url` igual a `http://localhost:4173`, `reuseExistingServer: false`. O preview é necessário porque, em desenvolvimento, o CSS só chega por JS.

`e2e/layout.spec.ts` percorre estas telas:

```ts
const SCREENS = [
  { name: 'phone-320', width: 320, height: 568 },
  { name: 'phone-375', width: 375, height: 667 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'phone-landscape', width: 844, height: 390 },
  { name: 'zoom-200', width: 683, height: 384, deviceScaleFactor: 2 },
] as const;
```

Em cada tela:

```ts
test(`${name}: fits the screen with the privacy notice open`, async ({ page }) => {
  await page.goto('/');
  await page.getByText('Aviso de privacidade').click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  await page.screenshot({ path: `test-results/layout/${name}.png`, fullPage: true });
});

test(`${name}: has no WCAG 2.2 AA violations`, async ({ page }) => {
  await page.goto('/');
  await page.getByText('Aviso de privacidade').click();
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(violations).toEqual([]);
});
```

Casos únicos:

| Teste | Condição | Verificação |
| --- | --- | --- |
| `declares the page language` | Padrão | `html` com `lang="pt-BR"` |
| `shows the skeleton without JavaScript` | `javaScriptEnabled: false` | `page-skeleton` visível, com altura maior que 0, e mensagem do `noscript` visível |
| `replaces the skeleton after mounting` | Padrão | `page-skeleton` com contagem 0 e `h1` visível |
| `keeps the footer at the bottom of tall screens` | 1920×1080 | Base do `footer` igual à altura da janela |
| `reaches the content by keyboard` | Primeiro Tab, depois Enter | Skip link visível e focado; `main` focado |
| `animates the skeleton by default` | JS desativado | `animation-name` dos blocos diferente de `none`, para provar que o caso seguinte testa algo real |
| `does not animate for reduced motion` | `reducedMotion: 'reduce'` e JS desativado | `animation-name` dos blocos igual a `none` |
| `gives touch targets 44px` | `hasTouch: true`, `isMobile: true` | Altura do link e do `summary` maior ou igual a 44 |

- [ ] **Passo 7: Instalar o navegador e rodar**

Run: `npx playwright install chromium && npm run test:e2e`
Expected: todos passam. Corrigir o que falhar antes de seguir.

- [ ] **Passo 8: Revisar as capturas**

Abrir cada arquivo de `test-results/layout/` e conferir: cores e marca como no design, nada cortado, rodapé legível e header centralizado.

- [ ] **Passo 9: Commit**

```bash
git add src e2e index.html playwright.config.ts package.json
git commit -m "feat: add responsive base layout"
```

---

## Tarefa 5: Automação local

**Arquivos:**
- Criar: `lefthook.yml`, `commitlint.config.js`, `.size-limit.json`
- Modificar: `package.json`

**Interfaces:**
- Produz: scripts `size` (`size-limit`), `verify` e `hooks:install`.

- [ ] **Passo 1: Criar a configuração**

- `commitlint.config.js`: estende `@commitlint/config-conventional`.
- `.size-limit.json`: `[{ "path": "dist/assets/*.js", "limit": "100 KB", "gzip": true }]`.
- `verify`: `npm run lint && npm run typecheck && npm test && npm run test:guards && npm run build && npm run size && npm run test:e2e`.
- `hooks:install`: `git config --local core.hooksPath .git/hooks && lefthook install --force`. A ordem importa: em máquinas com `core.hooksPath` global, o Lefthook recusa instalar sem `--force`, e o `--force` só é seguro depois da configuração local.
- `lefthook.yml`:

```yaml
glob_matcher: doublestar
pre-commit:
  jobs:
    - run: npx prettier --write --ignore-unknown {staged_files}
      stage_fixed: true
    - glob: '{src,e2e}/**/*.{ts,tsx}'
      run: npx eslint {staged_files}
commit-msg:
  jobs:
    - run: npx commitlint --edit {1}
pre-merge-commit:
  jobs:
    - run: npm run verify
```

- [ ] **Passo 2: Instalar os hooks sem tocar na pasta global**

Run: `npm run hooks:install && ls .git/hooks | grep -v sample; ls -A "$(git config --global core.hooksPath)" | wc -l`
Expected: `commit-msg`, `pre-commit` e `pre-merge-commit` listados em `.git/hooks`, e a pasta global continua com 0 arquivos.

- [ ] **Passo 3: Confirmar as verificações**

Run: `npm run verify`
Expected: tudo passa, com JS inicial abaixo de 100 KB gzip.

- [ ] **Passo 4: Confirmar que o commit fora do padrão é rejeitado**

Run: `git commit --allow-empty -m "bad message"; echo "exit=$?"`
Expected: `exit=1`, com erro do commitlint.

- [ ] **Passo 5: Confirmar que o `pre-commit` barra lint**

Criar `src/hook-sample.ts` com `export const a = 1 as any;`, adicionar ao stage e tentar um commit.
Expected: commit recusado pelo ESLint. Depois: `git reset -q src/hook-sample.ts && rm src/hook-sample.ts`.

- [ ] **Passo 6: Confirmar que o merge com verificação falhando é bloqueado**

Em uma branch temporária a partir da atual, criar `src/merge-sample.ts` com `export const broken: number = 'text';`, que passa no ESLint e quebra o TypeScript, commitar normalmente e tentar `git merge --no-ff` dela na branch de trabalho, depois de criar nesta um commit vazio para o merge não ser trivial.
Expected: `MERGE_HEAD` existe, e nenhum commit de merge é criado. Depois: `git merge --abort`, `git branch -D` da branch temporária e `git reset --hard HEAD~1` para remover o commit vazio.

- [ ] **Passo 7: Commit**

```bash
git add lefthook.yml commitlint.config.js .size-limit.json package.json
git commit -m "chore: add local quality gates"
```

---

## Tarefa 6: Documentação e integração

**Arquivos:**
- Criar: `CLAUDE.md`, `DECISIONS.md`, `AI_LOG.md`, `docs/architecture.md`, `docs/conventions/code.md`, `docs/conventions/git.md`, `docs/conventions/testing.md`, `docs/conventions/accessibility.md`, `docs/conventions/security.md`, `docs/design/tokens.md`, `docs/api/anilist.md`
- Modificar: `README.md`

- [ ] **Passo 1: Escrever a documentação**

Conteúdo definido na seção [Documentação](spec.md#documentação) da spec, com estes acréscimos:

- `CLAUDE.md`: até 100 linhas, com visão geral, comandos, regras em uma linha cada (idioma, sem `else`, sem comentários, sem `any`, skeleton, sem prop drilling, spec antes do código) e links. Sem `@import`.
- `docs/conventions/code.md`: tabela completa de idioma, composição, variantes em mapa tipado, cláusula de guarda e os exemplos `getScoreTone` e `Chip` de `000-pre-development`.
- `docs/conventions/git.md`: padrão de branch e commit, `--no-ff`, `npm run hooks:install` e o que fazer quando um `pre-merge-commit` falha (`git merge --abort`).
- `docs/api/anilist.md`: as 7 regras de GraphQL e a tabela de comportamentos da API.
- `DECISIONS.md`: resumo, trade-offs, o que foi além do mínimo e evoluções, com links para `docs/decisions`.
- `AI_LOG.md`: ferramentas usadas e casos reais verificados, corrigidos ou rejeitados, incluindo: a medição que trocou Next por Vite, o `override` que quebrou `import-x`, o `noInlineConfig` que evita que `eslint-disable` desligue a própria regra, e o `core.hooksPath` global que desligava os hooks sem aviso.

- [ ] **Passo 2: Atualizar o README**

Estado atual: fundação concluída, sem catálogo ainda. Comandos reais em "Como executar" (`nvm use`, `npm ci`, `npm run hooks:install`, `npx playwright install chromium`, `npm run dev`) e "Como testar" (`npm run verify` e cada script). Nova linha na linha do tempo:

| # | Branch | Entrega | Referência |
| --- | --- | --- | --- |
| 2 | `chore/project-foundation` | Instalação limpa, regras automáticas, tokens, layout base e documentação | [Spec](docs/specs/000-foundation/spec.md) |

- [ ] **Passo 3: Validar a documentação**

Run: `test $(wc -l < CLAUDE.md) -le 100 && echo ok; grep -c "@import" CLAUDE.md`
Expected: `ok` e `0`.

Depois, buscar com `git grep -i` os termos da lista de neutralidade, mantida fora do repositório.
Expected: nenhuma ocorrência.

- [ ] **Passo 4: Validar em um clone limpo**

Run: `git add -A && git commit -m "docs: add project guides and AI log"`, e depois, em uma pasta temporária fora do projeto: `git clone <caminho do projeto> . -b chore/project-foundation && git config --local core.hooksPath .git/hooks && npm ci && npm audit && npm run verify`
Expected: `npm ci` sem alertas, 0 vulnerabilidades e `verify` passando.

- [ ] **Passo 5: Merge na `main`**

```bash
git switch main
git merge --no-ff chore/project-foundation -m "Merge branch 'chore/project-foundation'" -m "Set up the project foundation. See docs/specs/000-foundation/spec.md." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: o `pre-merge-commit` roda `verify`, e o merge é criado. `git status` limpo.
