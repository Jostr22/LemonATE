import { Link } from 'react-router-dom';

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className={`logo${compact ? ' logo--compact' : ''}`} aria-label="LemonATE — Exprime el momento">
      <img
        className="logo__img"
        src={`${import.meta.env.BASE_URL}brand/logo-wordmark.webp`}
        alt="LemonATE — Exprime el momento"
        width="620"
        height="149"
      />
    </Link>
  );
}
