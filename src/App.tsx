import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WorkDetailPage from './pages/WorkDetailPage';
import AddWorkPage from './pages/AddWorkPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import LoadingSpinner from './components/ui/LoadingSpinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppProvider><DashboardPage /></AppProvider></ProtectedRoute>} />
      <Route path="/work/new" element={<ProtectedRoute><AppProvider><AddWorkPage /></AppProvider></ProtectedRoute>} />
      <Route path="/work/edit/:id" element={<ProtectedRoute><AppProvider><AddWorkPage /></AppProvider></ProtectedRoute>} />
      <Route path="/work/:id" element={<ProtectedRoute><AppProvider><WorkDetailPage /></AppProvider></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><AppProvider><CalendarPage /></AppProvider></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppProvider><ReportsPage /></AppProvider></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/*" element={
          <AuthProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
              }}
            />
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}
