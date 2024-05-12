import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import type { PetKind, PetKindsMap } from '~infrastructure/api-types';

import type { ApplicationState } from './store';

export type PetsState = {
  petKinds: PetKind[] | undefined;
  petKindsMap: PetKindsMap | undefined;
};

const initialState: PetsState = {
  petKinds: undefined,
  petKindsMap: undefined,
};

export const petsSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    addPetKinds: (state, action: PayloadAction<PetKind[]>) => {
      const petKinds = action.payload;
      state.petKinds = petKinds;

      state.petKindsMap = {};
      for (const kind of petKinds) {
        state.petKindsMap[kind.value] = kind.displayName;
      }
    },
  },
});

export function usePetKinds() {
  const petKinds = useSelector(
    (state: ApplicationState) => state.pets.petKinds
  );
  return petKinds;
}

export function usePetKindsMap() {
  const petKindsMap = useSelector(
    (state: ApplicationState) => state.pets.petKindsMap
  );
  return petKindsMap;
}

export const petsReducer = petsSlice.reducer;
export const { addPetKinds } = petsSlice.actions;
