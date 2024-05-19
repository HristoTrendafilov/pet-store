import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import { petsReducer } from './pets-slice';

const rootReducer = combineReducers({
  pets: petsReducer,
});

// Question: Im using combineReducers() so i can get ApplicationState and then use it as a Partial<> in the createStore()
// If i move it below the createStore() it's telling me im bad because i cant use it as parameter
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
