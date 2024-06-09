import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

import {
  deletePetAsync,
  getAllPetsAsync,
  getPetKindsAsync,
} from '~infrastructure/api-client';
import type {
  PetKind,
  PetKindsMap,
  PetListItem,
} from '~infrastructure/api-types';
import { reportError } from '~infrastructure/reportError';

import type { ApplicationDispatch, ApplicationState } from './store';

export type PetsState = {
  // pet list
  petKinds: PetKind[] | undefined;
  petKindsMap: PetKindsMap | undefined;
  allPets: PetListItem[] | undefined;
  refreshPetsLoading: boolean;
  refreshPetsError: string | undefined;
  // delete pet
  deletePetLoading: boolean;
  deletePetError: string | undefined;
};

const initialState: PetsState = {
  // pet list
  petKinds: undefined,
  petKindsMap: undefined,
  allPets: undefined,
  refreshPetsLoading: false,
  refreshPetsError: undefined,
  // delete pet
  deletePetLoading: false,
  deletePetError: undefined,
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

export const deletePetThunk = createAppAsyncThunk(
  'pets/deletePet',
  async (petId: number) => {
    await deletePetAsync(petId);
  }
);

export const petsSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    clearDeletePetError: (state) => {
      state.deletePetError = undefined;
    },
  },
  extraReducers: (builder) => {
    // pet list
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
    // delete pet
    builder.addCase(deletePetThunk.fulfilled, (state) => {
      state.deletePetLoading = false;
      state.deletePetError = undefined;
    });
    builder.addCase(deletePetThunk.pending, (state) => {
      state.deletePetLoading = true;
      state.deletePetError = undefined;
    });
    builder.addCase(deletePetThunk.rejected, (state) => {
      state.deletePetError = systemErrorMessage;
      state.deletePetLoading = false;
    });
  },
});

const petsRootSelector = (state: ApplicationState) => state[petsSlice.name];
export const petListSelector = createSelector([petsRootSelector], (pets) => ({
  petKinds: pets.petKinds,
  petKindsMap: pets.petKindsMap,
  allPets: pets.allPets,
  loading: pets.refreshPetsLoading,
  error: pets.refreshPetsError,
}));

export const deletePetSelector = createSelector([petsRootSelector], (pets) => ({
  loading: pets.deletePetLoading,
  error: pets.deletePetError,
}));

export const { clearDeletePetError } = petsSlice.actions;
