import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { formatCOP } from '../../../shared/pricing.js';
import { IconTrash } from '../components/Icons.jsx';

const TABS = ['profile', 'addresses', 'orders', 'favorites'];

export default function Account() {
  const { t, pick, lang } = useLang();
  const { user, updateMe, logout } = useAuth();
  const { products } = useStore();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [orders, setOrders] = useState(null);
  const [newAddress, setNewAddress] = useState({ label: '', line: '', neighborhood: '', notes: '', distanceKm: '' });
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setForm({ name: user?.name || '', phone: user?.phone || '' });
  }, [user]);

  useEffect(() => {
    if (tab === 'orders') {
      api
        .myOrders()
        .then(setOrders)
        .catch(() => setOrders([]));
    }
  }, [tab]);

  const saveProfile = async (event) => {
    event.preventDefault();
    await updateMe({ name: form.name, phone: form.phone });
    setFeedback(t('account.saved'));
  };

  const addAddress = async (event) => {
    event.preventDefault();
    if (!newAddress.line.trim()) return;
    await updateMe({ addresses: [...(user.addresses || []), { ...newAddress, distanceKm: Number(newAddress.distanceKm) || 0 }] });
    setNewAddress({ label: '', line: '', neighborhood: '', notes: '', distanceKm: '' });
    setFeedback(t('account.saved'));
  };

  const removeAddress = async (index) => {
    await updateMe({ addresses: (user.addresses || []).filter((_, i) => i !== index) });
  };

  const favorites = products.filter((product) => (user?.favorites || []).includes(product._id));

  return (
    <div className="shell section">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div>
          <span className="eyebrow">{t('nav.account')}</span>
          <h1 style={{ fontSize: 'var(--step-4)' }}>{t('auth.welcome', { name: user?.name?.split(' ')[0] || '' })}</h1>
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
          {t('auth.logout')}
        </button>
      </div>

      {feedback && <div className="notice notice--ok">{feedback}</div>}

      <div className="tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={tab === item}
            onClick={() => {
              setTab(item);
              setFeedback(null);
            }}
          >
            {t(`account.${item}`)}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form className="panel" onSubmit={saveProfile} style={{ maxWidth: 520 }}>
          <label className="field">
            <span>{t('auth.name')}</span>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label className="field">
            <span>{t('auth.phone')}</span>
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          </label>
          <label className="field">
            <span>{t('auth.email')}</span>
            <input value={user.email} disabled />
          </label>
          <button type="submit" className="btn">{t('common.save')}</button>
        </form>
      )}

      {tab === 'addresses' && (
        <div className="checkout-grid">
          <div className="stack">
            {(user.addresses || []).length === 0 && <div className="empty">{t('account.emptyAddresses')}</div>}
            {(user.addresses || []).map((address, index) => (
              <div key={`${address.line}-${index}`} className="panel row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{address.label || address.neighborhood || '—'}</strong>
                  <div className="tiny muted">{address.line}</div>
                  {address.notes && <div className="tiny muted">{address.notes}</div>}
                </div>
                <button type="button" className="btn btn--sm btn--danger" onClick={() => removeAddress(index)}>
                  <IconTrash /> {t('common.delete')}
                </button>
              </div>
            ))}
          </div>

          <form className="panel" onSubmit={addAddress}>
            <h4 style={{ marginBottom: '0.8rem' }}>{t('account.addAddress')}</h4>
            <label className="field">
              <span>{t('account.label')}</span>
              <input value={newAddress.label} onChange={(event) => setNewAddress((c) => ({ ...c, label: event.target.value }))} />
            </label>
            <label className="field">
              <span>{t('checkout.addressLine')}</span>
              <input value={newAddress.line} onChange={(event) => setNewAddress((c) => ({ ...c, line: event.target.value }))} required />
            </label>
            <label className="field">
              <span>{t('checkout.neighborhood')}</span>
              <input value={newAddress.neighborhood} onChange={(event) => setNewAddress((c) => ({ ...c, neighborhood: event.target.value }))} />
            </label>
            <label className="field">
              <span>{t('checkout.distance')}</span>
              <input type="number" min="0" step="0.1" value={newAddress.distanceKm} onChange={(event) => setNewAddress((c) => ({ ...c, distanceKm: event.target.value }))} />
            </label>
            <button type="submit" className="btn btn--block">{t('common.save')}</button>
          </form>
        </div>
      )}

      {tab === 'orders' && (
        <div className="stack">
          {orders === null && <p className="muted">{t('common.loading')}</p>}
          {orders?.length === 0 && <div className="empty">{t('account.emptyOrders')}</div>}
          {orders?.map((order) => (
            <div key={order._id} className="panel">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{order.code}</strong>
                  <div className="tiny muted">{new Date(order.createdAt).toLocaleString(lang)}</div>
                </div>
                <div className="row">
                  <span className="status">{t(`status.${order.status}`)}</span>
                  <strong>{formatCOP(order.total, lang)}</strong>
                </div>
              </div>
              <div className="tiny muted" style={{ marginTop: '0.5rem' }}>
                {order.items.map((item) => `${item.qty}× ${pick(item.name)}`).join(' · ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'favorites' && (
        <>
          {favorites.length === 0 ? (
            <div className="empty">{t('account.emptyFavorites')}</div>
          ) : (
            <div className="grid grid--products">
              {favorites.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </>
      )}

      <p className="tiny muted" style={{ marginTop: '2rem' }}>
        <Link to="/seguimiento" style={{ color: 'var(--neon)' }}>{t('nav.track')}</Link>
      </p>
    </div>
  );
}
