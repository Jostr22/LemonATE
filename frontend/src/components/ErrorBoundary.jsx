import { Component } from 'react';
import ErrorState from './ErrorState.jsx';
import { useLang } from '../context/LangContext.jsx';

function CrashFallback() {
  const { t } = useLang();
  return (
    <ErrorState
      title={t('error.title')}
      message={t('error.crash')}
      onRetry={() => window.location.reload()}
      retryLabel={t('error.reload')}
    />
  );
}

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('LemonATE UI error', error, info);
  }

  render() {
    return this.state.failed ? <CrashFallback /> : this.props.children;
  }
}
