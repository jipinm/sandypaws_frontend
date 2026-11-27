const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

const routeCode = (place, fallback) => {
  const known = {
    'Abu Dhabi': 'AUH',
    Dubai: 'DXB',
    Doha: 'DOH',
    Frankfurt: 'FRA',
    London: 'LHR',
    Paris: 'CDG',
    Toronto: 'YYZ',
    Singapore: 'SIN',
    Melbourne: 'MEL',
    Sydney: 'SYD',
  };
  return known[place] ?? fallback ?? place?.slice(0, 3).toUpperCase() ?? '';
};

const routeParts = (route = '') =>
  route.split(/\s*(?:→|->)\s*/).map((part) => part.trim());

const statusFor = (booking) => {
  if (booking.stage === 'Active') return 'OperationsActive';
  return booking.stage;
};

const defaultTask = (bookingId, workflowStatus) => {
  if (workflowStatus === 'PendingReview') {
    return [{
      id: `task-${bookingId}-intake`,
      type: 'Intake review',
      team: 'PostBooking',
      assignee: null,
      status: 'Queued',
      assignedAt: null,
      startedAt: null,
      completedAt: null,
    }];
  }
  if (workflowStatus === 'AwaitingDownPayment') {
    return [
      {
        id: `task-${bookingId}-intake`,
        type: 'Intake review',
        team: 'PostBooking',
        assignee: 'Maya Chen',
        status: 'Completed',
        assignedAt: hoursFromNow(-48),
        startedAt: hoursFromNow(-47),
        completedAt: hoursFromNow(-46),
      },
      {
        id: `task-${bookingId}-payment`,
        type: 'Payment confirmation',
        team: 'Accounts',
        assignee: null,
        status: 'Queued',
        assignedAt: null,
        startedAt: null,
        completedAt: null,
      },
    ];
  }
  return [
    {
      id: `task-${bookingId}-intake`,
      type: 'Intake review',
      team: 'PostBooking',
      assignee: 'Maya Chen',
      status: 'Completed',
      assignedAt: hoursFromNow(-120),
      startedAt: hoursFromNow(-119),
      completedAt: hoursFromNow(-118),
    },
    {
      id: `task-${bookingId}-payment`,
      type: 'Payment confirmation',
      team: 'Accounts',
      assignee: 'Omar Ali',
      status: 'Completed',
      assignedAt: hoursFromNow(-110),
      startedAt: hoursFromNow(-109),
      completedAt: hoursFromNow(-108),
    },
  ];
};

