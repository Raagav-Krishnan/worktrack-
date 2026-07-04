import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import WorkCard from '../components/dashboard/WorkCard';
import GlassCard from '../components/ui/GlassCard';
import NeoButton from '../components/ui/NeoButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CheckInModal from '../components/attendance/CheckInModal';
import type { Work } from '../types';
import { formatCurrency, getCurrentMonthKey } from '../lib/utils';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Plus, LogOut, CalendarDays, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { works, attendance, getMonthlyEarnings, loading } = useApp();
  const navigate = useNavigate();
  const [checkInWork, setCheckInWork] = useState<Work | null>(null);

  const now = new Date();
  const monthKey = getCurrentMonthKey();

  const totalEarnings = useMemo(() => {
    return works.reduce((sum, w) => {
      const e = getMonthlyEarnings(w.id, now.getFullYear(), now.getMonth());
      return sum + e.totalEarned;
    }, 0);
  }, [works, getMonthlyEarnings, now]);

  const totalLost = useMemo(() => {
    return works.reduce((sum, w) => {
      const e = getMonthlyEarnings(w.id, now.getFullYear(), now.getMonth());
      return sum + e.totalLost;
    }, 0);
  }, [works, getMonthlyEarnings, now]);

  const chartData = useMemo(() => {
    const months: { name: string; earnings: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      let earnings = 0;
      works.forEach((w) => {
        const e = getMonthlyEarnings(w.id, d.getFullYear(), d.getMonth());
        earnings += e.totalEarned;
      });
      months.push({ name: format(d, 'MMM yy'), earnings });
    }
    return months;
  }, [works, getMonthlyEarnings, now]);

  const allAttendances = useMemo(() => {
    const map = new Map<string, { present: number; absent: number; leave: number }>();
    for (let d = 1; d <= now.getDate(); d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), d);
      const key = format(date, 'yyyy-MM-dd');
      map.set(key, { present: 0, absent: 0, leave: 0 });
    }
    attendance.forEach((a) => {
      if (a.date.startsWith(monthKey)) {
        const entry = map.get(a.date);
        if (entry) {
          if (a.status === 'present' || a.status === 'leave-approved') entry.present++;
          else if (a.status === 'absent') entry.absent++;
        }
      }
    });
    return Array.from(map.entries()).map(([date, v]) => ({ date, ...v }));
  }, [attendance, monthKey, now]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen animated-bg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-700">Hello, {user?.displayName || 'User'}</h1>
            <p className="text-sm text-gray-400">{format(now, 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="flex items-center gap-3">
            <NeoButton onClick={() => navigate('/calendar')} className="text-xs">
              <CalendarDays size={16} />
            </NeoButton>
            <NeoButton onClick={() => navigate('/reports')} className="text-xs">
              <BarChart3 size={16} />
            </NeoButton>
            <NeoButton onClick={logout} className="text-xs">
              <LogOut size={16} />
            </NeoButton>
          </div>
        </header>

        <GlassCard className="mb-8 text-center py-8">
          <p className="text-sm text-gray-400 mb-1">Total Earnings This Month</p>
          <p className="text-5xl font-bold text-gray-700">{formatCurrency(totalEarnings)}</p>
          {totalLost > 0 && (
            <p className="text-sm text-soft-red mt-2">
              {formatCurrency(totalLost)} lost to missed check-ins
            </p>
          )}
        </GlassCard>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-600">Your Works</h2>
          <NeoButton onClick={() => navigate('/work/new')} accent>
            <Plus size={16} className="inline mr-1" /> Add Work
          </NeoButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} onCheckIn={setCheckInWork} />
          ))}
          {works.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 mb-4">No works added yet. Create your first one!</p>
              <NeoButton onClick={() => navigate('/work/new')} accent>
                <Plus size={16} className="inline mr-1" /> Add Work
              </NeoButton>
            </div>
          )}
        </div>

        <GlassCard className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Earnings Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e7" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                }}
              />
              <Line type="monotone" dataKey="earnings" stroke="#7c7b9a" strokeWidth={2} dot={{ fill: '#7c7b9a', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-medium text-gray-500 mb-4">Daily Attendance (This Month)</h3>
          <div className="flex flex-wrap gap-1.5">
            {allAttendances.map((d) => (
              <div
                key={d.date}
                className={`w-7 h-7 rounded-md text-[10px] flex items-center justify-center font-medium transition-colors
                  ${d.present > 0 ? 'bg-soft-green/40 text-green-800' : d.absent > 0 ? 'bg-soft-red/30 text-red-700' : d.leave > 0 ? 'bg-soft-amber/30 text-amber-700' : 'bg-gray-100 text-gray-300'}`}
                title={`${d.date}: ${d.present} present, ${d.absent} absent`}
              >
                {new Date(d.date).getDate()}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {checkInWork && (
        <CheckInModal
          work={checkInWork}
          onClose={() => setCheckInWork(null)}
          onComplete={() => setCheckInWork(null)}
        />
      )}
    </div>
  );
}
