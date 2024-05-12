import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import { Home } from '~Home/Home';
import { createStore } from '~infrastructure/redux/store';

import './main.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const store = createStore();

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Home />
    </Provider>
  </React.StrictMode>
);
