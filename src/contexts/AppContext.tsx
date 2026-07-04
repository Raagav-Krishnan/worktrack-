import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from './AuthContext';
import type {
  Work,
  AttendanceRecord,
  SundayToggle,
  LeaveLetter,
  AttendanceStatus,
  ProofType,
} from '../types';
import {
  getMonthKey,
  getTodayKey,
  formatDateKey,
  generateQrToken,
  getDayRate,
  getDaysInMonth,
  isSunday,
} from '../lib/utils';

interface AppContextType {
  works: Work[];
  attendance: AttendanceRecord[];
  sundayToggles: SundayToggle[];
  leaveLetters: LeaveLetter[];
  loading: boolean;
  addWork: (data: Omit<Work, 'id' | 'userId' | 'qrCodeUrl' | 'qrToken' | 'createdAt'>) => Promise<string>;
  updateWork: (id: string, data: Partial<Work>) => Promise<void>;
  deleteWork: (id: string) => Promise<void>;
  recordAttendance: (
    workId: string,
    status: AttendanceStatus,
    proofType?: ProofType,
    proofUrl?: string
  ) => Promise<void>;
  setSundayToggle: (workId: string, date: string, working: boolean) => Promise<void>;
  uploadLeaveLetter: (workId: string, date: string, file: File) => Promise<void>;
  getMonthAttendance: (workId: string, year: number, month: number) => AttendanceRecord[];
  getMonthlyEarnings: (workId: string, year: number, month: number) => {
    dayRate: number;
    daysPresent: number;
    daysAbsent: number;
    daysLeave: number;
    daysSundayOff: number;
    totalEarned: number;
    totalLost: number;
    totalPossible: number;
  };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [works, setWorks] = useState<Work[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sundayToggles, setSundayToggles] = useState<SundayToggle[]>([]);
  const [leaveLetters, setLeaveLetters] = useState<LeaveLetter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorks([]);
      setAttendance([]);
      setSundayToggles([]);
      setLeaveLetters([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let loaded = 0;
    const onLoaded = () => {
      loaded++;
      if (loaded === 4) setLoading(false);
    };

    const worksQ = query(
      collection(db, 'works'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubWorks = onSnapshot(worksQ, (snap) => {
      setWorks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Work)));
      onLoaded();
    });

    const attendanceQ = query(
      collection(db, 'attendance'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubAtt = onSnapshot(attendanceQ, (snap) => {
      setAttendance(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord)));
      onLoaded();
    });

    const sundayQ = query(
      collection(db, 'sundayToggles'),
      where('userId', '==', user.uid)
    );
    const unsubSun = onSnapshot(sundayQ, (snap) => {
      setSundayToggles(snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as SundayToggle)));
      onLoaded();
    });

    const leaveQ = query(
      collection(db, 'leaveLetters'),
      where('userId', '==', user.uid)
    );
    const unsubLeave = onSnapshot(leaveQ, (snap) => {
      setLeaveLetters(snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as LeaveLetter)));
      onLoaded();
    });

    return () => {
      unsubWorks();
      unsubAtt();
      unsubSun();
      unsubLeave();
    };
  }, [user]);

  const addWork = useCallback(
    async (data: Omit<Work, 'id' | 'userId' | 'qrCodeUrl' | 'qrToken' | 'createdAt'>) => {
      if (!user) throw new Error('Not authenticated');
      const qrToken = generateQrToken();
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=worktrack:${qrToken}`;
      const docRef = await addDoc(collection(db, 'works'), {
        ...data,
        userId: user.uid,
        qrCodeUrl,
        qrToken,
        createdAt: Timestamp.now().toDate().toISOString(),
      });
      return docRef.id;
    },
    [user]
  );

  const updateWork = useCallback(
    async (id: string, data: Partial<Work>) => {
      await updateDoc(doc(db, 'works', id), data);
    },
    []
  );

  const deleteWork = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'works', id));
  }, []);

  const recordAttendance = useCallback(
    async (
      workId: string,
      status: AttendanceStatus,
      proofType?: ProofType,
      proofUrl?: string
    ) => {
      if (!user) throw new Error('Not authenticated');

      const today = getTodayKey();
      const work = works.find((w) => w.id === workId);
      if (!work) throw new Error('Work not found');

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const dayRate = getDayRate(work.monthlySalary, year, month);

      const existing = attendance.find((a) => a.workId === workId && a.date === today);

      if (existing) {
        await updateDoc(doc(db, 'attendance', existing.id), {
          status,
          checkedInAt: status === 'present' ? now.toISOString() : existing.checkedInAt,
          proofType: proofType || existing.proofType,
          proofUrl: proofUrl || existing.proofUrl,
          dayRateApplied: dayRate,
        });
      } else {
        await addDoc(collection(db, 'attendance'), {
          workId,
          userId: user.uid,
          date: today,
          status,
          checkedInAt: status === 'present' ? now.toISOString() : null,
          proofType: proofType || null,
          proofUrl: proofUrl || null,
          dayRateApplied: dayRate,
        });
      }
    },
    [user, works, attendance]
  );

  const setSundayToggle = useCallback(
    async (workId: string, date: string, working: boolean) => {
      if (!user) throw new Error('Not authenticated');
      const existing = sundayToggles.find((s) => s.workId === workId && s.date === date);
      if (existing && existing.id) {
        await updateDoc(doc(db, 'sundayToggles', existing.id), { working });
      } else {
        await addDoc(collection(db, 'sundayToggles'), {
          workId,
          userId: user.uid,
          date,
          working,
        });
      }
    },
    [user, sundayToggles]
  );

  const uploadLeaveLetter = useCallback(
    async (workId: string, date: string, file: File) => {
      if (!user) throw new Error('Not authenticated');

      const work = works.find((w) => w.id === workId);
      if (!work) throw new Error('Work not found');

      const storageRef = ref(storage, `leave-letters/${user.uid}/${workId}/${date}_${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'leaveLetters'), {
        workId,
        userId: user.uid,
        date,
        fileUrl,
        status: 'approved',
      });

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const dayRate = getDayRate(work.monthlySalary, year, month);

      const existing = attendance.find((a) => a.workId === workId && a.date === date);
      if (existing) {
        await updateDoc(doc(db, 'attendance', existing.id), {
          status: 'leave-approved',
          proofType: 'leave-letter',
          proofUrl: fileUrl,
          dayRateApplied: dayRate,
        });
      } else {
        await addDoc(collection(db, 'attendance'), {
          workId,
          userId: user.uid,
          date,
          status: 'leave-approved',
          checkedInAt: null,
          proofType: 'leave-letter',
          proofUrl: fileUrl,
          dayRateApplied: dayRate,
        });
      }
    },
    [user, works, attendance]
  );

  const getMonthAttendance = useCallback(
    (workId: string, year: number, month: number) => {
      const monthKey = getMonthKey(year, month);
      return attendance.filter(
        (a) => a.workId === workId && a.date.startsWith(monthKey)
      );
    },
    [attendance]
  );

  const getMonthlyEarnings = useCallback(
    (workId: string, year: number, month: number) => {
      const work = works.find((w) => w.id === workId);
      if (!work) return { dayRate: 0, daysPresent: 0, daysAbsent: 0, daysLeave: 0, daysSundayOff: 0, totalEarned: 0, totalLost: 0, totalPossible: 0 };

      const dayRate = getDayRate(work.monthlySalary, year, month);
      const monthAttendance = getMonthAttendance(workId, year, month);

      let daysPresent = 0;
      let daysAbsent = 0;
      let daysLeave = 0;
      let daysSundayOff = 0;

      const totalDays = getDaysInMonth(year, month);

      for (let d = 1; d <= totalDays; d++) {
        const date = new Date(year, month, d);
        const dateKey = formatDateKey(date);

        const record = monthAttendance.find((a) => a.date === dateKey);

        if (record) {
          switch (record.status) {
            case 'present':
              daysPresent++;
              break;
            case 'absent':
              daysAbsent++;
              break;
            case 'leave-approved':
              daysLeave++;
              break;
            case 'sunday-off':
              daysSundayOff++;
              break;
            case 'sunday-working':
              if (record.checkedInAt) daysPresent++;
              else daysAbsent++;
              break;
          }
        } else if (isSunday(date)) {
          const toggle = sundayToggles.find(
            (s) => s.workId === workId && s.date === dateKey
          );
          if (!toggle || !toggle.working) {
            daysSundayOff++;
          }
        }
      }

      const totalEarned = (daysPresent + daysLeave) * dayRate;
      const totalPossible = totalDays * dayRate;
      const totalLost = daysAbsent * dayRate;

      return { dayRate, daysPresent, daysAbsent, daysLeave, daysSundayOff, totalEarned, totalLost, totalPossible };
    },
    [works, attendance, sundayToggles, getMonthAttendance]
  );

  return (
    <AppContext.Provider
      value={{
        works,
        attendance,
        sundayToggles,
        leaveLetters,
        loading,
        addWork,
        updateWork,
        deleteWork,
        recordAttendance,
        setSundayToggle,
        uploadLeaveLetter,
        getMonthAttendance,
        getMonthlyEarnings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
