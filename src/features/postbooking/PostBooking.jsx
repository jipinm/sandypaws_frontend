import { useMemo, useState } from 'react';
import AnimatedNumber from '../../components/ui/AnimatedNumber.jsx';
import Button from '../../components/ui/Button.jsx';
import Chip from '../../components/ui/Chip.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PillTabs from '../../components/ui/PillTabs.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import { inputClass } from '../../components/ui/Field.jsx';
import { MODES } from '../../data/reference.js';
import { plural } from '../../lib/records.js';
import PostBookingCase from './PostBookingCase.jsx';
import {
  dateInTimeZone,
  dateInputValue,
  formatDateTime,
  getAttentionItems,
  getOperationalEvents,
  isOpenTask,
  isDateTbd,
  POST_BOOKING_STATUS,
} from './postBookingUtils.js';

const VIEW_OPTIONS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'queue', label: 'Case queue' },
  { value: 'calendar', label: 'Calendar' },
];

const STATUS_FILTERS = [
  ['', 'All workflow statuses'],
  ['PendingReview', 'Pending intake review'],
  ['AwaitingDownPayment', 'Awaiting down payment'],
  ['OperationsActive', 'Operations active'],
];

const TEAM_LABELS = {
  PostBooking: 'Post-Booking',
  Accounts: 'Accounts',
  InformationGathering: 'Information gathering',
  GroundLogistics: 'Ground Logistics',
};

const EVENT_MODES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Next 7 Days' },
];

function StatusChip({ status }) {
  const config = POST_BOOKING_STATUS[status];
  return <Chip className={config?.style ?? 'bg-stone-100 text-ink'}>{config?.label ?? status}</Chip>;
}

function MetricTile({ label, value, unit, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-full w-full rounded-xl border border-line bg-white p-4 text-left shadow-c transition hover:-translate-y-0.5 hover:border-brand active:scale-[0.98]"
    >
      <p className="text-xs font-medium text-mute">{label}</p>
      <p className="mt-2 text-3xl font-bold"><AnimatedNumber value={value} /></p>
      <p className="text-xs text-mute">{unit}</p>
    </button>
  );
}

function Dashboard({ cases, bookings, events, onQueue, onOpen }) {
  const attention = getAttentionItems(cases, bookings);
  const today = new Date();
  const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const departureCases = new Set(
    events
      .filter((event) =>
        ['Flight departure', 'Land departure'].includes(event.type) &&
        new Date(event.at) >= today &&
        new Date(event.at) < endOfWeek,
      )
      .map((event) => event.caseId),
  );
  const metrics = [
    {
      label: 'Pending Intake Review',
      value: cases.filter((item) => item.workflowStatus === 'PendingReview').length,
      unit: 'Cases',
      status: 'PendingReview',
    },
    {
      label: 'Awaiting Down Payment',
      value: cases.filter((item) => item.workflowStatus === 'AwaitingDownPayment').length,
      unit: 'Cases',
      status: 'AwaitingDownPayment',
    },
    {
      label: 'Active Exports',
      value: cases.filter((item) => item.workflowStatus === 'OperationsActive').length,
      unit: 'Cases',
      status: 'OperationsActive',
    },
    {
      label: 'Departures in the Next 7 Days',
      value: departureCases.size,
      unit: 'Journeys',
      status: '',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Post-Booking"
        subtitle={`${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(today)} · All Operations`}
      />
      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <Reveal key={metric.label} delay={index * 0.05} className="h-full">
            <MetricTile
              {...metric}
              onClick={() => onQueue(metric.status, metric.status === '' ? true : false)}
            />
          </Reveal>
        ))}
      </div>

      <Reveal as="section" delay={0.14} className="mt-6 overflow-hidden rounded-xl border border-line bg-white shadow-c">
        <div className="flex items-center justify-between border-b border-line bg-orange-50 px-5 py-3">
          <div>
            <h2 className="font-semibold">Needs Attention</h2>
            <p className="text-xs text-mute">Open the case section for the next action.</p>
          </div>
          <button type="button" onClick={() => onQueue('', false)} className="text-sm font-semibold text-brandd hover:underline">
            View queue
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="text-left text-xs text-mute">
              <tr>
                <th className="px-5 py-2">Case / route</th>
                <th>Issue</th>
                <th>Next action</th>
                <th className="pr-5">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {attention.map((item, index) => (
                <Reveal
                  as="tr"
                  key={item.id}
                  y={8}
                  delay={index * 0.03}
                  onClick={() => onOpen(item.caseId, item.section)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpen(item.caseId, item.section);
                    }
                  }}
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold">{item.ref}</p>
                    <p className="text-xs text-mute">{item.route}</p>
                  </td>
                  <td>
                    <p className="font-medium">{item.issue}</p>
                    {item.detail && <p className="text-xs text-mute">{item.detail}</p>}
                  </td>
                  <td>{item.action}</td>
                  <td className="pr-5"><Chip className="bg-stone-100 text-ink">{item.owner}</Chip></td>
                </Reveal>
              ))}
              {attention.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-sm text-mute">No open attention items.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <SchedulePanel events={events} onOpen={onOpen} />
        <MonthPlannedPanel cases={cases} bookings={bookings} onOpen={onOpen} />
      </div>
      <p className="mt-4 text-xs text-mute">
        Demo workspace · Payment, document and operational updates are simulated in this browser session.
      </p>
    </div>
  );
}

