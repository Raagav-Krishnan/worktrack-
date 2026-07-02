import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import GlassCard from '../components/ui/GlassCard';
import NeoButton from '../components/ui/NeoButton';
import NeoInput from '../components/ui/NeoInput';
import type { DayOfWeek, Work } from '../types';
import { checkScheduleCollision, getDayRate, formatCurrency } from '../lib/utils';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const DAYS: { label: string; value: DayOfWeek }[] = [
  { label: 'S', value: 'Sun' },
  { label: 'M', value: 'Mon' },
  { label: 'T', value: 'Tue' },
  { label: 'W', value: 'Wed' },
  { label: 'T', value: 'Thu' },
  { label: 'F', value: 'Fri' },
  { label: 'S', value: 'Sat' },
];

const BUFFER_OPTIONS = [5, 10, 15, 20, 30];

export default function AddWorkPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { works, addWork, updateWork } = useApp();

  const existingWork = id ? works.find((w) => w.id === id) : null;

  const [name, setName] = useState(existingWork?.name || '');
  const [salary, setSalary] = useState(String(existingWork?.monthlySalary || ''));
  const [startTime, setStartTime] = useState(existingWork?.startTime || '09:00');
  const [buffer, setBuffer] = useState(existingWork?.bufferMinutes || 15);
  const [days, setDays] = useState<DayOfWeek[]>(existingWork?.recurrenceDays || []);
  const [collision, setCollision] = useState<Work | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleDay = (d: DayOfWeek) => {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  useEffect(() => {
    if (!name || !startTime || days.length === 0) {
      setCollision(null);
      return;
    }
    const conflict = checkScheduleCollision(
      { startTime, bufferMinutes: buffer, recurrenceDays: days },
      works,
      id
    );
    setCollision(conflict);
  }, [startTime, buffer, days, works, id, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (collision || !name || !salary || days.length === 0) return;

    setSaving(true);
    try {
      if (existingWork) {
        await updateWork(existingWork.id, {
          name,
          monthlySalary: Number(salary),
          startTime,
          bufferMinutes: buffer,
          recurrenceDays: days,
        });
      } else {
        await addWork({
          name,
          monthlySalary: Number(salary),
          startTime,
          bufferMinutes: buffer,
          recurrenceDays: days,
        });
      }
      navigate('/');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const previewDayRate = salary ? getDayRate(Number(salary), new Date().getFullYear(), new Date().getMonth()) : 0;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e8e5f0 0%, #f0eef5 50%, #e5eef0 100%)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        <GlassCard>
          <h1 className="text-xl font-semibold text-gray-700 mb-6">
            {existingWork ? 'Edit Work' : 'Add New Work'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <NeoInput label="Work Name" value={name} onChange={setName} placeholder="e.g. Work 1" />

            <NeoInput label="Monthly Salary (₹)" type="number" value={salary} onChange={setSalary} placeholder="20000" min={0} />

            {salary && (
              <div className="neo-inset p-3 text-center">
                <p className="text-xs text-gray-400">Day rate (this month):</p>
                <p className="text-lg font-semibold text-soft-teal">{formatCurrency(previewDayRate)}</p>
              </div>
            )}

            <NeoInput label="Start Time" type="time" value={startTime} onChange={setStartTime} />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-500">Buffer Minutes</label>
              <div className="flex gap-2">
                {BUFFER_OPTIONS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBuffer(b)}
                    className={`neo-sm px-4 py-2 text-sm transition-all ${buffer === b ? 'shadow-neo-inset text-soft-indigo font-medium' : 'text-gray-500'}`}
                  >
                    {b}min
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-500">Recurring Days</label>
              <div className="flex gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${days.includes(d.value) ? 'neo-inset text-soft-indigo' : 'neo-sm text-gray-400'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {collision && (
              <div className="neo-inset p-4 flex items-start gap-3 bg-soft-red/10">
                <AlertTriangle size={18} className="text-soft-red shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Schedule Conflict</p>
                  <p className="text-xs text-gray-500">
                    Cannot schedule — <strong>{collision.name}</strong> is already scheduled at this time.
                  </p>
                </div>
              </div>
            )}

            <NeoButton
              type="submit"
              accent
              disabled={!name || !salary || days.length === 0 || !!collision || saving}
              className="w-full"
            >
              {saving ? 'Saving...' : existingWork ? 'Update Work' : 'Create Work'}
            </NeoButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
