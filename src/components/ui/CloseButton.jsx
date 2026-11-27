export default function CloseButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="text-2xl leading-none text-mute hover:text-ink" aria-label="Close">
      ×
    </button>
  );
}
