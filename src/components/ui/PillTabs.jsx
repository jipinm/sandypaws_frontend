import { motion } from 'framer-motion';
import { spring } from '../../lib/motion.js';

/**
 * Row of pill buttons with a dark highlight that slides to the active one.
 * options: [{ value, label }]. `id` must be unique per group on screen.
 */
export default function PillTabs({ id, options, value, onChange, className, pillClass, inactiveClass }) {
  return (
    <div className={className}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`relative rounded-full font-semibold transition-colors ${pillClass} ${active ? 'text-white' : inactiveClass}`}
          >
            {active && <motion.span layoutId={id} transition={spring} className="absolute inset-0 rounded-full bg-ink" />}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
