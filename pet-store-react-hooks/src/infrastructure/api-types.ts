export interface PetListItem {
  petId: number;
  petName: string;
  addedDate: Date;
  kind: number;
}

export interface Pet {
  petId: number;
  petName: string;
  age: number;
  notes: string;
  kind: number;
  healthProblems: boolean;
  addedDate: Date;
}

export interface PetKind {
  displayName: string;
  value: number;
}
