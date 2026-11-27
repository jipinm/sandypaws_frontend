import PhoneField from './PhoneField.jsx';
import { Field, inputClass } from '../../../components/ui/Field.jsx';
import { COUNTRIES } from './countries.js';

export default function NewClientFields({ values, errors, onChange }) {
  const textField = (key, label, props) => (
    <Field label={label} error={errors[key]}>
      <input
        className={`${inputClass} mt-1`}
        value={values[key]}
        onChange={(e) => onChange({ [key]: e.target.value })}
        {...props}
      />
    </Field>
  );

  return (
    <section aria-labelledby="client-details-title" className="rounded-xl border border-line p-4">
      <h3 id="client-details-title" className="font-semibold">Client details</h3>
      <div className="mt-3 grid items-start gap-3 sm:grid-cols-2">
        {textField('name', 'Client name', { maxLength: 150 })}
        <PhoneField
          country={values.phoneCountry}
          number={values.phoneNumber}
          onCountryChange={(phoneCountry) => onChange({ phoneCountry })}
          onNumberChange={(phoneNumber) => onChange({ phoneNumber })}
          error={errors.phone}
        />
        {textField('email', 'Email', { type: 'email', maxLength: 254 })}
        {textField('addressLine1', 'Address line 1', { maxLength: 125 })}
        {textField('addressLine2', 'Address line 2 (optional)', { maxLength: 125 })}
        {textField('city', 'City', { maxLength: 70 })}
        {textField('region', 'Emirate / State / Province (optional)', { maxLength: 70 })}
        {textField('postalCode', 'Postal code (optional)', { maxLength: 20 })}
        <Field label="Country" error={errors.country}>
          <select
            className={`${inputClass} mt-1`}
            value={values.country}
            onChange={(e) => onChange({ country: e.target.value })}
          >
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>{c.name}</option>
            ))}
          </select>
        </Field>
      </div>
    </section>
  );
}
