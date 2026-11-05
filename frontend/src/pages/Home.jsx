import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { IconArrow, IconSpark } from '../components/Icons.jsx';

const CATEGORY_STYLES = ['cat-card--neon', 'cat-card--purple', 'cat-card', 'cat-card--chrome'];

export default function Home() {
  const { t, lang } = useLang();
  const { products, featured, settings, loading } = useStore();

  const perks = [
    { es: 'Tres tamaños: 12, 16 y 22 oz', en: 'Three sizes: 12, 16 and 22 oz' },
    { es: 'Hielo y azúcar a tu medida', en: 'Ice and sugar your way' },
    { es: 'Extras con precio visible', en: 'Extras with visible pricing' },
    { es: 'El total se actualiza al instante', en: 'The total updates instantly' },
  ];

  const combos = products.filter((p) => p.category === 'combos').slice(0, 3);
  const categories = [
    { id: 'limonadas', label: t('nav.lemonades'), count: products.filter((p) => p.category === 'limonadas').length },
    { id: 'especiales', label: t('nav.special'), count: products.filter((p) => p.category === 'especiales').length },
    { id: 'postres', label: t('nav.desserts'), count: products.filter((p) => p.category === 'postres').length },
    { id: 'combos', label: t('nav.combos'), count: products.filter((p) => p.category === 'combos').length },
  ];

  const openChat = () => window.dispatchEvent(new CustomEvent('lemonate:open-chat'));

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero__bg" aria-hidden="true" />
        <div className="shell hero__inner">
          <div className="reveal">
            <span className="eyebrow">{t('hero.kicker')}</span>
            <h1>
              <span className="line">{t('hero.line1')}</span>
              <span className="line chrome-text">{t('hero.line2')}</span>
            </h1>
            <p className="hero__lead">{t('hero.lead')}</p>
            <div className="hero__actions">
              <Link to="/tienda" className="btn">
                {t('hero.cta1')} <IconArrow />
              </Link>
              <Link to="/marca" className="btn btn--ghost">
                {t('hero.cta2')}
              </Link>
            </div>
            <div className="hero__meta">
              <div>
                <strong>{products.length || 22}</strong>
                <span>{t('hero.metric1')}</span>
              </div>
              <div>
                <strong>12 km</strong>
                <span>{t('hero.metric2')}</span>
              </div>
              <div>
                <strong>{t('hero.metric3.value')}</strong>
                <span>{t('hero.metric3')}</span>
              </div>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__disc" aria-hidden="true" />
            <img className="hero__lemon" src="./hero-lemon.svg" alt="Ilustración de un limón cromado" width="520" height="520" />
            <span className="hero__sticker hero__sticker--1">{t('hero.sticker1')}</span>
            <span className="hero__sticker hero__sticker--2">{t('hero.sticker2')}</span>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index}>Exprime el momento · Limón fresco · Domicilios Barranquilla · </span>
          ))}
        </div>
      </div>

      {/* ---------- Destacados ---------- */}
      <section className="section shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t('home.featured')}</span>
            <h2>{t('home.featured')}</h2>
            <p>{t('home.featuredLead')}</p>
          </div>
          <Link to="/tienda" className="link-arrow">
            {t('common.viewAll')} <IconArrow size={16} />
          </Link>
        </div>

        {loading ? (
          <p className="muted">{t('common.loading')}</p>
        ) : (
          <div className="grid grid--products">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Categorías ---------- */}
      <section className="section--tight shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t('nav.shop')}</span>
            <h2>{t('home.categories')}</h2>
            <p>{t('home.categoriesLead')}</p>
          </div>
        </div>
        <div className="grid grid--4">
          {categories.map((category, index) => (
            <Link
              to={`/tienda/${category.id}`}
              key={category.id}
              className={`cat-card ${CATEGORY_STYLES[index]}`}
            >
              <span className="cat-card__count">{String(category.count).padStart(2, '0')}</span>
              <h3>{category.label}</h3>
              <p>{t('common.explore')} →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Personalización ---------- */}
      <section className="section shell">
        <div className="split">
          <div className="frame" style={{ aspectRatio: '4 / 3' }}>
            <img src="./products/frappe-limon.svg" alt="Ilustración de un frappé de limón" loading="lazy" width="800" height="680" />
          </div>
          <div>
            <span className="eyebrow">{t('home.customize')}</span>
            <h2>{t('home.customize')}</h2>
            <p>{t('home.customizeLead')}</p>
            <ul className="stack" style={{ marginBlock: '1.5rem' }}>
              {perks.map((item) => (
                <li key={item.es} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--neon)' }}>■</span>
                  <span className="muted">{lang === 'en' ? item.en : item.es}</span>
                </li>
              ))}
            </ul>
            <Link to={`/producto/${products.find((p) => p.customizable)?._id || ''}`} className="btn">
              {t('home.customizeCta')} <IconArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Promociones ---------- */}
      <section className="section--tight shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t('nav.promos')}</span>
            <h2>{t('home.promos')}</h2>
            <p>{t('home.promosLead')}</p>
          </div>
          <Link to="/promociones" className="link-arrow">
            {t('common.viewAll')} <IconArrow size={16} />
          </Link>
        </div>
        <div className="grid grid--3">
          {combos.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* ---------- LemonATE AI ---------- */}
      <section className="section shell">
        <div
          className="panel"
          style={{
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(1.5rem, 4vw, 3.5rem)',
            background:
              'linear-gradient(120deg, rgba(132,57,184,0.35), rgba(23,25,26,0.9) 55%), radial-gradient(circle at 85% 20%, rgba(183,255,0,0.18), transparent 50%)',
            borderColor: 'rgba(132,57,184,0.5)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,0.8fr)',
            gap: 'var(--space-5)',
            alignItems: 'center',
          }}
        >
          <div>
            <span className="eyebrow">{t('home.ai')}</span>
            <h2>{t('home.ai')}</h2>
            <p style={{ maxWidth: '52ch' }}>{t('home.aiLead')}</p>
            <button type="button" className="btn btn--chrome" onClick={openChat}>
              <IconSpark /> {t('home.aiCta')}
            </button>
          </div>
          <div className="panel" style={{ background: 'rgba(10,11,12,0.55)', borderColor: 'rgba(244,243,234,0.14)' }}>
            <p className="tiny muted" style={{ letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              {t('ai.subtitle')}
            </p>
            <div className="msg msg--bot" style={{ maxWidth: '100%', marginBottom: '0.5rem' }}>
              {t('ai.welcome')}
            </div>
            <div className="msg msg--user" style={{ maxWidth: '100%' }}>
              {lang === 'en' ? 'Something sour and sugar free?' : '¿Algo ácido y sin azúcar?'}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Historia ---------- */}
      <section className="section shell">
        <div className="split">
          <div>
            <span className="eyebrow">{t('home.story')}</span>
            <h2>{t('home.story')}</h2>
            <p>{settings?.brand?.story?.[lang] || settings?.brand?.story?.es}</p>
            <Link to="/marca" className="link-arrow">
              {t('home.storyCta')} <IconArrow size={16} />
            </Link>
          </div>
          <div className="frame" style={{ aspectRatio: '1 / 1' }}>
            <img src="./products/combo-fiesta.svg" alt="Ilustración de un combo de limonadas y postres" loading="lazy" width="800" height="680" />
          </div>
        </div>
      </section>

      {/* ---------- Reseñas ---------- */}
      <section className="section--tight shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t('home.reviews')}</span>
            <h2>{t('home.reviews')}</h2>
          </div>
        </div>
        <div className="grid grid--3">
          {['home.review1', 'home.review2', 'home.review3'].map((key) => (
            <blockquote key={key} className="panel" style={{ margin: 0 }}>
              <p style={{ color: 'var(--cream)', fontSize: '1rem' }}>{t(key)}</p>
              <footer className="tiny muted">— Cliente LemonATE</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}
