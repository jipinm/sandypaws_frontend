import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Paw from '../../components/ui/Paw.jsx';
import { inputClass } from '../../components/ui/Field.jsx';
import { pop } from '../../lib/motion.js';

export default function Login({ onSignIn }) {
  const [busy, setBusy] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    timer.current = setTimeout(onSignIn, 750);
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-paper to-orange-50">
      <motion.form
        {...pop}
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-c border border-line p-8"
      >
        <div className="flex items-center gap-3">
          <motion.span
            initial={{ rotate: -20, scale: 0.6 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
            className="grid place-items-center w-12 h-12 rounded-xl bg-ink text-brand"
          >
            <Paw size={28} />
          </motion.span>
          <div>
            <p className="text-lg font-bold leading-tight">SandyPaws CRM</p>
            <p className="text-xs text-mute">Pet relocation operations</p>
          </div>
        </div>
        <h1 className="mt-7 text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-mute">Demo account is pre-filled.</p>
        <label className="block mt-5 text-xs font-medium text-mute">
          Email
          <input className={`${inputClass} mt-1`} defaultValue="supervisor@sandypaws.example" />
        </label>
        <label className="block mt-4 text-xs font-medium text-mute">
          Password
          <input type="password" className={`${inputClass} mt-1`} defaultValue="demo-password" />
        </label>
        <button className="mt-6 w-full rounded-lg bg-brandd py-2.5 text-sm font-semibold text-white hover:bg-ink transition active:scale-95 flex justify-center gap-2">
          {busy && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {busy ? 'Signing in' : 'Sign in'}
        </button>
        <p className="mt-4 text-center text-xs text-mute">Prototype. Fictional sample data.</p>
      </motion.form>
    </div>
  );
}
