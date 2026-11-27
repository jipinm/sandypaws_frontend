import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

/** Counts from the previous value to the new one. */
export default function AnimatedNumber({ value }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const controls = animate(current.current, value, {
      duration: reduced ? 0 : 0.7,
      ease: 'easeOut',
      onUpdate: (v) => {
        current.current = v;
        setShown(Math.round(v));
      },
      onComplete: () => setShown(value),
    });
    return () => controls.stop();
  }, [value, reduced]);

  return (
    <>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </>
  );
}
