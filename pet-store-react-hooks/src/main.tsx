import React from 'react';
import ReactDOM from 'react-dom/client';

import { SessionContextProvider } from '~context/context';
import { Home } from '~home/Home';

import './infrastructure/styles.scss';
import './main.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <SessionContextProvider>
      <Home />
    </SessionContextProvider>
  </React.StrictMode>
);
