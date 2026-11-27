import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button.jsx';
import Chip from '../../components/ui/Chip.jsx';
import CloseButton from '../../components/ui/CloseButton.jsx';
import { Field, inputClass } from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import PillTabs from '../../components/ui/PillTabs.jsx';
import { MODES } from '../../data/reference.js';
import { plural } from '../../lib/records.js';
import {
  DOCUMENT_STATUSES,
  FLIGHT_STATUSES,
  formatDateOnly,
  formatDateTime,
  fromDateTimeLocal,
  isOpenTask,
  latestFlightStatus,
  POST_BOOKING_STATUS,
  routeCheck,
  TASK_USERS,
  TIME_ZONES,
  toDateTimeLocal,
} from './postBookingUtils.js';

const CASE_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'journey', label: 'Journey' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'operations', label: 'Operations' },
  { value: 'payments', label: 'Payments' },
  { value: 'documents', label: 'Documents & approvals' },
  { value: 'activity', label: 'Activity' },
];

const TEAM_NAMES = {
  PostBooking: 'Post-Booking',
  Accounts: 'Accounts',
  InformationGathering: 'Information gathering',
  GroundLogistics: 'Ground Logistics',
};

const OUTCOMES = ['Review', 'Successfully Closed', 'On Hold', 'Cancelled'];

function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-line bg-white p-5 shadow-c ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusChip({ status }) {
  const config = POST_BOOKING_STATUS[status];
  return <Chip className={config?.style ?? 'bg-stone-100 text-ink'}>{config?.label ?? status}</Chip>;
}

function Value({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-mute">{label}</p>
      <div className="mt-1 break-words text-sm">{children || '—'}</div>
    </div>
  );
}

function PaymentRequestDialog({ request, onClose, onSave }) {
  const [draft, setDraft] = useState(() => ({
    paymentType: request?.paymentType ?? 'Initial',
    amount: request ? String(request.amount) : '',
    currency: request?.currency ?? 'AED',
    payer: request?.payer ?? 'Client',
    dueDate: toDateTimeLocal(request?.dueDate),
    description: request?.description ?? '',
  }));
  const [error, setError] = useState('');
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!Number.isFinite(Number(draft.amount)) || Number(draft.amount) <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    const dueDate = fromDateTimeLocal(draft.dueDate);
    if (!dueDate || !draft.description.trim()) {
      setError('Add a valid due date in Dubai time and a description.');
      return;
    }
    onSave({
      ...draft,
      id: request?.id ?? `payment-${Date.now()}`,
      amount: Number(draft.amount),
      dueDate,
      collectionStatus: request?.collectionStatus ?? 'Pending',
      receivedAmount: request?.receivedAmount ?? 0,
    });
  };

  return (
    <Modal onClose={onClose} label="Create demo payment request">
      <form onSubmit={submit} className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{request ? 'Edit payment request' : 'Raise payment request'}</h2>
            <p className="text-xs text-mute">Demo only · No payment is collected.</p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field label="Payment type">
            <select className={`${inputClass} mt-1`} value={draft.paymentType} onChange={(event) => update('paymentType', event.target.value)}>
              <option>Initial</option><option>Subsequent</option>
            </select>
          </Field>
          <Field label="Amount">
            <input className={`${inputClass} mt-1`} type="number" min="0.01" step="0.01" value={draft.amount} onChange={(event) => update('amount', event.target.value)} />
          </Field>
          <Field label="Currency">
            <select className={`${inputClass} mt-1`} value={draft.currency} onChange={(event) => update('currency', event.target.value)}>
              <option>AED</option><option>USD</option><option>EUR</option><option>GBP</option>
            </select>
          </Field>
          <Field label="Payer">
            <select className={`${inputClass} mt-1`} value={draft.payer} onChange={(event) => update('payer', event.target.value)}>
              <option>Client</option><option>Agent</option>
            </select>
          </Field>
          <Field label="Due date (Dubai time)">
            <input className={`${inputClass} mt-1`} type="datetime-local" value={draft.dueDate} onChange={(event) => update('dueDate', event.target.value)} />
          </Field>
          <Field label="Description" className="block sm:col-span-2">
            <input className={`${inputClass} mt-1`} value={draft.description} onChange={(event) => update('description', event.target.value)} />
          </Field>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button primary type="submit">{request ? 'Save changes' : 'Create demo request'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function FlightLegDialog({ leg, nextNumber, onClose, onSave }) {
  const [draft, setDraft] = useState(() => ({
    legNumber: leg?.legNumber ?? nextNumber,
    carrierName: leg?.carrierName ?? '',
    flightNumber: leg?.flightNumber ?? '',
    departureAirportCode: leg?.departureAirportCode ?? '',
    arrivalAirportCode: leg?.arrivalAirportCode ?? '',
    scheduledDepartureAt: toDateTimeLocal(leg?.scheduledDepartureAt, leg?.departureTimeZone ?? 'Asia/Dubai'),
    scheduledArrivalAt: toDateTimeLocal(leg?.scheduledArrivalAt, leg?.arrivalTimeZone ?? 'Europe/London'),
    departureTimeZone: leg?.departureTimeZone ?? 'Asia/Dubai',
    arrivalTimeZone: leg?.arrivalTimeZone ?? 'Europe/London',
  }));
  const [error, setError] = useState('');
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!/^[A-Z]{3}$/.test(draft.departureAirportCode) || !/^[A-Z]{3}$/.test(draft.arrivalAirportCode)) {
      setError('Use three-letter uppercase airport codes.');
      return;
    }
    if (draft.departureAirportCode === draft.arrivalAirportCode) {
      setError('Departure and arrival airports must be different.');
      return;
    }
    const scheduledDepartureAt = fromDateTimeLocal(draft.scheduledDepartureAt, draft.departureTimeZone);
    const scheduledArrivalAt = fromDateTimeLocal(draft.scheduledArrivalAt, draft.arrivalTimeZone);
    if (
      !draft.carrierName.trim() ||
      !draft.flightNumber.trim() ||
      !scheduledDepartureAt ||
      !scheduledArrivalAt ||
      new Date(scheduledArrivalAt) <= new Date(scheduledDepartureAt)
    ) {
      setError('Complete the flight details and make arrival later than departure.');
      return;
    }
    onSave({
      ...draft,
      id: leg?.id ?? `leg-${Date.now()}`,
      legNumber: Number(draft.legNumber),
      scheduledDepartureAt,
      scheduledArrivalAt,
      statusEvents: leg?.statusEvents ?? [],
    });
  };

  return (
    <Modal onClose={onClose} wide label={leg ? 'Edit flight leg' : 'Add flight leg'}>
      <form onSubmit={submit} className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{leg ? 'Edit flight leg' : 'Add flight leg'}</h2>
            <p className="text-xs text-mute">Manual demo itinerary · No live tracking connection.</p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field label="Carrier">
            <input className={`${inputClass} mt-1`} value={draft.carrierName} onChange={(event) => update('carrierName', event.target.value)} />
          </Field>
          <Field label="Flight number">
            <input className={`${inputClass} mt-1`} value={draft.flightNumber} onChange={(event) => update('flightNumber', event.target.value)} />
          </Field>
          <Field label="Departure airport">
            <input className={`${inputClass} mt-1`} maxLength="3" value={draft.departureAirportCode} onChange={(event) => update('departureAirportCode', event.target.value.toUpperCase())} />
          </Field>
          <Field label="Arrival airport">
            <input className={`${inputClass} mt-1`} maxLength="3" value={draft.arrivalAirportCode} onChange={(event) => update('arrivalAirportCode', event.target.value.toUpperCase())} />
          </Field>
          <Field label="Scheduled departure">
            <input className={`${inputClass} mt-1`} type="datetime-local" value={draft.scheduledDepartureAt} onChange={(event) => update('scheduledDepartureAt', event.target.value)} />
          </Field>
          <Field label="Departure time zone">
            <select className={`${inputClass} mt-1`} value={draft.departureTimeZone} onChange={(event) => update('departureTimeZone', event.target.value)}>
              {TIME_ZONES.map((zone) => <option key={zone}>{zone}</option>)}
            </select>
          </Field>
          <Field label="Scheduled arrival">
            <input className={`${inputClass} mt-1`} type="datetime-local" value={draft.scheduledArrivalAt} onChange={(event) => update('scheduledArrivalAt', event.target.value)} />
          </Field>
          <Field label="Arrival time zone">
            <select className={`${inputClass} mt-1`} value={draft.arrivalTimeZone} onChange={(event) => update('arrivalTimeZone', event.target.value)}>
              {TIME_ZONES.map((zone) => <option key={zone}>{zone}</option>)}
            </select>
          </Field>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button primary type="submit">Save leg</Button>
        </div>
      </form>
    </Modal>
  );
}

