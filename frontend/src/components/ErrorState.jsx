import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';

/**
 * Estado de error mínimo: un mensaje claro y una sola acción principal.
 * No agregar más botones aquí para no aumentar la carga de decisión.
 */
export default function ErrorState({ code, title, message, onRetry, retryLabel, homeLabel }) {
  const { t } = useLang();
  const actionLabel = onRetry ? retryLabel || t('common.retry') : homeLabel || t('error.home');

  return (
    <div className="shell section error-state" role="alert">
      {code && <span className="error-state__code">{code}</span>}
      <h1>{title || t('error.title')}</h1>
      <p>{message || t('error.lead')}</p>
      {onRetry ? (
        <button type="button" className="btn" onClick={onRetry}>
          {actionLabel}
        </button>
      ) : (
        <Link to="/" className="btn">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
