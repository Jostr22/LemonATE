import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';
import ChatWidget from './ChatWidget.jsx';
import { useLang } from '../context/LangContext.jsx';

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
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </>
  );
}
