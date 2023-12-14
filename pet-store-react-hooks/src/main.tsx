import React from 'react';
import ReactDOM from 'react-dom/client';

import { SessionContextProvider } from '~Context/context';

import { Home } from './Home/Home';

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
