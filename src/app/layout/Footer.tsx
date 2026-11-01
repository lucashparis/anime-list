import { Logo } from '@/shared/ui/Logo';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-white';
const touchTarget = 'inline-flex items-center pointer-coarse:min-h-control-touch';

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-sm bg-primary px-lg py-xl text-center text-white">
      <Logo size="sm" />
      <p className="text-xs uppercase">Todos os direitos reservados</p>
      <p className="text-xs">
        Dados fornecidos pela{' '}
        <a
          href="https://anilist.co"
          rel="noreferrer"
          className={`${touchTarget} underline ${focusRing}`}
        >
          AniList
        </a>
      </p>
      <details className="max-w-content text-xs">
        <summary className={`${touchTarget} cursor-pointer underline ${focusRing}`}>
          Aviso de privacidade
        </summary>
        <p className="pt-xs">
          O BuscAnime não tem contas, analytics nem cookies próprios. Para carregar o catálogo, seu
          navegador se conecta à AniList, que recebe seu IP e os termos buscados.
        </p>
      </details>
    </footer>
  );
}
