import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    console.error('[ErrorBoundary] Application error:', error?.message || 'Unknown error');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          background: '#f8fafc',
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#e87843" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h1 style={{ marginTop: '1.25rem', fontSize: '1.5rem', fontWeight: 700, color: '#0d0c22' }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: '0.5rem', color: '#717082', maxWidth: '420px', lineHeight: 1.6 }}>
            We're sorry for the inconvenience. Please refresh the page or contact us directly.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.65rem 1.5rem',
                background: '#e87843',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Refresh Page
            </button>
            <a
              href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'indiatourguide1@gmail.com'}`}
              style={{
                padding: '0.65rem 1.5rem',
                background: 'transparent',
                color: '#e87843',
                border: '1.5px solid #e87843',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              Contact Us
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
