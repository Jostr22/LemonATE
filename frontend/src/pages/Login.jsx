import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { t } = useLang();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(form);
      const target = location.state?.from || (user.role === 'admin' ? '/admin' : '/cuenta');
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell section" style={{ maxWidth: 520 }}>
      <span className="eyebrow">{t('nav.account')}</span>
      <h1 style={{ fontSize: 'var(--step-3)', marginBottom: '1rem' }}>{t('auth.login')}</h1>

      {error && <div className="notice notice--error">{error}</div>}

      <form className="panel" onSubmit={submit}>
        <label className="field">
          <span>{t('auth.email')}</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            autoComplete="email"
            required
          />
        </label>
        <label className="field">
          <span>{t('auth.password')}</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            autoComplete="current-password"
            minLength={8}
            required
          />
        </label>
        <button type="submit" className="btn btn--block" disabled={loading}>
          {loading ? t('common.loading') : t('auth.login')}
        </button>

        <p className="tiny muted" style={{ marginTop: '1rem', marginBottom: 0 }}>
          {t('auth.noAccount')} <Link to="/registro" style={{ color: 'var(--neon)' }}>{t('auth.register')}</Link>
        </p>
      </form>
    </div>
  );
}
