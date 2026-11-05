import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="shell section center">
      <h1 style={{ fontSize: 'var(--step-5)', color: 'var(--neon)' }}>404</h1>
      <p style={{ fontSize: 'var(--step-1)' }}>
        {t('product.notFound')}
      </p>
      <Link to="/" className="btn">
        {t('nav.home')}
      </Link>
    </div>
  );
}
