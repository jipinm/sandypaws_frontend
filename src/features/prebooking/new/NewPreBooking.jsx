import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Modal from '../../../components/ui/Modal.jsx';
import Button from '../../../components/ui/Button.jsx';
import CloseButton from '../../../components/ui/CloseButton.jsx';
import StepProgress from './StepProgress.jsx';
import ClientStep from './ClientStep.jsx';
import RequestStep from './RequestStep.jsx';
import PetsStep from './PetsStep.jsx';
import { validateStep } from './validate.js';
import { slide } from '../../../lib/motion.js';

const STEPS = [
  { title: 'Client', Component: ClientStep },
  { title: 'Request', Component: RequestStep },
  { title: 'Pets', Component: PetsStep },
];

const EMPTY_FORM = {
  clientMode: 'existing',
  clientId: '',
  newClient: { name: '', phone: '+971', email: '', address: '' },
  direction: 'Export',
  travelMode: '',
  prefs: '',
  route: '',
  month: '',
  pets: [{ type: 'dog', breed: '' }],
};

export default function NewPreBooking({ clients, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const { Component } = STEPS[step - 1];

  const update = (changes) => setForm((f) => ({ ...f, ...changes }));

  const next = () => {
    const found = validateStep(step, form);
    setErrors(found);
    if (!Object.keys(found).length) setStep(step + 1);
  };

  return (
    <Modal onClose={onClose} label="New Pre-Booking">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">New Pre-Booking</h2>
          <CloseButton onClick={onClose} />
        </div>
        <StepProgress titles={STEPS.map((s) => s.title)} current={step} />
        <div className="-mx-1 px-1 overflow-x-clip">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} {...slide} className="mt-5 space-y-4 text-sm">
              <Component
                form={form}
                update={update}
                errors={errors}
                clearErrors={() => setErrors({})}
                clients={clients}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-6 flex justify-between">
          <Button onClick={() => (step > 1 ? setStep(step - 1) : onClose())}>{step > 1 ? 'Back' : 'Cancel'}</Button>
          {step < STEPS.length ? (
            <Button key="next" primary onClick={next}>Next</Button>
          ) : (
            <Button key="save" primary onClick={() => onSave(form)}>Save Pre-Booking</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
