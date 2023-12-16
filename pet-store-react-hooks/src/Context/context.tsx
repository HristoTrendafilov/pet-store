import React, { createContext, useEffect, useMemo, useState } from 'react';

import { getPetKindsAsync } from '~infrastructure/api';
import type { IPetKind } from '~infrastructure/global';

import type { ISessionProvider } from './contextHelper';

// Question: Is it OK to give the default context as an empty object?
export const SessionContext = createContext({} as ISessionProvider);

type SessionContextProviderProps = {
  children: React.JSX.Element | React.JSX.Element[];
};

// Question: Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
// Should i always split my function and component exports?
export function SessionContextProvider(props: SessionContextProviderProps) {
  const [petKindsRecord, setPetKindsRecord] = useState<Record<number, string>>(
    {}
  );

  // Question: Why should i always destructure the props?
  const { children } = props;

  // Question: Should i have some kind of global modal for breaking erros like fetchind the pet kinds?
  useEffect(() => {
    void (async () => {
      try {
        const petKinds = await getPetKindsAsync();

        // Comment: Lost more time on this than i had to. I wanted to cache the petkinds in some way so i chose Record<number, string>
        const record = petKinds.reduce(
          (acc: Record<number, string>, curr: IPetKind) => {
            acc[curr.value] = curr.displayName;
            return acc;
          },
          {}
        );

        setPetKindsRecord(record);
      } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
      }
    })();
  }, []);

  const provider = useMemo<ISessionProvider>(
    () => ({ petKindsRecord }),
    [petKindsRecord]
  );

  return (
    <SessionContext.Provider value={provider}>
      {children}
    </SessionContext.Provider>
  );
}
