import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { IconCart, IconClose, IconMenu, IconSearch, IconUser } from './Icons.jsx';

const NAV = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/tienda', key: 'nav.shop', end: true },
  { to: '/tienda/limonadas', key: 'nav.lemonades' },
  { to: '/tienda/especiales', key: 'nav.special' },
  { to: '/tienda/postres', key: 'nav.desserts' },
  { to: '/tienda/combos', key: 'nav.combos' },
  { to: '/promociones', key: 'nav.promos' },
];

export default function Header() {
  const { t, lang, setLang } = useLang();
  const { user, isAdmin } = useAuth();
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="header">
        <div className="shell header__inner">
          <Logo />

          <nav className="nav" aria-label={t('nav.shop')}>
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <div className="lang-switch" role="group" aria-label="Idioma / Language">
              <button type="button" aria-pressed={lang === 'es'} onClick={() => setLang('es')}>
                ES
              </button>
              <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
                EN
              </button>
            </div>

            <Link to="/tienda" className="icon-btn" aria-label={t('shop.search')}>
              <IconSearch />
            </Link>

            <Link
              to={user ? '/cuenta' : '/login'}
              className="icon-btn"
              aria-label={user ? `${t('nav.account')} — ${user.name}` : t('auth.login')}
            >
              <IconUser />
            </Link>

            <button
              type="button"
              className="icon-btn"
              aria-label={`${t('nav.cart')} (${count})`}
              onClick={() => setOpen(true)}
            >
              <IconCart />
              {count > 0 && <span className="icon-btn__badge">{count}</span>}
            </button>

            <button
              type="button"
              className="icon-btn menu-toggle"
              aria-label={menuOpen ? t('common.close') : 'Menú'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Menú móvil">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)}>
              {t(item.key)}
            </NavLink>
          ))}
          <Link to="/seguimiento">{t('nav.track')}</Link>
          <Link to="/contacto">{t('nav.contact')}</Link>
          <Link to={user ? '/cuenta' : '/login'}>{user ? t('nav.account') : t('auth.login')}</Link>
          {isAdmin && <Link to="/admin">{t('nav.admin')}</Link>}
        </nav>
      )}
    </>
  );
}
