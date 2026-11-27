import PillTabs from '../../../components/ui/PillTabs.jsx';
import { Field, inputClass } from '../../../components/ui/Field.jsx';

const CLIENT_MODES = [
  { value: 'existing', label: 'Existing client' },
  { value: 'new', label: 'New client' },
];

const NEW_CLIENT_FIELDS = [
  ['name', 'Full name'],
  ['phone', 'Phone with country code'],
  ['email', 'Email'],
  ['address', 'Address'],
];

export default function ClientStep({ form, update, errors, clearErrors, clients }) {
  return (
    <>
      <PillTabs
        id="client-mode"
        options={CLIENT_MODES}
        value={form.clientMode}
        onChange={(clientMode) => {
          update({ clientMode });
          clearErrors();
        }}
        className="flex gap-2"
        pillClass="px-4 py-1.5 text-xs"
        inactiveClass="bg-stone-100"
      />
      {form.clientMode === 'existing' ? (
        <Field label="Client" error={errors.clientId}>
          <select
            className={`${inputClass} mt-1`}
            value={form.clientId}
            onChange={(e) => update({ clientId: e.target.value })}
          >
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      ) : (
        NEW_CLIENT_FIELDS.map(([key, label]) => (
          <Field key={key} label={label} error={errors[key]}>
            <input
              className={`${inputClass} mt-1`}
              value={form.newClient[key]}
              onChange={(e) => update({ newClient: { ...form.newClient, [key]: e.target.value } })}
            />
          </Field>
        ))
      )}
    </>
  );
}
