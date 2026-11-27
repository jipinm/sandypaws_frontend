import Chip from '../../components/ui/Chip.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import { MODES } from '../../data/reference.js';
import { plural } from '../../lib/records.js';

export default function MonthPlanned({ bookings, onOpen }) {
  return (
    <Reveal as="section" delay={0.08} className="rounded-xl bg-white border border-line shadow-c p-5">
      <h2 className="font-semibold">Month Planned · Date TBD</h2>
      <div className="mt-3 space-y-2">
        {bookings
          .filter((b) => b.month)
          .map((b, i) => (
            <Reveal key={b.id} y={10} delay={i * 0.06}>
              <button
                type="button"
                onClick={() => onOpen(b.id)}
                className="w-full text-left rounded-lg border border-line p-3 transition hover:border-brand hover:bg-orange-50/40 active:scale-[0.99]"
              >
                <div className="flex justify-between gap-2">
                  <p className="font-semibold">{b.ref} · {plural(b.pets.length)}</p>
                  <Chip className="bg-stone-100 text-ink">{MODES[b.mode]}</Chip>
                </div>
                <p className="text-sm">{b.route}</p>
                <p className="text-xs text-mute">{b.month} · Date TBD</p>
              </button>
            </Reveal>
          ))}
      </div>
    </Reveal>
  );
}
