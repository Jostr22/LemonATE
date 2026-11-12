import { useLang } from '../context/LangContext.jsx';
import ErrorState from '../components/ErrorState.jsx';

export default function NotFound() {
  const { t } = useLang();
  return (
    <ErrorState
      code="404"
      title={t('error.notFoundTitle')}
      message={t('error.notFoundLead')}
      homeLabel={t('error.home')}
    />
  );
}
