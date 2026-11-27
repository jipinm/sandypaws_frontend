import { motion, useScroll, useTransform } from 'framer-motion';
import SearchBox from './SearchBox.jsx';

export default function Header({ bookings, findClient, onOpen, onMenu, onSignOut }) {
  const { scrollY } = useScroll();
  const boxShadow = useTransform(scrollY, [0, 40], ['0 4px 16px rgba(32,26,24,0)', '0 4px 16px rgba(32,26,24,0.08)']);

  return (
    <motion.header
      style={{ boxShadow }}
      className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-paper/90 backdrop-blur px-4 sm:px-6 py-3"
    >
      <button type="button" className="lg:hidden text-xl" onClick={onMenu} aria-label="Menu">☰</button>
      <SearchBox bookings={bookings} findClient={findClient} onOpen={onOpen} />
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:block text-right text-xs">
          <p className="font-semibold">Operations Supervisor</p>
          <p className="text-mute">Rashid Khan</p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-stone-50"
        >
          Sign out
        </button>
      </div>
    </motion.header>
  );
}
