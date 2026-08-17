import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SidebarNav from './components/SidebarNav';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages — Public
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Pages — Authenticated
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';

// Pages — Agent only
import DashboardPage from './pages/DashboardPage';
import PropertyFormPage from './pages/PropertyFormPage';

export default function App() {
  return (
    <div className="z-app-layout">
      <Navbar />
      <SidebarNav />
      <div className="z-main-content-wrap">
        <Routes>
          {/* ── Public ────────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Authenticated (any logged-in user) ────────── */}
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute><FavoritesPage /></ProtectedRoute>
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
      </div>
    </div>
  );
}
