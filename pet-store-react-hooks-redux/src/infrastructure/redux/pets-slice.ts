import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getAllPetsAsync, getPetKindsAsync } from '~infrastructure/api-client';
import type {
  PetKind,
  PetKindsMap,
  PetListItem,
} from '~infrastructure/api-types';
import { reportError } from '~infrastructure/reportError';

import type { ApplicationState } from './store';

export type PetsState = {
  petKinds: PetKind[] | undefined;
  petKindsMap: PetKindsMap | undefined;
  allPets: PetListItem[] | undefined;
  loading: boolean;
  error: string | undefined;
};

const initialState: PetsState = {
  petKinds: undefined,
  petKindsMap: undefined,
  allPets: undefined,
  loading: false,
  error: undefined,
};

interface RefreshPetsResponse {
  pets: PetListItem[];
  petKinds?: PetKind[];
}

export const systemErrorMessage =
  'System error. Please contact the system administrator.';

export const refreshPetsThunk = createAsyncThunk(
  'pets/refreshPets',
  async (_, thunkAPI): Promise<RefreshPetsResponse> => {
    // Question: Dont like the casting to ApplicationState. There must be some way to know about its type
    const state = thunkAPI.getState() as ApplicationState;

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

      state.loading = false;
    });
    builder.addCase(refreshPetsThunk.pending, (state) => {
      state.allPets = undefined;
      state.loading = true;
    });
    builder.addCase(refreshPetsThunk.rejected, (state, action) => {
      reportError(action.error);
      state.error = systemErrorMessage;
    });
  },
});

export const allPetsSelector = (state: ApplicationState) => state.pets.allPets;
export const petKindsSelector = (state: ApplicationState) =>
  state.pets.petKinds;
export const petKindsMapSelector = (state: ApplicationState) =>
  state.pets.petKindsMap;
export const loadingSelector = (state: ApplicationState) => state.pets.loading;
export const errorSelector = (state: ApplicationState) => state.pets.error;

export const petsReducer = petsSlice.reducer;
