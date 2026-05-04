import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.jsx';
import './app.css';

const root = createRoot(document.getElementById('x_wsb_flex-app-root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
