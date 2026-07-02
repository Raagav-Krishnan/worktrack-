export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export type AttendanceStatus = 'present' | 'absent' | 'leave-approved' | 'sunday-off' | 'sunday-working';

export type ProofType = 'qr' | 'screenshot' | 'leave-letter';

export interface Work {
  id: string;
  userId: string;
  name: string;
  monthlySalary: number;
  startTime: string; // HH:mm
  bufferMinutes: number;
  recurrenceDays: DayOfWeek[];
  qrCodeUrl: string;
  qrToken: string;
  createdAt: string; // ISO string
}

export interface AttendanceRecord {
  id: string;
  workId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkedInAt: string | null; // ISO string
  proofType: ProofType | null;
  proofUrl: string | null;
  dayRateApplied: number;
}

export interface SundayToggle {
  id?: string;
  workId: string;
  date: string; // YYYY-MM-DD
  working: boolean;
}

export interface LeaveLetter {
  id?: string;
  workId: string;
  date: string; // YYYY-MM-DD
  fileUrl: string;
  status: 'approved';
}

export interface MonthlyEarnings {
  workId: string;
  workName: string;
  month: string; // YYYY-MM
  daysPresent: number;
  daysAbsent: number;
  daysLeave: number;
  daysSundayOff: number;
  totalEarned: number;
  totalLost: number;
  dayRate: number;
}
