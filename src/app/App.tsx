import { Footer } from '@/app/layout/Footer';
import { Header } from '@/app/layout/Header';

export function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:bg-white focus:p-md focus:text-primary focus-visible:outline-2 focus-visible:outline-primary pointer-coarse:min-h-control-touch"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1" />
      <Footer />
    </div>
  );
}
