import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useSession } from '@/lib/auth-client';
import AppShell from '@/components/layout/app-shell';
import Dashboard from '@/pages/dashboard';
import InputPage from '@/pages/input';
import CalendarPage from '@/pages/calendar';
import AnalyticsPage from '@/pages/analytics';
import SafeSkipsPage from '@/pages/safe-skips';
import RecoveryPage from '@/pages/recovery';
import SettingsPage from '@/pages/settings';
import HistoryPage from '@/pages/history';
import SemesterList from '@/pages/semesters/semester-list';
import CreateSemester from '@/pages/semesters/create-semester';
import EditSemester from '@/pages/semesters/edit-semester';
import LoginPage from '@/pages/login';
import PredictorPage from '@/pages/predictor';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="input" element={<InputPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="safe-skips" element={<SafeSkipsPage />} />
          <Route path="recovery" element={<RecoveryPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="predictor" element={<PredictorPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="semesters" element={<SemesterList />} />
          <Route path="semesters/new" element={<CreateSemester />} />
          <Route path="semesters/:id/edit" element={<EditSemester />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
