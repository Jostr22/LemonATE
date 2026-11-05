import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useLang } from '../context/LangContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { IconInstagram, IconTiktok, IconWhatsapp } from './Icons.jsx';

export default function Footer() {
  const { t } = useLang();
  const { settings } = useStore();
  const contact = settings?.contact || {};
  const whatsapp = `https://wa.me/${String(contact.whatsapp || '').replace(/\D/g, '')}`;

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__grid">
          <div>
            <Logo />
            <p className="tiny muted" style={{ marginTop: '0.8rem', maxWidth: '32ch' }}>
              {t('footer.about')}
            </p>
            <div className="socials">
              <a href={whatsapp} target="_blank" rel="noreferrer" aria-label={t('contact.whatsapp')}>
                <IconWhatsapp />
              </a>
              <a href={contact.instagram || '#'} target="_blank" rel="noreferrer" aria-label={t('contact.instagram')}>
                <IconInstagram />
              </a>
              <a href={contact.tiktok || '#'} target="_blank" rel="noreferrer" aria-label={t('contact.tiktok')}>
                <IconTiktok />
              </a>
            </div>
          </div>

          <div>
            <h4>{t('footer.shop')}</h4>
            <ul>
              <li><Link to="/tienda/limonadas">{t('nav.lemonades')}</Link></li>
              <li><Link to="/tienda/especiales">{t('nav.special')}</Link></li>
              <li><Link to="/tienda/postres">{t('nav.desserts')}</Link></li>
              <li><Link to="/tienda/combos">{t('nav.combos')}</Link></li>
              <li><Link to="/promociones">{t('nav.promos')}</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t('footer.help')}</h4>
            <ul>
              <li><Link to="/contacto">{t('nav.contact')}</Link></li>
              <li><Link to="/seguimiento">{t('nav.track')}</Link></li>
              <li><Link to="/cuenta">{t('nav.account')}</Link></li>
              <li><Link to="/login">{t('auth.login')}</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t('footer.payments')}</h4>
            <ul>
              <li>Nequi</li>
              <li>Daviplata</li>
              <li>Bancolombia</li>
              <li>Llaves Bre-B</li>
              <li>{t('payment.tarjeta')}</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} LemonATE. {t('footer.rights')}</span>
          <span>{t('footer.legal')}</span>
        </div>
      </div>
    </footer>
  );
}
