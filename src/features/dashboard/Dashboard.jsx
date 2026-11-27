import PageHeader from '../../components/ui/PageHeader.jsx';
import StatTiles from './StatTiles.jsx';
import NeedsAttention from './NeedsAttention.jsx';
import Schedule from './Schedule.jsx';
import MonthPlanned from './MonthPlanned.jsx';

export default function Dashboard({ bookings, onOpen, onNew, onNavigate }) {
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Tuesday, 24 November 2026 · All Operations" onNew={onNew} />
      <StatTiles bookings={bookings} onSelect={(stage) => onNavigate('pre', stage)} />
      <NeedsAttention bookings={bookings} onOpen={onOpen} onViewQueue={() => onNavigate('pre', '')} />
      <div className="mt-6 grid lg:grid-cols-2 gap-5">
        <Schedule />
        <MonthPlanned bookings={bookings} onOpen={onOpen} />
      </div>
    </div>
  );
}
