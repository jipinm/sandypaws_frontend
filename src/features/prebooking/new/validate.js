import { internationalNumber, nationalDigits } from './countries.js';

function checkPhone(iso, number) {
  if (!number.trim()) return 'Enter the mobile number';
  if (!/^[\d\s().-]+$/.test(number)) return 'Use digits only. Choose the country code from the list';
  const valid = nationalDigits(iso, number).length >= 4 && /^\+[1-9]\d{6,14}$/.test(internationalNumber(iso, number));
  return valid ? null : 'Enter a valid mobile number';
}

/** Returns { field: message } for the given step. An empty object means the step is valid. */
export function validateStep(step, form) {
  const errors = {};
  if (step === 1) {
    if (form.clientMode === 'existing') {
      if (!form.clientId) errors.clientId = 'Choose a client';
    } else {
      const { name, phoneCountry, phoneNumber, email, addressLine1, city, country } = form.newClient;
      if (name.trim().length < 2) errors.name = 'Enter the full name';
      const phoneError = checkPhone(phoneCountry, phoneNumber);
      if (phoneError) errors.phone = phoneError;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Enter a valid email';
      if (!addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required';
      if (!city.trim()) errors.city = 'City is required';
      if (!country) errors.country = 'Choose a country';
    }
  }
  if (step === 2 && !form.travelMode) errors.travelMode = 'Choose a travel mode';
  return errors;
}
