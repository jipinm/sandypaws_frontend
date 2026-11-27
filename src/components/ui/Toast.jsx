import { AnimatePresence, motion } from 'framer-motion';
import { slide } from '../../lib/motion.js';

export default function Toast({ message }) {
  return (
    <div role="status" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            {...slide}
            exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
            className="fixed bottom-5 right-5 z-[60] max-w-sm rounded-xl bg-ink text-white text-sm px-4 py-3 shadow-2xl"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
