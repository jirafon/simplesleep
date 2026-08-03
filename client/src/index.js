import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Tipografía sobria y moderna (instalada en dependencies).
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import App from './App';

// Clean up invalid cookie values on app start
import { getCookie, removeCookie } from './utils/cookies';

function cleanupStorage() {
  try {
    const token = getCookie('token');
    // Remove any invalid token values
    if (token === 'undefined' || token === 'null' || token === null) {
      removeCookie('token');
      console.log('🧹 Cleaned up invalid token from cookies');
    }
    // Remove any old localStorage user data (migration to cookies)
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('user')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        console.log('🧹 Migrated: Removed user data from localStorage (now using cookies)');
      }
    } catch (e) {
      // localStorage might not be available in some environments
    }
  } catch (error) {
    console.error('Error cleaning storage:', error);
  }
}

// Run cleanup before rendering
cleanupStorage();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


