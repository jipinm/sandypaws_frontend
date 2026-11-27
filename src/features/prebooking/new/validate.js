/** Returns { field: message } for the given step. An empty object means the step is valid. */
export function validateStep(step, form) {
  const errors = {};
  if (step === 1) {
    if (form.clientMode === 'existing') {
      if (!form.clientId) errors.clientId = 'Choose a client';
    } else {
      const { name, phone, email, address } = form.newClient;
      if (name.trim().length < 2) errors.name = 'Enter the full name';
      if (!/^\+[1-9]\d{6,14}$/.test(phone)) errors.phone = 'Use country code, e.g. +971501234567';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Enter a valid email';
      if (!address.trim()) errors.address = 'Address is required';
    }
  }
  if (step === 2 && !form.travelMode) errors.travelMode = 'Choose a travel mode';
  return errors;
}
