# Spec 006: Busca e carregamento

Branch: `fix/search-and-load-feedback`. Vem de três problemas de uso e de uma avaliação do README, relatados pelo responsável pelo projeto depois da `feat/final-polish`. Base em [005-final-polish](../005-final-polish/spec.md).

## Diagnóstico

| Problema | Causa | Evidência |
| --- | --- | --- |
| "Nar" não encontra Naruto | A API compara palavras completas e não o começo delas. Ela tolera alguns erros, mas sem regra fixa | Consultas reais: `Nar` e `Narut` não trazem Naruto, `Shing` não traz nada, `Shingeki no Kyo` e `Bleac` funcionam. O schema não tem outro filtro de título além de `search` |
| Espaços repetidos na URL | `normalizeSearch` só removia os espaços das pontas | `naruto   shippuden` virava `?q=naruto+++shippuden` |
| Aviso de carregamento lento pisca no `npm run dev` | O CSS entrava pelo `main.tsx`. No dev, o Vite o injeta só quando o JS roda, e até lá a página aparece sem estilo e com o aviso à mostra. No build, o CSS já ia para um `<link>` no `<head>`, e o problema não acontecia | Com o JS atrasado em 1,5s, o dev tinha 0 folhas de estilo e o aviso visível; a produção tinha 1 folha e o aviso oculto |

## Decisões

| Item | Tipo | Decisão |
| --- | --- | --- |
| Espaços na busca | Comportamento | Qualquer sequência de espaços, tabulações ou quebras vira um único espaço, antes do limite de 100 caracteres. Vale para a consulta, para a URL e para o campo |
| Lista vazia com busca | Texto | Abaixo de "Nenhum anime encontrado para “termo”.": "A busca só reconhece palavras completas do título. Se você digitou apenas o começo de um nome, escreva a palavra inteira, como “Naruto” em vez de “Nar”." As duas frases ficam na mesma região `role="status"`. Sem busca, a dica não aparece |
| CSS da página | Técnico | Entra por `<link rel="stylesheet">` no `index.html`, e não mais pelo `main.tsx`. O dev passa a pintar como o build, e o HMR do Tailwind continua funcionando |
| Instalação do Node no README | Documentação | `nvm install 24.22.2` e `nvm use 24.22.2`, com a versão escrita, porque `nvm use` sozinho falha sem a versão instalada e o nvm-windows não lê o `.nvmrc`. O README avisa que versões fora de `>=24.22.2 <25` são recusadas pelo `engine-strict` |
| Passos do README | Documentação | "Rodar o app" (nvm, `npm ci`, `npm run dev`) separado de "Desenvolver e testar" (hooks e navegador do Playwright, ambos opcionais) |
| Linha do tempo | Documentação | Entra a `docs/search-on-submit`, que já estava na `main` e faltava na tabela, e esta branch passa a ser a 13ª |
| Link do Figma | Fora do escopo | O link não é publicado no repositório; o README segue citando os desvios medidos |
| Busca por começo de palavra | Fora do escopo | Exigiria um índice próprio do catálogo, o que os termos da AniList e o limite de 30 requisições por minuto impedem |

## Critérios de aceite

- `naruto   shippuden` gera `search: "naruto shippuden"`, `?q=naruto+shippuden` e o campo com um espaço só.
- Uma busca sem resultado mostra o termo e a dica; a lista vazia sem busca não mostra a dica.
- O `index.html` liga a folha de estilo no `<head>`, e o `main.tsx` não importa CSS.
- No `npm run dev`, com o JS atrasado, a página tem a folha de estilo e o aviso de carregamento lento fica oculto.
- A tabela da linha do tempo tem uma linha por merge na `main`.
