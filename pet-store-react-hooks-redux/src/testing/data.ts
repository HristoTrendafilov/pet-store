import type { PetKindsMap } from '~infrastructure/api-types';

export const petKinds = [
  { displayName: 'Cat', value: 1 },
  { displayName: 'Dog', value: 2 },
  { displayName: 'Parrot', value: 3 },
];

export const petKindsMap: PetKindsMap = {};
petKinds.forEach((pet) => {
  petKindsMap[pet.value] = pet.displayName;
});

export const pets = [
  {
    petId: 42,
    petName: 'Gosho',
    age: 2,
    notes: 'White fur, very soft.',
    kind: 1,
    healthProblems: false,
    addedDate: '2022-10-31',
  },
  {
    petId: 43,
    petName: 'Pesho',
    age: 5,
    notes: undefined,
    kind: 2,
    healthProblems: false,
    addedDate: '2022-10-25',
  },
  {
    petId: 44,
    petName: 'Kenny',
    age: 1,
    notes: "Doesn't speak. Has the sniffles.",
    kind: 3,
    healthProblems: true,
    addedDate: '2022-10-27',
  },
];

export const petsList = [
  {
    petId: 42,
    petName: 'Gosho',
    addedDate: '2022-10-31',
    kind: 1,
  },
  {
    petId: 43,
    petName: 'Pesho',
    addedDate: '2022-10-25',
    kind: 2,
  },
  {
    petId: 44,
    petName: 'Kenny',
    addedDate: '2022-10-27',
    kind: 3,
  },
];
