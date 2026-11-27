import { MODES } from '../../data/reference.js';

export const POST_BOOKING_STATUS = {
  PendingReview: { label: 'Pending intake review', style: 'bg-yellow-100 text-yellow-800' },
  AwaitingDownPayment: { label: 'Awaiting down payment', style: 'bg-orange-100 text-orange-800' },
  OperationsActive: { label: 'Operations active', style: 'bg-green-100 text-green-800' },
};

export const TASK_USERS = ['Maya Chen', 'Omar Ali', 'Noor Rahman', 'Samir Patel'];

export const DOCUMENT_STATUSES = [
  'Requested',
  'In preparation',
  'Ready for review',
  'Shared with agent',
  'Confirmed',
];

export const FLIGHT_STATUSES = ['Scheduled', 'Delayed', 'Departed', 'Arrived', 'Cancelled'];

export const TIME_ZONES = [
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Qatar',
  'Asia/Singapore',
  'America/Toronto',
  'Australia/Melbourne',
  'Australia/Sydney',
];

export const formatDateTime = (value, timeZone = 'Asia/Dubai') => {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(new Date(value));
};

export const formatDateOnly = (value, timeZone = 'Asia/Dubai') => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone,
  }).format(new Date(value));
};

export const dateInputValue = (value = new Date()) => {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const dateInTimeZone = (value, timeZone = 'Asia/Dubai') => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).formatToParts(new Date(value));
  const part = (type) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
};

export const toDateTimeLocal = (value, timeZone = 'Asia/Dubai') => {
  if (!value) return '';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const part = (type) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
};

export const fromDateTimeLocal = (value, timeZone = 'Asia/Dubai') => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const desired = match.slice(1).map(Number);
  const desiredUtc = Date.UTC(desired[0], desired[1] - 1, desired[2], desired[3], desired[4]);
  let timestamp = desiredUtc;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(timestamp));
    const part = (type) => Number(parts.find((item) => item.type === type)?.value);
    const representedUtc = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'));
    const next = desiredUtc - (representedUtc - timestamp);
    if (next === timestamp) break;
    timestamp = next;
  }

  if (toDateTimeLocal(new Date(timestamp).toISOString(), timeZone) !== value) return null;
  return new Date(timestamp).toISOString();
};

export const latestFlightStatus = (leg) =>
  [...(leg.statusEvents ?? [])].sort((a, b) => new Date(b.statusAt) - new Date(a.statusAt))[0] ?? null;

export const isOpenTask = (task) => !['Completed', 'Reassigned'].includes(task.status);

export const routeCheck = (journey, legs) => {
  if (!legs.length) return 'No flight legs';
  const ordered = [...legs].sort((a, b) => a.legNumber - b.legNumber);
  if (journey.originAirportCode && ordered[0].departureAirportCode !== journey.originAirportCode) {
    return 'First departure mismatch';
  }
  if (
    journey.finalDestinationAirportCode &&
    ordered[ordered.length - 1].arrivalAirportCode !== journey.finalDestinationAirportCode
  ) {
    return 'Final arrival mismatch';
  }
  for (let index = 0; index < ordered.length - 1; index += 1) {
    if (ordered[index].arrivalAirportCode !== ordered[index + 1].departureAirportCode) {
      return 'Connection airport mismatch';
    }
  }
  return 'Route OK';
};

export const getAttentionItems = (cases, bookings) => {
  const items = [];
  cases.forEach((postBooking) => {
    const booking = bookings.find((item) => item.id === postBooking.bookingId);
    if (!booking) return;
    const push = (issue, action, owner, section, detail = '') =>
      items.push({
        id: `${postBooking.id}-${issue}`,
        caseId: postBooking.bookingId,
        ref: booking.ref,
        route: booking.route,
        issue,
        action,
        owner,
        section,
        detail,
      });

    if (postBooking.workflowStatus === 'PendingReview') {
      push('New intake submitted', 'Review intake', 'Post-Booking', 'overview');
    }
    if (postBooking.workflowStatus === 'AwaitingDownPayment') {
      push('Down payment pending', 'Confirm down payment', 'Accounts', 'payments');
    }
    if (
      postBooking.workflowStatus === 'OperationsActive' &&
      postBooking.transfers.some((transfer) => transfer.transferType === 'CargoPetPickup' && !transfer.assignedTo)
    ) {
      push('Cargo pickup unassigned', 'Assign a PRO', 'Ground Logistics', 'operations');
    }
    if (
      postBooking.workflowStatus === 'OperationsActive' &&
      postBooking.moccaeVisits.some((visit) => visit.petApprovals.some((pet) => pet.approvalStatus === 'Pending'))
    ) {
      push('MOCCAE approval pending', 'Review pet approval', 'Post-Booking', 'operations');
    }
    const delayedLeg = postBooking.flightLegs.find((leg) => latestFlightStatus(leg)?.flightStatus === 'Delayed');
    if (delayedLeg) {
      push(
        delayedLeg.legNumber > 1 ? 'Connecting flight delayed' : 'Flight delayed',
        'Review affected flight leg',
        'Post-Booking',
        'journey',
        formatDateTime(delayedLeg.scheduledArrivalAt, delayedLeg.arrivalTimeZone),
      );
    }
    if (
      postBooking.workflowStatus === 'OperationsActive' &&
      postBooking.receiver.pickupChoice === 'AgentPickup' &&
      postBooking.receiver.agentPickupStatus === 'Pending'
    ) {
      push(
        'Agent pickup not confirmed',
        'Reconfirm agent pickup',
        'Post-Booking',
        'operations',
        formatDateTime(postBooking.flightLegs.at(-1)?.scheduledArrivalAt, postBooking.journey.destinationTimeZone),
      );
    }
  });
  return items;
};

