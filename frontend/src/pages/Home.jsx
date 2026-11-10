import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { CATEGORIES } from '../../../shared/catalog.js';
import { IconArrow, IconSpark, IconWhatsapp } from '../components/Icons.jsx';

const TILE_CLASS = {
  limonadas: 'cat-tile--lemon',
  especiales: 'cat-tile--purple',
  postres: 'cat-tile--cream',
  combos: 'cat-tile--lime',
};

export default function Home() {
  const { t, pick } = useLang();
  const { products, featured, settings, loading } = useStore();

  const categories = CATEGORIES.map((category) => ({
    ...category,
    label: pick(category.name),
    className: TILE_CLASS[category.id],
    count: products.filter((product) => product.category === category.id).length,
  }));

  const favorites = (featured?.length ? featured : products)
    .filter((product) => product.active !== false)
    .slice(0, 4);
  const whatsappNumber = String(settings?.contact?.whatsapp || '').replace(/\D/g, '');
  const whatsapp = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '/contacto';

  const openChat = () => window.dispatchEvent(new CustomEvent('lemonate:open-chat'));

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero hero--citrus">
        <div className="hero__bg" aria-hidden="true" />
        <div className="shell hero__inner">
          <div className="reveal">
            <span className="eyebrow">{t('hero.kicker')}</span>
            <h1>
              <span className="line">{t('hero.line1')}</span>
              <span className="line hero__line--accent">{t('hero.line2')}</span>
            </h1>
            <p className="hero__lead">{t('hero.lead')}</p>
            <div className="hero__actions">
              <Link to="/tienda" className="btn btn--dark">
                {t('home.viewMenu')} <IconArrow />
              </Link>
              <Link to="/marca" className="btn btn--outline-dark">
                {t('hero.cta2')}
              </Link>
            </div>
            <div className="hero__meta">
              <div>
                <strong>{products.length || 22}</strong>
                <span>{t('hero.metric1')}</span>
              </div>
              <div>
                <strong>{settings?.delivery?.maxKm ?? 12} km</strong>
                <span>{t('hero.metric2')}</span>
              </div>
              <div>
                <strong>{t('hero.metric3.value')}</strong>
                <span>{t('hero.metric3')}</span>
              </div>
            </div>
          </div>

          <div className="hero__visual">
            <span className="hero__burst" aria-hidden="true" />
            <div className="hero__photo">
              <img
                src={`${import.meta.env.BASE_URL}brand/hero-limonada.webp`}
                alt={t('home.photoAlt')}
                width="1200"
                height="900"
                fetchPriority="high"
              />
            </div>
            <img
              className="hero__stamp"
              src={`${import.meta.env.BASE_URL}brand/logo-lemonate.webp`}
              alt="LemonATE — Exprime el momento"
              width="820"
              height="500"
            />
            <span className="hero__chip hero__chip--1">{t('home.heroChip1')}</span>
            <span className="hero__chip hero__chip--2">{t('hero.sticker1')}</span>
            <span className="hero__chip hero__chip--3">{t('home.heroChip2')}</span>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index}>Exprime el momento · Limón fresco · 12 / 16 / 22 oz · Domicilios Barranquilla · </span>
          ))}
        </div>
      </div>

      {/* ---------- Categorías ---------- */}
      <section className="section shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t('nav.menu')}</span>
            <h2>{t('home.categories')}</h2>
            <p>{t('home.categoriesLead')}</p>
          </div>
          <Link to="/tienda" className="link-arrow">
            {t('home.menuCta')} <IconArrow size={16} />
          </Link>
        </div>

        <div className="grid grid--4">
          {categories.map((category) => (
            <Link
              to={`/tienda/${category.id}`}
              key={category.id}
              className={`cat-tile ${category.className}`}
              style={{ '--tile-tone': category.tone }}
            >
              <img src={category.image} alt="" loading="lazy" width="600" height="750" />
              <span className="cat-tile__shade" aria-hidden="true" />
              <span className="cat-tile__count">{String(category.count).padStart(2, '0')}</span>
              <span className="cat-tile__body">
                <h3>{category.label}</h3>
                <span className="cat-tile__cta">
                  {t('home.categoryCta')} <IconArrow size={15} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Favoritos ---------- */}
      <section className="section--tight shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t('home.featured')}</span>
            <h2>{t('home.bestTitle')}</h2>
            <p>{t('home.bestLead')}</p>
          </div>
          <Link to="/tienda" className="link-arrow">
            {t('common.viewAll')} <IconArrow size={16} />
          </Link>
        </div>

        {loading ? (
          <p className="muted">{t('common.loading')}</p>
        ) : (
          <div className="grid grid--4">
            {favorites.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Ambiente de marca ---------- */}
      <section className="section--tight shell">
        <div className="brand-band">
          <div className="brand-band__copy">
            <span className="eyebrow">{t('home.brandKicker')}</span>
            <h2>{t('home.brandTitle')}</h2>
            <p>{t('home.brandLead')}</p>
            <Link to="/marca" className="btn btn--dark">
              {t('home.brandCta')} <IconArrow />
            </Link>
          </div>
          <div className="brand-band__gallery">
            <img
              className="brand-band__shot brand-band__shot--wide"
              src={`${import.meta.env.BASE_URL}brand/ambiente-1.webp`}
              alt={t('home.brandAlt1')}
              loading="lazy"
              width="900"
              height="900"
            />
            <img
              className="brand-band__shot brand-band__shot--tall"
              src={`${import.meta.env.BASE_URL}brand/ambiente-2.webp`}
              alt={t('home.brandAlt2')}
              loading="lazy"
              width="640"
              height="800"
            />
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section shell">
        <div className="cta-banner">
          <div className="cta-banner__art" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="cta-banner__copy">
            <span className="eyebrow">{t('home.ai')}</span>
            <h2>{t('home.ctaTitle')}</h2>
            <p>{t('home.ctaLead')}</p>
          </div>
          <div className="cta-banner__actions">
            <button type="button" className="btn btn--chrome" onClick={openChat}>
              <IconSpark /> {t('home.ctaAi')}
            </button>
            {whatsappNumber ? (
              <a className="btn btn--dark" href={whatsapp} target="_blank" rel="noreferrer">
                <IconWhatsapp /> {t('home.ctaWhatsapp')}
              </a>
            ) : (
              <Link to="/contacto" className="btn btn--dark">
                <IconWhatsapp /> {t('home.ctaWhatsapp')}
              </Link>
            )}
            <Link to="/seguimiento" className="btn btn--outline-light">
              {t('home.ctaTrack')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
