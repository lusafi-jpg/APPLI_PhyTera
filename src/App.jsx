import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import FieldDetailPage from './pages/FieldDetailPage';
import Login from './pages/Login';
import AlertsPage from './pages/AlertsPage';
import DevicesPage from './pages/DevicesPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import FarmsPage from './pages/FarmsPage';
import CropAnalysisPage from './pages/CropAnalysisPage';
import DroneMissionsPage from './pages/DroneMissionsPage';
import MaintenancePage from './pages/MaintenancePage';
import NotificationsPage from './pages/NotificationsPage';
import AuditLogsPage from './pages/AuditLogsPage';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="farms" element={<FarmsPage />} />
          <Route path="fields" element={<MapPage />} />
          <Route path="fields/:id" element={<FieldDetailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="crop-analysis" element={<CropAnalysisPage />} />
          <Route path="drone-missions" element={<DroneMissionsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
