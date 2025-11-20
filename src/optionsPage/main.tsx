import React from 'react';
import ReactDOM from 'react-dom/client';
import OptionsPage from './optionsPage';
import '../index.css'; // Use the global stylesheet

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <OptionsPage />
  </React.StrictMode>,
);
