# Git

## Branches

Uma branch por funcionalidade, em inglês, no formato `tipo/nome-curto`, com o tipo igual ao do Conventional Commits.

```
feat/anime-catalog
chore/project-foundation
docs/technical-walkthrough
```

A ordem prevista está na [spec da fundação](../specs/000-foundation/spec.md#ordem-das-branches).

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), em inglês, validados pelo commitlint.

```
feat: add format filter
fix: keep header at 68px
docs: add project guides and AI log
```

Todo commit termina com a linha de coautoria, depois de uma linha em branco:

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

O registro de quem fez o quê está em [AI_LOG.md](../../AI_LOG.md).

## Hooks

Instale uma vez por clone:

```bash
npm run hooks:install
```

O comando define `core.hooksPath` só neste repositório e instala os hooks do Lefthook. Se a máquina tiver `core.hooksPath` global, o Lefthook não instala os hooks do projeto e não avisa; por isso o comando define o caminho local. Não altere a configuração global.

| Momento | Verificação |
| --- | --- |
| `pre-commit` | Prettier e ESLint nos arquivos alterados; `npm run test:guards` quando `eslint.config.js` ou `tools/eslint/**` mudam |
| `commit-msg` | commitlint |
| `pre-merge-commit` | `npm run verify` |

Nunca use `--no-verify`. Não há `pre-push`: as verificações pesadas rodam no `pre-merge-commit`, e nada é enviado sem autorização do responsável pelo projeto.

## Merge

O merge para a `main` só acontece depois que o responsável pelo projeto avalia o trabalho. A branch entra com `--no-ff`, citando a spec:

```bash
git switch main
git merge --no-ff chore/project-foundation \
  -m "Merge branch 'chore/project-foundation'" \
  -m "Set up the project foundation. See docs/specs/000-foundation/spec.md." \
  -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Quando o `pre-merge-commit` falha

O merge não é criado. Desfaça e corrija na branch:

```bash
git merge --abort
git switch chore/project-foundation
npm run verify
```

Corrija o que falhou, faça o commit e repita o merge. Não há atalho que pule a verificação.

## README

Atualize o `README.md` na própria branch: estado atual, comandos novos e uma linha na linha do tempo.