function SchedulePanel({ events, onOpen }) {
  const [range, setRange] = useState('today');
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const visible = events.filter((event) => {
    const time = new Date(event.at);
    const sameLocalDay = dateInTimeZone(event.at, event.timeZone) === dateInTimeZone(now, event.timeZone);
    return time >= now && time < end && (range === 'week' || sameLocalDay);
  });

  return (
    <Reveal as="section" className="rounded-xl border border-line bg-white p-5 shadow-c">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Today and Upcoming</h2>
        <PillTabs
          id="postbooking-schedule-tabs"
          options={EVENT_MODES}
          value={range}
          onChange={setRange}
          className="flex gap-1 text-xs"
          pillClass="px-3 py-1"
          inactiveClass="bg-stone-100"
        />
      </div>
      <p className="mt-1 text-xs text-mute">Event times shown in their local time zones</p>
      <div className="mt-3 divide-y divide-line">
        {visible.slice(0, 7).map((event) => (
          <button
            type="button"
            key={event.id}
            onClick={() => onOpen(event.caseId, event.section)}
            className="flex w-full gap-3 py-2.5 text-left transition hover:bg-stone-50"
          >
            <span className="w-32 shrink-0 text-right text-xs font-semibold">{formatDateTime(event.at, event.timeZone)}</span>
            <span>
              <span className="block text-sm font-medium">{event.type} · {event.ref}</span>
              <span className="block text-xs text-mute">{event.detail}</span>
            </span>
          </button>
        ))}
        {visible.length === 0 && <p className="py-6 text-center text-sm text-mute">No scheduled events in this range.</p>}
      </div>
    </Reveal>
  );
}

function MonthPlannedPanel({ cases, bookings, onOpen }) {
  const planned = cases.filter(isDateTbd);
  return (
    <Reveal as="section" delay={0.08} className="rounded-xl border border-line bg-white p-5 shadow-c">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Month Planned · Date TBD</h2>
        <span className="text-xs text-mute">{planned.length} cases</span>
      </div>
      <div className="mt-3 space-y-2">
        {planned.map((postBooking, index) => {
          const booking = bookings.find((item) => item.id === postBooking.bookingId);
          if (!booking) return null;
          return (
            <Reveal key={postBooking.id} y={8} delay={index * 0.04}>
              <button
                type="button"
                onClick={() => onOpen(postBooking.bookingId, 'journey')}
                className="w-full rounded-lg border border-line p-3 text-left transition hover:border-brand hover:bg-orange-50/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{booking.ref} · {plural(booking.pets.length)}</p>
                  <Chip className="bg-stone-100 text-ink">{MODES[booking.mode]}</Chip>
                </div>
                <p className="text-sm">{booking.route}</p>
                <p className="text-xs text-mute">{postBooking.journey.plannedTravelMonth} · Date TBD</p>
              </button>
            </Reveal>
          );
        })}
        {planned.length === 0 && <p className="py-6 text-center text-sm text-mute">No journeys are waiting for an exact date.</p>}
      </div>
    </Reveal>
  );
}

