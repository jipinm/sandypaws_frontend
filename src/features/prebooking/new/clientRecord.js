import { findCountry, internationalNumber } from './countries.js';

const ADDRESS_FIELDS = ['addressLine1', 'addressLine2', 'city', 'region', 'postalCode'];

/**
 * Turns the form values into a client record. `phone` and `address` stay single strings,
 * which is what the rest of the app reads; the separate parts are kept alongside them.
 */
export function toClientRecord(values) {
  const trimmed = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
  const country = findCountry(trimmed.country).name;
  return {
    ...trimmed,
    country,
    countryIso: trimmed.country,
    phone: internationalNumber(trimmed.phoneCountry, trimmed.phoneNumber),
    address: [...ADDRESS_FIELDS.map((key) => trimmed[key]), country].filter(Boolean).join(', '),
  };
}
