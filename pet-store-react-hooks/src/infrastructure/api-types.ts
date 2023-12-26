export interface PetListItem {
  petId: number;
  petName: string;
  // Question: Sence the addedDate comes from the api as string, should i change the type to string and pass it as Date where i have to?
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
