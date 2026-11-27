import Chip from '../../components/ui/Chip.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import VaccineProgress from './VaccineProgress.jsx';
import { MODES, STAGES } from '../../data/reference.js';

export default function BookingRow({ booking, client, index, highlighted, onOpen }) {
  const stage = STAGES[booking.stage];
  return (
    <Reveal
      as="tr"
      y={8}
      delay={Math.min(index, 8) * 0.035}
      onClick={() => onOpen(booking.id)}
      className={`cursor-pointer hover:bg-stone-50 transition-colors ${highlighted ? 'fl' : ''}`}
    >
      <td className="px-5 py-3 font-semibold">{booking.ref}</td>
      <td>{client.name}</td>
      <td>
        <p>{booking.dir} · {MODES[booking.mode]}</p>
        <p className="text-xs text-mute">{booking.route || booking.month || 'Route not set'}</p>
      </td>
      <td>
        {booking.pets.length} · <span className="capitalize">{[...new Set(booking.pets.map((p) => p.type))].join(', ')}</span>
      </td>
      <td className="w-40 pr-3"><VaccineProgress pets={booking.pets} /></td>
      <td className="pr-5"><Chip className={stage.chip}>{stage.label}</Chip></td>
    </Reveal>
  );
}
