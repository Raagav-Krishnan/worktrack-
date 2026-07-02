import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useApp } from '../contexts/AppContext';
import GlassCard from '../components/ui/GlassCard';
import NeoButton from '../components/ui/NeoButton';
import StatusBadge from '../components/ui/StatusBadge';
import { ArrowLeft, Plus } from 'lucide-react';
import { formatDateKey, getDayOfWeek } from '../lib/utils';
import type { Work } from '../types';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const navigate = useNavigate();
  const { works, attendance, sundayToggles } = useApp();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  const events = useMemo(() => {
    return works.flatMap((work) => {
      return work.recurrenceDays.map((day) => {
        const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day);
        return {
          title: work.name,
          start: new Date(2024, 0, dayIndex + 1, parseInt(work.startTime.split(':')[0]), parseInt(work.startTime.split(':')[1])),
          end: new Date(2024, 0, dayIndex + 1, parseInt(work.startTime.split(':')[0]) + 1, parseInt(work.startTime.split(':')[1])),
          resource: work,
          allDay: false,
        };
      });
    });
  }, [works]);

  const dayAttendances = useMemo(() => {
    if (!selectedDate) return [];
    const key = formatDateKey(selectedDate);
    const dayOfWeek = getDayOfWeek(selectedDate);

    return works.map((work) => {
      const isScheduled = work.recurrenceDays.includes(dayOfWeek);
      const record = attendance.find((a) => a.workId === work.id && a.date === key);
      const sunToggle = sundayToggles.find((s) => s.workId === work.id && s.date === key);
      const isSun = selectedDate.getDay() === 0;

      let status: string;
      if (record) {
        status = record.status;
      } else if (isSun && (!sunToggle || !sunToggle.working)) {
        status = 'sunday-off';
      } else if (isScheduled) {
        status = 'pending';
      } else {
        status = 'not-scheduled';
      }

      return { work, status, record };
    });
  }, [selectedDate, works, attendance, sundayToggles]);

  const eventStyleGetter = (event: any) => {
    const colorIdx = works.indexOf(event.resource) % 5;
    const colors = ['#7c7b9a', '#6ba3a0', '#8bc78b', '#e8a0a0', '#e8c87a'];
    return {
      style: {
        backgroundColor: colors[colorIdx] + '30',
        borderLeft: `3px solid ${colors[colorIdx]}`,
        color: '#555',
        borderRadius: '8px',
        fontSize: '12px',
      },
    };
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e8e5f0 0%, #f0eef5 50%, #e5eef0 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600">
            <ArrowLeft size={16} /> Back
          </button>
          <NeoButton onClick={() => navigate('/work/new')} accent className="text-xs">
            <Plus size={14} className="inline mr-1" /> Add Work
          </NeoButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-4">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                views={['month', 'week']}
                view={view}
                date={date}
                onView={setView}
                onNavigate={setDate}
                onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
                onSelectEvent={(event) => setSelectedWork(event.resource)}
                eventPropGetter={eventStyleGetter}
                selectable
                popup
              />
            </GlassCard>
          </div>

          <div className="space-y-4">
            {selectedDate && (
              <GlassCard>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <div className="space-y-2">
                  {dayAttendances.map(({ work, status }) => (
                    <div
                      key={work.id}
                      className="flex items-center justify-between p-2 neo-sm cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => navigate(`/work/${work.id}`)}
                    >
                      <div>
                        <p className="text-sm text-gray-600">{work.name}</p>
                        <p className="text-xs text-gray-400">{work.startTime}</p>
                      </div>
                      <StatusBadge status={status as any} />
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {selectedWork && (
              <GlassCard>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{selectedWork.name}</h3>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Schedule: {selectedWork.startTime} ({selectedWork.bufferMinutes}min buffer)</p>
                  <p>Salary: ₹{selectedWork.monthlySalary.toLocaleString()}/mo</p>
                  <p>Days: {selectedWork.recurrenceDays.join(', ')}</p>
                </div>
                <NeoButton onClick={() => navigate(`/work/${selectedWork.id}`)} className="w-full mt-3 text-xs">
                  View Details
                </NeoButton>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
