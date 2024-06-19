import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import { Home } from '~Home/Home';
import { createStoreWithState } from '~infrastructure/redux/store';

import './main.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const store = createStoreWithState({});

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Home />
    </Provider>
  </React.StrictMode>
);
