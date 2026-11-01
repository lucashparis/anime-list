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
| Processo | Spec e plano antes do código, uma branch por funcionalidade e merge com `--no-ff` |
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
| Sem hook de `pre-push` | Nenhuma barreira no envio | Não há envio enquanto o repositório for local; as verificações pesadas rodam no merge |
| Busca ao enviar, não a cada tecla | Resultado menos imediato | Respeita o limite de 30 requisições por minuto |

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

- Próximas funcionalidades: catálogo, filtro por formato, busca por texto, "Ver mais" e estados de erro e vazio.
- Segurança: CSP e headers em `chore/security-headers`.
- Publicação: GitHub Actions com as mesmas verificações do merge.
- Documentação: passo a passo técnico em `docs/walkthrough.md`.
- Jurídico: avaliar a aferição de idade da ECA Digital antes de uso comercial.
- Cobertura: conferir o Safari do iOS, que o Playwright em Chromium não cobre.
- Ferramentas: voltar ao TypeScript 7 quando o `typescript-eslint` aceitar.
- Produto: página de detalhe, link externo nos cards, tema escuro, outros idiomas, contas de usuário e PWA.
