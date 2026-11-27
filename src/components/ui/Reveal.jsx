import { motion } from 'framer-motion';
import { ease } from '../../lib/motion.js';

/** Fades content up the first time it scrolls into view. */
export default function Reveal({ as = 'div', delay = 0, y = 16, children, ...props }) {
  const Component = motion[as];
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.4, delay, ease }}
      {...props}
    >
      {children}
    </Component>
  );
}
