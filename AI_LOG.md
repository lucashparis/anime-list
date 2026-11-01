# Uso de IA

Registro de como a IA foi usada no BuscAnime, com o que foi verificado, corrigido e rejeitado.

## Ferramentas

- **Claude Code**, em todo o desenvolvimento.
- **Claude Opus 5.5** coordenou o trabalho e faz a revisão final.
- **Claude Sonnet 5.5**, em subagentes, fez a implementação e a revisão de cada tarefa da fundação, cada um com contexto novo.
- No catálogo, o **Opus 5.5** implementou direto na janela principal, sem subagente por tarefa, e o **Sonnet 5.5** fez a revisão da branch.
- Na descoberta (filtro, busca e "Ver mais") nos estados de tela, nos cabeçalhos de segurança e no acabamento, o **Sonnet 5.5** implementou direto na janela principal, uma sessão por bloco, e fez a revisão de cada bloco.
- **Playwright** foi usado para validar o resultado no navegador.

Os commits levam a linha `Co-Authored-By` do modelo da sessão (Opus 5.5 até o catálogo, Sonnet 5.5 depois). Ela não distingue quem escreveu cada trecho: a divisão real é a descrita acima.

## Organização

- `CLAUDE.md` curto, apontando para documentos detalhados carregados só quando necessários.
- Spec aprovada antes do código, com plano só quando o risco justificar.
- A fundação teve uma revisão por tarefa e uma revisão final. A partir da próxima branch, é uma revisão por branch.
- O responsável pelo projeto aprovou as decisões e avalia cada merge.

## Custo da revisão

- A fundação consumiu cerca de 1 milhão de tokens em subagentes.
- As revisões por tarefa ficaram com 37% desse total e não acharam nenhum problema importante real.
- A revisão final achou 4, entre eles a regra `no-unsafe-type-assertion`, que faltava no `strictTypeChecked`, lacunas nos valores arbitrários e um teste do skip link que podia passar sem provar nada.
- A revisão visual do responsável pelo projeto achou o que nenhum revisor achou.

## Verificado por medição

- **Vite contra Next 16, com rede lenta simulada.** A primeira suposição era que o Next enviaria menos JS. A medição mostrou o contrário neste caso e trocou a decisão para o Vite. Os números estão em [000-pre-development](docs/decisions/000-pre-development.md#vite-e-next-16).

## Corrigido

- `eslint-plugin-jsx-a11y` não aceita ESLint 10. Foi trocado por `eslint-plugin-jsx-a11y-x`.
- `@size-limit/preset-app` trazia o Puppeteer com vulnerabilidades. Foi trocado por `@size-limit/file`.
- O `override` de `minimatch` quebrou o `eslint-plugin-import-x`. O problema apareceu ao rodar o ESLint, e o plugin foi trocado pela regra nativa `no-restricted-imports`.
- Sem `noInlineConfig`, um `eslint-disable` desligaria a própria regra de comentários. A opção ficou ativa.
- Um `core.hooksPath` global fazia o Lefthook não instalar os hooks do projeto, sem aviso. O `npm run hooks:install` define o caminho só no repositório.
- O plano usava `onUnhandledRequest`, que não existe mais no MSW 3. O typecheck acusou, e a opção virou `onUnhandledFrame`.
- O teste das regras de lint falhava em um único processo, porque o serviço de projeto do `typescript-eslint` guarda em cache os arquivos que não existiam. Cada caso passou a rodar em um processo filho.
- A revisão visual das capturas reduziu o cabeçalho de 108px para 68px e devolveu a seta do `<details>`, que um `inline-flex` planejado havia removido.
- Um passo de limpeza do plano (`git reset --hard`) apagou uma edição ainda não commitada durante a execução, e ela foi refeita.
- O teste de `credentials: 'omit'` falhou porque o MSW não preserva a opção no Node, embora o código estivesse certo. O teste passou a observar o `fetch`.
- Com 12 cards, a página passou da altura da tela e reprovou o teste do rodapé em tela alta. O teste passou a usar lista vazia, que é o caso que ele protege.
- A revisão apontou que perder a conexão deixaria a tela no skeleton indefinidamente. Um teste reproduziu o problema, e as consultas passaram a usar `networkMode: 'always'`.
- A revisão também apontou um teste e2e de cookies que não provava nada. Trocar para `credentials: 'include'` não o reprovou, mesmo com um cookie no navegador, e a verificação foi removida; quem prova a opção é o teste unitário.
- A spec propunha título inteiro e lista em alta. O responsável pelo projeto escolheu corte em 3 linhas e lista por popularidade.

## Rejeitado

- **Hook de `pre-push`:** as verificações pesadas já rodam no merge, e nada é enviado sem autorização do responsável pelo projeto.
- **Reproduzir o design pixel a pixel:** os espaçamentos irregulares gerariam código duplicado.
- **Manter o texto de baixo contraste do design:** os valores medidos reprovam no WCAG AA.
