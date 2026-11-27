import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { inputClass } from '../ui/Field.jsx';
import { STAGES } from '../../data/reference.js';
import { pop } from '../../lib/motion.js';

export default function SearchBox({ bookings, findClient, onOpen }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();

  const hits = useMemo(
    () =>
      term
        ? bookings
            .filter((b) => (b.ref + findClient(b.cid).name).toLowerCase().includes(query.toLowerCase()))
            .slice(0, 6)
        : [],
    [term, query, bookings, findClient],
  );

  const open = (id) => {
    onOpen(id);
    setQuery('');
  };

  return (
    <div className="relative flex-1 max-w-md">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by case reference or client"
        aria-label="Search by case reference or client"
        className={inputClass}
      />
      <AnimatePresence>
        {term && (
          <motion.div
            {...pop}
            className="absolute left-0 right-0 mt-1 rounded-xl bg-white border border-line shadow-xl overflow-hidden"
          >
            {hits.length ? (
              hits.map((hit) => (
                <button
                  key={hit.id}
                  type="button"
                  onClick={() => open(hit.id)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 flex justify-between gap-2"
                >
                  <span><b>{hit.ref}</b> · {findClient(hit.cid).name}</span>
                  <span className="text-xs text-mute">{STAGES[hit.stage].label}</span>
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-mute">No matches.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
