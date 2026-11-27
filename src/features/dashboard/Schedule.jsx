import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PillTabs from '../../components/ui/PillTabs.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import { EVENTS } from '../../data/seed.js';
import { fadeIn } from '../../lib/motion.js';

const TABS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Next 7 Days' },
];

export default function Schedule() {
  const [tab, setTab] = useState('today');
  const week = tab === 'week';
  const events = EVENTS.filter((e) => week || e.day === 0);

  return (
    <Reveal as="section" className="rounded-xl bg-white border border-line shadow-c p-5">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Today and Upcoming</h2>
        <PillTabs
          id="schedule-tab"
          options={TABS}
          value={tab}
          onChange={setTab}
          className="flex gap-1 text-xs"
          pillClass="px-3 py-1"
          inactiveClass="bg-stone-100"
        />
      </div>
      <p className="text-xs text-mute mt-1">Event times shown in their local time zones</p>
      <AnimatePresence mode="wait">
        <motion.div key={tab} {...fadeIn} className="mt-3 divide-y divide-line">
          {events.map((e, i) => (
            <Reveal key={e.title + e.detail} y={8} delay={i * 0.04} className="flex gap-3 py-2.5">
              <div className="w-14 shrink-0 text-right">
                <p className="font-semibold">{e.time}</p>
                <p className="text-[11px] text-mute">{e.zone}</p>
              </div>
              <div>
                <p className="font-medium text-sm">{e.title}</p>
                <p className="text-xs text-mute">
                  {e.detail}
                  {week && e.day ? ` · +${e.day}d` : ''}
                </p>
              </div>
            </Reveal>
          ))}
        </motion.div>
      </AnimatePresence>
    </Reveal>
  );
}
