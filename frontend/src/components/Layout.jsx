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
      <main id="contenido">
        {isDemoMode && (
          <div className="demo-strip">
            <span className="demo-strip__dot" aria-hidden="true" />
            {t('common.demoNotice')}
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </>
  );
}
