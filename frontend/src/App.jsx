import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ChatbotWidget from './components/ChatbotWidget';

const HomePage = lazy(() => import('./pages/HomePage'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const LoanPage = lazy(() => import('./pages/LoanPage'));
const ValuationPage = lazy(() => import('./pages/ValuationPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const AgentsPage = lazy(() => import('./pages/AgentsPage'));
const SellPage = lazy(() => import('./pages/SellPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const BillingResultPage = lazy(() => import('./pages/BillingResultPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PropertyFormPage = lazy(() => import('./pages/PropertyFormPage'));

function PageLoading() {
  return (
    <div className="loading-wrapper" style={{ minHeight: '60vh' }}>
      <div className="spinner" aria-label="Loading page" />
    </div>
  );
}

export default function App() {
  return (
    <div className="z-app-layout">
      <Navbar />
      <div className="z-main-content-wrap">
        <Suspense fallback={<PageLoading />}>
          <Routes>
          {/* ── Public ────────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/search" element={<PropertiesPage />} />
          <Route path="/loan" element={<LoanPage />} />
          <Route path="/valuation" element={<ValuationPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/sell" element={<SellPage />} />
          <Route path="/saved" element={
            <ProtectedRoute><SavedPage /></ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute><SavedPage /></ProtectedRoute>
          } />

          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/billing/:result" element={<BillingResultPage />} />

          {/* ── Authenticated (any logged-in user) ────────── */}
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* ── Agent only ────────────────────────────────── */}
          <Route path="/dashboard" element={
            <ProtectedRoute requireAgent><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/properties/new" element={
            <ProtectedRoute requireAgent><PropertyFormPage /></ProtectedRoute>
          } />
          <Route path="/properties/:id/edit" element={
            <ProtectedRoute requireAgent><PropertyFormPage /></ProtectedRoute>
          } />

          {/* ── 404 ───────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Footer />
        <ChatbotWidget />
      </div>
    </div>
  );
}
