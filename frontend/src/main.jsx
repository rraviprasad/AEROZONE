import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';

// Simple Error Boundary to catch "Black Screen" crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#000', color: '#f00', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>🚨 App Crash Detected</h2>
          <pre>{this.state.error?.toString()}</pre>
          <p>This is likely due to a missing file or a bad import. Checking logs...</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
