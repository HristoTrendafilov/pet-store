export interface PetListItem {
  petId: number;
  petName: string;
  addedDate: Date;
  kind: number;
}

export interface PetKind {
  displayName: string;
  value: number;
}
