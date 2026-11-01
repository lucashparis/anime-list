# Convenções de código

As regras de lint estão na [spec da fundação](../specs/000-foundation/spec.md#regras-de-lint). Este documento mostra como escrever o código que passa por elas.

## Idioma

| Conteúdo | Idioma |
| --- | --- |
| Branches, commits, nomes de arquivos, funções, variáveis, descrições de teste e mensagens técnicas | Inglês |
| Documentação e artefatos do projeto | Português |
| Todo texto da interface, inclusive `aria-label`, `alt`, placeholder e título da página | Português, mesmo quando o design estiver em inglês |
| Dados da API, como títulos e gêneros | Como a API retorna, sem tradução |
| Siglas sem equivalente em português, como OVA e ONA, e a marca BuscAnime | Mantidas |

O `<html>` declara `lang="pt-BR"`. Um trecho de dados em outro idioma, como um gênero, declara o próprio `lang`. Nomes próprios, como títulos, são dispensados pela WCAG 3.1.2.

## Composição

Componentes recebem `children` e props. O pai controla o espaçamento com `gap`; o componente filho não define margem externa. Quem precisa do dado chama o hook, em vez de receber a prop por vários níveis.

## Variantes em mapa tipado

Variantes são uniões de strings e um `Record` que as mapeia para classes. O TypeScript reprova uma variante sem classe. Referências reais: `Logo` em `src/shared/ui/Logo.tsx` e `ScoreBadge` em `src/features/anime-catalog/components/ScoreBadge.tsx`.

## Cláusula de guarda

Desvios de fluxo usam retorno antecipado. `else` e `else if` são reprovados. O ternário simples escolhe um valor, e o aninhado é reprovado.

Exemplo da regra de cor da nota, em `src/features/anime-catalog/model/scoreTone.ts`:

```ts
type ScoreTone = 'danger' | 'warning' | 'success';

export function getScoreTone(score: number): ScoreTone {
  if (score < 50) return 'danger';
  if (score <= 80) return 'warning';
  return 'success';
}
```

A regra vem dos [requisitos](../decisions/000-pre-development.md#requisitos-do-produto): abaixo de 50, vermelho; de 50 a 80, amarelo; acima de 80, verde. Nota nula tem estado próprio e não passa por esta função.

## Limites e estilo

- Funções até 40 linhas, arquivos até 200, complexidade até 10 e até 3 parâmetros. Passe um objeto quando precisar de mais.
- Sem comentários: dê nome a constantes e funções. O motivo de uma decisão fica no commit ou em `DECISIONS.md`.
- Sem `any`. Dados externos entram como `unknown` e passam pelo Zod.
- `className` só com tokens. Valores como `w-[13px]` são reprovados; os tokens estão em [tokens.md](../design/tokens.md).
- Imports internos usam o alias `@/`, como `@/shared/ui/Logo`.
- Prettier com aspas simples e 100 colunas; o `pre-commit` formata os arquivos alterados.
