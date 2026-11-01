import { Logo } from '@/shared/ui/Logo';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-white';
const touchTarget = 'pointer-coarse:min-h-control-touch';
const linkLayout = 'inline-flex items-center';
const summaryPadding = 'pointer-coarse:py-md';

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-sm bg-primary px-lg py-xl text-center text-white">
      <Logo size="sm" />
      <p className="text-xs uppercase">Todos os direitos reservados</p>
      <p className="text-xs">
        Dados fornecidos pela{' '}
        <a
          href="https://anilist.co"
          target="_blank"
          rel="noreferrer"
          className={`${linkLayout} ${touchTarget} underline ${focusRing}`}
        >
          AniList <span className="sr-only">(abre em nova aba)</span>
        </a>
      </p>
      <details className="max-w-content text-xs">
        <summary
          className={`${touchTarget} ${summaryPadding} cursor-pointer underline ${focusRing}`}
        >
          Aviso de privacidade
        </summary>
        <p className="pt-sm">
          O BuscAnime não tem contas, analytics nem cookies próprios. Para carregar o catálogo, seu
          navegador se conecta à AniList, que recebe seu IP e os termos buscados.
        </p>
      </details>
    </footer>
  );
}
