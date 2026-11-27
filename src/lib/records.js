import { VACCINES } from '../data/reference.js';

/**
 * Build a pet with its default vaccine checklist.
 * `status` is one status for every vaccine, or an array with one per vaccine.
 * No breed means no checklist.
 */
export const makePet = (type, breed, status) => ({
  type,
  breed,
  vax: breed
    ? Object.fromEntries(VACCINES[type].map((v, i) => [v, Array.isArray(status) ? status[i] : status]))
    : {},
});

export const plural = (count, word = 'pet') => `${count} ${count > 1 ? `${word}s` : word}`;

/** "2027-03" -> "March 2027". Formatted in UTC so the month never shifts by time zone. */
export const monthLabel = (value) =>
  value
    ? new Date(`${value}-01`).toLocaleString('en', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    : '';

export const vaccineProgress = (pets) => {
  const all = pets.flatMap((pet) => Object.values(pet.vax));
  const done = all.filter((s) => s === 'Completed').length;
  return { done, total: all.length, percent: all.length ? Math.round((done / all.length) * 100) : 0 };
};
