import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';
import ChatWidget from './ChatWidget.jsx';
import { useLang } from '../context/LangContext.jsx';
import { isDemoMode } from '../services/api.js';

export default function Layout() {
  const { pathname } = useLocation();
  const { t } = useLang();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#contenido">
        {t('common.continue')}
      </a>
      <Header />
      {isDemoMode && (
        <div
          className="notice"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 45,
            margin: 0,
            borderRadius: 0,
            textAlign: 'center',
            fontSize: '0.7rem',
            padding: '0.4rem',
            background: 'rgba(23,25,26,0.95)',
            borderTop: '1px solid #33373C',
          }}
        >
          {t('common.demoNotice')}
        </div>
      )}
      <main id="contenido">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </>
  );
}
