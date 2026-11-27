export default function Paw({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="6.5" cy="10" rx="2" ry="2.6" />
      <ellipse cx="10.5" cy="5.8" rx="2" ry="2.7" />
      <ellipse cx="15.5" cy="5.8" rx="2" ry="2.7" />
      <ellipse cx="19" cy="10" rx="2" ry="2.6" />
      <path d="M12.8 11c-3 0-6 3.2-6 5.7 0 1.9 1.6 2.6 3.2 2.3 1-.2 1.9-.5 2.8-.5s1.8.3 2.8.5c1.6.3 3.2-.4 3.2-2.3 0-2.5-3-5.7-6-5.7z" />
    </svg>
  );
}
