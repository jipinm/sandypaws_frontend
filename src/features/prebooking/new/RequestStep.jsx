import { AnimatePresence, motion } from 'framer-motion';
import { Field, FieldError, inputClass } from '../../../components/ui/Field.jsx';
import { MODES } from '../../../data/reference.js';

export default function RequestStep({ form, update, errors }) {
  return (
    <>
      <div>
        <p className="text-xs font-medium text-mute mb-1">Movement direction</p>
        <div className="flex gap-2">
          {['Export', 'Import'].map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={form.direction === d}
              onClick={() => update({ direction: d })}
              className={`flex-1 rounded-lg border py-2 font-semibold transition active:scale-[0.98] ${form.direction === d ? 'border-brand bg-orange-50' : 'border-line'}`}
            >
              {d}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {form.direction === 'Import' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="mt-2 text-xs text-yellow-800 bg-yellow-50 rounded-lg p-2">
                Imports are saved in Pre-Booking only. Post-Booking is export only.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>
        <p className="text-xs font-medium text-mute mb-1">Travel mode</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(MODES).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={form.travelMode === key}
              onClick={() => update({ travelMode: key })}
              className={`rounded-lg border px-2 py-2.5 text-xs font-semibold transition active:scale-95 ${form.travelMode === key ? 'border-brand bg-orange-50' : 'border-line hover:bg-stone-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <FieldError message={errors.travelMode} />
      </div>
      <Field label="Travel preferences (optional)">
        <textarea
          rows="2"
          className={`${inputClass} mt-1`}
          value={form.prefs}
          onChange={(e) => update({ prefs: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field className="" label="Planned route (optional)">
          <input
            placeholder="DXB → LHR"
            className={`${inputClass} mt-1`}
            value={form.route}
            onChange={(e) => update({ route: e.target.value })}
          />
        </Field>
        <Field className="" label="Planned month (optional)">
          <input
            type="month"
            className={`${inputClass} mt-1`}
            value={form.month}
            onChange={(e) => update({ month: e.target.value })}
          />
        </Field>
      </div>
    </>
  );
}
