import { configureStore } from '@reduxjs/toolkit';

import { petsReducer } from './pets-slice';

export const store = configureStore({
  reducer: {
    pets: petsReducer,
  },
});

export type ApplicationState = ReturnType<typeof store.getState>;
export type ApplicationDispatch = typeof store.dispatch;
