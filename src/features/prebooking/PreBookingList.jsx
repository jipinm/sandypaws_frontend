import PageHeader from '../../components/ui/PageHeader.jsx';
import PillTabs from '../../components/ui/PillTabs.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import BookingRow from './BookingRow.jsx';

const FILTERS = [
  ['', 'All'],
  ['NotHandedOver', 'Not handed over'],
  ['PendingReview', 'Pending review'],
  ['AwaitingDownPayment', 'Awaiting payment'],
  ['Active', 'Active'],
];

export default function PreBookingList({ bookings, findClient, onOpen, onNew, filter, onFilter, highlightId }) {
  const rows = bookings.filter((b) => !filter || b.stage === filter);
  const options = FILTERS.map(([value, label]) => ({
    value,
    label: (
      <>
        {label}{' '}
        <span className="opacity-60">{value ? bookings.filter((b) => b.stage === value).length : bookings.length}</span>
      </>
    ),
  }));

  return (
    <div>
      <PageHeader title="Pre-Booking" subtitle="Every relocation request, with intake and vaccine readiness" onNew={onNew} />
      <PillTabs
        id="stage-filter"
        options={options}
        value={filter}
        onChange={onFilter}
        className="mt-4 flex flex-wrap gap-2"
        pillClass="px-3.5 py-1.5 text-xs"
        inactiveClass="bg-white border border-line hover:bg-stone-50"
      />
      <Reveal className="mt-4 rounded-xl bg-white border border-line shadow-c overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="text-left text-xs text-mute bg-stone-50">
            <tr>
              <th className="px-5 py-2.5">Reference</th>
              <th>Client</th>
              <th>Request</th>
              <th>Pets</th>
              <th>Vaccines ready</th>
              <th className="pr-5">Stage</th>
            </tr>
          </thead>
          {/* Keyed by filter so rows stagger in again when the filter changes. */}
          <tbody key={filter} className="divide-y divide-line">
            {rows.map((b, i) => (
              <BookingRow
                key={b.id}
                index={i}
                booking={b}
                client={findClient(b.cid)}
                highlighted={highlightId === b.id}
                onOpen={onOpen}
              />
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-mute">No pre-bookings match this filter.</p>}
      </Reveal>
    </div>
  );
}
