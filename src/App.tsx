import { BrowserRouter, Routes, Route } from 'react-router';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="input" element={<InputPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="safe-skips" element={<SafeSkipsPage />} />
          <Route path="recovery" element={<RecoveryPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="semesters" element={<SemesterList />} />
          <Route path="semesters/new" element={<CreateSemester />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
