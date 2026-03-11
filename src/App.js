import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MISInbox from './pages/MISInbox';
import CombinedRecords from './pages/CombinedRecords';
import Classification, { ClassificationTab, ImproperWorklistTab } from './pages/Classification';
import ApprovalMapping, { AutoTaggedTab, ManualMappingTab } from './pages/ApprovalMapping';
import './App.css';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }>
        <Route index element={<MISInbox />} />
        <Route path="combined" element={<CombinedRecords />} />
        <Route path="classification" element={<Classification />}>
          <Route index element={<ClassificationTab />} />
          <Route path="improper" element={<ImproperWorklistTab />} />
        </Route>
        <Route path="approval-mapping" element={<ApprovalMapping />}>
          <Route index element={<AutoTaggedTab />} />
          <Route path="manual" element={<ManualMappingTab />} />
        </Route>
      </Route>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
