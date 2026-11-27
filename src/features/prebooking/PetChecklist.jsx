import { motion } from 'framer-motion';
import { VACCINE_STATUS_STYLE } from '../../data/reference.js';

export default function PetChecklist({ pets, onToggle }) {
  return (
    <div className="mt-2 space-y-3">
      {pets.map((pet, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.06 }}
          className="rounded-xl border border-line p-4"
        >
          <p className="font-semibold capitalize">{pet.type}{pet.breed ? ` · ${pet.breed}` : ''}</p>
          {Object.keys(pet.vax).length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(pet.vax).map(([vaccine, status]) => (
                <button
                  key={vaccine}
                  type="button"
                  onClick={() => onToggle(i, vaccine)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition active:scale-95 ${VACCINE_STATUS_STYLE[status]}`}
                >
                  <motion.span key={status} initial={{ opacity: 0.2 }} animate={{ opacity: 1 }} className="inline-block">
                    {vaccine}: {status}
                  </motion.span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-mute">No breed selected, so no default checklist.</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