export const getOperationalEvents = (cases, bookings) => {
  const events = [];
  const addEvent = (postBooking, booking, event) => {
    if (event.at) {
      events.push({
        id: event.id,
        caseId: postBooking.bookingId,
        ref: booking.ref,
        route: booking.route,
        ...event,
      });
    }
  };

  cases.forEach((postBooking) => {
    const booking = bookings.find((item) => item.id === postBooking.bookingId);
    if (!booking) return;
    postBooking.moccaeVisits.forEach((visit) =>
      addEvent(postBooking, booking, {
        id: visit.id,
        at: visit.scheduledAt,
        timeZone: 'Asia/Dubai',
        type: 'MOCCAE appointment',
        detail: `${visit.taskAssignee || 'PRO unassigned'} · ${booking.pets.length} pet${booking.pets.length === 1 ? '' : 's'}`,
        section: 'operations',
        assignedTo: visit.taskAssignee || '',
      }),
    );
    postBooking.transfers.forEach((transfer) =>
      addEvent(postBooking, booking, {
        id: transfer.id,
        at: transfer.scheduledPickupAt,
        timeZone: 'Asia/Dubai',
        type: transfer.transferType === 'CargoPetPickup' ? 'Cargo pickup' : 'Airport taxi',
        detail: `${transfer.assignedTo || 'PRO unassigned'} · ${transfer.dropOffAirportCode}`,
        section: 'operations',
        assignedTo: transfer.assignedTo || '',
      }),
    );
    postBooking.flightLegs.forEach((leg) => {
      addEvent(postBooking, booking, {
        id: `${leg.id}-departure`,
        at: leg.scheduledDepartureAt,
        timeZone: leg.departureTimeZone,
        type: 'Flight departure',
        detail: `${leg.departureAirportCode} → ${leg.arrivalAirportCode} ${leg.flightNumber}`,
        section: 'journey',
        assignedTo: '',
      });
      addEvent(postBooking, booking, {
        id: `${leg.id}-arrival`,
        at: leg.scheduledArrivalAt,
        timeZone: leg.arrivalTimeZone,
        type: 'Flight arrival',
        detail: `${leg.departureAirportCode} → ${leg.arrivalAirportCode} ${leg.flightNumber}`,
        section: 'journey',
        assignedTo: '',
      });
    });
    if (postBooking.landTransport?.scheduledDepartureAt) {
      addEvent(postBooking, booking, {
        id: `${postBooking.landTransport.id ?? postBooking.id}-land-departure`,
        at: postBooking.landTransport.scheduledDepartureAt,
        timeZone: 'Asia/Dubai',
        type: 'Land departure',
        detail: `${postBooking.landTransport.departureLocation} → ${postBooking.landTransport.arrivalLocation}`,
        section: 'operations',
        assignedTo: '',
      });
    }
    if (postBooking.landTransport?.scheduledArrivalAt) {
      addEvent(postBooking, booking, {
        id: `${postBooking.landTransport.id ?? postBooking.id}-land-arrival`,
        at: postBooking.landTransport.scheduledArrivalAt,
        timeZone: postBooking.journey.destinationTimeZone,
        type: 'Land arrival',
        detail: `${postBooking.landTransport.departureLocation} → ${postBooking.landTransport.arrivalLocation}`,
        section: 'operations',
        assignedTo: '',
      });
    }
  });
  return events.sort((a, b) => new Date(a.at) - new Date(b.at));
};

export const isDateTbd = (postBooking) =>
  Boolean(
    postBooking.journey.plannedTravelMonth &&
    !postBooking.flightLegs.some((leg) => leg.scheduledDepartureAt) &&
    !postBooking.landTransport?.scheduledDepartureAt,
  );

export const travelModeLabel = (booking) => MODES[booking.mode] ?? booking.mode;
