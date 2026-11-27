import Button from './Button.jsx';

export default function PageHeader({ title, subtitle, onNew }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-mute">{subtitle}</p>
      </div>
      <Button primary onClick={onNew}>+ New Pre-Booking</Button>
    </div>
  );
}
