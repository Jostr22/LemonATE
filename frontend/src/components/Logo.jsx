import { Link } from 'react-router-dom';

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className="logo" aria-label="LemonATE — inicio">
      <svg className="logo__mark" viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="logo-chrome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.3" stopColor="#C5C9CC" />
            <stop offset="0.55" stopColor="#6F767C" />
            <stop offset="0.75" stopColor="#EDF1F3" />
            <stop offset="1" stopColor="#8439B8" />
          </linearGradient>
          <linearGradient id="logo-neon" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#B7FF00" />
            <stop offset="1" stopColor="#E7FF36" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="27" fill="none" stroke="url(#logo-chrome)" strokeWidth="7" />
        <path d="M32 5a27 27 0 0 1 0 54Z" fill="url(#logo-neon)" />
        <path d="M32 5a27 27 0 0 0 0 54Z" fill="#8439B8" opacity="0.35" />
        <circle cx="32" cy="32" r="4" fill="#17191A" />
      </svg>
      {!compact && (
        <span>
          Lemon<span className="logo__ate">ATE</span>
        </span>
      )}
    </Link>
  );
}
