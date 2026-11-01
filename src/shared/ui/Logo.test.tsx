import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Logo } from './Logo';

describe('Logo', () => {
  it('exposes the brand name as one accessible text', () => {
    render(<Logo size="lg" />);
    expect(
      screen.getByText(
        (_, element) => element?.textContent === 'BuscAnime' && element.tagName === 'SPAN',
      ),
    ).toBeInTheDocument();
  });

  it.each([
    ['lg', 'text-xl'],
    ['sm', 'text-lg'],
  ] as const)('applies the %s size', (size, className) => {
    const { container } = render(<Logo size={size} />);
    expect(container.firstElementChild).toHaveClass(className);
  });
});
