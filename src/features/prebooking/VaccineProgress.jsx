import { motion } from 'framer-motion';
import { vaccineProgress } from '../../lib/records.js';
import { ease } from '../../lib/motion.js';

export default function VaccineProgress({ pets }) {
  const { done, total, percent } = vaccineProgress(pets);
  if (!total) return <span className="text-xs text-mute">No checklist</span>;
  return (
    <>
      <div className="h-1.5 rounded-full bg-line">
        <motion.div
          className="h-1.5 rounded-full bg-leaf"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.7, ease }}
        />
      </div>
      <p className="text-xs text-mute mt-1">{done} of {total} done</p>
    </>
  );
}
