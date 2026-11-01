export function loadedMessage(count: number) {
  if (count === 0) return 'Nenhum anime novo carregado';
  if (count === 1) return '1 anime carregado';
  return `${String(count)} animes carregados`;
}
