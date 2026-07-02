import { useNavigate } from 'react-router-dom';
import type { Work, AttendanceStatus } from '../../types';
import GlassCard from '../ui/GlassCard';
import StatusBadge from '../ui/StatusBadge';
import NeoButton from '../ui/NeoButton';
import { formatCurrency, isDayInRecurrence, isSunday, isWithinCheckInWindow } from '../../lib/utils';
import { useApp } from '../../contexts/AppContext';
import { Calendar, Clock } from 'lucide-react';

interface WorkCardProps {
  work: Work;
  onCheckIn: (work: Work) => void;
}

export default function WorkCard({ work, onCheckIn }: WorkCardProps) {
  const navigate = useNavigate();
  const { attendance, sundayToggles, getMonthlyEarnings } = useApp();
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  const earnings = getMonthlyEarnings(work.id, now.getFullYear(), now.getMonth());

  const todayRecord = attendance.find((a) => a.workId === work.id && a.date === todayKey);

  const isScheduledToday = isDayInRecurrence(now, work.recurrenceDays);
  const todayIsSunday = isSunday(now);

  let todayStatus: AttendanceStatus | 'pending' | 'not-scheduled' = 'not-scheduled';

  if (isScheduledToday) {
    if (todayIsSunday) {
      const sunToggle = sundayToggles.find((s) => s.workId === work.id && s.date === todayKey);
      if (!sunToggle || !sunToggle.working) {
        todayStatus = 'sunday-off';
      } else if (todayRecord) {
        todayStatus = todayRecord.status;
      } else {
        todayStatus = 'pending';
      }
    } else if (todayRecord) {
      todayStatus = todayRecord.status;
    } else {
      todayStatus = 'pending';
    }
  }

  const checkInWindow = isWithinCheckInWindow(work.startTime, work.bufferMinutes);

  return (
    <GlassCard hover className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">{work.name}</h3>
          <p className="text-xs text-gray-400">{work.startTime} • {work.bufferMinutes}min buffer</p>
        </div>
        <StatusBadge status={todayStatus} />
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Calendar size={14} />
          <span>{formatCurrency(work.monthlySalary)}/mo</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <Clock size={14} />
          <span>{formatCurrency(earnings.dayRate)}/day</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 py-2">
        <div className="neo-inset p-3 text-center">
          <p className="text-xs text-gray-400">Earned</p>
          <p className="text-lg font-semibold text-soft-teal">{formatCurrency(earnings.totalEarned)}</p>
        </div>
        <div className="neo-inset p-3 text-center">
          <p className="text-xs text-gray-400">Lost</p>
          <p className="text-lg font-semibold text-soft-red">{formatCurrency(earnings.totalLost)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{earnings.daysPresent} present • {earnings.daysAbsent} absent</span>
      </div>

      <div className="flex gap-2 mt-1">
        <NeoButton onClick={() => navigate(`/work/${work.id}`)} className="flex-1 text-xs">
          Details
        </NeoButton>
        {(todayStatus === 'pending' || todayStatus === 'sunday-working') && checkInWindow.isOpen && (
          <NeoButton onClick={() => onCheckIn(work)} accent className="flex-1 text-xs">
            Check In
          </NeoButton>
        )}
      </div>
    </GlassCard>
  );
}
