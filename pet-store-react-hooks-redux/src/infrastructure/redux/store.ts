import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import { petsReducer } from './pets-slice';

const rootReducer = combineReducers({
  pets: petsReducer,
});

export type ApplicationState = ReturnType<typeof rootReducer>;

export function createStore(preloadedState?: Partial<ApplicationState>) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  return store;
}

export type Store = ReturnType<typeof createStore>;

export type ApplicationDispatch = Store['dispatch'];

export const useAppDispatch: () => ApplicationDispatch = useDispatch;
