import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { t } = useLang();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate('/cuenta', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell section" style={{ maxWidth: 520 }}>
      <span className="eyebrow">{t('nav.account')}</span>
      <h1 style={{ fontSize: 'var(--step-3)', marginBottom: '1rem' }}>{t('auth.register')}</h1>

      {error && <div className="notice notice--error">{error}</div>}

      <form className="panel" onSubmit={submit}>
        <label className="field">
          <span>{t('auth.name')}</span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            autoComplete="name"
            required
          />
        </label>
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
          <span>{t('auth.phone')} ({t('common.optional')})</span>
          <input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            autoComplete="tel"
          />
        </label>
        <label className="field">
          <span>{t('auth.password')}</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="field__hint">{t('auth.passwordHint')}</p>
        </label>
        <button type="submit" className="btn btn--block" disabled={loading}>
          {loading ? t('common.loading') : t('auth.register')}
        </button>
        <p className="tiny muted" style={{ marginTop: '1rem', marginBottom: 0 }}>
          {t('auth.haveAccount')} <Link to="/login" style={{ color: 'var(--neon)' }}>{t('auth.login')}</Link>
        </p>
      </form>
    </div>
  );
}
