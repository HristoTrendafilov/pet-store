import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import { petsReducer } from './pets-slice';

export function createStore() {
  const store = configureStore({
    reducer: {
      pets: petsReducer,
    },
  });

  return store;
}

type Store = ReturnType<typeof createStore>;

export type ApplicationState = ReturnType<Store['getState']>;
export type ApplicationDispatch = Store['dispatch'];

export const useAppDispatch: () => ApplicationDispatch = useDispatch;
