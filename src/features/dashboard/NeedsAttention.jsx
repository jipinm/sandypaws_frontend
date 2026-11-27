import Chip from '../../components/ui/Chip.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import { ATTENTION } from '../../data/seed.js';

export default function NeedsAttention({ bookings, onOpen, onViewQueue }) {
  return (
    <Reveal as="section" delay={0.15} className="mt-6 rounded-xl bg-white border border-line shadow-c overflow-hidden">
      <div className="flex justify-between px-5 py-3 bg-orange-50 border-b border-line">
        <h2 className="font-semibold">Needs Attention</h2>
        <button type="button" onClick={onViewQueue} className="text-sm font-semibold text-brandd hover:underline">
          View queue
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="text-left text-xs text-mute">
            <tr>
              <th className="px-5 py-2">Case / route</th>
              <th>Issue</th>
              <th>Next action</th>
              <th className="pr-5">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ATTENTION.map((item, i) => {
              const booking = bookings.find((b) => b.id === item.id);
              return (
                <Reveal
                  as="tr"
                  key={item.id}
                  y={8}
                  delay={i * 0.04}
                  onClick={() => onOpen(item.id)}
                  className="cursor-pointer hover:bg-stone-50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold">{booking.ref}</p>
                    <p className="text-xs text-mute">{booking.route}</p>
                  </td>
                  <td>
                    <p className="font-medium">{item.issue}</p>
                    <p className="text-xs text-mute">{item.detail}</p>
                  </td>
                  <td>{item.action}</td>
                  <td className="pr-5"><Chip className="bg-stone-100 text-ink">{item.owner}</Chip></td>
                </Reveal>
              );
            })}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}
