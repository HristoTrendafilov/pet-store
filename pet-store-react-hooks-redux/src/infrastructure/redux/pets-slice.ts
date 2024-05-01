import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { PetKind, PetKindsSignature } from '~infrastructure/api-types';

// Question: When i use Map() for petKinds, redux says it's not serializable
// Had to change the type of the kinds in the components, but redux logic is only contained in the <Home/> component
export type PetsState = {
  petKinds: PetKind[] | undefined;
  petKindsSignature: PetKindsSignature | undefined;
};

const initialState: PetsState = {
  petKinds: undefined,
  petKindsSignature: undefined,
};

export const petsSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    addPetKinds: (state, action: PayloadAction<PetKind[]>) => {
      const petKinds = action.payload;
      state.petKinds = petKinds;

      state.petKindsSignature = {};
      for (const kind of petKinds) {
        state.petKindsSignature[kind.value] = kind.displayName;
      }
    },
  },
});

export const petsReducer = petsSlice.reducer;
export const { addPetKinds } = petsSlice.actions;
