import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CountryFlag from './CountryFlag.jsx';
import { inputClass } from '../../../components/ui/Field.jsx';
import { COUNTRIES, findCountry } from './countries.js';
import { pop } from '../../../lib/motion.js';

const matches = (country, query) => {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  const digits = term.replace(/^\+/, '');
  if (/^\d+$/.test(digits)) return country.dial.slice(1).startsWith(digits);
  return country.name.toLowerCase().includes(term) || country.iso.toLowerCase() === term;
};

/**
 * Searchable calling-code dropdown with flags. A native <select> cannot show flag images.
 * The panel spans the nearest positioned parent.
 */
export default function CallingCodeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const root = useRef(null);
  const trigger = useRef(null);
  const list = useRef(null);
  const listId = useId();

  const selected = findCountry(value);
  const results = COUNTRIES.filter((c) => matches(c, query));

  const show = () => {
    setQuery('');
    setActiveIndex(COUNTRIES.findIndex((c) => c.iso === value));
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current.focus();
  };

  const choose = (iso) => {
    onChange(iso);
    close();
  };

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => !root.current.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the highlighted option visible without scrolling the dialog around it.
  useEffect(() => {
    const box = list.current;
    const item = box?.children[activeIndex];
    if (!open || !item) return;
    if (item.offsetTop < box.scrollTop) box.scrollTop = item.offsetTop;
    else if (item.offsetTop + item.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = item.offsetTop + item.offsetHeight - box.clientHeight;
    }
  }, [open, activeIndex]);

  const onSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((i) => Math.max(0, Math.min(results.length - 1, i + step)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) choose(results[activeIndex].iso);
    }
  };

  return (
    <div
      ref={root}
      className="shrink-0"
      onKeyDown={(e) => {
        if (open && e.key === 'Escape') {
          e.stopPropagation(); // close only this list, not the whole dialog
          close();
        }
      }}
      onBlur={(e) => open && e.relatedTarget && !root.current.contains(e.relatedTarget) && setOpen(false)}
    >
      <button
        ref={trigger}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country calling code: ${selected.name} ${selected.dial}`}
        onClick={() => (open ? close() : show())}
        className={`${inputClass} !w-auto flex h-full items-center gap-1.5`}
      >
        <CountryFlag iso={selected.iso} />
        <span>{selected.dial}</span>
        <span aria-hidden="true" className="text-mute">▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...pop}
            className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-line bg-white p-2 shadow-xl"
          >
            <input
              autoFocus
              type="search"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={results[activeIndex] ? `${listId}-${results[activeIndex].iso}` : undefined}
              aria-label="Search country or code"
              placeholder="Search country or code"
              autoComplete="off"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onSearchKeyDown}
              className={inputClass}
            />
            <ul ref={list} id={listId} role="listbox" aria-label="Country calling code" className="relative mt-1 max-h-52 overflow-y-auto">
              {results.map((country, i) => (
                <li
                  key={country.iso}
                  id={`${listId}-${country.iso}`}
                  role="option"
                  aria-selected={country.iso === value}
                  onClick={(e) => {
                    e.preventDefault();
                    choose(country.iso);
                  }}
                  onMouseMove={() => setActiveIndex(i)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink ${i === activeIndex ? 'bg-orange-50' : ''} ${country.iso === value ? 'font-semibold' : 'font-normal'}`}
                >
                  <CountryFlag iso={country.iso} />
                  <span className="min-w-0 flex-1 truncate">{country.name}</span>
                  <span className="text-xs text-mute">{country.dial}</span>
                </li>
              ))}
            </ul>
            {results.length === 0 && <p className="px-2 py-2 text-sm font-normal text-mute">No matches.</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
