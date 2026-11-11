import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { CATEGORIES } from '../../../shared/catalog.js';
import {
  EXTRAS,
  EXTRA_GROUPS,
  ICE_OPTIONS,
  SIZES,
  SUGAR_OPTIONS,
  computeUnitPrice,
  formatCOP,
} from '../../../shared/pricing.js';
import { IconArrow, IconCheck } from '../components/Icons.jsx';

export default function Product() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const editKey = searchParams.get('editar');
  const { t, pick, lang } = useLang();
  const { products, loading } = useStore();
  const { add, remove, items } = useCart();
  const { showToast } = useToast();

  const product = products.find((item) => item._id === id);
  const editing = editKey ? items.find((item) => item.key === editKey) : null;

  const [qty, setQty] = useState(1);
  const [customization, setCustomization] = useState({
    size: 'medium',
    ice: 'normal',
    sugar: 'normal',
    extras: [],
  });

  useEffect(() => {
    if (editing) {
      setQty(editing.qty);
      setCustomization({
        size: editing.customization?.size || 'medium',
        ice: editing.customization?.ice || 'normal',
        sugar: editing.customization?.sugar || 'normal',
        extras: editing.customization?.extras || [],
      });
    }
  }, [editing]);

  const unitPrice = useMemo(
    () => (product ? computeUnitPrice(product, customization) : 0),
    [product, customization]
  );

  const toggleExtra = (extraId) => {
    setCustomization((current) => ({
      ...current,
      extras: current.extras.includes(extraId)
        ? current.extras.filter((entry) => entry !== extraId)
        : [...current.extras, extraId],
    }));
  };

  if (loading) {
    return (
      <div className="shell section">
        <p className="muted">{t('common.loading')}</p>
      </div>
    );
  }

  if (!product || product.active === false) {
    return (
      <div className="shell section">
        <div className="empty">
          <p>{t('product.notFound')}</p>
          <Link to="/tienda" className="btn btn--sm">
            {t('cart.emptyCta')}
          </Link>
        </div>
      </div>
    );
  }

  const soldOut = product.availability
    ? product.availability === 'soldout'
    : Number(product.stock) <= 0;
  const lowStock = product.availability
    ? product.availability === 'low'
    : !soldOut && Number(product.stock) <= 5;
  const category = CATEGORIES.find((item) => item.id === product.category);
  const related = products
    .filter((item) => item.category === product.category && item._id !== product._id)
    .slice(0, 4);

  const handleAdd = () => {
    if (soldOut) return;
    if (editing) remove(editing.key);
    add(product, customization, qty, unitPrice);
    showToast(t('product.added'));
  };

  return (
    <div className="shell section">
      <nav className="tiny muted" aria-label="Ruta" style={{ marginBottom: 'var(--space-4)' }}>
        <Link to="/tienda">{t('nav.shop')}</Link> /{' '}
        <Link to={`/tienda/${product.category}`}>{pick(category?.name)}</Link> /{' '}
        <span style={{ color: 'var(--cream)' }}>{pick(product.name)}</span>
      </nav>

      <div className="pdp">
        <div>
          <div className="pdp__media">
            <img src={product.image} alt={pick(product.name)} width="600" height="750" />
          </div>
          <p className="tiny muted" style={{ marginTop: '0.6rem' }}>
            {t('product.deliveryNote')}
          </p>
        </div>

        <div>
          <span className="product-card__cat">{pick(category?.name)}</span>
          <h1 style={{ fontSize: 'var(--step-3)', marginBottom: '0.6rem' }}>{pick(product.name)}</h1>
          <p>{pick(product.description)}</p>

          <div className="row" style={{ marginBottom: 'var(--space-4)' }}>
            <span className="pdp__price">{formatCOP(unitPrice * qty, lang)}</span>
            <span className={`status ${soldOut ? 'status--danger' : 'status--ok'}`}>
              {soldOut
                ? t('common.soldOut')
                : lowStock
                  ? t('product.lowStock')
                  : t('product.available')}
            </span>
            {product.customizable && <span className="badge" style={{ position: 'static' }}>{t('product.custom')}</span>}
          </div>

          {product.customizable && (
            <>
              <fieldset className="option-group">
                <legend>{t('product.size')}</legend>
                <div className="option-list">
                  {SIZES.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      className="option-chip"
                      aria-pressed={customization.size === size.id}
                      onClick={() => setCustomization((current) => ({ ...current, size: size.id }))}
                    >
                      {pick(size.label)} · {size.note}
                      {size.delta > 0 && <small>+{formatCOP(size.delta, lang)}</small>}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="option-group">
                <legend>{t('product.ice')}</legend>
                <div className="option-list">
                  {ICE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className="option-chip"
                      aria-pressed={customization.ice === option.id}
                      onClick={() => setCustomization((current) => ({ ...current, ice: option.id }))}
                    >
                      {pick(option.label)}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="option-group">
                <legend>{t('product.sugar')}</legend>
                <div className="option-list">
                  {SUGAR_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className="option-chip"
                      aria-pressed={customization.sugar === option.id}
                      onClick={() => setCustomization((current) => ({ ...current, sugar: option.id }))}
                    >
                      {pick(option.label)}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="option-group">
                <legend>{t('product.extras')}</legend>
                {EXTRA_GROUPS.map((group) => {
                  const groupExtras = EXTRAS.filter((extra) => extra.group === group.id);
                  if (groupExtras.length === 0) return null;
                  return (
                    <div className="option-subgroup" key={group.id}>
                      <span className="option-sublabel">{pick(group.label)}</span>
                      <div className="option-list">
                        {groupExtras.map((extra) => (
                          <button
                            key={extra.id}
                            type="button"
                            className="option-chip"
                            aria-pressed={customization.extras.includes(extra.id)}
                            onClick={() => toggleExtra(extra.id)}
                          >
                            {pick(extra.label)} <small>+{formatCOP(extra.price, lang)}</small>
                            {customization.extras.includes(extra.id) && <IconCheck size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </fieldset>
            </>
          )}

          <div className="row" style={{ marginTop: 'var(--space-4)' }}>
            <div className="qty">
              <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="−">
                −
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((value) => Math.min(99, value + 1))} aria-label="+">
                +
              </button>
            </div>
            <button type="button" className="btn grow" onClick={handleAdd} disabled={soldOut}>
              {soldOut ? t('common.soldOut') : editing ? t('common.save') : t('common.addToCart')}
              <IconArrow />
            </button>
          </div>

          <div className="panel" style={{ marginTop: 'var(--space-4)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>{t('product.ingredients')}</h4>
            <p className="tiny muted" style={{ margin: 0 }}>
              {product.tags?.map((tag) => `#${tag}`).join('  ') || '—'}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section--tight">
          <div className="section-head">
            <h2 style={{ fontSize: 'var(--step-2)' }}>{t('product.related')}</h2>
          </div>
          <div className="grid grid--products">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
