import { Component, type ReactNode } from 'react';
import { Button } from '@/shared/ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div role="alert" className="flex flex-col items-center gap-lg text-center">
        <p>Algo deu errado.</p>
        <Button
          variant="solid"
          onClick={() => {
            window.location.reload();
          }}
        >
          Recarregar a página
        </Button>
      </div>
    );
  }
}
