import type { AttendanceStatus } from '../../types';

const statusConfig: Record<string, { label: string; color: string }> = {
  present: { label: 'Present', color: 'bg-soft-green/30 text-green-800' },
  absent: { label: 'Absent', color: 'bg-soft-red/30 text-red-800' },
  'leave-approved': { label: 'Leave', color: 'bg-soft-amber/30 text-amber-800' },
  'sunday-off': { label: 'Sunday Off', color: 'bg-gray-200 text-gray-500' },
  'sunday-working': { label: 'Working Sunday', color: 'bg-soft-teal/30 text-teal-800' },
  pending: { label: 'Pending', color: 'bg-soft-amber/20 text-amber-700' },
  'not-scheduled': { label: 'Not Scheduled', color: 'bg-gray-100 text-gray-400' },
};

interface StatusBadgeProps {
  status: AttendanceStatus | 'pending' | 'not-scheduled';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
