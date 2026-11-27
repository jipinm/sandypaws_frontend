import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MobileSidebar, Sidebar } from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';
import ScrollProgress from './components/layout/ScrollProgress.jsx';
import Toast from './components/ui/Toast.jsx';
import Dashboard from './features/dashboard/Dashboard.jsx';
import PreBookingList from './features/prebooking/PreBookingList.jsx';
import BookingDetail from './features/prebooking/BookingDetail.jsx';
import NewPreBooking from './features/prebooking/new/NewPreBooking.jsx';
import { useTransientState } from './hooks/useTimers.js';
import { fadeIn } from './lib/motion.js';

/** The signed-in app shell: navigation, current view, dialogs and toasts. */
export default function Workspace({ store, onSignOut }) {
  const { bookings, clients, findClient } = store;
  const [view, setView] = useState('dash');
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, say] = useTransientState(3200);
  const [highlightId, highlight] = useTransientState(2400);

  const selected = bookings.find((b) => b.id === selectedId);

  const go = (nextView, nextFilter) => {
    setView(nextView);
    if (nextFilter !== undefined) setFilter(nextFilter);
    setMenuOpen(false);
  };

  const cycleVaccine = (id, petIndex, vaccine) => {
    store.cycleVaccine(id, petIndex, vaccine);
    say(`${vaccine} status updated`);
  };

  const handOver = (id) => {
    store.handOver(id);
    setSelectedId(null);
    highlight(id);
    say('Submitted. Post-Booking case created and queued for intake review.');
  };

  const save = (draft) => {
    const record = store.createBooking(draft);
    setCreating(false);
    setView('pre');
    setFilter('');
    highlight(record.id);
    say(
      record.dir === 'Export'
        ? `${record.ref} saved. Post-Booking case created and intake review queued.`
        : `${record.ref} saved in Pre-Booking (import).`,
    );
  };

  const pageProps = { bookings, findClient, onOpen: setSelectedId, onNew: () => setCreating(true) };
  const navProps = { view, onNavigate: go, onUnavailable: say };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <ScrollProgress />
      <Sidebar {...navProps} />
      <MobileSidebar {...navProps} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="min-w-0">
        <Header
          bookings={bookings}
          findClient={findClient}
          onOpen={setSelectedId}
          onMenu={() => setMenuOpen(true)}
          onSignOut={onSignOut}
        />
        <AnimatePresence mode="wait">
          <motion.main key={view} {...fadeIn} className="p-4 sm:p-6 max-w-[1400px]">
            {view === 'dash' ? (
              <Dashboard {...pageProps} onNavigate={go} />
            ) : (
              <PreBookingList {...pageProps} filter={filter} onFilter={setFilter} highlightId={highlightId} />
            )}
          </motion.main>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && (
          <BookingDetail
            key="detail"
            booking={selected}
            client={findClient(selected.cid)}
            onClose={() => setSelectedId(null)}
            onVaccine={cycleVaccine}
            onHandOver={handOver}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {creating && <NewPreBooking key="new" clients={clients} onClose={() => setCreating(false)} onSave={save} />}
      </AnimatePresence>

      <Toast message={toast} />
    </div>
  );
}
