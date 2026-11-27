import { useCallback, useRef, useState } from 'react';
import { CLIENTS, PRE_BOOKINGS } from '../data/seed.js';
import { NEXT_VACCINE_STATUS } from '../data/reference.js';
import { makePet, monthLabel } from '../lib/records.js';

/** In-memory stand-in for the backend: clients, pre-bookings and the actions on them. */
export function useBookingStore() {
  const [bookings, setBookings] = useState(PRE_BOOKINGS);
  const [clients, setClients] = useState(CLIENTS);
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
    setBookings((list) => list.map((b) => (b.id !== bookingId ? b : { ...b, stage: 'PendingReview', ref })));
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
    return record;
  };

  const findClient = useCallback((id) => clients.find((c) => c.id === id), [clients]);

  return { bookings, clients, findClient, cycleVaccine, handOver, createBooking };
}
