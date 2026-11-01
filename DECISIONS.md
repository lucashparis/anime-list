# Decisões

Resumo das decisões do BuscAnime. Evidências, medições e alternativas descartadas estão em [docs/decisions/000-pre-development.md](docs/decisions/000-pre-development.md), e o que a fundação entrega está na [spec](docs/specs/000-foundation/spec.md).

## Resumo

| Tema | Decisão |
| --- | --- |
| Plataforma | React com Vite, TypeScript estrito e hospedagem estática |
| Arquitetura | Pastas por funcionalidade (`app`, `features`, `shared`), componentes por composição e lógica em hooks |
| Dados | TanStack Query, `fetch` nativo, `zod/mini` e cache só em memória |
| Estado de tela | Filtro e busca na URL, com `URLSearchParams` |
| Interface | Tailwind com tokens do design, componentes próprios e Mulish pelo Fontsource |
| Carregamento | Skeleton em todo carregamento, sem spinner; skeleton estático no `index.html` |
| Qualidade | ESLint estrito, Vitest, Playwright com axe e limite de 100 KB gzip de JS inicial |
| Processo | Spec aprovada antes do código, uma branch por funcionalidade e merge com `--no-ff` |
| Idioma | Código e Git em inglês; documentação e interface em português |

Prioridade: acessibilidade, usabilidade e contraste; depois os requisitos do produto; depois o design, que o desafio manda seguir e que é seguido em layout, cores, tipografia e proporções. Todo desvio está registrado em [Desvios do design](docs/decisions/000-pre-development.md#desvios-do-design), cada um com o motivo.

## Trade-offs

| Escolha | Custo aceito | Como é compensado |
| --- | --- | --- |
| Vite em vez de Next 16 | O primeiro card chega depois, porque a lista é buscada no navegador | Skeleton no `index.html` e `preconnect` para a API e as imagens |
| Sem GraphQL Codegen | Uma mudança no schema não é detectada na compilação | Validação com Zod e teste de contrato contra a API real |
| Sem comentários nem `eslint-disable` | Nenhuma exceção pontual no código | `noInlineConfig` ativo; exceção inevitável altera a configuração e é registrada aqui |
| `eslint-plugin-jsx-a11y-x` 0.2.0 | Projeto jovem | Só atua em desenvolvimento, e o axe valida no navegador |
| `override` de `minimatch` | Afeta as ferramentas de desenvolvimento | Validado executando o ESLint |
| TypeScript 6.0.3 em vez de 7 | Versão mais antiga | `typescript-eslint` exige versão menor que 6.1 |
| Playwright só em Chromium | O Safari do iOS não tem cobertura automática | Conferência manual antes de publicar |
| Sem hook de `pre-push` | Nenhuma barreira no envio | Nada é enviado sem autorização do responsável pelo projeto; as verificações pesadas rodam no merge |
| Rótulos dos filtros em português, com o Figma em inglês | O texto da tela diverge do frame | O público e os leitores de tela usam português; o mapa de rótulos está nas [decisões prévias](docs/decisions/000-pre-development.md#idioma). Títulos e gêneros seguem a API, em inglês e romaji |
| Cores de texto de baixo contraste do design corrigidas | A nota amarela e a verde e o "Ver mais" têm texto escuro em vez de claro | Os valores do Figma reprovam no WCAG AA (1,37:1 a 2,21:1); a cor de fundo continua a do design |
| Espaçamentos do design normalizados em uma escala de 4, 8, 12, 16 e 24px | Diferenças de 1 a 4px em relação ao frame | O frame mistura 10, 11, 15, 19 e 25px; a escala evita valores soltos no código |
| Busca ao enviar, não a cada tecla, e sem debounce planejado | Não há resultados enquanto se digita | O limite de 30 requisições por minuto é baixo, e uma busca instantânea, mesmo com debounce, o consumiria com o uso normal de quem digita devagar ou corrige o termo. Enviar com Enter ou "Buscar" mantém uma consulta por intenção do usuário |
| Lista por popularidade | Quase só clássicos, sem os lançamentos em alta que o design sugere | Lista estável e títulos conhecidos; a busca alcança o restante |
| Título cortado em 3 linhas, como no design | Sem página de detalhe, quem enxerga em tela de toque não lê o título completo | Texto inteiro para leitores de tela e no atributo `title`, ao passar o mouse |
| Até 3 gêneros por card | Os demais gêneros ficam ocultos | Card compacto e capa visível |
| Teste de contrato fora do `verify` | O merge não detecta sozinho uma mudança na API | `npm run test:contract` roda antes do merge quando a consulta muda, e o Zod reprova em produção o que sair do schema |
| Sem nova tentativa em 4xx | Um 429 passageiro mostra erro na hora | Evita agravar o limite de requisições; o botão "Tentar novamente" repete a consulta quando o usuário quiser |
| Timeout de 10s sem nova tentativa automática | Uma API lenta vira erro, mesmo que respondesse em 12s | O skeleton nunca passa de 10s, em vez de até 30s com 2 tentativas |
| CSP sem relatório de violações | Uma violação em produção só aparece no console do navegador | Não há coletor, e a CSP é testada no Playwright com o `vercel.json` real |
| HSTS de 2 anos sem `preload` | O domínio fica fora das listas de pré-carga | Não controlo o domínio final, e o `preload` é irreversível na prática |
| Cards abrem a AniList em nova aba | Quem clica sai do catálogo | Não há página de detalhe própria, e a AniList tem os dados completos |
| Capas na resolução da AniList | Em telas de alta densidade (2x e 3x) as capas ficam mais suaves | A `extraLarge` de 460px é a maior que a API oferece e já é a servida em todas as telas |
| Sem pré-busca da primeira página | O LCP do mobile segue em cerca de 3,5s no Lighthouse | O Vite junta os scripts do HTML em um só pacote, então antecipar a consulta exigiria entradas separadas e um cliente de consulta compartilhado; o ganho não compensa |
| Licença MIT em nome de Lucas Paris | Qualquer pessoa pode reutilizar o código | É o padrão para projetos de portfólio; pode ser trocada pelo responsável |
| Imagem de prévia só com a marca | Não mostra os animes do catálogo | As capas são da AniList, e a prévia não depende da API |
| Ícones gerados por script | Um passo manual se a marca mudar | Sem dependência nova e sem arquivo de design fora do repositório |
| Capa fora de `s4.anilist.co` descartada em vez de erro | O card aparece sem capa | A lista inteira não cai por causa de uma URL, e a CSP bloquearia o carregamento de qualquer jeito |
| Ordem por relevância na busca | A lista muda de ordem ao buscar | Popularidade enterra o que o texto procura |
| Filtro em botões, não em `select` | Ocupa mais espaço em telas estreitas | As 8 opções ficam visíveis e a quebra de linha evita rolagem horizontal |
| "Ver mais" em vez de paginação | Não há como pular para o fim | Mantém o contexto e usa só `hasNextPage`, que a API garante |
| Foco fica em "Ver mais" | Quem usa teclado precisa voltar ao início para ler os novos cards | Anúncio "12 animes carregados" e botão no mesmo lugar |

## O que foi além do mínimo

- Instalação limpa: `npm ci` sem alertas e `npm audit` sem vulnerabilidades, com cada exceção justificada.
- Regras de arquitetura e de estilo validadas pelo ESLint, com testes que provam que cada regra reprova o que deve.
- Verificação automática no merge: TypeScript, Vitest, Playwright, build e size-limit.
- Acessibilidade medida: axe em oito configurações de tela, teclado, alvo de toque, movimento reduzido e `noscript`.
- Contraste corrigido onde o design reprovava no WCAG AA.
- Aviso de privacidade e atribuição à AniList no rodapé.
- Medição de Vite e Next 16 sob rede lenta antes de escolher a plataforma.
- Documentação pensada para quem desenvolve com IA: `CLAUDE.md` curto e documentos detalhados carregados quando necessários.
- Estados que o design não tem: carregamento, erro, limite de requisições, timeout, lista vazia e falha de renderização.
- Filtro e busca na URL, com link compartilhável e botão voltar.
- Cards que abrem a página do anime na AniList, com movimento ao passar o mouse que respeita `prefers-reduced-motion`.
- Cabeçalhos de segurança com CSP sem `unsafe-inline`, capas restritas a `s4.anilist.co` e teste da CSP no navegador.
- Ícones, prévia do link, meta tags, título da aba que acompanha filtro e busca, `robots.txt` e licença MIT.
- Resposta da API validada em tempo de execução, com teste de contrato contra a API real.

## O que faria com mais tempo

Do mais para o menos prioritário. A busca instantânea, com ou sem debounce, não está na lista de propósito: o limite da API é restrito, e a decisão está nos [trade-offs](#trade-offs).

1. **GitHub Actions** com as mesmas verificações do `verify`. Hoje elas rodam só nos hooks locais, e nada impede um merge sem rodá-las em outra máquina.
2. **Safari do iOS.** O Playwright cobre só Chromium, e a conferência no iPhone é manual.
3. **Lista inicial mais atual.** A lista por popularidade traz quase só clássicos; uma lista em alta ou por temporada aproxima o catálogo do que o design sugere.
4. **Página de detalhe**, em vez de abrir a AniList, e título completo para quem usa tela de toque.
5. **Desempenho do primeiro card.** O LCP do mobile fica em cerca de 3,5s, porque depende da cadeia HTML, JS, API e capa de terceiros. A pré-busca da primeira página exigiria entradas separadas no Vite e um cliente de consulta compartilhado.
6. **Jurídico.** Avaliar a aferição de idade da ECA Digital antes de uso comercial.
7. **Ferramentas.** Voltar ao TypeScript 7 quando o `typescript-eslint` aceitar.
8. **Produto.** Tema escuro, outros idiomas, contas de usuário e PWA.

### Pendências registradas nas revisões

Cada item foi achado em uma revisão e deixado sem correção, de propósito:

- **Revisão de `feat/feedback-states` e `chore/security-headers`:** o `ErrorBoundary` cobre só o catálogo e não registra a causa, porque não há serviço de erros; o texto do erro continua na tela durante a nova tentativa; `COVER_ORIGIN` repete a origem da CSP e do `preconnect`, e uma mudança de CDN da AniList exige alterar os três.
- **Revisão de `feat/format-filter`, `feat/text-search` e `feat/load-more`:** o campo de busca só consulta ao enviar, então texto digitado e não enviado permanece ao trocar o filtro; recarregar uma lista com várias páginas vencidas repete uma consulta por página.
- **Revisão de `feat/product-polish` e `docs/technical-walkthrough`:** nada compara as cores dos ícones e da prévia com o `index.html`, e o teste do passo a passo não trata âncoras duplicadas nem blocos de código; a URL de produção está repetida no `index.html` e no teste.
- **Revisão de `feat/final-polish`:** o link esticado impede selecionar o texto dos gêneros e da nota dentro do card; o foco vai ao título da seção antes de a nova tentativa terminar, e um novo erro igual não é anunciado de novo; o `--spacing` base de 4px vale para qualquer utilitário numérico futuro; a cor da capa depende de o React aplicar o estilo pelo CSSOM, que a CSP permite.

### Medição

Lighthouse depois de `feat/final-polish` (local, 3 rodadas): mobile 90 e desktop 91 a 93 em Performance, com acessibilidade, boas práticas e SEO em 100 nos dois. Nada que mudamos no código move a nota de Performance, porque o LCP depende da cadeia HTML, JS, API e capa de terceiros.