const caseDetails = {
  1038: {
    workflowStatus: 'OperationsActive',
    task: {
      type: 'Cargo pet pickup',
      team: 'GroundLogistics',
      assignee: null,
      status: 'Queued',
    },
    flight: {
      airline: 'Emirates SkyCargo',
      number: 'EK 048',
      departureHours: 34,
      arrivalHours: 39,
    },
    transfer: {
      type: 'CargoPetPickup',
      pickupHours: 28,
      pickupAddress: 'Al Raha Gardens, Abu Dhabi',
      airport: 'AUH',
      terminal: 'Cargo terminal',
      travellerCount: 0,
      luggageCount: 0,
      taskType: 'Cargo pet pickup',
    },
  },
  1042: {
    workflowStatus: 'OperationsActive',
    task: {
      type: 'MOCCAE appointment',
      team: 'GroundLogistics',
      assignee: 'Noor Rahman',
      status: 'Assigned',
    },
    flight: {
      airline: 'British Airways',
      number: 'BA 106',
      departureHours: 54,
      arrivalHours: 62,
    },
    moccae: {
      arrangement: 'SandyPawsTaxi',
      scheduledHours: 23,
      taskAssignee: 'Noor Rahman',
      petApprovalIndexes: [0, 1],
    },
    transfer: {
      type: 'PassengerTaxi',
      pickupHours: 50,
      pickupAddress: 'Dubai Marina',
      airport: 'DXB',
      terminal: 'Terminal 1',
      travellerCount: 2,
      luggageCount: 3,
      taskType: 'Airport taxi',
      assignee: 'Noor Rahman',
    },
  },
  1045: {
    workflowStatus: 'OperationsActive',
    flight: {
      airline: 'Air France',
      number: 'AF 659',
      departureHours: 76,
      arrivalHours: 83,
    },
    receiver: {
      pickupChoice: 'AgentPickup',
      agentName: 'Northstar Pet Travel',
      agentEmail: 'hello@northstar.example',
      agentPickupStatus: 'Pending',
      departureContactStatus: 'Pending',
      availabilityNotes: 'Please confirm arrival handoff.',
    },
  },
  1031: {
    workflowStatus: 'OperationsActive',
    connectingRoute: ['DXB', 'LHR', 'YYZ'],
    flight: {
      airline: 'Air Canada',
      number: 'AC 859',
      departureHours: 47,
      arrivalHours: 69,
      delayedLeg: 2,
    },
  },
  1029: {
    workflowStatus: 'OperationsActive',
    flight: {
      airline: 'Lufthansa',
      number: 'LH 631',
      departureHours: 42,
      arrivalHours: 49,
    },
  },
  1050: {
    workflowStatus: 'AwaitingDownPayment',
    flight: {
      airline: 'Private charter',
      number: 'SPJ 204',
      departureHours: 120,
      arrivalHours: 127,
    },
  },
  1053: {
    workflowStatus: 'PendingReview',
    flight: {
      airline: 'Qantas',
      number: 'QF 8420',
      departureHours: 160,
      arrivalHours: 171,
    },
  },
  1049: {
    workflowStatus: 'AwaitingDownPayment',
  },
  1051: {
    workflowStatus: 'PendingReview',
    landTransport: {
      vehicleType: 'Comfort van',
      departureLocation: 'Abu Dhabi',
      arrivalLocation: 'Doha',
      scheduledDepartureAt: null,
      scheduledArrivalAt: null,
    },
  },
};

const cityByCode = {
  CDG: ['FR', 'Paris', 'Europe/Paris'],
  DOH: ['QA', 'Doha', 'Asia/Qatar'],
  FRA: ['DE', 'Frankfurt', 'Europe/Berlin'],
  LHR: ['GB', 'London', 'Europe/London'],
  MEL: ['AU', 'Melbourne', 'Australia/Melbourne'],
  SIN: ['SG', 'Singapore', 'Asia/Singapore'],
  SYD: ['AU', 'Sydney', 'Australia/Sydney'],
  YYZ: ['CA', 'Toronto', 'America/Toronto'],
};

const airportTimeZones = {
  AUH: 'Asia/Dubai',
  DXB: 'Asia/Dubai',
  DOH: 'Asia/Qatar',
  CDG: 'Europe/Paris',
  FRA: 'Europe/Berlin',
  LHR: 'Europe/London',
  YYZ: 'America/Toronto',
  MEL: 'Australia/Melbourne',
  SYD: 'Australia/Sydney',
  SIN: 'Asia/Singapore',
};

const makeLeg = (caseId, legNumber, from, to, options = {}) => ({
  id: `leg-${caseId}-${legNumber}`,
  legNumber,
  carrierName: options.airline ?? 'SandyPaws Air',
  flightNumber: options.number ?? `SP ${caseId}`,
  departureAirportCode: from,
  arrivalAirportCode: to,
  scheduledDepartureAt: hoursFromNow(options.departureHours ?? 48 + legNumber * 8),
  scheduledArrivalAt: hoursFromNow(options.arrivalHours ?? 54 + legNumber * 8),
  departureTimeZone: airportTimeZones[from] ?? 'Asia/Dubai',
  arrivalTimeZone: airportTimeZones[to] ?? 'Europe/London',
  statusEvents: options.delayed
    ? [{
        id: `flight-event-${caseId}-${legNumber}-1`,
        flightStatus: 'Delayed',
        statusAt: hoursFromNow(3),
        source: 'Operator',
        recordedBy: 'Maya Chen',
      }]
    : [],
});

