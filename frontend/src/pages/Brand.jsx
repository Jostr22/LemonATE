import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { IconArrow } from '../components/Icons.jsx';

export default function Brand() {
  const { t, lang } = useLang();
  const { settings } = useStore();

  const values = [
    {
      es: ['Ácido, no amargo', 'El limón manda. Todo lo demás lo acompaña.'],
      en: ['Sour, not bitter', 'Lemon leads. Everything else follows.'],
    },
    {
      es: ['Creatividad cítrica', 'Combinaciones que no están en el menú de nadie más.'],
      en: ['Citrus creativity', 'Combinations you will not find on anyone else’s menu.'],
    },
    {
      es: ['Cercanía', 'Domicilios en Barranquilla y municipios cercanos.'],
      en: ['Closeness', 'Delivery in Barranquilla and nearby municipalities.'],
    },
  ];

  return (
    <div className="shell section">
      <span className="eyebrow">{t('home.story')}</span>
      <h1 style={{ fontSize: 'var(--step-4)', maxWidth: '18ch', marginBottom: 'var(--space-4)' }}>
        {t('brand.slogan')}
      </h1>

      <div className="split">
        <div>
          <p style={{ fontSize: 'var(--step-1)', color: 'var(--cream)' }}>
            {settings?.brand?.story?.[lang] || settings?.brand?.story?.es}
          </p>
          <p>
            {lang === 'en'
              ? 'LemonATE is a lemon-based drinks and desserts store. Our identity mixes editorial K-pop energy, chrome details and citrus acidity. Prices and addresses on this site are demo data that the administrator can edit.'
              : 'LemonATE es una tienda de bebidas y postres a base de limón. Nuestra identidad mezcla energía editorial K-pop, detalles cromados y acidez cítrica. Los precios y direcciones de este sitio son datos de demostración que el administrador puede editar.'}
          </p>
          <Link to="/tienda" className="btn">
            {t('hero.cta1')} <IconArrow />
          </Link>
        </div>
        <div className="frame brand-logo-frame">
          <img src="./brand/logo-lemonate.jpg" alt="Logo oficial de LemonATE" width="1200" height="743" />
        </div>
      </div>

      <section className="section--tight">
        <div className="grid grid--3">
          {values.map((value) => {
            const [title, text] = value[lang] || value.es;
            return (
              <div key={title} className="panel">
                <h3 style={{ fontSize: 'var(--step-1)', color: 'var(--neon)', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ margin: 0 }}>{text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section--tight">
        <div className="panel">
          <h3 style={{ fontSize: 'var(--step-2)', marginBottom: '1rem' }}>{t('brand.palette')}</h3>
          <div className="grid grid--4">
            {['#B7FF00', '#E7FF36', '#8439B8', '#C5C9CC', '#17191A', '#F4F3EA'].map((color) => (
              <div key={color}>
                <div style={{ height: 70, borderRadius: 8, background: color, border: '1px solid var(--ink-line)' }} />
                <span className="tiny muted">{color}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
