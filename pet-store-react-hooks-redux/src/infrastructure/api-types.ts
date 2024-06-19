export interface PetListItem {
  petId: number;
  petName: string;
  addedDate: string;
  kind: number;
}

export interface Pet {
  petId: number;
  petName: string;
  age: number;
  notes: string;
  kind: number;
  healthProblems: boolean;
  addedDate: string;
}

export interface PetKind {
  displayName: string;
  value: number;
}

export type PetFormData = Omit<Pet, 'petId'>;

export type PetKindsMap = { [value: number]: string };
