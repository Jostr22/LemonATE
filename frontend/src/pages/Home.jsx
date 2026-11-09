import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { IconArrow, IconSpark, IconWhatsapp } from '../components/Icons.jsx';

const CATEGORY_META = {
  limonadas: { image: './products/limonada-maracuya.svg', className: 'cat-tile--lemon' },
  especiales: { image: './products/frappe-caramelo.svg', className: 'cat-tile--purple' },
  postres: { image: './products/cupcake-limon.svg', className: 'cat-tile--cream' },
  combos: { image: './products/combo-fiesta.svg', className: 'cat-tile--lime' },
};

export default function Home() {
  const { t } = useLang();
  const { products, featured, settings, loading } = useStore();

  const categories = [
    { id: 'limonadas', label: t('nav.lemonades') },
    { id: 'especiales', label: t('nav.special') },
    { id: 'postres', label: t('nav.desserts') },
    { id: 'combos', label: t('nav.combos') },
  ].map((category) => ({
    ...category,
    count: products.filter((product) => product.category === category.id).length,
    ...CATEGORY_META[category.id],
  }));

  const favorites = (featured?.length ? featured : products).filter((product) => product.active !== false).slice(0, 4);
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
            <div className="hero__logo-card">
              <img
                src={`${import.meta.env.BASE_URL}brand/logo-lemonate.jpg`}
                alt="Logo de LemonATE: Exprime el momento"
                width="1200"
                height="743"
              />
            </div>
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
            >
              <img src={category.image} alt="" loading="lazy" width="800" height="680" />
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
