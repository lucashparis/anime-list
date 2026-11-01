# 000: Decisões anteriores ao desenvolvimento

Registro do que foi levantado, medido e decidido antes da primeira linha de código do BuscAnime, um catálogo web de animes com dados da API AniList. Medições feitas em 31/10/2026.

## Requisitos do produto

- Listar animes conforme o design.
- Filtrar por formato e buscar por texto.
- Exibir a nota (`averageScore`) em cada card: abaixo de 50, vermelho; de 50 a 80, amarelo; acima de 80, verde.

## Ordem de prioridade

1. Acessibilidade, usabilidade e contraste: a experiência de quem usa prevalece.
2. Requisitos do produto.
3. Design: base de layout, cores e arredondamentos, sem reprodução literal de cada pixel.

Todo desvio do design é registrado na seção [Desvios do design](#desvios-do-design).

## O que levantamos

### Design

O arquivo tem uma página e um único frame desktop, de 1366×1457. Não há frames mobile nem de carregamento, lista vazia ou erro.

| Avaliação | Evidência |
| --- | --- |
| Bem estruturado | Tokens de cor semânticos; chip e card como componentes; auto layout na página e na grade; raios consistentes de 4 e 8px |
| Mal estruturado | Filtros e botões desenhados com retângulo e texto soltos; padding dos filtros variando de 17 a 23px; selo da nota com variante `Hover`, tamanho `Medium` e posição fixa; larguras fixas; rodapé cerca de 9,5px fora do centro; espaçamentos de 10, 11, 15, 19 e 25px |
| Conteúdo ilustrativo | Títulos digitados à mão e capturas de tela no lugar das capas |

Conclusão: o design é referência visual, e a estrutura de componentes é definida pelo código.

### API AniList

Comportamentos verificados com requisições reais:

| Comportamento | Consequência |
| --- | --- |
| Limite atual de 30 requisições por minuto, informado no header | Busca dispara ao enviar, nunca a cada tecla |
| `search: ""` retorna lista vazia; `null` retorna tudo | Variáveis vazias são omitidas |
| `total` e `lastPage` não são confiáveis, segundo a documentação | Paginação usa apenas `hasNextPage`; sem contador de resultados |
| `averageScore`, `format` e `title.english` podem ser nulos | Nota nula tem estado próprio; título usa `romaji` |
| Formato inválido retorna erro 400; a documentação avisa que pode haver erro com status 200 | Cliente verifica o status e o campo `errors` |
| `description` contém HTML | O campo não é solicitado, eliminando um vetor de XSS |
| Resposta tenta gravar cookie de sessão | Requisições usam `credentials: 'omit'` |
| Termos proíbem usar a API como armazenamento | Cache somente em memória |
| `isAdult` filtra conteúdo adulto, mas "Ecchi" não é considerado adulto | `isAdult: false` sempre; limitação registrada |

### Obrigações legais

Este levantamento orienta decisões técnicas e não substitui revisão jurídica.

| Norma | Aplicação |
| --- | --- |
| Lei 13.146/2015 (LBI), art. 63 | Exige sites acessíveis, seguindo boas práticas internacionais. Sem parâmetro técnico regulamentado, adotamos WCAG 2.2 AA como referência |
| Lei 13.709/2018 (LGPD) | Sem contas, analytics ou cookies próprios. Aviso informa que o IP e os termos buscados chegam à AniList |
| Lei 15.211/2025 (ECA Digital) | Em vigor desde 17/03/2026 para produtos de provável acesso por menores. Conteúdo adulto é sempre filtrado; a necessidade de aferição de idade não foi confirmada e exige avaliação jurídica antes de uso comercial |
| Lei 9.610/1998 (direitos autorais) | Capas pertencem a terceiros, e o rodapé atribui os dados à AniList |

## O que medimos

### Vite e Next 16

Mesma listagem nas duas opções, com React 19.3.1, Vite 8.3.5 e Next 16.4.3. Rede simulada de 50 KB/s com 400ms de latência.

| Métrica | Vite | Next 16 |
| --- | --- | --- |
| JS inicial (gzip) | 99 KB (84 KB com `zod/mini`) | 174 KB |
| Skeleton visível | cerca de 0,5s | cerca de 0,5s |
| Primeiro card | 3,8s | 0,8 a 1,3s |
| Maior elemento visível (LCP) | 3,5s | 5,7s |
| Interativo | 3,8s | 8,1s |

Limites: LCP e interatividade tiveram uma única execução, o servidor rodou localmente e nada foi otimizado. A medição indica ordem de grandeza, não valores exatos.

### Campos solicitados na API

| Consulta de 12 itens | Tamanho | Gzip |
| --- | --- | --- |
| Só os campos da tela | 3,5 KB | 1 KB |
| Conjunto amplo de campos | 36 KB | 10,5 KB |

### Contraste

| Elemento | Design | Decisão |
| --- | --- | --- |
| Nota amarela | 1,37:1 | Texto `#1A1A1A`: 10,04:1 |
| Nota verde | 2,21:1 | Texto `#1A1A1A`: 6,24:1 |
| "Ver mais" (branco sobre amarelo) | 1,73:1 | Texto `#1A1A1A`: 10,04:1 |
| Nota vermelha | 3,46:1 | Mantida: passa como texto grande |
| Chip de gênero | 4,55:1 | Mantido |
| Placeholder da busca | 2,19:1 | `#6B7280`: 4,83:1 |
| Borda do campo de busca | 1,65:1 | `#8A94A6`: 3,06:1 |

### Instalação limpa

Objetivo: instalar sem alertas, ou justificar os que restarem. Resultado final com Node 24.22.2 e npm 11.19.1: `npm ci` com 0 alertas e `npm audit` com 0 vulnerabilidades.

| Problema encontrado | Decisão |
| --- | --- |
| Node 24.18.1 sem correções de segurança posteriores | Atualizado para 24.22.2, fixado em `.nvmrc` |
| `eslint-plugin-jsx-a11y` não aceita ESLint 10, e ESLint 9 está sem suporte | `eslint-plugin-jsx-a11y-x`, fork que aceita ESLint 10 |
| `@size-limit/preset-app` traz Puppeteer com vulnerabilidades altas | `@size-limit/file`, porque só precisamos do limite de tamanho |
| `minimatch` vulnerável na cadeia do ESLint | `override` para `^11.0.1`; `npm audit fix --force` rebaixaria o ESLint para a versão 4 |
| O `override` quebra `eslint-plugin-import-x` | Plugin removido; a regra nativa `no-restricted-imports` valida a mesma fronteira |
| `lefthook` tem script de instalação | Aprovado em `allowScripts` |

Exceções justificadas:

- **TypeScript 6.0.3, não 7:** `typescript-eslint` exige versão menor que 6.1.
- **`@types/node` 24, não 26:** acompanha a versão do Node em uso.
- **`override` de `minimatch`:** afeta só ferramentas de desenvolvimento e foi validado executando o ESLint.
- **`eslint-plugin-jsx-a11y-x` 0.2.0:** projeto jovem, aceito porque só atua em desenvolvimento e `axe-core` valida a acessibilidade no navegador.

## O que decidimos

### Plataforma

| Decisão | Por quê | Alternativa descartada |
| --- | --- | --- |
| React com Vite | Menos JS e interativo mais cedo; hospedagem estática; CSP sem `unsafe-inline`; cada usuário consome a própria cota da API | Next 16: conteúdo aparece antes e favorece SEO, mas envia mais JS, concentra as chamadas em um servidor e exige nonce ou recurso experimental para CSP restrita |
| TypeScript estrito, sem `any` | Erros detectados antes da execução | Exceções com `eslint-disable` |
| Limite de 100 KB gzip de JS inicial | Uso viável em 3G instável, validado automaticamente | Sem limite automático |

O custo aceito do Vite é o primeiro card chegar depois. Ele é compensado com skeleton no `index.html` e `preconnect` para a API e as imagens.

### Arquitetura

**Arquitetura feature-based, no modelo do [Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md), com componentes por composição.**

| Decisão | Por quê | Alternativa descartada |
| --- | --- | --- |
| Pastas por funcionalidade, com dependência em um só sentido: `app`, `features`, `shared` | O que muda junto fica junto, e um requisito novo ganha a própria pasta | Atomic Design: gera discussão de classificação e não trata dados; pasta única de `components/`: mistura genérico e negócio; Feature-Sliced Design: camadas demais para uma tela |
| Composição com `children`, props e variantes tipadas | Reuso simples e sem estado implícito | Compound Components: as partes não variam nem compartilham estado |
| Lógica em hooks, chamados por quem usa o dado | Elimina prop drilling | Context ou repasse por vários níveis |
| Pai controla o espaçamento com `gap` | Evita margens divergentes | Margem externa nos componentes |

### Estado e dados

| Decisão | Por quê | Alternativa descartada |
| --- | --- | --- |
| TanStack Query para dados do servidor | Cache em memória, cancelamento e "Ver mais" | Redux e Zustand: não há estado global de cliente |
| URL para filtro e busca, com `URLSearchParams` | Link compartilhável e botão voltar | React Router: só existe uma tela |
| `fetch` nativo | Uma única query de leitura | Apollo e urql: recursos sem uso |
| `zod/mini` | Valida a resposta em tempo de execução por cerca de 5 KB | Zod completo: cerca de 15 KB a mais; GraphQL Codegen: não valida em produção e adiciona etapa de build |

### Padrão de GraphQL

1. Query fixa e nomeada, em um único arquivo.
2. Entrada do usuário só em variáveis.
3. Solicitar apenas os campos usados na tela.
4. Omitir variáveis vazias.
5. Paginar apenas com `hasNextPage`.
6. Tratar erros em um único cliente: rede, status HTTP e `errors`.
7. Converter a resposta para o modelo `Anime` antes de chegar à tela.

Sem Codegen, uma mudança no schema não é detectada na compilação. O Zod e um teste de contrato contra a API real cobrem esse risco.

### Interface

| Decisão | Por quê | Alternativa descartada |
| --- | --- | --- |
| Tailwind CSS com tokens do design | Sem custo em JS e com escala única | CSS-in-JS: custo em JS e dificuldade com CSP |
| Componentes próprios em `shared/ui` | Visual autoral | MUI e shadcn: seria preciso desfazer o tema |
| Mulish pelo Fontsource | Fonte servida pelo próprio app, sem terceiro adicional | Google Fonts |
| Skeleton em todo carregamento, sem spinner | Reduz a percepção de espera e mantém o layout | Spinner |

### Qualidade

| Decisão | Ferramenta |
| --- | --- |
| Testes de regras e componentes | Vitest, Testing Library, jsdom e MSW |
| Validação no navegador a cada funcionalidade | Playwright e `@axe-core/playwright` |
| Lint, com limites de função e complexidade | ESLint, `typescript-eslint`, `eslint-plugin-jsx-a11y-x` e `eslint-plugin-react-hooks` |
| Código autoexplicativo, sem comentários e em inglês | Regra local do ESLint |
| Cláusula de guarda com retorno antecipado, sem `else` e sem ternário aninhado | `no-restricted-syntax` e `no-nested-ternary` do ESLint |
| Formatação e padrão de commits | Prettier, commitlint e Lefthook |
| Limite de tamanho | size-limit |

### Processo

- **Spec-driven:** cada funcionalidade tem spec e plano aprovados antes do código.
- **Git:** uma branch por funcionalidade, merge com `--no-ff` na `main`, histórico preservado. Branches e commits em inglês, em Conventional Commits.
- **IA:** `CLAUDE.md` curto, apontando para documentos carregados só quando necessários.
- **README:** criado antes do código e atualizado em cada branch, com o estado atual e uma linha do tempo das entregas.

### Idioma

Desenvolvimento em inglês; documentação e interface em português; dados da API sem tradução. A regra completa está na [spec da fundação](../specs/000-foundation/spec.md#idioma).

| Decisão | Por quê | Alternativa descartada |
| --- | --- | --- |
| Interface em português, mesmo quando o design estiver em inglês | O público usa português, e misturar idiomas prejudica a compreensão e os leitores de tela | Manter os rótulos em inglês do design |
| Títulos e gêneros como a API retorna | São dados de terceiros, e a API não oferece tradução | Tabela própria de gêneros traduzidos: exigiria manutenção e divergiria da fonte |
| Gênero declarado com `lang="en"` | Leitores de tela pronunciam a palavra no idioma correto (WCAG 3.1.2) | Herdar `pt-BR` da página |
| Textos da interface direto no código | Só existe um idioma | Biblioteca de internacionalização: JS sem uso |

Rótulos dos filtros:

| Design | Interface | Valor na API |
| --- | --- | --- |
| All Formats | Todos os formatos | Omitido |
| TV Show | Série de TV | `TV` |
| Movie | Filme | `MOVIE` |
| TV Short | Curta de TV | `TV_SHORT` |
| Special | Especial | `SPECIAL` |
| OVA | OVA | `OVA` |
| ONA | ONA | `ONA` |
| Music | Música | `MUSIC` |

## Desvios do design

| Item | Design | Implementação | Motivo |
| --- | --- | --- | --- |
| Rótulos dos filtros | Inglês | Português | Idioma da interface |
| Nota 80 | Verde | Amarelo | Requisito do produto |
| Texto em fundo amarelo ou verde | Claro | `#1A1A1A` | Contraste |
| Placeholder e borda do campo | `#A7B0BE` e `#C4CAD4` | `#6B7280` e `#8A94A6` | Contraste |
| Espaçamentos | 10, 11, 15, 19, 25 e 28px | 4, 8, 12, 16 e 24px | Consistência |
| Padding dos filtros | 17 a 23px | 16px | Consistência |
| Altura dos controles | 32, 38 e 48px | 32, 40 e 48px; 44px em telas de toque | Consistência e área de toque |
| Altura do card | 270px fixos | 270px mínimos | Títulos longos em telas estreitas |
| Legenda do rodapé | 10px | 12px | Legibilidade |
| Rodapé | Fora do centro | Centralizado | Correção |
| Rodapé | Só marca e direitos | Atribuição à AniList e aviso de privacidade | Transparência |

## Mudanças de rumo

| Primeira ideia | Decisão final | O que mudou |
| --- | --- | --- |
| Reprodução pixel a pixel | Design como base visual | A análise mostrou espaçamentos irregulares, que gerariam código duplicado |
| Seguir o design mesmo com baixo contraste | Priorizar a experiência de uso | Os valores medidos reprovam no WCAG AA |
| Next 16 por reduzir JS | Vite | A redução vem dos Server Components, e a medição mostrou mais JS neste caso |
| `eslint-plugin-import-x` | Regra nativa do ESLint | Incompatível com a correção de segurança |
| Instalar as versões mais recentes de tudo | Versões compatíveis e exceções justificadas | A instalação limpa revelou conflitos reais |

## Fora do escopo

Página de detalhe, link externo nos cards, tema escuro, outros idiomas, contas de usuário e PWA.

## Fontes

- [AniList: limites de uso](https://docs.anilist.co/guide/rate-limiting), [termos](https://docs.anilist.co/guide/terms-of-use), [considerações](https://docs.anilist.co/guide/considerations), [paginação](https://docs.anilist.co/guide/graphql/pagination) e [erros](https://docs.anilist.co/guide/graphql/errors)
- [Next.js 16](https://nextjs.org/blog/next-16) e [CSP no Next.js](https://nextjs.org/docs/app/guides/content-security-policy)
- [React: composição com `children`](https://react.dev/learn/passing-props-to-a-component)
- [LBI, Título III](https://www.legjur.com/legislacao/nivel/lei_00131462015/-titulo-iii-da-acessibilidade) e [MPF sobre a regulamentação do art. 63](https://www.mpf.mp.br/o-mpf/unidades/pr-sp/noticias/mpf-exige-que-a-uniao-defina-regras-para-garantir-acessibilidade-em-sites-publicos-e-privados)
- [ECA Digital: vigência](https://teletime.com.br/26/02/2026/lei-que-torna-anpd-agencia-e-fixa-vigencia-do-eca-digital-e-sancionada/) e [análise da Mayer Brown](https://www.mayerbrown.com/pt/insights/publications/2026/04/enforcement-of-brazils-eca-digital-introduces-new-obligations-for-companies)
