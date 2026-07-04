import type { DayOfWeek, Work } from '../types';

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const totalDays = getDaysInMonth(year, month);
  for (let d = 1; d <= totalDays; d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

export function isDayInRecurrence(date: Date, recurrenceDays: DayOfWeek[]): boolean {
  return recurrenceDays.includes(getDayOfWeek(date));
}

export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

export function isSaturday(date: Date): boolean {
  return date.getDay() === 6;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return getMonthKey(now.getFullYear(), now.getMonth());
}

export function isWithinCheckInWindow(
  startTime: string,
  bufferMinutes: number
): { isOpen: boolean; remainingMinutes: number; windowEnd: Date } {
  const now = new Date();
  const [h, m] = startTime.split(':').map(Number);
  const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  const bufferMs = bufferMinutes * 60 * 1000;
  const windowEnd = new Date(windowStart.getTime() + bufferMs);

  if (now >= windowStart && now <= windowEnd) {
    const remaining = Math.max(0, Math.floor((windowEnd.getTime() - now.getTime()) / 60000));
    return { isOpen: true, remainingMinutes: remaining, windowEnd };
  }
  return { isOpen: false, remainingMinutes: 0, windowEnd };
}

export function checkScheduleCollision(
  newWork: { startTime: string; endTime: string; bufferMinutes: number; recurrenceDays: DayOfWeek[] },
  existingWorks: Work[],
  excludeWorkId?: string
): Work | null {
  const newStart = newWork.startTime;
  const newEnd = newWork.endTime;

  for (const work of existingWorks) {
    if (excludeWorkId && work.id === excludeWorkId) continue;

    const hasCommonDay = work.recurrenceDays.some((d) => newWork.recurrenceDays.includes(d));
    if (!hasCommonDay) continue;

    const existingStart = work.startTime;
    const existingEnd = work.endTime;

    if (timeRangesOverlap(newStart, newEnd, existingStart, existingEnd)) {
      return work;
    }
  }
  return null;
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const rh = Math.floor(total / 60) % 24;
  const rm = total % 60;
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
}

function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && start2 < end1;
}

export function generateQrToken(): string {
  return crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
}

export function getDayRate(monthlySalary: number, year: number, month: number): number {
  const days = getDaysInMonth(year, month);
  return monthlySalary / days;
}
