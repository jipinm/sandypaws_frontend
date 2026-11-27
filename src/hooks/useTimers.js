import { useCallback, useEffect, useRef, useState } from 'react';

/** A value that clears itself after `duration` ms. Setting it again restarts the timer. */
export function useTransientState(duration) {
  const [value, setValue] = useState(null);
  const timer = useRef();
  const show = useCallback(
    (next) => {
      clearTimeout(timer.current);
      setValue(next);
      timer.current = setTimeout(() => setValue(null), duration);
    },
    [duration],
  );
  useEffect(() => () => clearTimeout(timer.current), []);
  return [value, show];
}
