import { AnimatePresence, motion } from 'framer-motion';
import Paw from '../ui/Paw.jsx';
import { ease, spring } from '../../lib/motion.js';

const NAV = [
  { key: 'dash', label: 'Dashboard', enabled: true },
  { key: 'pre', label: 'Pre-Booking', enabled: true },
  { key: 'post', label: 'Post-Booking', badge: 'Next', message: 'Post-Booking screens are built next.' },
  { key: 'acc', label: 'Accounts' },
  { key: 'doc', label: 'Documents' },
  { key: 'hr', label: 'HR' },
  { key: 'adm', label: 'Administration' },
];

function SidebarContent({ id, view, onNavigate, onUnavailable }) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-2 py-3 text-white">
        <span className="text-brand"><Paw /></span>
        <span className="font-bold">SandyPaws CRM</span>
      </div>
      <nav className="mt-3 space-y-1">
        {NAV.map((item) => {
          const active = view === item.key;
          const tone = active
            ? 'text-white font-semibold'
            : item.enabled
              ? 'text-stone-200 hover:bg-white/10'
              : 'text-stone-500 hover:bg-white/5';
          return (
            <motion.button
              key={item.key}
              type="button"
              aria-current={active ? 'page' : undefined}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                item.enabled
                  ? onNavigate(item.key)
                  : onUnavailable(item.message ?? `${item.label} is not part of this prototype.`)
              }
              className={`relative flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm text-left transition-colors ${tone}`}
            >
              {active && <motion.span layoutId={id} transition={spring} className="absolute inset-0 rounded-lg bg-brand/15" />}
              <span className="relative">{item.label}</span>
              {item.badge && (
                <span className="relative text-[10px] rounded-full bg-sun/20 text-sun px-2 py-0.5">{item.badge}</span>
              )}
            </motion.button>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar(props) {
  return (
    <aside className="hidden bg-ink p-4 lg:block lg:min-h-screen">
      <SidebarContent id="nav-desktop" {...props} />
    </aside>
  );
}

export function MobileSidebar({ open, onClose, ...props }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="drawer" className="lg:hidden" exit={{ opacity: 1, transition: { duration: 0.25 } }}>
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-ink p-4"
          >
            <SidebarContent id="nav-mobile" {...props} />
          </motion.aside>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-ink/40"
            onClick={onClose}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
