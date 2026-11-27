import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { useSession } from '@/lib/auth-client';
import AppShell from '@/components/layout/app-shell';
import LoadingScreen from '@/components/loading-screen';

import LandingPage from '@/pages/landing';
import PublicCalculator from '@/pages/public-calculator';
import { calculators } from '@/lib/public-calculators';
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
  // Public content must never wait for session validation.
  return <LandingPage />;
}

function SessionUnavailable() {
  return (
    <main className="min-h-screen grid place-content-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Unable to check your session</h1>
      <p className="text-sm text-text-secondary">Please check your connection and try again.</p>
      <button className="rounded-lg bg-panel border border-border-strong px-4 py-2" onClick={() => window.location.reload()}>Retry</button>
    </main>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, error } = useSession();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error && !session) {
    return <SessionUnavailable />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, error } = useSession();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error && !session) {
    return <SessionUnavailable />;
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
        {/* Public homepage; host redirects cookie-bearing requests optimistically */}
        <Route path="/" element={<RootRoute />} />
        {calculators.map(calculator => <Route key={calculator.path} path={calculator.path} element={<PublicCalculator calculator={calculator} />} />)}

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
