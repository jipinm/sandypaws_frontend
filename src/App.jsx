import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './features/auth/Login.jsx';
import Workspace from './Workspace.jsx';
import { useBookingStore } from './hooks/useBookingStore.js';

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  // Records live here so they survive signing out and back in, until the page is reloaded.
  const store = useBookingStore();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={signedIn ? 'app' : 'login'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {signedIn ? (
          <Workspace store={store} onSignOut={() => setSignedIn(false)} />
        ) : (
          <Login onSignIn={() => setSignedIn(true)} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
