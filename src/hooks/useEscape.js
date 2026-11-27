import { useEffect, useRef } from 'react';

export function useEscape(handler) {
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && latest.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
