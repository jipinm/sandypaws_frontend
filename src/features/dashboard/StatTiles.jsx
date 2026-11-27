import AnimatedNumber from '../../components/ui/AnimatedNumber.jsx';
import Reveal from '../../components/ui/Reveal.jsx';

/* Each total is a fixed baseline (cases outside the sample data) plus the live sample records. */
const buildTiles = (bookings) => {
  const inStage = (stage) => bookings.filter((b) => b.stage === stage).length;
  const departing = bookings.filter((b) => b.dep && b.dep >= '2026-11-24' && b.dep <= '2026-12-01').length;
  return [
    { label: 'Pending Intake Review', value: 4 + inStage('PendingReview'), unit: 'Cases', stage: 'PendingReview' },
    { label: 'Awaiting Down Payment', value: 2 + inStage('AwaitingDownPayment'), unit: 'Cases', stage: 'AwaitingDownPayment' },
    { label: 'Active Exports', value: 13 + inStage('Active'), unit: 'Cases', stage: 'Active' },
    { label: 'Departures in the Next 7 Days', value: 2 + departing, unit: 'Journeys' },
  ];
};

export default function StatTiles({ bookings, onSelect }) {
  return (
    <div className="mt-5 grid grid-cols-2 xl:grid-cols-4 gap-3">
      {buildTiles(bookings).map((tile, i) => (
        <Reveal key={tile.label} delay={i * 0.06}>
          {/* The wrapper owns the entrance transform, so the button's CSS hover lift still works. */}
          <button
            type="button"
            onClick={() => tile.stage && onSelect(tile.stage)}
            className="h-full w-full text-left rounded-xl bg-white border border-line p-4 shadow-c transition hover:-translate-y-0.5 hover:border-brand active:scale-[0.98]"
          >
            <p className="text-xs font-medium text-mute">{tile.label}</p>
            <p className="mt-2 text-3xl font-bold">
              <AnimatedNumber value={tile.value} />
            </p>
            <p className="text-xs text-mute">{tile.unit}</p>
          </button>
        </Reveal>
      ))}
    </div>
  );
}
