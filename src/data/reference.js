/* Reference data (schema: Breeds, Vaccines, BreedVaccines) */
export const BREEDS = {
  dog: ['Labrador Retriever', 'Golden Retriever', 'French Bulldog', 'German Shepherd', 'Mixed breed'],
  cat: ['Persian', 'British Shorthair', 'Siamese', 'Domestic Shorthair'],
};

export const VACCINES = {
  dog: ['Rabies', 'DHPP', 'Leptospirosis', 'Rabies titre test'],
  cat: ['Rabies', 'FVRCP', 'Rabies titre test'],
};

export const MODES = {
  InCabin: 'In-cabin',
  ExcessBaggage: 'Excess baggage',
  ManifestCargo: 'Manifest cargo',
  PrivateJet: 'Private jet',
  LandTransport: 'Land transport',
};

export const STAGES = {
  Active: { label: 'Active export', chip: 'bg-green-100 text-green-800' },
  PendingReview: { label: 'Pending intake review', chip: 'bg-yellow-100 text-yellow-800' },
  AwaitingDownPayment: { label: 'Awaiting down payment', chip: 'bg-orange-100 text-orange-800' },
  NotHandedOver: { label: 'Not handed over', chip: 'bg-stone-200 text-stone-700' },
};

export const VACCINE_STATUS_STYLE = {
  Unconfirmed: 'bg-stone-100 text-stone-600',
  Pending: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
};

export const NEXT_VACCINE_STATUS = {
  Unconfirmed: 'Pending',
  Pending: 'Completed',
  Completed: 'Unconfirmed',
};
