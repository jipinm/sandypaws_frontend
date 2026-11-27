export default function Button({ primary = false, className = '', type = 'button', ...props }) {
  const variant = primary ? 'bg-brandd text-white hover:bg-ink' : 'border border-line bg-white hover:bg-stone-50';
  return (
    <button
      type={type}
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-40 ${variant} ${className}`}
    />
  );
}
