import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { useSession } from '@/lib/auth-client';
import AppShell from '@/components/layout/app-shell';
import LoadingScreen from '@/components/loading-screen';

const LandingPage = lazy(() => import('@/pages/landing'));
const LoginPage = lazy(() => import('@/pages/login'));
const ResetPasswordPage = lazy(() => import('@/pages/reset-password'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const InputPage = lazy(() => import('@/pages/input'));
const CalendarPage = lazy(() => import('@/pages/calendar'));
const AnalyticsPage = lazy(() => import('@/pages/analytics'));
const SafeSkipsPage = lazy(() => import('@/pages/safe-skips'));
const RecoveryPage = lazy(() => import('@/pages/recovery'));
const HistoryPage = lazy(() => import('@/pages/history'));
const PredictorPage = lazy(() => import('@/pages/predictor'));
const TimeWindowPage = lazy(() => import('@/pages/time-window'));
const SettingsPage = lazy(() => import('@/pages/settings'));
const SemesterList = lazy(() => import('@/pages/semesters/semester-list'));
const CreateSemester = lazy(() => import('@/pages/semesters/create-semester'));
const EditSemester = lazy(() => import('@/pages/semesters/edit-semester'));

function RootRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <LandingPage />
    </Suspense>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root route: shows Landing Page to unauthenticated visitors, redirects authenticated users to app dashboard */}
        <Route path="/" element={<RootRoute />} />

        {/* Public route */}
        <Route
          path="login"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingScreen />}>
                <LoginPage />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="reset-password"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingScreen />}>
                <ResetPasswordPage />
              </Suspense>
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="input"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <InputPage />
              </Suspense>
            }
          />
          <Route
            path="calendar"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <CalendarPage />
              </Suspense>
            }
          />
          <Route
            path="analytics"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <AnalyticsPage />
              </Suspense>
            }
          />
          <Route
            path="safe-skips"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <SafeSkipsPage />
              </Suspense>
            }
          />
          <Route
            path="recovery"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <RecoveryPage />
              </Suspense>
            }
          />
          <Route
            path="history"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <HistoryPage />
              </Suspense>
            }
          />
          <Route
            path="predictor"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <PredictorPage />
              </Suspense>
            }
          />
          <Route
            path="time-window"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <TimeWindowPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <SettingsPage />
              </Suspense>
            }
          />
          <Route
            path="semesters"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <SemesterList />
              </Suspense>
            }
          />
          <Route
            path="semesters/new"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <CreateSemester />
              </Suspense>
            }
          />
          <Route
            path="semesters/:id/edit"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <EditSemester />
              </Suspense>
            }
          />
        </Route>
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
