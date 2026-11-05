import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../services/api.js';
import { IconChat, IconClose, IconSpark } from './Icons.jsx';

export default function ChatWidget({ forceOpen = false }) {
  const { t, lang } = useLang();
  const { products } = useStore();
  const [open, setOpen] = useState(forceOpen);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: t('ai.welcome') }]);
  const logRef = useRef(null);

  useEffect(() => {
    // Reinicia el saludo al cambiar de idioma.
    setMessages((current) =>
      current.length <= 1 ? [{ from: 'bot', text: t('ai.welcome') }] : current
    );
  }, [lang, t]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener('lemonate:open-chat', openHandler);
    return () => window.removeEventListener('lemonate:open-chat', openHandler);
  }, []);

  const send = async (text) => {
    const clean = text.trim();
    if (!clean || busy) return;
    setMessages((current) => [...current, { from: 'user', text: clean }]);
    setInput('');
    setBusy(true);
    try {
      const data = await api.chat({ message: clean, lang });
      const productLinks = (data.productIds || [])
        .map((id) => products.find((p) => p._id === id))
        .filter(Boolean)
        .slice(0, 3);
      setMessages((current) => [...current, { from: 'bot', text: data.reply, products: productLinks }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { from: 'bot', text: `${t('common.retry')}: ${error.message}` },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const chips =
    lang === 'en'
      ? ['Recommend something', 'Sugar free?', 'Prices', 'Hours', 'Delivery']
      : ['Recomiéndame algo', '¿Tienen sin azúcar?', 'Precios', 'Horarios', 'Domicilios'];

  return (
    <>
      {open && (
        <section className="chat-panel" aria-label={t('ai.title')}>
          <header className="chat-panel__head">
            <span className="chat-dot" aria-hidden="true" />
            <div className="grow">
              <strong>{t('ai.title')}</strong>
              <span>{t('ai.subtitle')}</span>
            </div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={t('common.close')}>
              <IconClose size={18} />
            </button>
          </header>

          <div className="chat-log" ref={logRef} aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={`msg ${message.from === 'user' ? 'msg--user' : 'msg--bot'}`}>
                {message.text}
                {message.products?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {message.products.map((product) => (
                      <Link
                        key={product._id}
                        to={`/producto/${product._id}`}
                        className="btn btn--sm btn--ghost"
                        onClick={() => setOpen(false)}
                      >
                        {product.name[lang] || product.name.es}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && <div className="msg msg--bot">…</div>}
          </div>

          <div className="chat-chips">
            {chips.map((chip) => (
              <button type="button" key={chip} onClick={() => send(chip)}>
                {chip}
              </button>
            ))}
          </div>

          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t('ai.placeholder')}
              aria-label={t('ai.placeholder')}
              maxLength={240}
            />
            <button type="submit" aria-label={t('ai.send')} disabled={busy}>
              <IconSpark />
            </button>
          </form>
          <p className="tiny muted" style={{ padding: '0 1rem 0.8rem', margin: 0 }}>
            {t('ai.disclaimer')}
          </p>
        </section>
      )}

      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((value) => !value)}
        aria-label={t('ai.title')}
        aria-expanded={open}
      >
        {open ? <IconClose size={22} /> : <IconChat size={24} />}
      </button>
    </>
  );
}
