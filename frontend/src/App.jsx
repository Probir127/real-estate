import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ChatbotWidget from './components/ChatbotWidget';

// Pages — Public
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoanPage from './pages/LoanPage';
import ValuationPage from './pages/ValuationPage';
import PricingPage from './pages/PricingPage';
import AgentsPage from './pages/AgentsPage';
import SellPage from './pages/SellPage';
import SavedPage from './pages/SavedPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Pages — Authenticated
import ProfilePage from './pages/ProfilePage';

// Pages — Agent only
import DashboardPage from './pages/DashboardPage';
import PropertyFormPage from './pages/PropertyFormPage';

export default function App() {
  return (
    <div className="z-app-layout">
      <Navbar />
      <div className="z-main-content-wrap">
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
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/favorites" element={<SavedPage />} />

          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

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
        <Footer />
        <ChatbotWidget />
      </div>
    </div>
  );
}

