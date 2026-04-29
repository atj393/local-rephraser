import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OptionsApp } from './OptionsApp';
import '@/styles/common.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Options root container missing');
}
createRoot(container).render(
  <StrictMode>
    <OptionsApp />
  </StrictMode>,
);
