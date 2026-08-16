/**
 * ProtectedRoute — wraps routes that require authentication.
 * If loading (hydrating from localStorage), shows a spinner.
 * If not authenticated, redirects to /login preserving the intended path.
 * If requireAgent=true, non-agent users are redirected to home.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAgent = false }) {
  const { isAuthenticated, isAgent, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-wrapper" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAgent && !isAgent) {
    return <Navigate to="/" replace />;
  }

  return children;
}
