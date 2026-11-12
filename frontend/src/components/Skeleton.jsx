import { useLang } from '../context/LangContext.jsx';

/** Bloque base para construir estados de carga. */
export function Skeleton({ className = '', ...rest }) {
  return <span className={`skeleton ${className}`.trim()} aria-hidden="true" {...rest} />;
}

export function ProductCardSkeleton() {
  return (
    <article className="product-card product-card--skeleton" aria-hidden="true">
      <div className="product-card__media skeleton" />
      <div className="product-card__body">
        <Skeleton className="skeleton--line skeleton--xs" />
        <Skeleton className="skeleton--line skeleton--title" />
        <Skeleton className="skeleton--line" />
        <Skeleton className="skeleton--line skeleton--short" />
        <div className="product-card__foot">
          <Skeleton className="skeleton--price" />
          <Skeleton className="skeleton--btn" />
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 8, compact = false }) {
  const { t } = useLang();
  return (
    <div className="skeleton-region" role="status" aria-busy="true">
      <span className="sr-only">{t('common.loading')}</span>
      <div className={`grid ${compact ? 'grid--4' : 'grid--products'}`}>
        {Array.from({ length: count }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  const { t } = useLang();
  return (
    <div className="shell section" role="status" aria-busy="true">
      <span className="sr-only">{t('common.loading')}</span>
      <Skeleton className="skeleton--line skeleton--breadcrumb" />
      <div className="pdp">
        <div>
          <div className="pdp__media skeleton skeleton--pdp" />
          <Skeleton className="skeleton--line skeleton--short skeleton--note" />
        </div>
        <div className="skeleton-pdp__info">
          <Skeleton className="skeleton--line skeleton--xs" />
          <Skeleton className="skeleton--line skeleton--heading" />
          <Skeleton className="skeleton--line" />
          <Skeleton className="skeleton--line skeleton--short" />
          <Skeleton className="skeleton--price" />
          <Skeleton className="skeleton--block" />
          <Skeleton className="skeleton--block" />
          <Skeleton className="skeleton--btn skeleton--btn-lg" />
        </div>
      </div>
    </div>
  );
}

export function RowsSkeleton({ rows = 3, rowClassName = 'skeleton--row' }) {
  const { t } = useLang();
  return (
    <div className="skeleton-region skeleton-rows" role="status" aria-busy="true">
      <span className="sr-only">{t('common.loading')}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className={rowClassName} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 4, cols = 6 }) {
  const { t } = useLang();
  return (
    <div className="table-wrap skeleton-region" role="status" aria-busy="true">
      <span className="sr-only">{t('common.loading')}</span>
      <table className="skeleton-table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, index) => (
              <th key={index}>
                <Skeleton className="skeleton--line skeleton--xs" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row}>
              {Array.from({ length: cols }).map((_, col) => (
                <td key={col}>
                  <Skeleton className="skeleton--line" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
