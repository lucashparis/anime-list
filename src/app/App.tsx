import { AppProviders } from '@/app/AppProviders';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { Footer } from '@/app/layout/Footer';
import { Header } from '@/app/layout/Header';
import { AnimeCatalog } from '@/features/anime-catalog/components/AnimeCatalog';

export function App() {
  return (
    <AppProviders>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-sm focus:left-sm focus:z-10 focus:bg-white focus:p-md focus:text-primary focus-visible:outline-2 focus-visible:outline-primary pointer-coarse:min-h-control-touch"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 px-lg py-xl focus:outline-none">
          <ErrorBoundary>
            <AnimeCatalog />
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </AppProviders>
  );
}