function CaseQueue({ cases, bookings, onOpen, initialStatus, initialUpcoming }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [mode, setMode] = useState('');
  const [team, setTeam] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const events = getOperationalEvents(cases, bookings);
  const owners = [...new Set(cases.flatMap((postBooking) => postBooking.tasks.filter(isOpenTask).map((task) => task.assignee).filter(Boolean)))].sort();
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const rows = cases.filter((postBooking) => {
    const booking = bookings.find((item) => item.id === postBooking.bookingId);
    if (!booking) return false;
    const task = postBooking.tasks.find(isOpenTask);
    const text = `${booking.ref} ${booking.clientName} ${booking.route} ${booking.pets.map((pet) => pet.breed).join(' ')}`.toLowerCase();
    const hasUpcomingDeparture = events.some(
      (event) =>
        event.caseId === booking.id &&
        ['Flight departure', 'Land departure'].includes(event.type) &&
        new Date(event.at) >= now &&
        new Date(event.at) < weekEnd,
    );
    return (
      (!search || text.includes(search.toLowerCase())) &&
      (!status || postBooking.workflowStatus === status) &&
      (!mode || booking.mode === mode) &&
      (!team || task?.team === team) &&
      (!assignedTo || (assignedTo === '__unassigned__' ? !task?.assignee : task?.assignee === assignedTo)) &&
      (!upcoming || hasUpcomingDeparture)
    );
  });

  return (
    <div>
      <PageHeader title="Post-Booking case queue" subtitle="Export cases, intake status and next operational task" />
      <div className="mt-4 grid gap-3 rounded-xl border border-line bg-white p-4 shadow-c sm:grid-cols-2 xl:grid-cols-6">
        <label className="text-xs font-medium text-mute sm:col-span-2 xl:col-span-1">
          Search reference, client, route or pet
          <input value={search} onChange={(event) => setSearch(event.target.value)} className={`${inputClass} mt-1`} placeholder="SP-1038 or client name" />
        </label>
        <label className="text-xs font-medium text-mute">
          Workflow status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={`${inputClass} mt-1`}>
            {STATUS_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-mute">
          Travel mode
          <select value={mode} onChange={(event) => setMode(event.target.value)} className={`${inputClass} mt-1`}>
            <option value="">All travel modes</option>
            {Object.entries(MODES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-mute">
          Current team
          <select value={team} onChange={(event) => setTeam(event.target.value)} className={`${inputClass} mt-1`}>
            <option value="">All teams</option>
            {Object.entries(TEAM_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-mute">
          Assigned owner
          <select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className={`${inputClass} mt-1`}>
            <option value="">All owners</option>
            <option value="__unassigned__">Unassigned</option>
            {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 self-end rounded-lg border border-line px-3 py-2 text-sm">
          <input type="checkbox" checked={upcoming} onChange={(event) => setUpcoming(event.target.checked)} />
          Departures in 7 days
        </label>
        <div className="flex items-end sm:col-span-2 xl:col-span-6">
          <Button onClick={() => { setSearch(''); setStatus(''); setMode(''); setTeam(''); setAssignedTo(''); setUpcoming(false); }}>
            Reset filters
          </Button>
          <span className="ml-auto self-center text-xs text-mute">{rows.length} of {cases.length} cases</span>
        </div>
      </div>

      <Reveal className="mt-4 overflow-x-auto rounded-xl border border-line bg-white shadow-c">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-stone-50 text-left text-xs text-mute">
            <tr>
              <th className="px-5 py-3">Reference / client</th>
              <th>Route / travel</th>
              <th>Pets</th>
              <th>Departure / planned</th>
              <th>Next task / owner</th>
              <th className="pr-5">Workflow</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((postBooking, index) => {
              const booking = bookings.find((item) => item.id === postBooking.bookingId);
              const task = postBooking.tasks.find(isOpenTask);
              return (
                <Reveal
                  as="tr"
                  key={postBooking.id}
                  y={8}
                  delay={index * 0.025}
                  onClick={() => onOpen(postBooking.bookingId, 'overview')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpen(postBooking.bookingId, 'overview');
                    }
                  }}
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold">{booking.ref}</p>
                    <p className="text-xs text-mute">{booking.clientName}</p>
                  </td>
                  <td>
                    <p>{booking.route}</p>
                    <p className="text-xs text-mute">{MODES[booking.mode]}</p>
                  </td>
                  <td>{plural(booking.pets.length)}</td>
                  <td>
                    {postBooking.flightLegs[0]
                      ? formatDateTime(postBooking.flightLegs[0].scheduledDepartureAt, postBooking.flightLegs[0].departureTimeZone)
                      : postBooking.landTransport?.scheduledDepartureAt
                        ? formatDateTime(postBooking.landTransport.scheduledDepartureAt)
                        : postBooking.journey.plannedTravelMonth || 'Date TBD'}
                  </td>
                  <td>
                    <p>{task?.type ?? 'No open task'}</p>
                    <p className="text-xs text-mute">{task?.assignee || TEAM_LABELS[task?.team] || 'Unassigned'}</p>
                  </td>
                  <td className="pr-5"><StatusChip status={postBooking.workflowStatus} /></td>
                </Reveal>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-mute">No post-booking cases match these filters.</p>}
      </Reveal>
    </div>
  );
}

function Calendar({ events, onOpen }) {
  const [range, setRange] = useState('today');
  const [date, setDate] = useState(dateInputValue());
  const [eventType, setEventType] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const uniqueTypes = [...new Set(events.map((event) => event.type))].sort();
  const uniqueOwners = [...new Set(events.map((event) => event.assignedTo).filter(Boolean))].sort();
  const endDate = new Date(`${date}T00:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 7);
  const weekEnd = endDate.toISOString().slice(0, 10);
  const visible = events.filter((event) => {
    const eventDate = dateInTimeZone(event.at, event.timeZone);
    const inRange = eventDate >= date && eventDate < weekEnd;
    return (
      (range === 'today' ? eventDate === date : inRange) &&
      (!eventType || event.type === eventType) &&
      (!assignedTo || event.assignedTo === assignedTo)
    );
  });

  return (
    <div>
      <PageHeader title="Operational calendar" subtitle="MOCCAE visits, transfers, flight legs and land schedules" />
      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-4 shadow-c">
        <PillTabs
          id="postbooking-calendar-range"
          options={EVENT_MODES}
          value={range}
          onChange={setRange}
          className="flex gap-1 text-xs"
          pillClass="px-3 py-1.5"
          inactiveClass="bg-stone-100"
        />
        <label className="text-xs font-medium text-mute">
          Date
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <label className="text-xs font-medium text-mute">
          Event type
          <select value={eventType} onChange={(event) => setEventType(event.target.value)} className={`${inputClass} mt-1`}>
            <option value="">All event types</option>
            {uniqueTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-mute">
          Assigned user
          <select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className={`${inputClass} mt-1`}>
            <option value="">All users</option>
            {uniqueOwners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
        </label>
        <Button onClick={() => { setDate(dateInputValue()); setEventType(''); setAssignedTo(''); }}>
          Today / clear
        </Button>
      </div>
      <p className="mt-2 text-xs text-mute">Times are formatted in each event’s time zone. Staff availability and conflicts are not checked in this demo.</p>
      <div className="mt-4 space-y-2">
        {visible.map((event, index) => (
          <Reveal key={event.id} delay={index * 0.025}>
            <button
              type="button"
              onClick={() => onOpen(event.caseId, event.section)}
              className="grid w-full gap-2 rounded-xl border border-line bg-white p-4 text-left shadow-c transition hover:border-brand sm:grid-cols-[180px_1fr_auto]"
            >
              <span className="text-sm font-semibold">{formatDateTime(event.at, event.timeZone)}</span>
              <span>
                <span className="block font-semibold">{event.type} · {event.ref}</span>
                <span className="block text-sm text-mute">{event.detail}</span>
              </span>
              <Chip className="bg-stone-100 text-ink">{event.assignedTo || 'No assignee'}</Chip>
            </button>
          </Reveal>
        ))}
        {visible.length === 0 && (
          <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-sm text-mute">
            No scheduled operational events match this date and filter.
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostBooking({ store, say }) {
  const [screen, setScreen] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [focusTab, setFocusTab] = useState('overview');
  const cases = store.postBookings;
  const bookings = useMemo(
    () =>
      cases
        .map((postBooking) => {
          const booking = store.bookings.find((item) => item.id === postBooking.bookingId);
          const client = booking ? store.findClient(booking.cid) : null;
          return booking && client
            ? { ...booking, clientName: client.name, client }
            : null;
        })
        .filter(Boolean),
    [cases, store.bookings, store.clients],
  );
  const events = useMemo(() => getOperationalEvents(cases, bookings), [cases, bookings]);

  const openQueue = (status = '', upcoming = false) => {
    setStatusFilter(status);
    setUpcomingOnly(upcoming);
    setScreen('queue');
  };
  const openCase = (caseId, section = 'overview') => {
    setSelectedCaseId(caseId);
    setFocusTab(section);
    setScreen('case');
  };
  const selectedCase = cases.find((postBooking) => postBooking.bookingId === selectedCaseId);
  const selectedBooking = bookings.find((booking) => booking.id === selectedCaseId);

  return (
    <div>
      <div className="mb-5 overflow-x-auto">
        <PillTabs
          id="postbooking-primary-navigation"
          options={VIEW_OPTIONS}
          value={screen === 'case' ? '' : screen}
          onChange={setScreen}
          className="flex min-w-max gap-2"
          pillClass="px-4 py-2 text-sm"
          inactiveClass="border border-line bg-white hover:bg-stone-50"
        />
      </div>
      {screen === 'dashboard' && (
        <Dashboard
          cases={cases}
          bookings={bookings}
          events={events}
          onQueue={openQueue}
          onOpen={openCase}
        />
      )}
      {screen === 'queue' && (
        <CaseQueue
          cases={cases}
          bookings={bookings}
          onOpen={openCase}
          initialStatus={statusFilter}
          initialUpcoming={upcomingOnly}
        />
      )}
      {screen === 'calendar' && <Calendar events={events} onOpen={openCase} />}
      {screen === 'case' && selectedCase && selectedBooking && (
        <PostBookingCase
          key={`${selectedCase.id}-${focusTab}`}
          postBooking={selectedCase}
          booking={selectedBooking}
          onBack={() => setScreen('queue')}
          initialTab={focusTab}
          updateCase={store.updatePostBooking}
          approveIntake={store.approvePostBookingIntake}
          confirmDownPayment={store.confirmPostBookingDownPayment}
          say={say}
        />
      )}
      {screen === 'case' && (!selectedCase || !selectedBooking) && (
        <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-semibold">Case not found</p>
          <p className="mt-1 text-sm text-mute">Return to the queue and select an available Export case.</p>
          <Button className="mt-4" onClick={() => setScreen('queue')}>Back to case queue</Button>
        </div>
      )}
    </div>
  );
}
