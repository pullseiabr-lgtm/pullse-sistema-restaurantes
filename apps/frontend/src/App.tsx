import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { RequireAuth } from './components/RequireAuth';
import { AppLayout } from './components/AppLayout';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
