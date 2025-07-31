
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useCartStore } from './store/cartStore';

const AppWithAuth = () => {
  const { setAuthenticated } = useCartStore();

  useEffect(() => {
    // Check if user is logged in when app loads
    const token = localStorage.getItem("token");
    if (token) {
      setAuthenticated(true);
    }
  }, [setAuthenticated]);

  return <App />;
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppWithAuth />
  </React.StrictMode>
);
