import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { setBaseUrl } from './_vendor/api-client-react';

import './index.css';

// Point API calls at the backend. When the frontend and backend are hosted
// on different domains (e.g. frontend on Vercel, backend on Railway), set
// VITE_API_URL to the backend's URL. If unset, API calls stay relative
// (same-origin), which is correct when both are served from one domain.
if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL);
}

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
