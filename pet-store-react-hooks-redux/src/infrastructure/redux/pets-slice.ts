import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

import { getAllPetsAsync, getPetKindsAsync } from '~infrastructure/api-client';
import type {
  PetKind,
  PetKindsMap,
  PetListItem,
} from '~infrastructure/api-types';
import { reportError } from '~infrastructure/reportError';

import type { ApplicationDispatch, ApplicationState } from './store';

export type PetsState = {
  petKinds: PetKind[] | undefined;
  petKindsMap: PetKindsMap | undefined;
  allPets: PetListItem[] | undefined;
  refreshPetsLoading: boolean;
  refreshPetsError: string | undefined;
};

const initialState: PetsState = {
  petKinds: undefined,
  petKindsMap: undefined,
  allPets: undefined,
  refreshPetsLoading: false,
  refreshPetsError: undefined,
};

interface RefreshPetsResponse {
  pets: PetListItem[];
  petKinds?: PetKind[];
}

export const systemErrorMessage =
  'System error. Please contact the system administrator.';

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: ApplicationState;
  dispatch: ApplicationDispatch;
}>();

export const refreshPetsThunk = createAppAsyncThunk(
  'pets/refreshPets',
  async (_, thunkAPI): Promise<RefreshPetsResponse> => {
    const state = thunkAPI.getState();

    const petsPromise = getAllPetsAsync();

    let petKinds;
    if (!state.pets.petKinds) {
      petKinds = await getPetKindsAsync();
    }

    const pets = await petsPromise;

    return { pets, petKinds };
  }
);

export const petsSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(refreshPetsThunk.fulfilled, (state, action) => {
      const pets = action.payload.pets.sort((x, y) => y.petId - x.petId);
      state.allPets = pets;

      if (action.payload.petKinds) {
        state.petKinds = action.payload.petKinds;

        state.petKindsMap = {};
        for (const kind of action.payload.petKinds) {
          state.petKindsMap[kind.value] = kind.displayName;
        }
      }

      state.refreshPetsLoading = false;
      state.refreshPetsError = undefined;
    });
    builder.addCase(refreshPetsThunk.pending, (state) => {
      state.allPets = undefined;
      state.refreshPetsError = undefined;
      state.refreshPetsLoading = true;
    });
    builder.addCase(refreshPetsThunk.rejected, (state, action) => {
      reportError(action.error);
      state.refreshPetsError = systemErrorMessage;
      state.refreshPetsLoading = false;
    });
  },
});

export const petKindsSelector = createSelector(
  [
    (state: ApplicationState) => state.pets.petKinds,
    (state: ApplicationState) => state.pets.petKindsMap,
  ],
  (petKinds, petKindsMap) => ({
    petKinds,
    petKindsMap,
  })
);

// Question: When i select only allPets from the state and return them i get this warning:
// The result function returned its own inputs without modification. e.g
// `createSelector([state => state.todos], todos => todos)`
// This could lead to inefficient memoization and unnecessary re-renders.
export const allPetsSelector = createSelector(
  [(state: ApplicationState) => state.pets.allPets],
  (allPets) => ({ allPets })
);

export const refreshPetsStateSelector = createSelector(
  [
    (state: ApplicationState) => state.pets.refreshPetsLoading,
    (state: ApplicationState) => state.pets.refreshPetsError,
  ],
  (refreshPetsLoading, refreshPetsError) => ({
    refreshPetsLoading,
    refreshPetsError,
  })
);
