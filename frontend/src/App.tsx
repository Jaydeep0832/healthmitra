import React, { Suspense, lazy } from 'react';
import 'leaflet/dist/leaflet.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import AuthGuard from './components/Common/AuthGuard';
import ErrorBoundary from './components/Common/ErrorBoundary';
import LoadingSpinner from './components/Common/LoadingSpinner';
import { I18nProvider } from './i18n/I18nContext';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const Hospitals = lazy(() => import('./pages/Hospitals'));
const SymptomChecker = lazy(() => import('./pages/SymptomChecker'));
const Reports = lazy(() => import('./pages/Reports'));
const Schemes = lazy(() => import('./pages/Schemes'));

function AppContent() {
  const location = useLocation();
  const isChatbot = location.pathname === '/chatbot';

  return (
    <div className={`flex flex-col bg-slate-50 text-gray-900 font-sans ${isChatbot ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Navbar />
      <main className={`flex-1 min-h-0 ${isChatbot ? 'overflow-hidden flex flex-col' : ''}`}>
        <Suspense fallback={<LoadingSpinner size="lg" message="Loading page..." />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/chatbot"
              element={
                <AuthGuard>
                  <Chatbot />
                </AuthGuard>
              }
            />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route
              path="/symptoms"
              element={
                <AuthGuard>
                  <SymptomChecker />
                </AuthGuard>
              }
            />
            <Route
              path="/reports"
              element={
                <AuthGuard>
                  <Reports />
                </AuthGuard>
              }
            />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isChatbot && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <Router>
          <AppContent />
        </Router>
      </I18nProvider>
    </ErrorBoundary>
  );
}

