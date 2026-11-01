import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '@/app/ErrorBoundary';

function Broken(): never {
  throw new Error('render failure');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the fallback with a reload button when a child throws', () => {
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado.');
    expect(screen.getByRole('button', { name: 'Recarregar a página' })).toBeInTheDocument();
  });

  it('renders the children when nothing fails', () => {
    render(
      <ErrorBoundary>
        <p>Tudo certo</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Tudo certo')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
