import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { LEGAL } from '../content/legal.js';

export default function Legal({ kind }) {
  const { t, lang } = useLang();
  const content = LEGAL[kind]?.[lang] || LEGAL[kind]?.es;

  useEffect(() => {
    if (!content) return undefined;
    document.title = `${content.title} · LemonATE`;
    return () => {
      document.title = 'LemonATE';
    };
  }, [content]);

  if (!content) return null;

  return (
    <article className="shell section legal">
      <span className="eyebrow">LemonATE</span>
      <h1>{content.title}</h1>
      <p className="tiny muted legal__meta">{content.updated}</p>
      <p className="legal__intro">{content.intro}</p>

      {content.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.bullets && (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <p className="legal__back">
        <Link to="/" className="btn btn--ghost btn--sm">
          {t('legal.back')}
        </Link>
      </p>
    </article>
  );
}
