import Modal from '../../components/ui/Modal.jsx';
import Chip from '../../components/ui/Chip.jsx';
import Button from '../../components/ui/Button.jsx';
import CloseButton from '../../components/ui/CloseButton.jsx';
import PetChecklist from './PetChecklist.jsx';
import { MODES, STAGES } from '../../data/reference.js';
import { plural } from '../../lib/records.js';

function InfoCard({ title, children }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-xs font-semibold text-mute mb-2">{title}</p>
      {children}
    </div>
  );
}

export default function BookingDetail({ booking, client, onClose, onVaccine, onHandOver }) {
  const stage = STAGES[booking.stage];
  const notHandedOver = booking.stage === 'NotHandedOver';
  const isExport = booking.dir === 'Export';

  let footnote = 'Post-Booking screens are built next.';
  if (notHandedOver) {
    footnote = isExport
      ? 'Submitting creates the linked Post-Booking case.'
      : 'Post-Booking is export only, so imports stay in Pre-Booking.';
  }

  return (
    <Modal onClose={onClose} wide label={`${booking.ref} details`}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-mute">{booking.ref} · {booking.dir} · {MODES[booking.mode]}</p>
            <h2 className="text-xl font-bold">{client.name}</h2>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip className={stage.chip}>{stage.label}</Chip>
          {booking.route && <Chip className="bg-stone-100 text-ink">{booking.route}</Chip>}
          {booking.month && <Chip className="bg-stone-100 text-ink">{booking.month} · Date TBD</Chip>}
        </div>
        <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
          <InfoCard title="CLIENT">
            <p>{client.phone}</p>
            <p className="break-all">{client.email}</p>
            <p className="text-mute">{client.address}</p>
          </InfoCard>
          <InfoCard title="REQUEST">
            <p>{plural(booking.pets.length)} declared</p>
            <p>Created {booking.created} by {booking.by}</p>
            <p className="text-mute">{booking.prefs || 'No travel preferences.'}</p>
          </InfoCard>
        </div>
        <p className="mt-5 text-xs font-semibold text-mute">
          PETS AND VACCINATION CHECKLIST <span className="font-normal">(click a status to update)</span>
        </p>
        <PetChecklist pets={booking.pets} onToggle={(petIndex, vaccine) => onVaccine(booking.id, petIndex, vaccine)} />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-mute max-w-xs">{footnote}</p>
          <div className="flex gap-2">
            <Button onClick={onClose}>Close</Button>
            {notHandedOver && isExport && (
              <Button primary onClick={() => onHandOver(booking.id)}>Submit to Post-Booking</Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
