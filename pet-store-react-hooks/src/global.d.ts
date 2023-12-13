// Question: If i want to create a global.d.ts file with all the interfaces and types i want to use
// should the file: tsconfig.json be modified with: "include": ["**/*.d.ts"],
export interface IPet {
  petId: number;
  petName: string;
  age: number;
  notes: string;
  kind: number;
  healthProblems: boolean;
  addedDate: Date;
}

export interface IPetKind {
  displayName: string;
  value: number;
}
