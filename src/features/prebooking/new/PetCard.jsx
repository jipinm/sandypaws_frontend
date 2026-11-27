import { motion } from 'framer-motion';
import Chip from '../../../components/ui/Chip.jsx';
import { inputClass } from '../../../components/ui/Field.jsx';
import { BREEDS, VACCINES, VACCINE_STATUS_STYLE } from '../../../data/reference.js';
import { fadeIn } from '../../../lib/motion.js';

export default function PetCard({ pet, removable, onChange, onRemove }) {
  return (
    <div className="rounded-xl border border-line p-3 space-y-2">
      <div className="flex gap-2">
        <select
          aria-label="Pet type"
          className={inputClass}
          value={pet.type}
          onChange={(e) => onChange({ type: e.target.value, breed: '' })}
        >
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
        </select>
        <select aria-label="Breed" className={inputClass} value={pet.breed} onChange={(e) => onChange({ breed: e.target.value })}>
          <option value="">Breed (optional)</option>
          {BREEDS[pet.type].map((breed) => (
            <option key={breed}>{breed}</option>
          ))}
        </select>
        {removable && (
          <button type="button" onClick={onRemove} className="px-2 text-mute hover:text-red-700" aria-label="Remove pet">
            ×
          </button>
        )}
      </div>
      {pet.breed ? (
        <motion.div key={pet.type + pet.breed} {...fadeIn} className="flex flex-wrap gap-1.5">
          {VACCINES[pet.type].map((vaccine) => (
            <Chip key={vaccine} className={VACCINE_STATUS_STYLE.Unconfirmed}>{vaccine}</Chip>
          ))}
        </motion.div>
      ) : (
        <p className="text-xs text-mute">Pick a breed to load the default vaccine checklist.</p>
      )}
    </div>
  );
}
