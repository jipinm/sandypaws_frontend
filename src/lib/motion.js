/* Shared Framer Motion presets. Timings match the original CSS keyframes. */
export const ease = [0.25, 0.1, 0.25, 1]; // CSS "ease"

/** .fi: fade up */
export const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease } },
};

/** .pop: scale and rise */
export const pop = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease } },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.16, ease } },
};

/** .sl: slide in from the right */
export const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.12, ease } },
};

export const spring = { type: 'spring', stiffness: 500, damping: 38 };
