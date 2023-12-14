import { useContext } from 'react';

import { SessionContext } from './context';

export interface ISessionProvider {
  petKindsRecord: Record<number, string>;
}

export function useSessionContext(): ISessionProvider {
  const context = useContext(SessionContext);
  return context;
}