const makePaymentRequests = (bookingId, workflowStatus) => {
  if (workflowStatus === 'PendingReview') return [];
  const confirmed = workflowStatus === 'OperationsActive';
  return [{
    id: `payment-${bookingId}-initial`,
    paymentType: 'Initial',
    amount: 2850 + (bookingId % 5) * 250,
    currency: 'AED',
    payer: 'Client',
    dueDate: hoursFromNow(72),
    description: 'Initial relocation coordination',
    collectionStatus: confirmed ? 'Confirmed' : 'Pending',
    receivedAmount: confirmed ? 2850 + (bookingId % 5) * 250 : 0,
  }];
};

const makeDocuments = (bookingId) => [
  { id: `document-${bookingId}-vaccination`, name: 'Pet vaccination record', status: 'Confirmed', remarks: '', owner: 'Maya Chen' },
  { id: `document-${bookingId}-owner`, name: 'Owner travel document', status: 'Shared with agent', remarks: '', owner: 'Omar Ali' },
  { id: `document-${bookingId}-travel`, name: 'Travel approval checklist', status: 'In preparation', remarks: '', owner: 'Noor Rahman' },
];

const makeCase = (booking) => {
  const config = caseDetails[booking.id] ?? {};
  const workflowStatus = config.workflowStatus ?? statusFor(booking);
  const [routeFrom, routeTo] = routeParts(booking.route);
  const fromAirport = routeCode(routeFrom, 'DXB');
  const toAirport = routeCode(routeTo, 'LHR');
  const destination = cityByCode[toAirport] ?? ['GB', routeTo || 'Destination', 'Europe/London'];
  const landMode = booking.mode === 'LandTransport';
  const journeyId = `journey-${booking.id}`;
  const petCount = booking.pets.length;
  const plannedMonth = booking.month || null;
  const legRoute = config.connectingRoute ?? [fromAirport, toAirport];
  const flight = config.flight;
  const flightLegs = landMode || !flight
    ? []
    : legRoute.slice(0, -1).map((from, index) =>
        makeLeg(booking.id, index + 1, from, legRoute[index + 1], {
          ...flight,
          number: legRoute.length > 2 ? `${flight.number}-${index + 1}` : flight.number,
          delayed: flight.delayedLeg === index + 1,
          departureHours: flight.departureHours + index * 12,
          arrivalHours: flight.arrivalHours + index * 12,
        }),
      );
  const tasks = defaultTask(booking.id, workflowStatus);
  if (config.task) {
    tasks.push({
      id: `task-${booking.id}-operations`,
      type: config.task.type,
      team: config.task.team,
      assignee: config.task.assignee,
      status: config.task.status,
      assignedAt: config.task.assignee ? hoursFromNow(-8) : null,
      startedAt: null,
      completedAt: null,
    });
  }

  const moccaeVisits = config.moccae
    ? [{
        id: `moccae-${booking.id}-1`,
        arrangement: config.moccae.arrangement,
        clientConfirmationStatus: 'Confirmed',
        scheduledAt: hoursFromNow(config.moccae.scheduledHours),
        pickupAddress: 'Dubai Marina',
        returnAddress: 'Dubai Marina',
        taskId: `task-${booking.id}-operations`,
        taskAssignee: config.moccae.taskAssignee,
        petApprovals: Array.from({ length: petCount }, (_, index) => ({
          petIndex: index,
          approvalStatus: config.moccae.petApprovalIndexes.includes(index) && index === 0 ? 'Approved' : 'Pending',
          decisionAt: config.moccae.petApprovalIndexes.includes(index) && index === 0 ? hoursFromNow(-2) : null,
          notes: '',
        })),
        actualPetPickupAt: null,
        actualPetReturnedAt: null,
        clientArrivedAt: null,
        clientExitedAt: null,
      }]
    : [];

  const transfer = config.transfer
    ? [{
        id: `transfer-${booking.id}-1`,
        transferType: config.transfer.type,
        taskId: `task-${booking.id}-operations`,
        taskType: config.transfer.taskType,
        assignedTo: config.transfer.assignee ?? config.task?.assignee ?? null,
        scheduledPickupAt: hoursFromNow(config.transfer.pickupHours),
        pickupAddress: config.transfer.pickupAddress,
        dropOffAirportCode: config.transfer.airport,
        dropOffTerminal: config.transfer.terminal,
        travellerCount: config.transfer.travellerCount,
        luggageCount: config.transfer.luggageCount,
        petIndexes: Array.from({ length: petCount }, (_, index) => index),
        travelCrateSize: 'Medium',
      }]
    : [];

  const activity = [{
    id: `activity-${booking.id}-created`,
    text: 'Export case created and queued for intake review',
    at: hoursFromNow(-72),
    actor: booking.by || 'Maya Chen',
  }];
  if (workflowStatus !== 'PendingReview') {
    activity.push({
      id: `activity-${booking.id}-intake`,
      text: 'Intake review approved',
      at: hoursFromNow(-48),
      actor: 'Maya Chen',
    });
  }
  if (workflowStatus === 'OperationsActive') {
    activity.push({
      id: `activity-${booking.id}-payment`,
      text: 'Accounts confirmed initial payment (demo)',
      at: hoursFromNow(-36),
      actor: 'Omar Ali',
    });
  }

  return {
    id: booking.id,
    bookingId: booking.id,
    ref: booking.ref,
    workflowStatus,
    journey: {
      id: journeyId,
      plannedTravelMonth: plannedMonth,
      originAirportCode: landMode ? null : fromAirport,
      finalDestinationAirportCode: landMode ? null : toAirport,
      destinationCountryCode: destination[0],
      destinationCity: destination[1],
      destinationTimeZone: destination[2],
      passengerTicketNumber: booking.mode === 'InCabin' || booking.mode === 'ExcessBaggage'
        ? `TKT-${booking.id}-DEMO`
        : '',
      airWaybillNumber: booking.mode === 'ManifestCargo' || booking.mode === 'PrivateJet'
        ? `AWB-${booking.id}-DEMO`
        : '',
      cargoFlightType: booking.mode === 'ManifestCargo' ? 'Commercial' : '',
      landVehicleType: landMode ? config.landTransport?.vehicleType ?? 'Comfort van' : '',
    },
    flightLegs,
    tasks,
    payments: makePaymentRequests(booking.id, workflowStatus),
    moccaeVisits,
    flightDay: {
      clientConfirmationStatus: 'Pending',
      clientConfirmedAt: null,
      airportAssistanceRequired: null,
      taxiRequired: null,
      cargoCheckInChoice: null,
    },
    transfers: transfer,
    landTransport: config.landTransport ? { ...config.landTransport } : null,
    receiver: config.receiver
      ? { ...config.receiver, agentRespondedAt: null, departureNotifiedAt: null }
      : {
          pickupChoice: 'ClientPickup',
          clientName: '',
          agentName: '',
          agentEmail: '',
          agentPhone: '',
          agentPickupStatus: null,
          departureContactStatus: null,
          availabilityNotes: '',
          agentRespondedAt: null,
          departureNotifiedAt: null,
        },
    documents: makeDocuments(booking.id),
    notes: [],
    activity,
    outcome: null,
  };
};

export const createPostBookingCases = (bookings) =>
  bookings.filter((booking) => booking.dir === 'Export').map(makeCase);

export const createPostBookingCase = (booking) => makeCase(booking);
