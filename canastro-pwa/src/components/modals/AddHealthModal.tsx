'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { HealthMetric } from '@/types';

const METRIC_TYPES = [
  { value: 'weight', label: 'Weight', unit: 'kg' },
  { value: 'heartRate', label: 'Resting Heart Rate', unit: 'bpm' },
  { value: 'bloodPressure', label: 'Blood Pressure (systolic)', unit: 'mmHg' },
  { value: 'steps', label: 'Steps', unit: 'steps' },
  { value: 'custom', label: 'Custom', unit: '' },
];

interface Props {
  onClose: () => void;
  onAdd: (m: HealthMetric) => void;
}

export default function AddHealthModal({ onClose, onAdd }: Props) {
  const [type, setType] = useState('weight');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customLabel, setCustomLabel] = useState('');
  const [customUnit, setCustomUnit] = useState('');

  const selected = METRIC_TYPES.find(m => m.value === type)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;
    onAdd({
      id: crypto.randomUUID(),
      date: new Date(date).toISOString(),
      type: type as HealthMetric['type'],
      value: parseFloat(value),
      unit: type === 'custom' ? customUnit : selected.unit,
      label: type === 'custom' ? customLabel : selected.label,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div className="w-full bg-zinc-900 rounded-t-3xl p-6 pb-safe" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Log Health Metric</h2>
          <button onClick={onClose} className="text-zinc-400 p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
            {METRIC_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          {type === 'custom' && (
            <>
              <input className="input-field" placeholder="Label" value={customLabel} onChange={e => setCustomLabel(e.target.value)} required />
              <input className="input-field" placeholder="Unit (e.g. mg/dL)" value={customUnit} onChange={e => setCustomUnit(e.target.value)} />
            </>
          )}
          <input className="input-field" placeholder={`Value ${type !== 'custom' ? `(${selected.unit})` : ''}`} type="number" step="0.1" value={value} onChange={e => setValue(e.target.value)} required />
          <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
          <button type="submit" className="btn-primary w-full">Log Metric</button>
        </form>
      </div>
    </div>
  );
}
