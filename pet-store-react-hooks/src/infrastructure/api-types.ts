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
