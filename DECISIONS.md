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

Prioridade: acessibilidade, usabilidade e contraste; depois os requisitos do produto; por último o design, usado como base visual e sem reprodução literal.

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
| Busca ao enviar, não a cada tecla | Resultado menos imediato | Respeita o limite de 30 requisições por minuto |
| Lista por popularidade | Quase só clássicos, sem os lançamentos em alta que o design sugere | Lista estável e títulos conhecidos; a busca alcança o restante |
| Título cortado em 3 linhas, como no design | Sem página de detalhe, quem enxerga em tela de toque não lê o título completo | Texto inteiro para leitores de tela e no atributo `title`, ao passar o mouse |
| Até 3 gêneros por card | Os demais gêneros ficam ocultos | Card compacto e capa visível |
| Teste de contrato fora do `verify` | O merge não detecta sozinho uma mudança na API | `npm run test:contract` roda antes do merge quando a consulta muda, e o Zod reprova em produção o que sair do schema |
| Sem nova tentativa em 4xx | Um 429 passageiro mostra erro na hora | Evita agravar o limite de requisições; o botão "Tentar novamente" repete a consulta quando o usuário quiser |
| Timeout de 10s sem nova tentativa automática | Uma API lenta vira erro, mesmo que respondesse em 12s | O skeleton nunca passa de 10s, em vez de até 30s com 2 tentativas |
| CSP sem relatório de violações | Uma violação em produção só aparece no console do navegador | Não há coletor, e a CSP é testada no Playwright com o `vercel.json` real |
| HSTS de 2 anos sem `preload` | O domínio fica fora das listas de pré-carga | Não controlo o domínio final, e o `preload` é irreversível na prática |
| Capa fora de `s4.anilist.co` descartada em vez de erro | O card aparece sem capa | A lista inteira não cai por causa de uma URL, e a CSP bloquearia o carregamento de qualquer jeito |

| Busca só ao enviar | Não há resultados enquanto se digita | Respeita o limite de 30 requisições por minuto |
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

## Evoluções

Fora do escopo atual, na ordem das [branches](docs/specs/000-foundation/spec.md#ordem-das-branches):

- Registrado na revisão do Bloco B, sem correção: o campo de busca só consulta ao enviar, então texto digitado e não enviado permanece ao trocar o filtro; recarregar uma lista com várias páginas vencidas repete uma consulta por página.
- Acabamento: prévia do link, ícones e imagens em `feat/product-polish`.
- Publicação: GitHub Actions com as mesmas verificações do merge.
- Documentação: passo a passo técnico em `docs/walkthrough.md`.
- Jurídico: avaliar a aferição de idade da ECA Digital antes de uso comercial.
- Cobertura: conferir o Safari do iOS, que o Playwright em Chromium não cobre.
- Ferramentas: voltar ao TypeScript 7 quando o `typescript-eslint` aceitar.
- Produto: página de detalhe, link externo nos cards, tema escuro, outros idiomas, contas de usuário e PWA.
