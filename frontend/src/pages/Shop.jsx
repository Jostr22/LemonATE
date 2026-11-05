import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { CATEGORIES } from '../../../shared/catalog.js';

export default function Shop({ mode = 'shop' }) {
  const { category: routeCategory } = useParams();
  const { t, pick } = useLang();
  const { products, loading } = useStore();
  const [category, setCategory] = useState(routeCategory || '');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recommended');

  useEffect(() => {
    setCategory(routeCategory || '');
  }, [routeCategory]);

  const isPromos = mode === 'promos';

  const visible = useMemo(() => {
    let list = products.filter((product) => product.active !== false);
    if (isPromos) {
      list = list.filter((product) => product.featured || product.category === 'combos');
    }
    if (category) list = list.filter((product) => product.category === category);
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter((product) =>
        `${product.name.es} ${product.name.en} ${product.tags?.join(' ')}`.toLowerCase().includes(needle)
      );
    }
    switch (sort) {
      case 'priceAsc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'name':
        return [...list].sort((a, b) => pick(a.name).localeCompare(pick(b.name)));
      default:
        return [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || b.stock - a.stock);
    }
  }, [products, category, query, sort, isPromos, pick]);

  return (
    <div className="shell section">
      <span className="eyebrow">{isPromos ? t('nav.promos') : t('shop.title')}</span>
      <div className="section-head" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--step-4)' }}>
            {isPromos
              ? t('home.promos')
              : category
                ? pick(CATEGORIES.find((c) => c.id === category)?.name) || t('shop.title')
                : t('shop.title')}
          </h1>
          <p>
            {isPromos
              ? t('home.promosLead')
              : category
                ? pick(CATEGORIES.find((c) => c.id === category)?.blurb)
                : t('shop.lead')}
          </p>
        </div>
        <span className="tiny muted">{t('shop.results', { count: visible.length })}</span>
      </div>

      <form className="filters" onSubmit={(event) => event.preventDefault()}>
        <label className="field">
          <span>{t('shop.search')}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('shop.search')}
          />
        </label>

        {!isPromos && (
          <label className="field">
            <span>{t('shop.category')}</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">{t('common.all')}</option>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {pick(item.name)}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="field">
          <span>{t('shop.sort')}</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="recommended">{t('shop.sort.recommended')}</option>
            <option value="priceAsc">{t('shop.sort.priceAsc')}</option>
            <option value="priceDesc">{t('shop.sort.priceDesc')}</option>
            <option value="name">{t('shop.sort.name')}</option>
          </select>
        </label>
      </form>

      {!isPromos && !category && (
        <div className="pill-row" style={{ marginBottom: 'var(--space-4)' }}>
          <Link to="/tienda" className="btn btn--sm btn--ghost">
            {t('common.all')}
          </Link>
          {CATEGORIES.map((item) => (
            <Link key={item.id} to={`/tienda/${item.id}`} className="btn btn--sm btn--ghost">
              {pick(item.name)}
            </Link>
          ))}
        </div>
      )}

      {loading ? (
        <p className="muted">{t('common.loading')}</p>
      ) : visible.length === 0 ? (
        <div className="empty">
          <p>{t('shop.empty')}</p>
        </div>
      ) : (
        <div className="grid grid--products">
          {visible.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
