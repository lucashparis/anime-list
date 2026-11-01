import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useUrlSearchParams } from '@/shared/hooks/useUrlSearchParams';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('useUrlSearchParams', () => {
  it('reads the current query string', () => {
    window.history.replaceState(null, '', '/?format=MOVIE');
    const { result } = renderHook(() => useUrlSearchParams());
    expect(result.current.params.get('format')).toBe('MOVIE');
  });

  it('writes, replaces and removes keys, adding a history entry for each change', () => {
    const { result } = renderHook(() => useUrlSearchParams());
    const initialLength = window.history.length;
    act(() => {
      result.current.update({ format: 'OVA' });
    });
    expect(window.location.search).toBe('?format=OVA');
    expect(result.current.params.get('format')).toBe('OVA');
    act(() => {
      result.current.update({ format: null });
    });
    expect(window.location.search).toBe('');
    expect(window.history.length).toBe(initialLength + 2);
  });

  it('does not add a history entry when nothing changes', () => {
    window.history.replaceState(null, '', '/?format=OVA');
    const { result } = renderHook(() => useUrlSearchParams());
    const initialLength = window.history.length;
    act(() => {
      result.current.update({ format: 'OVA' });
    });
    expect(window.history.length).toBe(initialLength);
  });

  it('follows the browser back button', () => {
    const { result } = renderHook(() => useUrlSearchParams());
    act(() => {
      result.current.update({ format: 'ONA' });
    });
    act(() => {
      window.history.replaceState(null, '', '/?format=MUSIC');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.params.get('format')).toBe('MUSIC');
  });
});
