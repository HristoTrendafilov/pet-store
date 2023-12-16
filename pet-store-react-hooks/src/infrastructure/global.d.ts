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

// Comment: honestly looked for it. Looked complicated so it had to work.
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
