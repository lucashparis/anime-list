# Uso de IA

Registro de como a IA foi usada no BuscAnime, com o que foi verificado, corrigido e rejeitado.

## Ferramentas

- **Claude Code**, em todo o desenvolvimento.
- **Claude Opus 5.5** coordenou o trabalho e faz a revisão final.
- **Claude Sonnet 5.5**, em subagentes, fez a implementação e a revisão de cada tarefa da fundação, cada um com contexto novo.
- No catálogo, o **Opus 5.5** implementou direto na janela principal, sem subagente por tarefa, e o **Sonnet 5.5** fez a revisão da branch.
- Daí em diante, o **Sonnet 5.5** implementou direto na janela principal, uma sessão por bloco, e fez a revisão de cada bloco. Os blocos são: A, a fundação e o catálogo; B, filtro, busca e "Ver mais"; C, estados de tela e cabeçalhos de segurança; D, ícones, prévia do link e passo a passo técnico; e a lapidação final (`feat/final-polish`).
- Na `fix/search-and-load-feedback`, o **Opus 5.5** investigou e implementou direto na janela principal, e o **Sonnet 5.5** revisou a branch.
- **Playwright** foi usado para validar o resultado no navegador.

Os commits levam a linha `Co-Authored-By` do modelo da sessão (Opus 5.5 até o catálogo, Sonnet 5.5 depois e Opus 5.5 na `fix/search-and-load-feedback`). Ela não distingue quem escreveu cada trecho: a divisão real é a descrita acima.

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

- O levantamento de código depois de `feat/product-polish` e `docs/technical-walkthrough` (Bloco D) achou que o campo de busca perdia o foco ao enviar (o `key` o recriava). Um teste reproduziu, e o campo passou a ser controlado.
- O teste e2e do clique no card mostrou que o link esticado não cobria o card: o `--*: initial` do tema anulava o `inset-0`. O token `--spacing` base foi declarado.
- O Lighthouse (produção e local) deu Performance 89 a 93 e os outros três pilares em 100. A pré-busca da primeira página foi tentada em um ramo descartado: o Vite juntava os scripts em um só pacote. O `fetchpriority` na primeira capa não mudou a nota e também foi descartado.
- O responsável pelo projeto viu o aviso de carregamento lento piscar no `npm run dev`. Os testes e2e só rodam no build, onde o CSS já vinha por `<link>`, e por isso não o pegavam. A comparação dos dois ambientes com o JS atrasado mostrou que no dev a página pintava sem CSS. A folha de estilo passou a ser ligada no `index.html`, e um teste garante isso. Na mesma branch, consultas reais mostraram que a AniList só reconhece palavras completas, e a lista vazia passou a orientar quem busca.
- A avaliação do README pelo responsável pelo projeto achou três falhas: `nvm use` sozinho, que falha sem a versão instalada e no nvm-windows; os passos opcionais misturados aos obrigatórios; e uma branch integrada que faltava na linha do tempo. O `nvm use` sem versão foi reproduzido no nvm-windows 1.1.11, e a contagem de merges veio do `git log --merges`.

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
- Uma avaliação crítica da entrega contra o enunciado apontou que o site publicado não tinha o layout do Figma (busca acima dos filtros, "Ver mais" pequeno) e que a documentação dizia que o design não seria reproduzido. O layout já estava corrigido na branch, e a documentação foi reescrita para dizer o que o código faz: o Figma é seguido, com desvios registrados.

## Rejeitado

- **Hook de `pre-push`:** as verificações pesadas já rodam no merge, e nada é enviado sem autorização do responsável pelo projeto.
- **Reproduzir o design pixel a pixel como método:** os espaçamentos irregulares (10, 11, 15, 19 e 25px) gerariam código duplicado e viraram uma escala de tokens. O layout, a ordem dos elementos, as cores e as proporções seguem o frame, e a `feat/final-polish` os realinhou depois de medir o frame e o site lado a lado.
- **Manter o texto de baixo contraste do design:** os valores medidos reprovam no WCAG AA.
