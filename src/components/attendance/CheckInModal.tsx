import { useState, useEffect } from 'react';
import type { Work } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { isWithinCheckInWindow, formatCurrency } from '../../lib/utils';
import { X, Camera, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface CheckInModalProps {
  work: Work;
  onClose: () => void;
  onComplete: () => void;
}

export default function CheckInModal({ work, onClose, onComplete }: CheckInModalProps) {
  const { recordAttendance } = useApp();
  const [tab, setTab] = useState<'scan' | 'upload'>('scan');
  const [status, setStatus] = useState<'idle' | 'success' | 'failed' | 'scanning'>('idle');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState<number>(0);

  const windowInfo = isWithinCheckInWindow(work.startTime, work.bufferMinutes);

  useEffect(() => {
    if (windowInfo.isOpen) {
      setCountdown(windowInfo.remainingMinutes);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [windowInfo]);

  const handleQrScan = async () => {
    setStatus('scanning');
    setError('');
    try {
      await recordAttendance(work.id, 'present', 'qr');
      setStatus('success');
      setTimeout(onComplete, 2000);
    } catch (err: any) {
      setError(err.message);
      setStatus('failed');
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('scanning');
    setError('');
    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      await recordAttendance(work.id, 'present', 'screenshot', dataUrl);
      setStatus('success');
      setTimeout(onComplete, 2000);
    } catch (err: any) {
      setError(err.message);
      setStatus('failed');
    }
  };

  const handleManualMark = async () => {
    try {
      if (windowInfo.isOpen) {
        await recordAttendance(work.id, 'present', 'qr');
      } else {
        await recordAttendance(work.id, 'absent');
      }
      setStatus(windowInfo.isOpen ? 'success' : 'failed');
      setTimeout(onComplete, 2000);
    } catch (err: any) {
      setError(err.message);
      setStatus('failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card max-w-md w-full p-8 relative animate-[scaleIn_0.2s_ease]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-700 mb-1">Check In</h2>
        <p className="text-sm text-gray-400 mb-4">{work.name}</p>

        {windowInfo.isOpen ? (
          <div className="neo-inset p-4 mb-6 flex items-center gap-3">
            <Clock size={20} className="text-soft-teal" />
            <div>
              <p className="text-sm font-medium text-soft-teal">Check-in window open</p>
              <p className="text-xs text-gray-400">{countdown} min remaining</p>
            </div>
          </div>
        ) : (
          <div className="neo-inset p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={20} className="text-soft-red" />
            <div>
              <p className="text-sm font-medium text-soft-red">Check-in window closed</p>
              <p className="text-xs text-gray-400">Today's pay for {work.name} will not be credited</p>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <>
            <div className="flex border-b border-white/30 mb-6">
              <button
                onClick={() => setTab('scan')}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${tab === 'scan' ? 'text-soft-indigo border-b-2 border-soft-indigo' : 'text-gray-400'}`}
              >
                <Camera size={16} className="inline mr-1.5" />Scan QR
              </button>
              <button
                onClick={() => setTab('upload')}
                className={`flex-1 pb-3 text-sm font-medium transition-colors ${tab === 'upload' ? 'text-soft-indigo border-b-2 border-soft-indigo' : 'text-gray-400'}`}
              >
                <Upload size={16} className="inline mr-1.5" />Upload Screenshot
              </button>
            </div>

            {tab === 'scan' ? (
              <div className="text-center">
                <div className="neo-inset p-8 mb-4 flex items-center justify-center">
                  <img src={work.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
                <NeoButton onClick={handleQrScan} accent className="w-full">
                  <Camera size={16} className="inline mr-1.5" />Simulate QR Scan
                </NeoButton>
                <p className="text-xs text-gray-400 mt-2">Camera QR scanning not available in demo. Click to simulate.</p>
              </div>
            ) : (
              <div className="text-center">
                <div
                  className="neo-inset p-8 mb-4 flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => document.getElementById('screenshot-input')?.click()}
                >
                  <Upload size={32} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload a screenshot</p>
                </div>
                <input
                  id="screenshot-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleScreenshotUpload}
                />
                {!windowInfo.isOpen && (
                  <NeoButton onClick={handleManualMark} className="w-full mt-2">
                    Mark as Absent
                  </NeoButton>
                )}
              </div>
            )}
          </>
        )}

        {status === 'scanning' && (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-soft-indigo/20 border-t-soft-indigo rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">Processing...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8 animate-[scaleIn_0.3s_ease]">
            <CheckCircle size={48} className="text-soft-green mx-auto mb-3" />
            <p className="text-lg font-semibold text-green-800">Checked In!</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(work.monthlySalary / 30)} credited for today
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center py-8 animate-[scaleIn_0.3s_ease]">
            <AlertCircle size={48} className="text-soft-red mx-auto mb-3" />
            <p className="text-lg font-semibold text-red-800">Check-in Missed</p>
            <p className="text-sm text-gray-500 mt-1">{error || 'Buffer time has passed'}</p>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          Salary: {formatCurrency(work.monthlySalary)}/mo • Schedule: {work.startTime} ({work.bufferMinutes}min buffer)
        </p>
      </div>
    </div>
  );
}

function NeoButton({ children, onClick, className = '', accent }: { children: React.ReactNode; onClick?: () => void; className?: string; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`neo-button font-medium text-sm ${accent ? 'text-soft-indigo' : 'text-gray-600'} ${className}`}
    >
      {children}
    </button>
  );
}
