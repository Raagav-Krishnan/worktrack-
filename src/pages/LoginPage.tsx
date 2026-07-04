import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center">
      <div className="glass-card p-10 w-full max-w-md mx-4 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl neo flex items-center justify-center">
            <span className="text-2xl font-bold text-soft-indigo">W</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-700 mb-1">WorkTrack</h1>
          <p className="text-sm text-gray-400">Multi-job attendance & payroll tracker</p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="neo-button w-full flex items-center justify-center gap-3 text-gray-600"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>

        <p className="mt-6 text-xs text-gray-400">
          Track your work attendance across multiple jobs
        </p>
      </div>
    </div>
  );
}
