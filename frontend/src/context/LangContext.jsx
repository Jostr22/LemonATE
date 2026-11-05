import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANG, translate } from '../i18n/index.js';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lemonate.lang') || DEFAULT_LANG);

  useEffect(() => {
    localStorage.setItem('lemonate.lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang((current) => (current === 'es' ? 'en' : 'es')),
      t: (key, vars) => translate(lang, key, vars),
      /** Devuelve el texto bilingüe de un campo { es, en } */
      pick: (field) => (field && (field[lang] ?? field.es)) || '',
    }),
    [lang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error('useLang debe usarse dentro de LangProvider');
  return context;
}
