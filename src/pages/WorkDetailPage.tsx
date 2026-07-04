import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import GlassCard from '../components/ui/GlassCard';
import NeoButton from '../components/ui/NeoButton';
import NeoToggle from '../components/ui/NeueToggle';
import StatusBadge from '../components/ui/StatusBadge';
import {
  formatCurrency,
  getMonthKey,
  formatDateKey,
  formatDate,
  isSunday,
  isSaturday,
  getDaysInMonth,
} from '../lib/utils';
import {
  ArrowLeft,
  Download,
  Upload,
  CheckCircle,
  Sun,
  Clock,
  Calendar,
} from 'lucide-react';

export default function WorkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { works, attendance, sundayToggles, leaveLetters, setSundayToggle, uploadLeaveLetter, deleteWork, getMonthlyEarnings } = useApp();

  const work = works.find((w) => w.id === id);
  const now = new Date();

  const [saturdayDate, setSaturdayDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const earnings = useMemo(() => {
    if (!work) return null;
    return getMonthlyEarnings(work.id, now.getFullYear(), now.getMonth());
  }, [work, getMonthlyEarnings, now]);

  const monthAttendance = useMemo(() => {
    if (!work) return [];
    const totalDays = getDaysInMonth(now.getFullYear(), now.getMonth());
    const monthAtt = attendance.filter(
      (a) => a.workId === work.id && a.date.startsWith(getMonthKey(now.getFullYear(), now.getMonth()))
    );
    return Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const key = formatDateKey(d);
      const record = monthAtt.find((a) => a.date === key);
      const isSun = isSunday(d);
      const isSat = isSaturday(d);
      const sunToggle = sundayToggles.find((s) => s.workId === work.id && s.date === key);

      let status = 'not-scheduled';
      if (record) {
        status = record.status;
      } else if (isSun && (!sunToggle || !sunToggle.working)) {
        status = 'sunday-off';
      } else if (isSun && sunToggle?.working) {
        status = 'pending';
      } else if (work.recurrenceDays.includes(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] as any)) {
        status = 'pending';
      }

      return { date: d, dateKey: key, status, record, isSun, isSat };
    });
  }, [work, attendance, sundayToggles, now]);

  if (!work) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(-45deg, #f3f4ff, #eef2ff, #ffffff, #f9f9ff)' }}>
        <GlassCard className="text-center p-8">
          <p className="text-gray-400 mb-4">Work not found</p>
          <NeoButton onClick={() => navigate('/')}>Back to Dashboard</NeoButton>
        </GlassCard>
      </div>
    );
  }

  const sundays = monthAttendance.filter((d) => d.isSun);
  const saturdays = monthAttendance.filter((d) => d.isSat);

  const handleLeaveUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !saturdayDate) return;
    setUploading(true);
    try {
      await uploadLeaveLetter(work.id, saturdayDate, file);
      setUploadSuccess(`Leave letter approved for ${saturdayDate}`);
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err: any) {
      console.error(err);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen animated-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-700">{work.name}</h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={14} /> {work.startTime} - {work.endTime} ({work.bufferMinutes}min buffer)</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {work.recurrenceDays.join(', ')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <NeoButton onClick={() => navigate(`/work/edit/${work.id}`)} className="text-xs">Edit</NeoButton>
                  <NeoButton onClick={async () => { await deleteWork(work.id); navigate('/dashboard'); }} className="text-xs text-soft-red">Delete</NeoButton>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="neo-inset p-3 text-center">
                  <p className="text-xs text-gray-400">Monthly Salary</p>
                  <p className="text-lg font-semibold text-gray-700">{formatCurrency(work.monthlySalary)}</p>
                </div>
                <div className="neo-inset p-3 text-center">
                  <p className="text-xs text-gray-400">Day Rate</p>
                  <p className="text-lg font-semibold text-soft-teal">{earnings ? formatCurrency(earnings.dayRate) : '-'}</p>
                </div>
                <div className="neo-inset p-3 text-center">
                  <p className="text-xs text-gray-400">Earned This Month</p>
                  <p className="text-lg font-semibold text-soft-indigo">{earnings ? formatCurrency(earnings.totalEarned) : '-'}</p>
                </div>
              </div>

              <div className="flex items-center justify-center p-4">
                <div className="neo-inset p-4 inline-block">
                  <img src={work.qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                </div>
              </div>
              <div className="text-center">
                <NeoButton onClick={() => window.open(work.qrCodeUrl, '_blank')} className="text-xs">
                  <Download size={14} className="inline mr-1" /> Download QR
                </NeoButton>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Attendance History — {now.toLocaleString('default', { month: 'long' })}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs">
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Check-in</th>
                      <th className="pb-2">Proof</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthAttendance.slice().reverse().map((d) => (
                      <tr key={d.dateKey} className="border-t border-white/20">
                        <td className="py-2 pr-4 text-gray-600">{d.date.getDate()} {d.date.toLocaleString('default', { month: 'short' })}</td>
                        <td className="py-2 pr-4"><StatusBadge status={d.status as any} /></td>
                        <td className="py-2 pr-4 text-gray-400 text-xs">{d.record?.checkedInAt ? new Date(d.record.checkedInAt).toLocaleTimeString() : '-'}</td>
                        <td className="py-2 text-gray-400 text-xs">{d.record?.proofType || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard>
              <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                <Sun size={16} /> Sunday Settings
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {sundays.map((d) => {
                  const toggle = sundayToggles.find((s) => s.workId === work.id && s.date === d.dateKey);
                  const isWorking = toggle?.working || false;
                  return (
                    <div key={d.dateKey} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">{formatDate(d.date)}</span>
                      <NeoToggle
                        checked={isWorking}
                        onChange={(v) => setSundayToggle(work.id, d.dateKey, v)}
                      />
                    </div>
                  );
                })}
                {sundays.length === 0 && <p className="text-xs text-gray-400">No Sundays this month</p>}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                <Upload size={16} /> Saturday Leave Letters
              </h3>
              <div className="space-y-3">
                <select
                  value={saturdayDate}
                  onChange={(e) => setSaturdayDate(e.target.value)}
                  className="neo-inset px-3 py-2 text-sm w-full outline-none text-gray-600"
                >
                  <option value="">Select Saturday</option>
                  {saturdays.map((d) => (
                    <option key={d.dateKey} value={d.dateKey}>
                      {formatDate(d.date)}
                    </option>
                  ))}
                </select>

                <label className="neo-inset p-4 flex flex-col items-center justify-center cursor-pointer text-center hover:bg-white/10 transition-colors">
                  <Upload size={24} className="text-gray-300 mb-1" />
                  <span className="text-xs text-gray-400">Upload leave letter (image/PDF)</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    disabled={!saturdayDate || uploading}
                    onChange={handleLeaveUpload}
                  />
                </label>

                {uploading && <p className="text-xs text-gray-400 text-center">Uploading...</p>}
                {uploadSuccess && (
                  <div className="flex items-center gap-2 text-xs text-soft-green">
                    <CheckCircle size={14} /> {uploadSuccess}
                  </div>
                )}

                {leaveLetters.filter((l) => l.workId === work.id).length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">Approved leaves:</p>
                    {leaveLetters.filter((l) => l.workId === work.id).map((l) => (
                      <div key={l.date} className="flex items-center justify-between text-xs text-gray-500 py-1">
                        <span>{formatDate(l.date)}</span>
                        <CheckCircle size={12} className="text-soft-green" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Summary</h3>
              {earnings && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Present</span><span className="text-soft-green font-medium">{earnings.daysPresent}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Absent</span><span className="text-soft-red font-medium">{earnings.daysAbsent}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Leave</span><span className="text-soft-amber font-medium">{earnings.daysLeave}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Sunday off</span><span className="text-gray-400 font-medium">{earnings.daysSundayOff}</span></div>
                  <div className="border-t border-white/20 pt-2 flex justify-between font-semibold">
                    <span className="text-gray-500">Earned</span>
                    <span className="text-soft-teal">{formatCurrency(earnings.totalEarned)}</span>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
