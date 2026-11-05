import { useState } from 'react';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../services/api.js';
import { IconInstagram, IconTiktok, IconWhatsapp } from '../components/Icons.jsx';

export default function Contact() {
  const { t, lang } = useLang();
  const { settings } = useStore();
  const contact = settings?.contact || {};
  const [form, setForm] = useState({ name: '', contact: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (!form.name.trim()) found.name = true;
    if (!form.contact.trim()) found.contact = true;
    if (!form.subject.trim()) found.subject = true;
    if (form.message.trim().length < 10) found.message = true;
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await api.createMessage(form);
      setStatus('ok');
      setForm({ name: '', contact: '', subject: '', message: '' });
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  const whatsapp = `https://wa.me/${String(contact.whatsapp || '').replace(/\D/g, '')}`;

  return (
    <div className="shell section">
      <span className="eyebrow">{t('nav.contact')}</span>
      <h1 style={{ fontSize: 'var(--step-4)', marginBottom: '0.5rem' }}>{t('contact.title')}</h1>
      <p>{t('contact.lead')}</p>

      <div className="checkout-grid">
        <form className="panel" onSubmit={submit} noValidate>
          {status === 'ok' && <div className="notice notice--ok">{t('contact.sent')}</div>}
          {status && status !== 'ok' && <div className="notice notice--error">{status}</div>}

          <div className="form-grid">
            <label className="field">
              <span>{t('contact.name')} *</span>
              <input value={form.name} onChange={update('name')} aria-invalid={Boolean(errors.name)} autoComplete="name" />
            </label>
            <label className="field">
              <span>{t('contact.contact')} *</span>
              <input value={form.contact} onChange={update('contact')} aria-invalid={Boolean(errors.contact)} />
            </label>
            <label className="field field--full">
              <span>{t('contact.subject')} *</span>
              <input value={form.subject} onChange={update('subject')} aria-invalid={Boolean(errors.subject)} />
            </label>
            <label className="field field--full">
              <span>{t('contact.message')} *</span>
              <textarea value={form.message} onChange={update('message')} aria-invalid={Boolean(errors.message)} rows={5} />
            </label>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? t('common.loading') : t('contact.send')}
          </button>
        </form>

        <aside className="stack">
          <div className="panel">
            <h4 style={{ marginBottom: '1rem' }}>{t('contact.whatsapp')}</h4>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="btn btn--block">
              <IconWhatsapp /> WhatsApp
            </a>
            <div className="socials">
              <a href={contact.instagram || '#'} target="_blank" rel="noreferrer" aria-label={t('contact.instagram')}>
                <IconInstagram />
              </a>
              <a href={contact.tiktok || '#'} target="_blank" rel="noreferrer" aria-label={t('contact.tiktok')}>
                <IconTiktok />
              </a>
            </div>
            <p className="tiny muted" style={{ marginTop: '0.8rem', marginBottom: 0 }}>
              {t('contact.noFacebook')}
            </p>
          </div>

          <div className="panel">
            <h4 style={{ marginBottom: '0.6rem' }}>{t('contact.hours')}</h4>
            <p className="tiny muted" style={{ whiteSpace: 'pre-line', margin: 0 }}>
              {t('contact.hoursValue')}
            </p>
          </div>

          <div className="panel">
            <h4 style={{ marginBottom: '0.6rem' }}>{t('checkout.address')}</h4>
            <p className="tiny muted" style={{ margin: 0 }}>
              {settings?.delivery?.businessAddress}
            </p>
            <p className="tiny muted" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              {settings?.coverage?.[lang] || settings?.coverage?.es}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
