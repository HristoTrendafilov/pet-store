import { useContext } from 'react';

import { SessionContext } from './context';

// Comment: Because i cant export Components and Functions from context.tsx file i moved things here
export interface ISessionProvider {
  petKindsRecord: Record<number, string>;
}

export function useSessionContext(): ISessionProvider {
  const context = useContext(SessionContext);
  return context;
}
