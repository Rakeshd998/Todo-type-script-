import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { store } from './store';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      {/*
        HashRouter: routes become /#/login, /#/clips etc.
        The hash is never sent to the server, so GitHub Pages always
        serves index.html and React Router handles navigation client-side.
        BrowserRouter caused 404s because GitHub Pages has no fallback route.
      */}
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </StrictMode>,
);

