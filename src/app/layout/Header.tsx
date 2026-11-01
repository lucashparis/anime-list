import { Logo } from '@/shared/ui/Logo';

export function Header() {
  return (
    <header className="flex justify-center bg-primary px-lg py-xl">
      <h1>
        <Logo size="lg" />
      </h1>
    </header>
  );
}
