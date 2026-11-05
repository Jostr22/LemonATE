import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LangContext.jsx';

/** Protege rutas privadas. `admin` exige rol de administrador. */
export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading, isAdmin } = useAuth();
  const { t } = useLang();
  const location = useLocation();

  if (loading) {
    return (
      <div className="shell section">
        <p className="muted">{t('common.loading')}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (admin && !isAdmin) {
    return (
      <div className="shell section">
        <div className="notice notice--error">{t('admin.notAdmin')}</div>
      </div>
    );
  }

  return children;
}
