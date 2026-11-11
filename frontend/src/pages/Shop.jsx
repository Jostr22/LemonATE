import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { IconSearch } from '../components/Icons.jsx';
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

  const activeProducts = products.filter((product) => product.active !== false);

  const counts = useMemo(() => {
    const base = { '': activeProducts.length };
    for (const item of CATEGORIES) {
      base[item.id] = activeProducts.filter((product) => product.category === item.id).length;
    }
    return base;
  }, [activeProducts]);

  const visible = useMemo(() => {
    let list = [...activeProducts];
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
        return list.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return list.sort((a, b) => b.price - a.price);
      case 'name':
        return list.sort((a, b) => pick(a.name).localeCompare(pick(b.name)));
      default:
        return list.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.stock || 0) - Number(a.stock || 0));
    }
  }, [activeProducts, category, query, sort, isPromos, pick]);

  const currentCategory = CATEGORIES.find((item) => item.id === category);

  return (
    <div className="shell section menu-page">
      <div className="menu-head">
        <div>
          <span className="eyebrow">{isPromos ? t('nav.promos') : t('nav.menu')}</span>
          <h1>
            {isPromos
              ? t('home.promos')
              : currentCategory
                ? pick(currentCategory.name)
                : t('nav.menu')}
          </h1>
          <p>
            {isPromos
              ? t('home.promosLead')
              : currentCategory
                ? pick(currentCategory.blurb)
                : t('shop.lead')}
          </p>
        </div>
        <span className="menu-head__count">{t('shop.results', { count: visible.length })}</span>
      </div>

      {!isPromos && (
        <nav className="menu-tabs" aria-label={t('nav.menu')}>
          <Link to="/tienda" className={!category ? 'is-active' : ''} aria-current={!category ? 'page' : undefined}>
            {t('common.all')} <span>{counts['']}</span>
          </Link>
          {CATEGORIES.map((item) => (
            <Link
              key={item.id}
              to={`/tienda/${item.id}`}
              className={category === item.id ? 'is-active' : ''}
              aria-current={category === item.id ? 'page' : undefined}
            >
              {pick(item.name)} <span>{counts[item.id]}</span>
            </Link>
          ))}
        </nav>
      )}

      <form className="menu-tools" onSubmit={(event) => event.preventDefault()}>
        <label className="menu-search">
          <IconSearch size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('shop.search')}
            aria-label={t('shop.search')}
          />
        </label>

        <label className="menu-sort">
          <span>{t('shop.sort')}</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="recommended">{t('shop.sort.recommended')}</option>
            <option value="priceAsc">{t('shop.sort.priceAsc')}</option>
            <option value="priceDesc">{t('shop.sort.priceDesc')}</option>
            <option value="name">{t('shop.sort.name')}</option>
          </select>
        </label>
      </form>

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
