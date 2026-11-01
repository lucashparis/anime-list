import type { ReactNode } from 'react';

export function Chip({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <span lang={lang} className="block rounded-sm bg-primary-light px-sm py-xs text-xs text-white">
      {children}
    </span>
  );
}
