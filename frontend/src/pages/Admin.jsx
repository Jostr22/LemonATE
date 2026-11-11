import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../services/api.js';
import { CATEGORIES } from '../../../shared/catalog.js';
import { ORDER_STATUSES } from '../i18n/index.js';
import { formatCOP } from '../../../shared/pricing.js';
import { IconArrow, IconCheck, IconClose, IconTrash } from '../components/Icons.jsx';

const EMPTY_PRODUCT = {
  name: { es: '', en: '' },
  description: { es: '', en: '' },
  category: 'limonadas',
  price: 9000,
  stock: 10,
  image: 'products/fotos/limonada-natural.webp',
  featured: false,
  customizable: true,
  active: true,
};

export default function Admin() {
  const { t, pick, lang } = useLang();
  const { products, settings, refresh, loading } = useStore();
  const [tab, setTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [settingsForm, setSettingsForm] = useState(null);

  const loadOrders = () =>
    api
      .listOrders()
      .then(setOrders)
      .catch((err) => setError(err.message));

  const loadMessages = () =>
    api
      .listMessages()
      .then(setMessages)
      .catch((err) => setError(err.message));

  useEffect(() => {
    loadOrders();
    loadMessages();
  }, []);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        whatsapp: settings.contact?.whatsapp || '',
        email: settings.contact?.email || '',
        instagram: settings.contact?.instagram || '',
        tiktok: settings.contact?.tiktok || '',
        businessAddress: settings.delivery?.businessAddress || '',
        maxKm: settings.delivery?.maxKm || 12,
        ranges: settings.delivery?.ranges || [],
        weekdaysOpen: settings.hours?.weekdays?.open || '10:00',
        weekdaysClose: settings.hours?.weekdays?.close || '20:00',
        sundayOpen: settings.hours?.sunday?.open || '10:00',
        sundayClose: settings.hours?.sunday?.close || '16:00',
        nequi: settings.payments?.nequi || '',
        daviplata: settings.payments?.daviplata || '',
        bancolombia: settings.payments?.bancolombia || '',
        breB: settings.payments?.breB || '',
      });
    }
  }, [settings]);

  const stats = useMemo(
    () => ({
      products: products.filter((product) => product.active !== false).length,
      orders: orders.length,
      pending: orders.filter((order) => !['entregado', 'cancelado'].includes(order.status)).length,
      messages: messages.filter((message) => message.status === 'nuevo').length,
    }),
    [products, orders, messages]
  );

  const notify = (message) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 3000);
  };

  /* ---------------- productos ---------------- */
  const saveProduct = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const payload = {
        ...editing,
        price: Number(editing.price),
        stock: Number(editing.stock),
        tags: Array.isArray(editing.tags) ? editing.tags : [],
      };
      if (editing._id) {
        await api.updateProduct(editing._id, payload);
      } else {
        await api.createProduct(payload);
      }
      setEditing(null);
      await refresh();
      notify(t('admin.saved'));
    } catch (err) {
      setError(err.message);
    }
  };

  const deactivate = async (product) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await api.removeProduct(product._id);
      await refresh();
      notify(t('admin.deleted'));
    } catch (err) {
      setError(err.message);
    }
  };

  /* ---------------- pedidos ---------------- */
  const changeStatus = async (order, status) => {
    setError(null);
    try {
      await api.updateOrderStatus(order._id, status);
      await loadOrders();
      await refresh();
      notify(t('admin.saved'));
    } catch (err) {
      setError(err.message);
    }
  };

  /* ---------------- ajustes ---------------- */
  const saveSettings = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const updated = await api.updateSettings({
        contact: {
          ...settings.contact,
          whatsapp: settingsForm.whatsapp,
          email: settingsForm.email,
          instagram: settingsForm.instagram,
          tiktok: settingsForm.tiktok,
        },
        hours: {
          weekdays: { open: settingsForm.weekdaysOpen, close: settingsForm.weekdaysClose },
          sunday: { open: settingsForm.sundayOpen, close: settingsForm.sundayClose },
        },
        delivery: {
          ...settings.delivery,
          businessAddress: settingsForm.businessAddress,
          maxKm: Number(settingsForm.maxKm),
          ranges: settingsForm.ranges.map((range) => ({ maxKm: Number(range.maxKm), fee: Number(range.fee) })),
        },
        payments: {
          ...settings.payments,
          nequi: settingsForm.nequi,
          daviplata: settingsForm.daviplata,
          bancolombia: settingsForm.bancolombia,
          breB: settingsForm.breB,
        },
      });
      await refresh();
      notify(t('admin.saved'));
      return updated;
    } catch (err) {
      setError(err.message);
    }
  };

  const statusClass = (status) => {
    if (status === 'entregado' || status === 'pago-confirmado') return 'status--ok';
    if (status === 'cancelado') return 'status--danger';
    if (status === 'en-camino' || status === 'en-preparacion') return 'status--info';
    return 'status--warn';
  };

  return (
    <div className="shell section">
      <span className="eyebrow">{t('nav.admin')}</span>
      <h1 style={{ fontSize: 'var(--step-4)', marginBottom: '0.4rem' }}>{t('admin.title')}</h1>
      <p>{t('admin.lead')}</p>

      {feedback && <div className="notice notice--ok">{feedback}</div>}
      {error && <div className="notice notice--error">{error}</div>}

      <div className="tabs" role="tablist">
        {['dashboard', 'products', 'orders', 'messages', 'settings'].map((item) => (
          <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>
            {t(`admin.${item === 'dashboard' ? 'title' : item}`)}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <>
          <div className="grid grid--4" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="stat-card"><strong>{stats.products}</strong><span>{t('admin.stats.products')}</span></div>
            <div className="stat-card"><strong>{stats.orders}</strong><span>{t('admin.stats.orders')}</span></div>
            <div className="stat-card"><strong>{stats.pending}</strong><span>{t('admin.stats.pending')}</span></div>
            <div className="stat-card"><strong>{stats.messages}</strong><span>{t('admin.stats.messages')}</span></div>
          </div>

          <div className="grid grid--2">
            <div className="panel">
              <h4 style={{ marginBottom: '0.8rem' }}>{t('admin.orders')}</h4>
              {orders.slice(0, 5).map((order) => (
                <div key={order._id} className="row" style={{ justifyContent: 'space-between', paddingBlock: '0.4rem', borderBottom: '1px solid var(--ink-line)' }}>
                  <span className="tiny">{order.code}</span>
                  <span className={`status ${statusClass(order.status)}`}>{t(`status.${order.status}`)}</span>
                  <strong className="tiny">{formatCOP(order.total, lang)}</strong>
                </div>
              ))}
              {orders.length === 0 && <p className="tiny muted">{t('account.emptyOrders')}</p>}
            </div>

            <div className="panel">
              <h4 style={{ marginBottom: '0.8rem' }}>{t('admin.messages')}</h4>
              {messages.slice(0, 5).map((message) => (
                <div key={message._id} style={{ paddingBlock: '0.4rem', borderBottom: '1px solid var(--ink-line)' }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <strong className="tiny">{message.subject}</strong>
                    <span className={`status ${message.status === 'nuevo' ? 'status--warn' : 'status--ok'}`}>{message.status}</span>
                  </div>
                  <span className="tiny muted">{message.name}</span>
                </div>
              ))}
              {messages.length === 0 && <p className="tiny muted">{t('admin.noMessages')}</p>}
            </div>
          </div>
        </>
      )}

      {tab === 'products' && (
        <>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <span className="tiny muted">{products.length} {t('admin.products').toLowerCase()}</span>
            <button type="button" className="btn btn--sm" onClick={() => setEditing({ ...EMPTY_PRODUCT })}>
              + {t('admin.newProduct')}
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('admin.image')}</th>
                  <th>{t('admin.products')}</th>
                  <th>{t('admin.category')}</th>
                  <th>{t('admin.price')}</th>
                  <th>{t('admin.stock')}</th>
                  <th>{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td><img src={product.image} alt="" width="46" height="46" style={{ borderRadius: 6, objectFit: 'cover' }} /></td>
                    <td>
                      <strong className="tiny">{pick(product.name)}</strong>
                      {product.featured && <span className="badge badge--chrome" style={{ position: 'static', marginLeft: 6 }}>★</span>}
                    </td>
                    <td className="tiny">{pick(CATEGORIES.find((c) => c.id === product.category)?.name)}</td>
                    <td className="tiny">{formatCOP(product.price, lang)}</td>
                    <td>
                      <span className={`status ${product.stock > 0 ? 'status--ok' : 'status--danger'}`}>{product.stock}</span>
                    </td>
                    <td>
                      <div className="row" style={{ gap: '0.3rem' }}>
                        <button type="button" className="btn btn--sm btn--ghost" onClick={() => setEditing({ ...product })}>
                          {t('common.edit')}
                        </button>
                        <button type="button" className="btn btn--sm btn--danger" onClick={() => deactivate(product)}>
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <>
          {orders.length === 0 ? (
            <div className="empty">{t('account.emptyOrders')}</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('admin.code')}</th>
                    <th>{t('admin.date')}</th>
                    <th>{t('admin.customer')}</th>
                    <th>{t('admin.total')}</th>
                    <th>{t('admin.status')}</th>
                    <th>{t('admin.changeStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td><strong className="tiny">{order.code}</strong></td>
                      <td className="tiny">{new Date(order.createdAt).toLocaleString(lang)}</td>
                      <td className="tiny">
                        {order.customer?.name}
                        <div className="muted">{order.customer?.phone}</div>
                      </td>
                      <td className="tiny">{formatCOP(order.total, lang)}</td>
                      <td><span className={`status ${statusClass(order.status)}`}>{t(`status.${order.status}`)}</span></td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(event) => changeStatus(order, event.target.value)}
                          className="tiny"
                          style={{ padding: '0.3rem', background: '#101213', border: '1px solid var(--ink-line)', borderRadius: 6 }}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>{t(`status.${status}`)}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'messages' && (
        <div className="stack">
          {messages.length === 0 && <div className="empty">{t('admin.noMessages')}</div>}
          {messages.map((message) => (
            <article className="panel" key={message._id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{message.subject}</strong>
                  <div className="tiny muted">
                    {message.name} · {message.contact} · {new Date(message.createdAt).toLocaleString(lang)}
                  </div>
                </div>
                <div className="row">
                  <span className={`status ${message.status === 'nuevo' ? 'status--warn' : 'status--ok'}`}>{message.status}</span>
                  {message.status === 'nuevo' && (
                    <button
                      type="button"
                      className="btn btn--sm btn--ghost"
                      onClick={async () => {
                        await api.markMessage(message._id);
                        loadMessages();
                      }}
                    >
                      <IconCheck /> {t('admin.markRead')}
                    </button>
                  )}
                </div>
              </div>
              <p className="tiny" style={{ marginTop: '0.6rem', marginBottom: 0 }}>{message.message}</p>
            </article>
          ))}
        </div>
      )}

      {tab === 'settings' && settingsForm && (
        <form className="panel" onSubmit={saveSettings}>
          <h4 style={{ marginBottom: '1rem' }}>{t('contact.title')}</h4>
          <div className="form-grid">
            <label className="field">
              <span>WhatsApp</span>
              <input value={settingsForm.whatsapp} onChange={(event) => setSettingsForm((c) => ({ ...c, whatsapp: event.target.value }))} />
            </label>
            <label className="field">
              <span>{t('auth.email')}</span>
              <input value={settingsForm.email} onChange={(event) => setSettingsForm((c) => ({ ...c, email: event.target.value }))} />
            </label>
            <label className="field">
              <span>Instagram</span>
              <input value={settingsForm.instagram} onChange={(event) => setSettingsForm((c) => ({ ...c, instagram: event.target.value }))} />
            </label>
            <label className="field">
              <span>TikTok</span>
              <input value={settingsForm.tiktok} onChange={(event) => setSettingsForm((c) => ({ ...c, tiktok: event.target.value }))} />
            </label>
          </div>

          <hr className="divider" />
          <h4 style={{ marginBottom: '1rem' }}>{t('contact.hours')}</h4>
          <div className="form-grid">
            <label className="field">
              <span>Lun–Sáb abre</span>
              <input type="time" value={settingsForm.weekdaysOpen} onChange={(event) => setSettingsForm((c) => ({ ...c, weekdaysOpen: event.target.value }))} />
            </label>
            <label className="field">
              <span>Lun–Sáb cierra</span>
              <input type="time" value={settingsForm.weekdaysClose} onChange={(event) => setSettingsForm((c) => ({ ...c, weekdaysClose: event.target.value }))} />
            </label>
            <label className="field">
              <span>Dom/Festivo abre</span>
              <input type="time" value={settingsForm.sundayOpen} onChange={(event) => setSettingsForm((c) => ({ ...c, sundayOpen: event.target.value }))} />
            </label>
            <label className="field">
              <span>Dom/Festivo cierra</span>
              <input type="time" value={settingsForm.sundayClose} onChange={(event) => setSettingsForm((c) => ({ ...c, sundayClose: event.target.value }))} />
            </label>
          </div>

          <hr className="divider" />
          <h4 style={{ marginBottom: '1rem' }}>{t('checkout.address')} / {t('checkout.coverage')}</h4>
          <div className="form-grid">
            <label className="field field--full">
              <span>{t('checkout.address')}</span>
              <input value={settingsForm.businessAddress} onChange={(event) => setSettingsForm((c) => ({ ...c, businessAddress: event.target.value }))} />
            </label>
            <label className="field">
              <span>Radio máximo (km)</span>
              <input type="number" min="1" value={settingsForm.maxKm} onChange={(event) => setSettingsForm((c) => ({ ...c, maxKm: event.target.value }))} />
            </label>
          </div>
          <div className="grid grid--4">
            {settingsForm.ranges.map((range, index) => (
              <div className="panel" key={index} style={{ padding: '0.8rem' }}>
                <span className="tiny muted">Hasta km</span>
                <input
                  type="number"
                  value={range.maxKm}
                  onChange={(event) =>
                    setSettingsForm((c) => ({
                      ...c,
                      ranges: c.ranges.map((r, i) => (i === index ? { ...r, maxKm: event.target.value } : r)),
                    }))
                  }
                  style={{ width: '100%', marginBottom: '0.4rem', padding: '0.4rem', background: '#101213', border: '1px solid var(--ink-line)', borderRadius: 6 }}
                />
                <span className="tiny muted">Tarifa (COP)</span>
                <input
                  type="number"
                  value={range.fee}
                  onChange={(event) =>
                    setSettingsForm((c) => ({
                      ...c,
                      ranges: c.ranges.map((r, i) => (i === index ? { ...r, fee: event.target.value } : r)),
                    }))
                  }
                  style={{ width: '100%', padding: '0.4rem', background: '#101213', border: '1px solid var(--ink-line)', borderRadius: 6 }}
                />
              </div>
            ))}
          </div>

          <hr className="divider" />
          <h4 style={{ marginBottom: '1rem' }}>{t('checkout.payment')}</h4>
          <div className="form-grid">
            <label className="field">
              <span>Nequi</span>
              <input value={settingsForm.nequi} onChange={(event) => setSettingsForm((c) => ({ ...c, nequi: event.target.value }))} />
            </label>
            <label className="field">
              <span>Daviplata</span>
              <input value={settingsForm.daviplata} onChange={(event) => setSettingsForm((c) => ({ ...c, daviplata: event.target.value }))} />
            </label>
            <label className="field">
              <span>Bancolombia</span>
              <input value={settingsForm.bancolombia} onChange={(event) => setSettingsForm((c) => ({ ...c, bancolombia: event.target.value }))} />
            </label>
            <label className="field">
              <span>Llaves Bre-B</span>
              <input value={settingsForm.breB} onChange={(event) => setSettingsForm((c) => ({ ...c, breB: event.target.value }))} />
            </label>
          </div>

          <button type="submit" className="btn">{t('common.save')}</button>
        </form>
      )}

      {editing && (
        <div className="modal" role="dialog" aria-modal="true">
          <form className="modal__card" onSubmit={saveProduct}>
            <div className="modal__head">
              <h3 style={{ fontSize: 'var(--step-2)' }}>{editing._id ? t('admin.editProduct') : t('admin.newProduct')}</h3>
              <button type="button" className="icon-btn" onClick={() => setEditing(null)} aria-label={t('common.close')}>
                <IconClose />
              </button>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>{t('admin.nameEs')}</span>
                <input
                  value={editing.name?.es || ''}
                  onChange={(event) => setEditing((c) => ({ ...c, name: { ...c.name, es: event.target.value } }))}
                  required
                />
              </label>
              <label className="field">
                <span>{t('admin.nameEn')}</span>
                <input
                  value={editing.name?.en || ''}
                  onChange={(event) => setEditing((c) => ({ ...c, name: { ...c.name, en: event.target.value } }))}
                />
              </label>
              <label className="field field--full">
                <span>{t('admin.descEs')}</span>
                <textarea
                  rows={2}
                  value={editing.description?.es || ''}
                  onChange={(event) => setEditing((c) => ({ ...c, description: { ...c.description, es: event.target.value } }))}
                />
              </label>
              <label className="field field--full">
                <span>{t('admin.descEn')}</span>
                <textarea
                  rows={2}
                  value={editing.description?.en || ''}
                  onChange={(event) => setEditing((c) => ({ ...c, description: { ...c.description, en: event.target.value } }))}
                />
              </label>
              <label className="field">
                <span>{t('admin.category')}</span>
                <select value={editing.category} onChange={(event) => setEditing((c) => ({ ...c, category: event.target.value }))}>
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>{pick(category.name)}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{t('admin.image')}</span>
                <input value={editing.image} onChange={(event) => setEditing((c) => ({ ...c, image: event.target.value }))} />
              </label>
              <label className="field">
                <span>{t('admin.price')}</span>
                <input type="number" min="0" value={editing.price} onChange={(event) => setEditing((c) => ({ ...c, price: event.target.value }))} required />
              </label>
              <label className="field">
                <span>{t('admin.stock')}</span>
                <input type="number" min="0" value={editing.stock} onChange={(event) => setEditing((c) => ({ ...c, stock: event.target.value }))} required />
              </label>
            </div>

            <label className="checkbox">
              <input type="checkbox" checked={Boolean(editing.featured)} onChange={(event) => setEditing((c) => ({ ...c, featured: event.target.checked }))} />
              <span>{t('admin.featured')}</span>
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={Boolean(editing.customizable)} onChange={(event) => setEditing((c) => ({ ...c, customizable: event.target.checked }))} />
              <span>{t('admin.customizable')}</span>
            </label>

            {editing.image && (
              <img src={editing.image} alt="" style={{ width: 120, borderRadius: 8, marginBottom: '1rem' }} />
            )}

            <div className="row">
              <button type="submit" className="btn">{t('common.save')} <IconArrow /></button>
              <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>{t('common.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      {loading && <p className="muted" style={{ marginTop: '1rem' }}>{t('common.loading')}</p>}
    </div>
  );
}
