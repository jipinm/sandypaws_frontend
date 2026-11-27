import { motion } from 'framer-motion';
import { useEscape } from '../../hooks/useEscape.js';
import { fadeIn, pop } from '../../lib/motion.js';

/** Bottom sheet on phones, centred dialog from `sm` up. Wrap in <AnimatePresence> for the exit animation. */
export default function Modal({ onClose, wide = false, label, children }) {
  useEscape(onClose);
  return (
    <motion.div
      {...fadeIn}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/40"
      onClick={onClose}
    >
      <motion.div
        variants={pop}
        initial="initial"
        animate="animate"
        exit="exit"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`bg-white w-full rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto ${wide ? 'sm:max-w-2xl' : 'sm:max-w-xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
