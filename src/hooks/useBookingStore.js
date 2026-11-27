import { useCallback, useRef, useState } from 'react';
import { CLIENTS, PRE_BOOKINGS } from '../data/seed.js';
import { createPostBookingCase, createPostBookingCases } from '../data/postBookingSeed.js';
import { NEXT_VACCINE_STATUS } from '../data/reference.js';
import { makePet, monthLabel } from '../lib/records.js';

/** In-memory stand-in for the backend: clients, pre-bookings and the actions on them. */
export function useBookingStore() {
  const [bookings, setBookings] = useState(PRE_BOOKINGS);
  const [clients, setClients] = useState(CLIENTS);
  const [postBookings, setPostBookings] = useState(() => createPostBookingCases(PRE_BOOKINGS));
  const nextIds = useRef({ booking: 1061, case: 1054 });

  const cycleVaccine = (bookingId, petIndex, vaccine) =>
    setBookings((list) =>
      list.map((b) =>
        b.id !== bookingId
          ? b
          : {
              ...b,
              pets: b.pets.map((p, i) =>
                i !== petIndex ? p : { ...p, vax: { ...p.vax, [vaccine]: NEXT_VACCINE_STATUS[p.vax[vaccine]] } },
              ),
            },
      ),
    );

  const handOver = (bookingId) => {
    const ref = `SP-${nextIds.current.case++}`;
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;
    const handedOver = { ...booking, stage: 'PendingReview', ref };
    setBookings((list) => list.map((item) => (item.id !== bookingId ? item : handedOver)));
    setPostBookings((list) => {
      const existing = list.find((item) => item.bookingId === bookingId);
      if (existing) {
        return list.map((item) =>
          item.bookingId === bookingId ? { ...item, workflowStatus: 'PendingReview' } : item,
        );
      }
      return [...list, createPostBookingCase(handedOver)];
    });
  };

  const updatePostBooking = (bookingId, changes, activityText) => {
    const current = postBookings.find((item) => item.bookingId === bookingId);
    if (!current) return false;
    const patch = typeof changes === 'function' ? changes(current) : changes;
    const updated = {
      ...current,
      ...patch,
      ...(activityText
        ? {
            activity: [
              {
                id: `activity-${bookingId}-${Date.now()}`,
                text: activityText,
                at: new Date().toISOString(),
                actor: 'Maya Chen',
              },
              ...current.activity,
            ],
          }
        : {}),
    };
    setPostBookings((list) =>
      list.map((item) => (item.bookingId === bookingId ? updated : item)),
    );
    if (patch.workflowStatus) {
      const stage = patch.workflowStatus === 'OperationsActive' ? 'Active' : patch.workflowStatus;
      setBookings((list) =>
        list.map((item) => (item.id === bookingId ? { ...item, stage } : item)),
      );
    }
    return true;
  };

  const approvePostBookingIntake = (bookingId) => {
    const current = postBookings.find((item) => item.bookingId === bookingId);
    if (!current || current.workflowStatus !== 'PendingReview') return false;
    const intakeTask = current.tasks.find((task) => task.type === 'Intake review');
    const tasks = current.tasks.map((task) =>
      task === intakeTask
        ? {
            ...task,
            assignee: task.assignee ?? 'Maya Chen',
            status: 'Completed',
            assignedAt: task.assignedAt ?? new Date().toISOString(),
            startedAt: task.startedAt ?? new Date().toISOString(),
            completedAt: new Date().toISOString(),
          }
        : task,
    );
    if (!tasks.some((task) => task.type === 'Payment confirmation' && task.status !== 'Completed')) {
      tasks.push({
        id: `task-${bookingId}-payment-${Date.now()}`,
        type: 'Payment confirmation',
        team: 'Accounts',
        assignee: null,
        status: 'Queued',
        assignedAt: null,
        startedAt: null,
        completedAt: null,
      });
    }
    const payments = current.payments.length
      ? current.payments
      : [{
          id: `payment-${bookingId}-initial-demo`,
          paymentType: 'Initial',
          amount: 3000,
          currency: 'AED',
          payer: 'Client',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Initial relocation coordination (demo)',
          collectionStatus: 'Pending',
          receivedAmount: 0,
        }];
    return updatePostBooking(
      bookingId,
      { workflowStatus: 'AwaitingDownPayment', tasks, payments },
      'Intake review approved',
    );
  };

  const confirmPostBookingDownPayment = (bookingId) => {
    const current = postBookings.find((item) => item.bookingId === bookingId);
    if (
      !current ||
      current.workflowStatus !== 'AwaitingDownPayment' ||
      !current.payments.some(
        (payment) => payment.paymentType === 'Initial' && payment.collectionStatus !== 'Confirmed',
      )
    ) return false;
    const payments = current.payments.map((payment) =>
      payment.paymentType === 'Initial'
        ? { ...payment, collectionStatus: 'Confirmed', receivedAmount: payment.amount }
        : payment,
    );
    const tasks = current.tasks.map((task) =>
      task.type === 'Payment confirmation' && task.status !== 'Completed'
        ? {
            ...task,
            assignee: task.assignee ?? 'Omar Ali',
            status: 'Completed',
            assignedAt: task.assignedAt ?? new Date().toISOString(),
            startedAt: task.startedAt ?? new Date().toISOString(),
            completedAt: new Date().toISOString(),
          }
        : task,
    );
    return updatePostBooking(
      bookingId,
      { workflowStatus: 'OperationsActive', tasks, payments },
      'Accounts confirmed initial payment (demo)',
    );
  };

  const createBooking = (draft) => {
    let clientId = Number(draft.clientId);
    if (draft.clientMode === 'new') {
      clientId = Math.max(...clients.map((c) => c.id)) + 1;
      setClients([...clients, { id: clientId, ...draft.newClient, name: draft.newClient.name.trim() }]);
    }
    const id = nextIds.current.booking++;
    const isExport = draft.direction === 'Export';
    const ref = isExport ? `SP-${nextIds.current.case++}` : `PB-${id}`;
    const record = {
      id,
      ref,
      cid: clientId,
      dir: draft.direction,
      mode: draft.travelMode,
      prefs: draft.prefs,
      by: 'Rashid Khan',
      created: '24 Nov 2026',
      route: draft.route,
      month: monthLabel(draft.month),
      stage: isExport ? 'PendingReview' : 'NotHandedOver',
      pets: draft.pets.map((p) => makePet(p.type, p.breed, 'Unconfirmed')),
    };
    setBookings((list) => [record, ...list]);
    if (isExport) {
      setPostBookings((list) => [...list, createPostBookingCase(record)]);
    }
    return record;
  };

  const findClient = useCallback((id) => clients.find((c) => c.id === id), [clients]);

  return {
    bookings,
    clients,
    postBookings,
    findClient,
    cycleVaccine,
    handOver,
    createBooking,
    updatePostBooking,
    approvePostBookingIntake,
    confirmPostBookingDownPayment,
  };
}