function VisitDialog({ pets, onClose, onSave }) {
  const [draft, setDraft] = useState({
    arrangement: 'SandyPawsTaxi',
    scheduledAt: '',
    clientConfirmationStatus: 'Pending',
    taskAssignee: '',
    pickupAddress: '',
    returnAddress: '',
  });
  const [error, setError] = useState('');
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const scheduledAt = fromDateTimeLocal(draft.scheduledAt);
    if (!scheduledAt || (draft.arrangement === 'SandyPawsTaxi' && !draft.pickupAddress.trim())) {
      setError('Add a valid scheduled time in Dubai time and the required pickup address.');
      return;
    }
    onSave({
      id: `moccae-${Date.now()}`,
      arrangement: draft.arrangement,
      clientConfirmationStatus: draft.clientConfirmationStatus,
      scheduledAt,
      pickupAddress: draft.pickupAddress,
      returnAddress: draft.returnAddress,
      taskId: `task-moccae-${Date.now()}`,
      taskAssignee: draft.taskAssignee || null,
      petApprovals: pets.map((_, petIndex) => ({
        petIndex,
        approvalStatus: 'Pending',
        decisionAt: null,
        notes: '',
      })),
      actualPetPickupAt: null,
      actualPetReturnedAt: null,
      clientArrivedAt: null,
      clientExitedAt: null,
    });
  };

  return (
    <Modal onClose={onClose} wide label="Schedule MOCCAE visit">
      <form onSubmit={submit} className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Schedule MOCCAE visit</h2>
            <p className="text-xs text-mute">Appointment and per-pet approvals are demo data.</p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field label="Visit arrangement">
            <select className={`${inputClass} mt-1`} value={draft.arrangement} onChange={(event) => update('arrangement', event.target.value)}>
              <option value="SandyPawsTaxi">SandyPaws taxi</option>
              <option value="ClientOfficeVisit">Client office visit</option>
            </select>
          </Field>
          <Field label="Scheduled time (Dubai time)">
            <input className={`${inputClass} mt-1`} type="datetime-local" value={draft.scheduledAt} onChange={(event) => update('scheduledAt', event.target.value)} />
          </Field>
          <Field label="Client confirmation">
            <select className={`${inputClass} mt-1`} value={draft.clientConfirmationStatus} onChange={(event) => update('clientConfirmationStatus', event.target.value)}>
              <option>Pending</option><option>Confirmed</option><option>Declined</option>
            </select>
          </Field>
          <Field label="Assigned PRO">
            <select className={`${inputClass} mt-1`} value={draft.taskAssignee} onChange={(event) => update('taskAssignee', event.target.value)}>
              <option value="">Unassigned</option>
              {TASK_USERS.map((user) => <option key={user}>{user}</option>)}
            </select>
          </Field>
          {draft.arrangement === 'SandyPawsTaxi' && (
            <>
              <Field label="Pickup address">
                <input className={`${inputClass} mt-1`} value={draft.pickupAddress} onChange={(event) => update('pickupAddress', event.target.value)} />
              </Field>
              <Field label="Return address">
                <input className={`${inputClass} mt-1`} value={draft.returnAddress} onChange={(event) => update('returnAddress', event.target.value)} />
              </Field>
            </>
          )}
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button primary type="submit">Save visit</Button>
        </div>
      </form>
    </Modal>
  );
}

