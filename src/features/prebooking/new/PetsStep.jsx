import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../../../components/ui/Button.jsx';
import PetCard from './PetCard.jsx';
import { plural } from '../../../lib/records.js';

export default function PetsStep({ form, update }) {
  const { pets } = form;
  // Stable keys so the correct card animates out when one is removed.
  const nextKey = useRef(Math.max(0, ...pets.map((p) => p.key ?? 0)) + 1);

  const add = () => update({ pets: [...pets, { type: 'dog', breed: '', key: nextKey.current++ }] });
  const change = (index, changes) => update({ pets: pets.map((p, i) => (i === index ? { ...p, ...changes } : p)) });
  const remove = (index) => update({ pets: pets.filter((_, i) => i !== index) });

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="font-semibold">{plural(pets.length)} declared</p>
        <Button onClick={add}>+ Add pet</Button>
      </div>
      <AnimatePresence initial={false}>
        {pets.map((pet, i) => (
          <motion.div
            key={pet.key ?? 0}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <PetCard
              pet={pet}
              removable={pets.length > 1}
              onChange={(changes) => change(i, changes)}
              onRemove={() => remove(i)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
