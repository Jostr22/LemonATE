import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { computeUnitPrice, formatCOP } from '../../../shared/pricing.js';
import { IconHeart } from './Icons.jsx';

const CATEGORY_LABELS = {
  limonadas: { es: 'Limonada', en: 'Lemonade' },
  especiales: { es: 'Especial', en: 'Special' },
  postres: { es: 'Postre', en: 'Dessert' },
  combos: { es: 'Combo', en: 'Combo' },
};

export default function ProductCard({ product }) {
  const { t, pick, lang } = useLang();
  const { user, toggleFavorite } = useAuth();
  const { add } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const soldOut = Number(product.stock) <= 0;
  const isFavorite = (user?.favorites || []).includes(product._id);

  const handleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    const result = await toggleFavorite(product._id);
    if (result.favorite) showToast(pick({ es: 'Guardado en favoritos', en: 'Saved to favorites' }));
  };

  const quickAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (soldOut) return;
    if (product.customizable) {
      navigate(`/producto/${product._id}`);
      return;
    }
    add(product, {}, 1, computeUnitPrice(product));
    showToast(t('cart.added'));
  };

  return (
    <article className="product-card">
      {soldOut && <span className="badge badge--out">{t('common.soldOut')}</span>}
      {!soldOut && product.featured && <span className="badge">{t('home.featured')}</span>}
      <button
        type="button"
        className="fav-btn"
        aria-pressed={isFavorite}
        aria-label={t('account.favorites')}
        onClick={handleFavorite}
      >
        <IconHeart size={17} filled={isFavorite} />
      </button>

      <Link to={`/producto/${product._id}`} className="product-card__media" tabIndex={-1} aria-hidden="true">
        <img src={product.image} alt={pick(product.name)} loading="lazy" width="400" height="340" />
      </Link>

      <div className="product-card__body">
        <span className="product-card__cat">{pick(CATEGORY_LABELS[product.category])}</span>
        <h3 className="product-card__name">
          <Link to={`/producto/${product._id}`}>{pick(product.name)}</Link>
        </h3>
        <p className="product-card__desc">{pick(product.description)}</p>
        <div className="product-card__foot">
          <span className="price">
            {formatCOP(product.price, lang)}
            {product.customizable && <small>{t('common.from')}</small>}
          </span>
          <button
            type="button"
            className="btn btn--sm"
            onClick={quickAdd}
            disabled={soldOut}
            aria-label={`${t('common.add')} ${pick(product.name)}`}
          >
            {product.customizable ? t('common.add') : t('common.add')}
          </button>
        </div>
      </div>
    </article>
  );
}
