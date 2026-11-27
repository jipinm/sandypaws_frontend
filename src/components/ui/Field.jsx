export const inputClass =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

export function Field({ label, error, className = 'block', children }) {
  return (
    <label className={`${className} text-xs font-medium text-mute`}>
      {label}
      {children}
      <FieldError message={error} />
    </label>
  );
}

export function FieldError({ message }) {
  return message ? <span className="text-xs text-red-700">{message}</span> : null;
}
