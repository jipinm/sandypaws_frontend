/* Fictional sample data */
import { makePet as pet } from '../lib/records.js';

export const CLIENTS = [
  [1, 'Amelia Hart', '+971501234567', 'amelia.hart@example.com', 'Palm Jumeirah, Dubai'],
  [2, 'Rohan Mehta', '+971502345678', 'rohan.mehta@example.com', 'JLT, Dubai'],
  [3, 'Sven Larsson', '+971503456789', 'sven.larsson@example.com', 'Al Raha Gardens, Abu Dhabi'],
  [4, 'Fatima Al Zaabi', '+971504567890', 'fatima.zaabi@example.com', 'Khalifa City, Abu Dhabi'],
  [5, 'Lucas Moreau', '+971505678901', 'lucas.moreau@example.com', 'Dubai Marina'],
  [6, 'Chloe Bennett', '+971506789012', 'chloe.bennett@example.com', 'Downtown Dubai'],
  [7, 'Arjun Patel', '+971507890123', 'arjun.patel@example.com', 'Business Bay, Dubai'],
  [8, 'Mia Fischer', '+971508901234', 'mia.fischer@example.com', 'Emirates Hills, Dubai'],
  [9, 'Tariq Haddad', '+971509012345', 'tariq.haddad@example.com', 'Yas Island, Abu Dhabi'],
  [10, 'Olivia Grant', '+971500123456', 'olivia.grant@example.com', 'Arabian Ranches, Dubai'],
].map(([id, name, phone, email, address]) => ({ id, name, phone, email, address }));

const booking = (id, ref, cid, dir, mode, pets, stage, extra) => ({
  id, ref, cid, dir, mode, pets, stage,
  prefs: '', by: 'Layla Haddad', created: '18 Nov 2026',
  ...extra,
});

export const PRE_BOOKINGS = [
  booking(1038, 'SP-1038', 3, 'Export', 'ManifestCargo', [pet('dog', 'German Shepherd', 'Completed')], 'Active',
    { route: 'AUH → FRA', dep: '2026-11-25', prefs: 'Cargo pickup from the villa, afternoon.' }),
  booking(1042, 'SP-1042', 5, 'Export', 'InCabin',
    [pet('dog', 'Labrador Retriever', 'Completed'), pet('cat', 'Persian', ['Completed', 'Pending', 'Pending'])], 'Active',
    { route: 'DXB → LHR', dep: '2026-11-24', prefs: 'Both pets travel in the same taxi.' }),
  booking(1045, 'SP-1045', 6, 'Export', 'InCabin', [pet('cat', 'British Shorthair', 'Completed')], 'Active',
    { route: 'DXB → CDG', dep: '2026-11-25' }),
  booking(1031, 'SP-1031', 2, 'Export', 'ExcessBaggage', [pet('dog', 'Golden Retriever', 'Completed')], 'Active',
    { route: 'DXB → YYZ', dep: '2026-11-25', prefs: 'Connecting flight via London.' }),
  booking(1029, 'SP-1029', 4, 'Export', 'ManifestCargo', [pet('cat', 'Siamese', 'Completed')], 'Active',
    { route: 'AUH → FRA', dep: '2026-11-24' }),
  booking(1050, 'SP-1050', 8, 'Export', 'PrivateJet', [pet('dog', '', '')], 'AwaitingDownPayment',
    { route: 'DXB → SIN', dep: '2026-12-02' }),
  booking(1053, 'SP-1053', 10, 'Export', 'InCabin', [pet('dog', 'Labrador Retriever', 'Unconfirmed')], 'PendingReview',
    { route: 'DXB → MEL', created: '24 Nov 2026' }),
  booking(1049, 'SP-1049', 7, 'Export', 'ManifestCargo',
    [pet('dog', 'French Bulldog', 'Pending'), pet('dog', 'Mixed breed', 'Pending')], 'AwaitingDownPayment',
    { route: 'Dubai → Sydney', month: 'March 2027' }),
  booking(1051, 'SP-1051', 9, 'Export', 'LandTransport', [pet('cat', 'Domestic Shorthair', 'Unconfirmed')], 'PendingReview',
    { route: 'Abu Dhabi → Doha', month: 'February 2027' }),
  booking(1060, 'PB-1060', 1, 'Import', 'InCabin',
    [pet('cat', 'Persian', ['Completed', 'Unconfirmed', 'Unconfirmed'])], 'NotHandedOver',
    { prefs: 'Arriving at Abu Dhabi (AUH).', created: '23 Nov 2026' }),
];

export const ATTENTION = [
  { id: 1038, issue: 'Cargo pickup unassigned', detail: 'Pickup 24 Nov · 16:00 GST', action: 'Assign a PRO', owner: 'Ground Logistics' },
  { id: 1042, issue: 'MOCCAE approval pending', detail: '1 of 2 pets · 24 Nov, 21:15 GST', action: 'Review pet approval', owner: 'Post-Booking' },
  { id: 1045, issue: 'Arrival time changed', detail: 'Travel 25 Nov · 08:40 GST', action: 'Reconfirm agent pickup', owner: 'Post-Booking' },
  { id: 1031, issue: 'Connecting flight delayed', detail: 'Arrival 25 Nov · 16:50 EST', action: 'Review affected flight leg', owner: 'Post-Booking' },
  { id: 1050, issue: 'Down payment pending', detail: '', action: 'Confirm down payment', owner: 'Accounts' },
  { id: 1053, issue: 'New intake submitted', detail: '', action: 'Review intake', owner: 'Post-Booking' },
];

/* day = days after "today" (24 Nov 2026) */
export const EVENTS = [
  { time: '10:30', zone: 'GST', title: 'MOCCAE appointment', detail: 'SP-1042 · Assigned to Noor', day: 0 },
  { time: '16:00', zone: 'GST', title: 'Cargo pickup', detail: 'SP-1038 · PRO unassigned', day: 0 },
  { time: '16:20', zone: 'CET', title: 'Flight arrival · Frankfurt', detail: 'SP-1029 · AUH → FRA', day: 0 },
  { time: '21:15', zone: 'GST', title: 'Flight departure · Dubai', detail: 'SP-1042 · DXB → LHR', day: 0 },
  { time: '08:40', zone: 'GST', title: 'Flight departure · Dubai', detail: 'SP-1045 · DXB → CDG', day: 1 },
  { time: '13:40', zone: 'GMT', title: 'Connecting flight departure · London', detail: 'SP-1031 · LHR → YYZ', day: 1 },
  { time: '09:00', zone: 'GST', title: 'Private jet departure · Dubai', detail: 'SP-1050 · DXB → SIN', day: 6 },
];
