import { useId } from 'react';
import CallingCodeSelect from './CallingCodeSelect.jsx';
import { FieldError, inputClass } from '../../../components/ui/Field.jsx';

export default function PhoneField({ country, number, onCountryChange, onNumberChange, error }) {
  const numberId = useId();
  // Not wrapped in <label>: that would forward clicks on the dropdown to the first control.
  return (
    <div className="text-xs font-medium text-mute">
      <label htmlFor={numberId}>Mobile number</label>
      <div className="relative mt-1 flex gap-2">
        <CallingCodeSelect value={country} onChange={onCountryChange} />
        <input
          id={numberId}
          type="tel"
          inputMode="tel"
          autoComplete="off"
          maxLength={30}
          placeholder="50 123 4567"
          className={`${inputClass} min-w-0 flex-1`}
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}