function TransferDialog({ pets, onClose, onSave }) {
  const [draft, setDraft] = useState({
    transferType: 'PassengerTaxi',
    scheduledPickupAt: '',
    pickupAddress: '',
    dropOffAirportCode: '',
    dropOffTerminal: '',
    travellerCount: '1',
    luggageCount: '0',
    taskAssignee: '',
    petIndexes: [],
    travelCrateSize: 'Medium',
  });
  const [error, setError] = useState('');
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const togglePet = (petIndex) =>
    setDraft((current) => ({
      ...current,
      petIndexes: current.petIndexes.includes(petIndex)
        ? current.petIndexes.filter((index) => index !== petIndex)
        : [...current.petIndexes, petIndex],
    }));
  const submit = (event) => {
    event.preventDefault();
    const scheduledPickupAt = fromDateTimeLocal(draft.scheduledPickupAt);
    if (!scheduledPickupAt || !draft.pickupAddress.trim() || !/^[A-Z]{3}$/.test(draft.dropOffAirportCode)) {
      setError('Add a valid pickup time in Dubai time, pickup address and three-letter airport code.');
      return;
    }
    if (draft.transferType === 'CargoPetPickup' && draft.petIndexes.length === 0) {
      setError('Select at least one pet for cargo pickup.');
      return;
    }
    const id = `transfer-${Date.now()}`;
    onSave({
      id,
      transferType: draft.transferType,
      taskId: `task-${id}`,
      taskType: draft.transferType === 'CargoPetPickup' ? 'Cargo pet pickup' : 'Airport taxi',
      assignedTo: draft.taskAssignee || null,
      scheduledPickupAt,
      pickupAddress: draft.pickupAddress,
      dropOffAirportCode: draft.dropOffAirportCode,
      dropOffTerminal: draft.dropOffTerminal,
      travellerCount: Number(draft.travellerCount),
      luggageCount: Number(draft.luggageCount),
      petIndexes: draft.petIndexes,
      travelCrateSize: draft.travelCrateSize,
    });
  };

  return (
    <Modal onClose={onClose} wide label="Create airport transfer">
      <form onSubmit={submit} className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Create airport transfer</h2>
            <p className="text-xs text-mute">Transfer and staff assignment are simulated.</p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field label="Transfer type">
            <select className={`${inputClass} mt-1`} value={draft.transferType} onChange={(event) => update('transferType', event.target.value)}>
              <option value="PassengerTaxi">Passenger taxi</option>
              <option value="CargoPetPickup">Cargo pet pickup</option>
            </select>
          </Field>
          <Field label="Pickup time (Dubai time)">
            <input className={`${inputClass} mt-1`} type="datetime-local" value={draft.scheduledPickupAt} onChange={(event) => update('scheduledPickupAt', event.target.value)} />
          </Field>
          <Field label="Pickup address">
            <input className={`${inputClass} mt-1`} value={draft.pickupAddress} onChange={(event) => update('pickupAddress', event.target.value)} />
          </Field>
          <Field label="Drop-off airport">
            <input className={`${inputClass} mt-1`} maxLength="3" value={draft.dropOffAirportCode} onChange={(event) => update('dropOffAirportCode', event.target.value.toUpperCase())} />
          </Field>
          <Field label="Terminal">
            <input className={`${inputClass} mt-1`} value={draft.dropOffTerminal} onChange={(event) => update('dropOffTerminal', event.target.value)} />
          </Field>
          <Field label="Assigned PRO">
            <select className={`${inputClass} mt-1`} value={draft.taskAssignee} onChange={(event) => update('taskAssignee', event.target.value)}>
              <option value="">Unassigned</option>
              {TASK_USERS.map((user) => <option key={user}>{user}</option>)}
            </select>
          </Field>
          <Field label="Passengers">
            <input className={`${inputClass} mt-1`} type="number" min="0" value={draft.travellerCount} onChange={(event) => update('travellerCount', event.target.value)} />
          </Field>
          <Field label="Luggage">
            <input className={`${inputClass} mt-1`} type="number" min="0" value={draft.luggageCount} onChange={(event) => update('luggageCount', event.target.value)} />
          </Field>
          {draft.transferType === 'CargoPetPickup' && (
            <>
              <Field label="Travel crate size">
                <input className={`${inputClass} mt-1`} value={draft.travelCrateSize} onChange={(event) => update('travelCrateSize', event.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-medium text-mute">Pets on this transfer</p>
                <div className="flex flex-wrap gap-3">
                  {pets.map((pet, index) => (
                    <label key={index} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={draft.petIndexes.includes(index)} onChange={() => togglePet(index)} />
                      {pet.type} · {pet.breed || `Pet ${index + 1}`}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button primary type="submit">Save transfer</Button>
        </div>
      </form>
    </Modal>
  );
}

function OutcomeDialog({ onClose, onSave }) {
  const [outcome, setOutcome] = useState(OUTCOMES[1]);
  const [reason, setReason] = useState('');
  return (
    <Modal onClose={onClose} label="Set demo case outcome">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!reason.trim()) return;
          onSave(outcome, reason.trim());
        }}
        className="p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Set case outcome</h2>
            <p className="text-xs text-mute">Prototype-only; it does not change the workflow status.</p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <Field label="Outcome" className="mt-5 block">
          <select className={`${inputClass} mt-1`} value={outcome} onChange={(event) => setOutcome(event.target.value)}>
            {OUTCOMES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Reason" className="mt-3 block">
          <textarea className={`${inputClass} mt-1 min-h-20`} value={reason} onChange={(event) => setReason(event.target.value)} />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button primary type="submit" disabled={!reason.trim()}>Save demo outcome</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function PostBookingCase({
  postBooking,
  booking,
  onBack,
  initialTab,
  updateCase,
  approveIntake,
  confirmDownPayment,
  say,
}) {
  const [tab, setTab] = useState(CASE_TABS.some((item) => item.value === initialTab) ? initialTab : 'overview');
  const [dialog, setDialog] = useState(null);
  const client = booking.client;

  const save = (changes, activityText, toastText) => {
    const updated = updateCase(postBooking.bookingId, changes, activityText);
    if (updated && toastText) say(toastText);
    if (!updated) say('This case is no longer available. Return to the queue and select it again.');
    return updated;
  };

  const changeJourney = (key, value) =>
    key === 'landTransport'
      ? save({ landTransport: value })
      : save({ journey: { ...postBooking.journey, [key]: value } });

  const updateTask = (taskId, updater, message) => {
    const tasks = postBooking.tasks;
    let updatedTasks;
    if (typeof updater === 'function') updatedTasks = updater(tasks);
    else updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, ...updater } : task));
    save({ tasks: updatedTasks }, message, message ? 'Task updated in this demo.' : '');
  };

  const assignTask = (task, assignee) => {
    if (!assignee || !['Queued', 'Assigned'].includes(task.status)) return;
    const assignedAt = new Date().toISOString();
    if (task.assignee && task.assignee !== assignee) {
      const newTask = {
        ...task,
        id: `${task.id}-reassigned-${Date.now()}`,
        assignee,
        status: 'Assigned',
        assignedAt,
        startedAt: null,
        completedAt: null,
        previousAssignee: task.assignee,
      };
      updateTask(task.id, (tasks) => [
        ...tasks.map((item) => (item.id === task.id ? { ...item, status: 'Reassigned', reassignedTo: assignee } : item)),
        newTask,
      ], `${task.type} reassigned from ${task.assignee} to ${assignee}`);
      return;
    }
    updateTask(task.id, { assignee, status: 'Assigned', assignedAt }, `${task.type} assigned to ${assignee}`);
  };

  const setTaskStatus = (task, nextStatus) => {
    const now = new Date().toISOString();
    const changes = {
      status: nextStatus,
      ...(nextStatus === 'InProgress' ? { startedAt: now } : {}),
      ...(nextStatus === 'Completed' ? { completedAt: now } : {}),
    };
    updateTask(task.id, changes, `${task.type} marked ${nextStatus}`);
  };

  const savePaymentRequest = (request) => {
    const isEdit = postBooking.payments.some((payment) => payment.id === request.id);
    const payments = isEdit
      ? postBooking.payments.map((payment) => (payment.id === request.id ? request : payment))
      : [...postBooking.payments, request];
    if (save(
      { payments },
      `Demo ${request.paymentType.toLowerCase()} payment request ${isEdit ? 'updated' : 'created'}`,
      `Demo payment request ${isEdit ? 'updated' : 'created'}.`,
    )) {
      setDialog(null);
    }
  };

  const saveFlightLeg = (leg) => {
    const existing = postBooking.flightLegs.some((item) => item.id === leg.id);
    const flightLegs = existing
      ? postBooking.flightLegs.map((item) => (item.id === leg.id ? leg : item))
      : [...postBooking.flightLegs, { ...leg, legNumber: postBooking.flightLegs.length + 1 }];
    if (save({ flightLegs }, existing ? 'Flight leg updated' : 'Flight leg added', 'Flight itinerary saved.')) {
      setDialog(null);
    }
  };

  const appendFlightStatus = (legId, flightStatus) => {
    const flightLegs = postBooking.flightLegs.map((leg) =>
      leg.id === legId
        ? {
            ...leg,
            statusEvents: [
              ...leg.statusEvents,
              {
                id: `flight-event-${Date.now()}`,
                flightStatus,
                statusAt: new Date().toISOString(),
                source: 'Operator',
                recordedBy: 'Maya Chen',
              },
            ],
          }
        : leg,
    );
    save({ flightLegs }, `Flight status updated to ${flightStatus}`, 'Manual flight update saved in this demo.');
  };

  const addMoccaeVisit = (visit) => {
    const tasks = visit.taskAssignee
      ? [...postBooking.tasks, {
          id: visit.taskId,
          type: 'MOCCAE appointment',
          team: 'GroundLogistics',
          assignee: visit.taskAssignee,
          status: 'Assigned',
          assignedAt: new Date().toISOString(),
          startedAt: null,
          completedAt: null,
        }]
      : [...postBooking.tasks, {
          id: visit.taskId,
          type: 'MOCCAE appointment',
          team: 'GroundLogistics',
          assignee: null,
          status: 'Queued',
          assignedAt: null,
          startedAt: null,
          completedAt: null,
        }];
    if (save({ moccaeVisits: [...postBooking.moccaeVisits, visit], tasks }, 'MOCCAE visit scheduled', 'MOCCAE visit added.')) {
      setDialog(null);
    }
  };

  const addTransfer = (transfer) => {
    const tasks = [...postBooking.tasks, {
      id: transfer.taskId,
      type: transfer.taskType,
      team: 'GroundLogistics',
      assignee: transfer.assignedTo,
      status: transfer.assignedTo ? 'Assigned' : 'Queued',
      assignedAt: transfer.assignedTo ? new Date().toISOString() : null,
      startedAt: null,
      completedAt: null,
    }];
    if (save({ transfers: [...postBooking.transfers, transfer], tasks }, 'Airport transfer created', 'Airport transfer added.')) {
      setDialog(null);
    }
  };

  const updateVisit = (visitId, changes, activityText) => {
    const moccaeVisits = postBooking.moccaeVisits.map((visit) => {
      if (visit.id !== visitId) return visit;
      const updated = { ...visit, ...changes };
      if (changes.taskAssignee !== undefined) {
        updated.taskId = visit.taskId ?? `task-${visit.id}`;
      }
      return updated;
    });
    const tasks = changes.taskAssignee === undefined
      ? postBooking.tasks
      : postBooking.tasks.map((task) =>
          task.id === postBooking.moccaeVisits.find((visit) => visit.id === visitId)?.taskId
            ? {
                ...task,
                assignee: changes.taskAssignee || null,
                status: changes.taskAssignee ? 'Assigned' : 'Queued',
                assignedAt: changes.taskAssignee ? new Date().toISOString() : null,
              }
            : task,
        );
    save({ moccaeVisits, tasks }, activityText, activityText ? 'Visit updated.' : '');
  };

  const updateTransfer = (transferId, changes, activityText) => {
    const transfer = postBooking.transfers.find((item) => item.id === transferId);
    const transfers = postBooking.transfers.map((item) => (item.id === transferId ? { ...item, ...changes } : item));
    const tasks = changes.assignedTo === undefined
      ? postBooking.tasks
      : postBooking.tasks.map((task) =>
          task.id === transfer?.taskId
            ? {
                ...task,
                assignee: changes.assignedTo || null,
                status: changes.assignedTo ? 'Assigned' : 'Queued',
                assignedAt: changes.assignedTo ? new Date().toISOString() : null,
              }
            : task,
        );
    save({ transfers, tasks }, activityText, activityText ? 'Transfer updated.' : '');
  };

  const addNote = (text) => {
    const note = { id: `note-${Date.now()}`, text, actor: 'Maya Chen', at: new Date().toISOString() };
    save({ notes: [note, ...postBooking.notes] }, 'Case note added', 'Note added to the demo activity.');
  };

  const saveOutcome = (outcome, reason) => {
    if (save({ outcome: { outcome, reason, at: new Date().toISOString(), actor: 'Maya Chen' } }, `Demo outcome set to ${outcome}`, 'Demo outcome saved.')) {
      setDialog(null);
    }
  };

  const tabOptions = CASE_TABS.map((item) => ({
    value: item.value,
    label: (
      <span className="whitespace-nowrap">
        {item.label}
        {item.value === 'tasks' && <span className="ml-1 opacity-70">({postBooking.tasks.filter(isOpenTask).length})</span>}
      </span>
    ),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button type="button" onClick={onBack} className="mb-2 text-sm font-semibold text-brandd hover:underline">
            ← Back to case queue
          </button>
          <p className="text-xs font-semibold text-mute">{booking.ref} · Export · {MODES[booking.mode]}</p>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <p className="mt-1 text-sm text-mute">{booking.route} · {plural(booking.pets.length)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip status={postBooking.workflowStatus} />
          {postBooking.outcome && <Chip className="bg-purple-100 text-purple-800">Demo outcome: {postBooking.outcome.outcome}</Chip>}
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <PillTabs
          id="postbooking-case-tabs"
          options={tabOptions}
          value={tab}
          onChange={setTab}
          className="flex min-w-max gap-2"
          pillClass="px-3.5 py-2 text-xs"
          inactiveClass="border border-line bg-white hover:bg-stone-50"
        />
      </div>

      <div className="mt-4 space-y-4">
        {tab === 'overview' && (
          <Overview
            postBooking={postBooking}
            booking={booking}
            client={client}
            onTab={setTab}
            onApprove={() => {
              const approved = approveIntake(postBooking.bookingId);
              say(approved ? 'Intake approved. Accounts confirmation is next (demo).' : 'Intake can only be approved while pending review.');
            }}
          />
        )}
        {tab === 'journey' && (
          <JourneyPanel
            postBooking={postBooking}
            booking={booking}
            changeJourney={changeJourney}
            onEditLeg={(leg) => setDialog({ type: 'leg', leg })}
            onAddLeg={() => setDialog({ type: 'leg', leg: null })}
            onFlightStatus={appendFlightStatus}
          />
        )}
        {tab === 'tasks' && (
          <TasksPanel postBooking={postBooking} onAssign={assignTask} onStatus={setTaskStatus} />
        )}
        {tab === 'operations' && (
          <OperationsPanel
            postBooking={postBooking}
            booking={booking}
            changeCase={save}
            updateVisit={updateVisit}
            updateTransfer={updateTransfer}
            onAddVisit={() => setDialog({ type: 'visit' })}
            onAddTransfer={() => setDialog({ type: 'transfer' })}
            onTab={setTab}
          />
        )}
        {tab === 'payments' && (
          <PaymentsPanel
            postBooking={postBooking}
            onAdd={() => setDialog({ type: 'payment' })}
            onEdit={(request) => setDialog({ type: 'payment', request })}
            onConfirm={() => {
              const confirmed = confirmDownPayment(postBooking.bookingId);
              say(confirmed ? 'Accounts payment confirmation recorded (demo). Operations are active.' : 'Payment confirmation is only available while awaiting down payment.');
            }}
          />
        )}
        {tab === 'documents' && (
          <DocumentsPanel postBooking={postBooking} booking={booking} onSave={save} onTab={setTab} />
        )}
        {tab === 'activity' && (
          <ActivityPanel
            postBooking={postBooking}
            onAddNote={addNote}
            onOutcome={() => setDialog({ type: 'outcome' })}
            onTab={setTab}
          />
        )}
      </div>

      <AnimatePresence>
        {dialog?.type === 'payment' && (
          <PaymentRequestDialog key={dialog.request?.id ?? 'payment'} request={dialog.request} onClose={() => setDialog(null)} onSave={savePaymentRequest} />
        )}
        {dialog?.type === 'leg' && (
          <FlightLegDialog
            key={dialog.leg?.id ?? 'new-leg'}
            leg={dialog.leg}
            nextNumber={postBooking.flightLegs.length + 1}
            onClose={() => setDialog(null)}
            onSave={saveFlightLeg}
          />
        )}
        {dialog?.type === 'visit' && (
          <VisitDialog key="visit" pets={booking.pets} onClose={() => setDialog(null)} onSave={addMoccaeVisit} />
        )}
        {dialog?.type === 'transfer' && (
          <TransferDialog key="transfer" pets={booking.pets} onClose={() => setDialog(null)} onSave={addTransfer} />
        )}
        {dialog?.type === 'outcome' && (
          <OutcomeDialog key="outcome" onClose={() => setDialog(null)} onSave={saveOutcome} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Overview({ postBooking, booking, client, onTab, onApprove }) {
  const nextTask = postBooking.tasks.find(isOpenTask);
  const scheduledDeparture = postBooking.flightLegs[0]
    ? formatDateOnly(postBooking.flightLegs[0].scheduledDepartureAt, postBooking.flightLegs[0].departureTimeZone)
    : postBooking.landTransport?.scheduledDepartureAt
      ? formatDateOnly(postBooking.landTransport.scheduledDepartureAt)
      : '';
  const planned = postBooking.journey.plannedTravelMonth || scheduledDeparture || 'Date TBD';
  return (
    <>
      {postBooking.workflowStatus === 'PendingReview' && (
        <Panel
          title="Intake review"
          action={<Chip className="bg-yellow-100 text-yellow-800">Action required</Chip>}
          className="border-yellow-200"
        >
          <p className="text-sm text-mute">Review the submitted client, pet and travel details before moving the case to Accounts.</p>
          <Button primary className="mt-4" onClick={onApprove}>Approve intake</Button>
        </Panel>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Client">
          <Value label="Name">{client.name}</Value>
          <div className="mt-3 grid gap-3">
            <Value label="Phone">{client.phone}</Value>
            <Value label="Email">{client.email}</Value>
            <Value label="Address">{client.address}</Value>
          </div>
        </Panel>
        <Panel title="Journey summary">
          <div className="grid grid-cols-2 gap-3">
            <Value label="Movement">{booking.dir}</Value>
            <Value label="Travel mode">{MODES[booking.mode]}</Value>
            <Value label="Route">{booking.route}</Value>
            <Value label="Planned">{planned}</Value>
          </div>
          <Button className="mt-4" onClick={() => onTab('journey')}>Open journey</Button>
        </Panel>
        <Panel title="Next action">
          {nextTask ? (
            <>
              <p className="font-semibold">{nextTask.type}</p>
              <p className="mt-1 text-sm text-mute">{TEAM_NAMES[nextTask.team] || nextTask.team} · {nextTask.assignee || 'Unassigned'}</p>
              <Chip className="mt-3 bg-stone-100 text-ink">{nextTask.status}</Chip>
              <div><Button className="mt-4" onClick={() => onTab('tasks')}>Open tasks</Button></div>
            </>
          ) : (
            <p className="text-sm text-mute">No open tasks.</p>
          )}
        </Panel>
      </div>

      <Panel title="Pets and submitted request">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {booking.pets.map((pet, index) => (
            <div key={`${booking.id}-pet-${index}`} className="rounded-lg border border-line p-3">
              <p className="font-semibold">{pet.type} · {pet.breed || `Pet ${index + 1}`}</p>
              <p className="mt-1 text-xs text-mute">Vaccination checklist: {pet.vax ? 'Available in Pre-Booking' : 'Not provided'}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-mute">{booking.prefs || 'No travel preferences recorded.'}</p>
      </Panel>

      {postBooking.workflowStatus === 'AwaitingDownPayment' && (
        <Panel title="Accounts handoff" action={<Chip className="bg-orange-100 text-orange-800">Payment confirmation required</Chip>}>
          <p className="text-sm text-mute">The case is waiting for Accounts to confirm the initial payment. Operations will activate only after that demo confirmation.</p>
          <Button className="mt-4" onClick={() => onTab('payments')}>Open payment summary</Button>
        </Panel>
      )}
      {postBooking.workflowStatus === 'OperationsActive' && (
        <Panel title="Operations snapshot" action={<Chip className="bg-green-100 text-green-800">Active</Chip>}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Value label="Flight legs">{postBooking.flightLegs.length || (postBooking.landTransport ? 'Land schedule' : 'Not scheduled')}</Value>
            <Value label="Open tasks">{postBooking.tasks.filter(isOpenTask).length}</Value>
            <Value label="Document items">{postBooking.documents.length}</Value>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => onTab('operations')}>Open operations</Button>
            <Button onClick={() => onTab('documents')}>Open documents</Button>
            <Button onClick={() => onTab('activity')}>Open activity</Button>
          </div>
        </Panel>
      )}
      <p className="text-xs text-mute">Demo data · Changes are held in memory and reset when this page reloads.</p>
    </>
  );
}

function JourneyPanel({ postBooking, booking, changeJourney, onEditLeg, onAddLeg, onFlightStatus }) {
  const [timeError, setTimeError] = useState('');
  const isLand = booking.mode === 'LandTransport';
  const check = routeCheck(postBooking.journey, postBooking.flightLegs);
  const updateLegStatus = (leg, flightStatus) => onFlightStatus(leg.id, flightStatus);
  const updateLandTime = (key, value, timeZone) => {
    const timestamp = fromDateTimeLocal(value, timeZone);
    if (value && !timestamp) {
      setTimeError(`That local time does not exist in ${timeZone}. Choose another time.`);
      return;
    }
    const departureAt = key === 'scheduledDepartureAt' ? timestamp : postBooking.landTransport.scheduledDepartureAt;
    const arrivalAt = key === 'scheduledArrivalAt' ? timestamp : postBooking.landTransport.scheduledArrivalAt;
    if (departureAt && arrivalAt && new Date(arrivalAt) <= new Date(departureAt)) {
      setTimeError('Land arrival must be later than departure.');
      return;
    }
    setTimeError('');
    changeJourney('landTransport', { ...postBooking.landTransport, [key]: timestamp });
  };
  const updateJourneyField = (key, value) => {
    changeJourney(key, value);
  };

  return (
    <>
      <Panel title="Journey details" action={<Chip className="bg-orange-50 text-brandd">Demo itinerary</Chip>}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Destination city">
            <input className={`${inputClass} mt-1`} value={postBooking.journey.destinationCity} onChange={(event) => updateJourneyField('destinationCity', event.target.value)} />
          </Field>
          <Field label="Destination country code">
            <input className={`${inputClass} mt-1`} maxLength="2" value={postBooking.journey.destinationCountryCode} onChange={(event) => updateJourneyField('destinationCountryCode', event.target.value.toUpperCase())} />
          </Field>
          <Field label="Destination time zone">
            <select className={`${inputClass} mt-1`} value={postBooking.journey.destinationTimeZone} onChange={(event) => updateJourneyField('destinationTimeZone', event.target.value)}>
              {TIME_ZONES.map((zone) => <option key={zone}>{zone}</option>)}
            </select>
          </Field>
          <Field label="Planned travel month">
            <input className={`${inputClass} mt-1`} placeholder="e.g. March 2027" value={postBooking.journey.plannedTravelMonth || ''} onChange={(event) => updateJourneyField('plannedTravelMonth', event.target.value || null)} />
          </Field>
          {!isLand && (
            <>
              <Field label="Origin airport">
                <input className={`${inputClass} mt-1`} maxLength="3" value={postBooking.journey.originAirportCode || ''} onChange={(event) => updateJourneyField('originAirportCode', event.target.value.toUpperCase())} />
              </Field>
              <Field label="Final destination airport">
                <input className={`${inputClass} mt-1`} maxLength="3" value={postBooking.journey.finalDestinationAirportCode || ''} onChange={(event) => updateJourneyField('finalDestinationAirportCode', event.target.value.toUpperCase())} />
              </Field>
              <Field label="Passenger ticket number">
                <input className={`${inputClass} mt-1`} value={postBooking.journey.passengerTicketNumber} onChange={(event) => updateJourneyField('passengerTicketNumber', event.target.value)} />
              </Field>
              <Field label="Air waybill number">
                <input className={`${inputClass} mt-1`} value={postBooking.journey.airWaybillNumber} onChange={(event) => updateJourneyField('airWaybillNumber', event.target.value)} />
              </Field>
              {booking.mode === 'ManifestCargo' && (
                <Field label="Cargo flight type">
                  <select className={`${inputClass} mt-1`} value={postBooking.journey.cargoFlightType} onChange={(event) => updateJourneyField('cargoFlightType', event.target.value)}>
                    <option value="">Not selected</option><option>Commercial</option><option>NonCommercial</option>
                  </select>
                </Field>
              )}
            </>
          )}
          {isLand && (
            <Field label="Land vehicle type">
              <input className={`${inputClass} mt-1`} value={postBooking.journey.landVehicleType} onChange={(event) => updateJourneyField('landVehicleType', event.target.value)} />
            </Field>
          )}
        </div>
        <p className="mt-3 text-xs text-mute">Mode-specific fields are shown for {MODES[booking.mode]}. This itinerary is demo data.</p>
      </Panel>

      {isLand ? (
        <Panel title="Land-transport schedule">
          {postBooking.landTransport ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Departure location">
                <input className={`${inputClass} mt-1`} value={postBooking.landTransport.departureLocation || ''} onChange={(event) => changeJourney('landTransport', { ...postBooking.landTransport, departureLocation: event.target.value })} />
              </Field>
              <Field label="Arrival location">
                <input className={`${inputClass} mt-1`} value={postBooking.landTransport.arrivalLocation || ''} onChange={(event) => changeJourney('landTransport', { ...postBooking.landTransport, arrivalLocation: event.target.value })} />
              </Field>
              <Field label="Scheduled departure">
                <input className={`${inputClass} mt-1`} type="datetime-local" value={toDateTimeLocal(postBooking.landTransport.scheduledDepartureAt, 'Asia/Dubai')} onChange={(event) => updateLandTime('scheduledDepartureAt', event.target.value, 'Asia/Dubai')} />
              </Field>
              <Field label="Scheduled arrival">
                <input className={`${inputClass} mt-1`} type="datetime-local" value={toDateTimeLocal(postBooking.landTransport.scheduledArrivalAt, postBooking.journey.destinationTimeZone)} onChange={(event) => updateLandTime('scheduledArrivalAt', event.target.value, postBooking.journey.destinationTimeZone)} />
              </Field>
            </div>
          ) : (
            <p className="text-sm text-mute">No land schedule has been entered.</p>
          )}
          {timeError && <p role="alert" className="mt-3 text-sm text-red-700">{timeError}</p>}
        </Panel>
      ) : (
        <Panel
          title="Flight legs"
          action={<Button primary onClick={onAddLeg}>+ Add flight leg</Button>}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Chip className={check === 'Route OK' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {check}
            </Chip>
            <span className="text-xs text-mute">Route continuity is checked against the first and final airport.</span>
          </div>
          <div className="space-y-3">
            {postBooking.flightLegs
              .slice()
              .sort((a, b) => a.legNumber - b.legNumber)
              .map((leg) => {
                const latest = latestFlightStatus(leg);
                return (
                  <div key={leg.id} className="rounded-xl border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">Leg {leg.legNumber} · {leg.carrierName} · {leg.flightNumber}</p>
                        <p className="mt-1 text-sm">{leg.departureAirportCode} → {leg.arrivalAirportCode}</p>
                        <p className="mt-1 text-xs text-mute">
                          Depart {formatDateTime(leg.scheduledDepartureAt, leg.departureTimeZone)} · Arrive {formatDateTime(leg.scheduledArrivalAt, leg.arrivalTimeZone)}
                        </p>
                      </div>
                      <Button onClick={() => onEditLeg(leg)}>Edit leg</Button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <Field label="Manual flight status">
                        <select
                          className={`${inputClass} mt-1`}
                          value={latest?.flightStatus ?? 'Scheduled'}
                          onChange={(event) => updateLegStatus(leg, event.target.value)}
                        >
                          {FLIGHT_STATUSES.map((flightStatus) => <option key={flightStatus}>{flightStatus}</option>)}
                        </select>
                      </Field>
                      <Chip className="bg-stone-100 text-ink">{latest ? `${latest.flightStatus} · ${latest.source}` : 'No manual update'}</Chip>
                    </div>
                    {leg.statusEvents.length > 0 && (
                      <div className="mt-3 border-t border-line pt-3">
                        <p className="text-xs font-semibold text-mute">STATUS HISTORY</p>
                        {leg.statusEvents.slice().reverse().map((event) => (
                          <p key={event.id} className="mt-1 text-xs">
                            {event.flightStatus} · {formatDateTime(event.statusAt, leg.departureTimeZone)} · {event.recordedBy}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            {postBooking.flightLegs.length === 0 && (
              <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-mute">No flight legs yet. Add the first leg to build the itinerary.</p>
            )}
          </div>
        </Panel>
      )}
    </>
  );
}

function TasksPanel({ postBooking, onAssign, onStatus }) {
  return (
    <>
      <Panel title="Case tasks" action={<Chip className="bg-stone-100 text-ink">{postBooking.tasks.length} total</Chip>}>
        <div className="space-y-3">
          {postBooking.tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-line p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{task.type}</p>
                  <p className="mt-1 text-xs text-mute">{TEAM_NAMES[task.team] || task.team} · {task.assignee || 'Unassigned'}</p>
                </div>
                <Chip className={task.status === 'Completed' ? 'bg-green-100 text-green-800' : task.status === 'Reassigned' ? 'bg-purple-100 text-purple-800' : 'bg-stone-100 text-ink'}>
                  {task.status}
                </Chip>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Value label="Assigned">{formatDateTime(task.assignedAt)}</Value>
                <Value label="Started">{formatDateTime(task.startedAt)}</Value>
                <Value label="Completed">{formatDateTime(task.completedAt)}</Value>
              </div>
              {task.previousAssignee && (
                <p className="mt-2 text-xs text-mute">Previous assignee: {task.previousAssignee}</p>
              )}
              {task.reassignedTo && (
                <p className="mt-2 text-xs text-mute">Reassigned to {task.reassignedTo}; a new assigned task is shown in this demo.</p>
              )}
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <Field label={task.assignee ? 'Assign / reassign' : 'Assign to'}>
                  <select
                    className={`${inputClass} mt-1 min-w-52`}
                    value={task.assignee ?? ''}
                    disabled={!['Queued', 'Assigned'].includes(task.status)}
                    onChange={(event) => onAssign(task, event.target.value)}
                  >
                    <option value="">Select a staff member</option>
                    {TASK_USERS.map((user) => <option key={user}>{user}</option>)}
                  </select>
                </Field>
                {task.status === 'Assigned' && (
                  <Button onClick={() => onStatus(task, 'InProgress')}>Start task</Button>
                )}
                {task.status === 'InProgress' && (
                  <Button primary onClick={() => onStatus(task, 'Completed')}>Complete task</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <p className="text-xs text-mute">Assignments are local demo state; staff availability is not checked.</p>
    </>
  );
}

function PaymentsPanel({ postBooking, onAdd, onEdit, onConfirm }) {
  const paymentTask = postBooking.tasks.find((task) => task.type === 'Payment confirmation');
  const totalsByCurrency = postBooking.payments.reduce((totals, payment) => {
    const currency = payment.currency || 'AED';
    const current = totals[currency] ?? { total: 0, received: 0 };
    current.total += Number(payment.amount || 0);
    current.received += Number(payment.receivedAmount || 0);
    totals[currency] = current;
    return totals;
  }, {});
  return (
    <>
      <Panel
        title="Payment summary"
        action={<Chip className="bg-amber-50 text-amber-800">Demo only · Not a real payment</Chip>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Value label="Accounts owner">{paymentTask?.assignee || 'Unassigned'}</Value>
          {Object.entries(totalsByCurrency).map(([currency, totals]) => (
            <div key={currency} className="rounded-lg border border-line p-3">
              <p className="text-xs font-semibold text-mute">{currency}</p>
              <p className="mt-2 text-sm">Requests: {totals.total.toLocaleString('en-US')}</p>
              <p className="text-sm">Received: {totals.received.toLocaleString('en-US')}</p>
              <p className="text-sm">Outstanding: {Math.max(totals.total - totals.received, 0).toLocaleString('en-US')}</p>
            </div>
          ))}
          {Object.keys(totalsByCurrency).length === 0 && (
            <p className="text-sm text-mute">No payment totals recorded.</p>
          )}
        </div>
        <p className="mt-3 text-xs text-mute">Totals are illustrative local values; no payment ledger or collection service is connected.</p>
      </Panel>
      <Panel
        title="Payment requests"
        action={postBooking.workflowStatus !== 'PendingReview' && <Button onClick={onAdd}>+ Raise request</Button>}
      >
        <div className="space-y-3">
          {postBooking.payments.map((payment) => (
            <div key={payment.id} className="grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-semibold">{payment.paymentType} request · {payment.payer}</p>
                <p className="text-sm">{Number(payment.amount).toLocaleString('en-US')} {payment.currency}</p>
                <p className="mt-1 text-xs text-mute">{payment.description} · Due {formatDateOnly(payment.dueDate)}</p>
                {payment.collectionStatus !== 'Confirmed' && postBooking.workflowStatus !== 'PendingReview' && (
                  <Button className="mt-2" onClick={() => onEdit(payment)}>Edit request</Button>
                )}
              </div>
              <Chip className={payment.collectionStatus === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                {payment.collectionStatus}
              </Chip>
            </div>
          ))}
          {postBooking.payments.length === 0 && (
            <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-mute">
              No request is recorded. Intake approval creates a demo initial request.
            </p>
          )}
        </div>
        {postBooking.workflowStatus === 'PendingReview' && (
          <p className="mt-4 text-sm text-mute">Payment requests become available after intake approval.</p>
        )}
        {postBooking.workflowStatus === 'AwaitingDownPayment' && (
          <Button
            primary
            className="mt-4"
            disabled={!postBooking.payments.some((payment) => payment.paymentType === 'Initial' && payment.collectionStatus !== 'Confirmed')}
            onClick={onConfirm}
          >
            Simulate Accounts confirmation
          </Button>
        )}
        {postBooking.workflowStatus === 'OperationsActive' && (
          <p className="mt-4 text-sm text-green-800">Initial payment confirmation recorded in the demo; operations are active.</p>
        )}
      </Panel>
    </>
  );
}

function OperationsPanel({
  postBooking,
  booking,
  changeCase,
  updateVisit,
  updateTransfer,
  onAddVisit,
  onAddTransfer,
  onTab,
}) {
  const [agentError, setAgentError] = useState('');
  const [timeError, setTimeError] = useState('');
  const updateTime = (value, timeZone, onSave) => {
    const timestamp = fromDateTimeLocal(value, timeZone);
    if (value && !timestamp) {
      setTimeError(`That local time does not exist in ${timeZone}. Choose another time.`);
      return;
    }
    setTimeError('');
    onSave(timestamp);
  };
  const updateVisitTime = (visit, key, value) => {
    updateTime(value, 'Asia/Dubai', (timestamp) => {
      const pickupAt = key === 'actualPetPickupAt' ? timestamp : visit.actualPetPickupAt;
      const returnedAt = key === 'actualPetReturnedAt' ? timestamp : visit.actualPetReturnedAt;
      const arrivedAt = key === 'clientArrivedAt' ? timestamp : visit.clientArrivedAt;
      const exitedAt = key === 'clientExitedAt' ? timestamp : visit.clientExitedAt;
      if (pickupAt && returnedAt && new Date(returnedAt) <= new Date(pickupAt)) {
        setTimeError('Pet return time must be later than pet pickup.');
        return;
      }
      if (arrivedAt && exitedAt && new Date(exitedAt) <= new Date(arrivedAt)) {
        setTimeError('Client exit time must be later than arrival.');
        return;
      }
      setTimeError('');
      updateVisit(visit.id, { [key]: timestamp });
    });
  };
  const changeCheckIn = (key, value) => {
    const converted = ['airportAssistanceRequired', 'taxiRequired'].includes(key)
      ? value === '' ? null : value === 'Yes'
      : value;
    const flightDay = {
      ...postBooking.flightDay,
      [key]: converted,
      ...(key === 'clientConfirmationStatus'
        ? { clientConfirmedAt: value === 'Confirmed' ? new Date().toISOString() : null }
        : {}),
    };
    changeCase({ flightDay }, `Flight-day ${key} updated`, 'Flight-day details updated.');
  };

  return (
    <>
      {booking.mode === 'LandTransport' && (
        <Panel title="Land-transport schedule">
          <p className="text-sm text-mute">Use the Journey tab to update land locations and scheduled times.</p>
          <Button className="mt-3" onClick={() => onTab('journey')}>Open journey schedule</Button>
        </Panel>
      )}

      <Panel title="MOCCAE visits" action={<Button onClick={onAddVisit}>+ Schedule visit</Button>}>
        <div className="space-y-4">
          {postBooking.moccaeVisits.map((visit) => (
            <div key={visit.id} className="rounded-xl border border-line p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{visit.arrangement === 'SandyPawsTaxi' ? 'SandyPaws taxi' : 'Client office visit'}</p>
                  <p className="mt-1 text-xs text-mute">{formatDateTime(visit.scheduledAt)} · Assigned PRO: {visit.taskAssignee || 'Unassigned'}</p>
                </div>
                <Chip className={visit.clientConfirmationStatus === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                  Client {visit.clientConfirmationStatus}
                </Chip>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Visit arrangement">
                  <select className={`${inputClass} mt-1`} value={visit.arrangement} onChange={(event) => updateVisit(visit.id, { arrangement: event.target.value })}>
                    <option value="SandyPawsTaxi">SandyPaws taxi</option><option value="ClientOfficeVisit">Client office visit</option>
                  </select>
                </Field>
                <Field label="Scheduled time (Dubai time)">
                  <input className={`${inputClass} mt-1`} type="datetime-local" value={toDateTimeLocal(visit.scheduledAt, 'Asia/Dubai')} onChange={(event) => updateTime(event.target.value, 'Asia/Dubai', (scheduledAt) => updateVisit(visit.id, { scheduledAt }))} />
                </Field>
                <Field label="Client confirmation">
                  <select className={`${inputClass} mt-1`} value={visit.clientConfirmationStatus} onChange={(event) => updateVisit(visit.id, { clientConfirmationStatus: event.target.value }, `MOCCAE client ${event.target.value.toLowerCase()}`)}>
                    <option>Pending</option><option>Confirmed</option><option>Declined</option>
                  </select>
                </Field>
                <Field label="Assigned PRO">
                  <select className={`${inputClass} mt-1`} value={visit.taskAssignee ?? ''} onChange={(event) => updateVisit(visit.id, { taskAssignee: event.target.value || null }, event.target.value ? `MOCCAE task assigned to ${event.target.value}` : 'MOCCAE task returned to queue')}>
                    <option value="">Unassigned</option>
                    {TASK_USERS.map((user) => <option key={user}>{user}</option>)}
                  </select>
                </Field>
                {visit.arrangement === 'SandyPawsTaxi' ? (
                  <>
                    <Field label="Pickup address">
                      <input className={`${inputClass} mt-1`} value={visit.pickupAddress || ''} onChange={(event) => updateVisit(visit.id, { pickupAddress: event.target.value })} />
                    </Field>
                    <Field label="Return address">
                      <input className={`${inputClass} mt-1`} value={visit.returnAddress || ''} onChange={(event) => updateVisit(visit.id, { returnAddress: event.target.value })} />
                    </Field>
                    <Field label="Actual pet pickup (Dubai time)">
                      <input className={`${inputClass} mt-1`} type="datetime-local" value={toDateTimeLocal(visit.actualPetPickupAt, 'Asia/Dubai')} disabled={!visit.taskAssignee} onChange={(event) => updateVisitTime(visit, 'actualPetPickupAt', event.target.value)} />
                    </Field>
                    <Field label="Actual pet returned (Dubai time)">
                      <input className={`${inputClass} mt-1`} type="datetime-local" value={toDateTimeLocal(visit.actualPetReturnedAt, 'Asia/Dubai')} onChange={(event) => updateVisitTime(visit, 'actualPetReturnedAt', event.target.value)} />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="Client arrived (Dubai time)">
                      <input className={`${inputClass} mt-1`} type="datetime-local" value={toDateTimeLocal(visit.clientArrivedAt, 'Asia/Dubai')} onChange={(event) => updateVisitTime(visit, 'clientArrivedAt', event.target.value)} />
                    </Field>
                    <Field label="Client exited (Dubai time)">
                      <input className={`${inputClass} mt-1`} type="datetime-local" value={toDateTimeLocal(visit.clientExitedAt, 'Asia/Dubai')} onChange={(event) => updateVisitTime(visit, 'clientExitedAt', event.target.value)} />
                    </Field>
                  </>
                )}
              </div>
              <div className="mt-4 border-t border-line pt-3">
                <p className="text-xs font-semibold text-mute">PER-PET APPROVAL</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {visit.petApprovals.map((approval) => {
                    const pet = booking.pets[approval.petIndex];
                    return (
                      <div key={approval.petIndex} className="rounded-lg bg-stone-50 p-3">
                        <p className="text-sm font-medium">{pet?.type} · {pet?.breed || `Pet ${approval.petIndex + 1}`}</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <select
                            className={inputClass}
                            value={approval.approvalStatus}
                            onChange={(event) => {
                              const approvalStatus = event.target.value;
                              const petApprovals = visit.petApprovals.map((item) =>
                                item.petIndex === approval.petIndex
                                  ? { ...item, approvalStatus, decisionAt: approvalStatus === 'Pending' ? null : new Date().toISOString() }
                                  : item,
                              );
                              updateVisit(visit.id, { petApprovals }, `MOCCAE pet approval set to ${approvalStatus}`);
                            }}
                          >
                            <option>Pending</option><option>Approved</option><option>NotApproved</option>
                          </select>
                          <input
                            className={inputClass}
                            placeholder="Approval note"
                            value={approval.notes}
                            onChange={(event) => {
                              const petApprovals = visit.petApprovals.map((item) =>
                                item.petIndex === approval.petIndex ? { ...item, notes: event.target.value } : item,
                              );
                              updateVisit(visit.id, { petApprovals });
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          {postBooking.moccaeVisits.length === 0 && (
            <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-mute">No visit scheduled. Add a visit to track client confirmation and approval per pet.</p>
          )}
        </div>
      </Panel>

      <Panel title="Flight-day check-in" action={<Chip className="bg-stone-100 text-ink">Unanswered stays distinct from No</Chip>}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Client confirmation">
            <select className={`${inputClass} mt-1`} value={postBooking.flightDay.clientConfirmationStatus} onChange={(event) => changeCheckIn('clientConfirmationStatus', event.target.value)}>
              <option>Pending</option><option>Confirmed</option><option>Declined</option>
            </select>
          </Field>
          <Field label="Airport assistance required">
            <select className={`${inputClass} mt-1`} value={postBooking.flightDay.airportAssistanceRequired === null ? '' : postBooking.flightDay.airportAssistanceRequired ? 'Yes' : 'No'} onChange={(event) => changeCheckIn('airportAssistanceRequired', event.target.value)}>
              <option value="">Unanswered</option><option>Yes</option><option>No</option>
            </select>
          </Field>
          <Field label="Taxi required">
            <select className={`${inputClass} mt-1`} value={postBooking.flightDay.taxiRequired === null ? '' : postBooking.flightDay.taxiRequired ? 'Yes' : 'No'} onChange={(event) => changeCheckIn('taxiRequired', event.target.value)}>
              <option value="">Unanswered</option><option>Yes</option><option>No</option>
            </select>
          </Field>
          {booking.mode === 'ManifestCargo' && (
            <Field label="Cargo check-in choice">
              <select className={`${inputClass} mt-1`} value={postBooking.flightDay.cargoCheckInChoice ?? ''} onChange={(event) => changeCheckIn('cargoCheckInChoice', event.target.value || null)}>
                <option value="">Unanswered</option><option value="SandyPawsPickup">SandyPaws pickup</option><option value="ClientSelfCheckIn">Client self check-in</option>
              </select>
            </Field>
          )}
          {postBooking.flightDay.clientConfirmedAt && (
            <Value label="Confirmed at">{formatDateTime(postBooking.flightDay.clientConfirmedAt)}</Value>
          )}
        </div>
      </Panel>

      <Panel title="Airport transfers" action={<Button onClick={onAddTransfer}>+ Add transfer</Button>}>
        <div className="space-y-3">
          {postBooking.transfers.map((transfer) => (
            <div key={transfer.id} className="rounded-xl border border-line p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{transfer.transferType === 'CargoPetPickup' ? 'Cargo pet pickup' : 'Passenger taxi'}</p>
                  <p className="mt-1 text-xs text-mute">{transfer.dropOffAirportCode} {transfer.dropOffTerminal} · {transfer.petIndexes.length} linked pet(s)</p>
                </div>
                <Chip className={transfer.assignedTo ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                  {transfer.assignedTo || 'PRO unassigned'}
                </Chip>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Transfer type">
                  <select className={`${inputClass} mt-1`} value={transfer.transferType} onChange={(event) => {
                    const transferType = event.target.value;
                    updateTransfer(transfer.id, {
                      transferType,
                      petIndexes: transferType === 'CargoPetPickup' ? booking.pets.map((_, index) => index) : [],
                    });
                  }}>
                    <option value="PassengerTaxi">Passenger taxi</option><option value="CargoPetPickup">Cargo pet pickup</option>
                  </select>
                </Field>
                <Field label="Pickup time (Dubai time)">
                  <input className={`${inputClass} mt-1`} type="datetime-local" value={toDateTimeLocal(transfer.scheduledPickupAt, 'Asia/Dubai')} onChange={(event) => updateTime(event.target.value, 'Asia/Dubai', (scheduledPickupAt) => updateTransfer(transfer.id, { scheduledPickupAt }))} />
                </Field>
                <Field label="Pickup address">
                  <input className={`${inputClass} mt-1`} value={transfer.pickupAddress} onChange={(event) => updateTransfer(transfer.id, { pickupAddress: event.target.value })} />
                </Field>
                <Field label="Drop-off airport">
                  <input className={`${inputClass} mt-1`} maxLength="3" value={transfer.dropOffAirportCode} onChange={(event) => updateTransfer(transfer.id, { dropOffAirportCode: event.target.value.toUpperCase() })} />
                </Field>
                <Field label="Terminal">
                  <input className={`${inputClass} mt-1`} value={transfer.dropOffTerminal || ''} onChange={(event) => updateTransfer(transfer.id, { dropOffTerminal: event.target.value })} />
                </Field>
                <Field label="Assigned PRO">
                  <select className={`${inputClass} mt-1`} value={transfer.assignedTo || ''} onChange={(event) => updateTransfer(transfer.id, { assignedTo: event.target.value || null }, event.target.value ? `Transfer assigned to ${event.target.value}` : 'Transfer returned to queue')}>
                    <option value="">Unassigned</option>{TASK_USERS.map((user) => <option key={user}>{user}</option>)}
                  </select>
                </Field>
                <Field label="Passengers">
                  <input className={`${inputClass} mt-1`} type="number" min="0" value={transfer.travellerCount ?? ''} onChange={(event) => updateTransfer(transfer.id, { travellerCount: event.target.value === '' ? null : Number(event.target.value) })} />
                </Field>
                <Field label="Luggage">
                  <input className={`${inputClass} mt-1`} type="number" min="0" value={transfer.luggageCount ?? ''} onChange={(event) => updateTransfer(transfer.id, { luggageCount: event.target.value === '' ? null : Number(event.target.value) })} />
                </Field>
                {transfer.transferType === 'CargoPetPickup' && (
                  <Field label="Travel crate size">
                    <input className={`${inputClass} mt-1`} value={transfer.travelCrateSize || ''} onChange={(event) => updateTransfer(transfer.id, { travelCrateSize: event.target.value })} />
                  </Field>
                )}
              </div>
            </div>
          ))}
          {postBooking.transfers.length === 0 && <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-mute">No airport transfer is scheduled.</p>}
        </div>
      </Panel>

      <Panel title="Destination receiver / agent">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Pickup choice">
            <select
              className={`${inputClass} mt-1`}
              value={postBooking.receiver.pickupChoice}
              onChange={(event) => changeCase({
                receiver: {
                  ...postBooking.receiver,
                  pickupChoice: event.target.value,
                  ...(event.target.value === 'ClientPickup'
                    ? { agentName: '', agentEmail: '', agentPhone: '', agentPickupStatus: null }
                    : { agentPickupStatus: postBooking.receiver.agentPickupStatus || 'Pending' }),
                },
              }, 'Destination pickup choice updated', 'Pickup choice updated.')}
            >
              <option value="ClientPickup">Client pickup</option><option value="AgentPickup">Agent pickup</option>
            </select>
          </Field>
          {postBooking.receiver.pickupChoice === 'AgentPickup' && (
            <>
              <Field label="Destination agent">
                <select
                  className={`${inputClass} mt-1`}
                  value={postBooking.receiver.agentName}
                  onChange={(event) => changeCase({
                    receiver: {
                      ...postBooking.receiver,
                      agentName: event.target.value,
                      agentEmail: event.target.value ? 'operations@destination-agent.example' : '',
                      agentPickupStatus: event.target.value ? 'Pending' : null,
                    },
                  })}
                >
                  <option value="">Choose a demo agent</option>
                  <option>Northstar Pet Travel</option><option>Harbour Animal Logistics</option><option>Client-managed agent</option>
                </select>
              </Field>
              <Field label="Agent email">
                <input className={`${inputClass} mt-1`} type="email" value={postBooking.receiver.agentEmail || ''} onChange={(event) => changeCase({ receiver: { ...postBooking.receiver, agentEmail: event.target.value } })} />
              </Field>
              <Field label="Agent phone">
                <input className={`${inputClass} mt-1`} type="tel" value={postBooking.receiver.agentPhone || ''} onChange={(event) => changeCase({ receiver: { ...postBooking.receiver, agentPhone: event.target.value } })} />
              </Field>
              <Field label="Agent pickup status">
                <select className={`${inputClass} mt-1`} value={postBooking.receiver.agentPickupStatus || 'Pending'} onChange={(event) => {
                  const nextStatus = event.target.value;
                  if (nextStatus === 'Confirmed' && !postBooking.receiver.agentEmail && !postBooking.receiver.agentPhone) {
                    setAgentError('Add an agent phone number or email before confirming pickup.');
                    return;
                  }
                  setAgentError('');
                  changeCase({ receiver: { ...postBooking.receiver, agentPickupStatus: nextStatus, agentRespondedAt: nextStatus === 'Pending' ? null : new Date().toISOString() } }, `Agent pickup ${nextStatus.toLowerCase()}`, 'Agent response updated.');
                }}>
                  <option>Pending</option><option>Confirmed</option><option>Unavailable</option>
                </select>
              </Field>
              <Field label="Departure contact status">
                <select className={`${inputClass} mt-1`} value={postBooking.receiver.departureContactStatus || 'Pending'} onChange={(event) => {
                  const nextStatus = event.target.value;
                  if (nextStatus === 'Confirmed' && !postBooking.receiver.agentEmail && !postBooking.receiver.agentPhone) {
                    setAgentError('Add an agent phone number or email before confirming departure contact.');
                    return;
                  }
                  setAgentError('');
                  changeCase({ receiver: { ...postBooking.receiver, departureContactStatus: nextStatus, departureNotifiedAt: nextStatus === 'Pending' ? null : new Date().toISOString() } }, `Agent departure contact ${nextStatus.toLowerCase()}`, 'Agent contact updated.');
                }}>
                  <option>Pending</option><option>Confirmed</option><option>Unavailable</option>
                </select>
              </Field>
            </>
          )}
          <Field label="Availability notes" className="block sm:col-span-2 xl:col-span-3">
            <textarea className={`${inputClass} mt-1 min-h-20`} value={postBooking.receiver.availabilityNotes || ''} onChange={(event) => changeCase({ receiver: { ...postBooking.receiver, availabilityNotes: event.target.value } })} />
          </Field>
        </div>
        {agentError && <p role="alert" className="mt-3 text-sm text-red-700">{agentError}</p>}
        {postBooking.receiver.pickupChoice === 'AgentPickup' && !postBooking.receiver.agentEmail && !postBooking.receiver.agentPhone && (
          <p className="mt-3 text-sm text-amber-800">Add a phone number or email before confirming an agent pickup.</p>
        )}
      </Panel>
      {timeError && <p role="alert" className="text-sm text-red-700">{timeError}</p>}
    </>
  );
}

function DocumentsPanel({ postBooking, booking, onSave, onTab }) {
  const updateDocument = (documentId, changes, activityText) => {
    const documents = postBooking.documents.map((document) =>
      document.id === documentId ? { ...document, ...changes } : document,
    );
    onSave({ documents }, activityText, activityText ? 'Checklist updated.' : '');
  };
  return (
    <>
      <Panel title="Document and approval checklist" action={<Chip className="bg-amber-50 text-amber-800">Prototype-only checklist · No uploads</Chip>}>
        <p className="mb-4 text-sm text-mute">
          Demo items for {booking.dir.toLowerCase()} · {postBooking.journey.destinationCountryCode} · {MODES[booking.mode]}. Requirements are illustrative and are not regulatory advice.
        </p>
        <div className="space-y-3">
          {postBooking.documents.map((document) => (
            <div key={document.id} className="grid gap-3 rounded-xl border border-line p-4 md:grid-cols-[1fr_200px_180px]">
              <div>
                <p className="font-semibold">{document.name}</p>
                <Field label="Remarks" className="mt-2 block">
                  <input className={`${inputClass} mt-1`} value={document.remarks || ''} onChange={(event) => updateDocument(document.id, { remarks: event.target.value })} />
                </Field>
              </div>
              <Field label="Demo status">
                <select className={`${inputClass} mt-1`} value={document.status} onChange={(event) => updateDocument(document.id, { status: event.target.value }, `${document.name} marked ${event.target.value}`)}>
                  {DOCUMENT_STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
              </Field>
              <Field label="Owner">
                <select className={`${inputClass} mt-1`} value={document.owner || 'Maya Chen'} onChange={(event) => updateDocument(document.id, { owner: event.target.value })}>
                  {TASK_USERS.map((user) => <option key={user}>{user}</option>)}
                </select>
              </Field>
              <Button className="md:col-span-3 md:justify-self-start" onClick={() => onTab('journey')}>Open linked journey</Button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-mute">The real schema has no general document checklist, template or file store. No attachment is uploaded or retained.</p>
      </Panel>
    </>
  );
}

function ActivityPanel({ postBooking, onAddNote, onOutcome, onTab }) {
  const [note, setNote] = useState('');
  const submitNote = (event) => {
    event.preventDefault();
    const text = note.trim();
    if (!text) return;
    onAddNote(text);
    setNote('');
  };
  const activities = [
    ...postBooking.notes.map((item) => ({ ...item, type: 'Note', actor: item.actor })),
    ...postBooking.activity,
  ].sort((a, b) => new Date(b.at) - new Date(a.at));

  return (
    <>
      <Panel title="Case notes" action={<Chip className="bg-amber-50 text-amber-800">Demo activity · Not persisted</Chip>}>
        <form onSubmit={submitNote}>
          <label className="block text-xs font-medium text-mute" htmlFor="postbooking-note">Add a note</label>
          <textarea id="postbooking-note" className={`${inputClass} mt-1 min-h-24`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Write an internal demo note…" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button primary type="submit" disabled={!note.trim()}>Add note</Button>
            <Button onClick={onOutcome}>Set demo case outcome</Button>
            {postBooking.outcome && <Chip className="bg-purple-100 text-purple-800">{postBooking.outcome.outcome} · demo only</Chip>}
          </div>
          {postBooking.outcome && <p className="mt-2 text-xs text-mute">{postBooking.outcome.reason}</p>}
        </form>
      </Panel>

      <Panel title="Activity timeline">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 border-l-2 border-brand/30 pl-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{activity.text}</p>
                <p className="mt-1 text-xs text-mute">{activity.actor || 'Demo user'} · {formatDateTime(activity.at)}</p>
              </div>
              {activity.type && <Chip className="h-fit bg-stone-100 text-ink">{activity.type}</Chip>}
            </div>
          ))}
          {activities.length === 0 && <p className="text-sm text-mute">No activity recorded.</p>}
        </div>
      </Panel>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onTab('journey')}>Open journey</Button>
        <Button onClick={() => onTab('tasks')}>Open tasks</Button>
        <Button onClick={() => onTab('documents')}>Open documents</Button>
      </div>
      <p className="text-xs text-mute">Demo outcomes do not alter the SQL-shaped workflow status.</p>
    </>
  );
}
