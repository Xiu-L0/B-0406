import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

class ErrorBoundary extends (React as any).Component {
  state = { error: null as any };

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  render() {
    if ((this as any).state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui, -apple-system', color: '#0f172a' }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>页面运行出错</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>
            请将以下错误信息截图发我，用于定位白屏原因。
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            {(this as any).state.error?.stack || (this as any).state.error?.message || String((this as any).state.error)}
          </pre>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
