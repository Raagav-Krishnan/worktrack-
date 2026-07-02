import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import GlassCard from '../components/ui/GlassCard';
import NeoButton from '../components/ui/NeoButton';
import { formatCurrency } from '../lib/utils';
import { ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
  const navigate = useNavigate();
  const { works, getMonthlyEarnings } = useApp();
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const monthLabel = format(targetDate, 'MMMM yyyy');

  const reportData = useMemo(() => {
    return works.map((work) => {
      const e = getMonthlyEarnings(work.id, year, month);
      return {
        workName: work.name,
        monthlySalary: work.monthlySalary,
        dayRate: e.dayRate,
        daysPresent: e.daysPresent,
        daysAbsent: e.daysAbsent,
        daysLeave: e.daysLeave,
        daysSundayOff: e.daysSundayOff,
        totalEarned: e.totalEarned,
        totalLost: e.totalLost,
        totalPossible: e.totalPossible,
      };
    });
  }, [works, getMonthlyEarnings, year, month]);

  const totals = useMemo(() => {
    return reportData.reduce(
      (acc, r) => ({
        earned: acc.earned + r.totalEarned,
        lost: acc.lost + r.totalLost,
        possible: acc.possible + r.totalPossible,
        present: acc.present + r.daysPresent,
        absent: acc.absent + r.daysAbsent,
        leave: acc.leave + r.daysLeave,
      }),
      { earned: 0, lost: 0, possible: 0, present: 0, absent: 0, leave: 0 }
    );
  }, [reportData]);

  const exportCSV = () => {
    const headers = ['Work', 'Salary', 'Day Rate', 'Present', 'Absent', 'Leave', 'Sunday Off', 'Earned', 'Lost'];
    const rows = reportData.map((r) =>
      [r.workName, r.monthlySalary, r.dayRate.toFixed(2), r.daysPresent, r.daysAbsent, r.daysLeave, r.daysSundayOff, r.totalEarned.toFixed(2), r.totalLost.toFixed(2)].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WorkTrack_Report_${monthLabel.replace(' ', '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e8e5f0 0%, #f0eef5 50%, #e5eef0 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600">
            <ArrowLeft size={16} /> Back
          </button>
          <NeoButton onClick={exportCSV} className="text-xs">
            <Download size={14} className="inline mr-1" /> Export CSV
          </NeoButton>
        </div>

        <GlassCard className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-700">Payroll Summary</h1>
            <div className="flex items-center gap-2">
              <NeoButton onClick={() => setMonthOffset(monthOffset + 1)} className="text-xs px-3">←</NeoButton>
              <span className="text-sm font-medium text-gray-500 min-w-[140px] text-center">{monthLabel}</span>
              <NeoButton onClick={() => setMonthOffset(Math.max(0, monthOffset - 1))} className="text-xs px-3">→</NeoButton>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <GlassCard className="text-center py-4">
            <p className="text-xs text-gray-400">Total Earned</p>
            <p className="text-xl font-bold text-soft-teal">{formatCurrency(totals.earned)}</p>
          </GlassCard>
          <GlassCard className="text-center py-4">
            <p className="text-xs text-gray-400">Total Lost</p>
            <p className="text-xl font-bold text-soft-red">{formatCurrency(totals.lost)}</p>
          </GlassCard>
          <GlassCard className="text-center py-4">
            <p className="text-xs text-gray-400">Attendance Rate</p>
            <p className="text-xl font-bold text-soft-indigo">
              {totals.possible > 0 ? Math.round((totals.earned / totals.possible) * 100) : 0}%
            </p>
          </GlassCard>
        </div>

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-white/20">
                  <th className="pb-3 pr-3">Work</th>
                  <th className="pb-3 pr-3">Salary</th>
                  <th className="pb-3 pr-3">Day Rate</th>
                  <th className="pb-3 pr-3 text-center">Present</th>
                  <th className="pb-3 pr-3 text-center">Absent</th>
                  <th className="pb-3 pr-3 text-center">Leave</th>
                  <th className="pb-3 pr-3 text-right">Earned</th>
                  <th className="pb-3 text-right">Lost</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((r, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="py-3 pr-3 text-gray-600 font-medium">{r.workName}</td>
                    <td className="py-3 pr-3 text-gray-500">{formatCurrency(r.monthlySalary)}</td>
                    <td className="py-3 pr-3 text-gray-500">{formatCurrency(r.dayRate)}</td>
                    <td className="py-3 pr-3 text-center text-soft-green">{r.daysPresent}</td>
                    <td className="py-3 pr-3 text-center text-soft-red">{r.daysAbsent}</td>
                    <td className="py-3 pr-3 text-center text-soft-amber">{r.daysLeave}</td>
                    <td className="py-3 pr-3 text-right text-soft-teal font-medium">{formatCurrency(r.totalEarned)}</td>
                    <td className="py-3 text-right text-soft-red">{formatCurrency(r.totalLost)}</td>
                  </tr>
                ))}
                {reportData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">No data for this month</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
