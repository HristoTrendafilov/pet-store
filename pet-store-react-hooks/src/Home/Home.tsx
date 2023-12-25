import { useCallback, useEffect, useState } from 'react';

import { getAllPetsAsync, getPetKindsAsync } from '~infrastructure/api';
import type { PetListItem } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/errorMessage/ErrorMessage';
import { LoadingIndicator } from '~infrastructure/components/loadingIndicator/LoadingIndicator';

import { PetsTable } from './PetsTable';

import './Home.css';

export function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [allPets, setAllPets] = useState<PetListItem[] | undefined>(undefined);
  const [petKindsMap, setPetKindsMap] = useState<
    Map<number, string> | undefined
  >(undefined);

  const refreshPets = useCallback(async (fetchPetKinds: boolean = false) => {
    setLoading(true);

    try {
      const petsPromise = getAllPetsAsync();

      if (fetchPetKinds) {
        const petKinds = await getPetKindsAsync();

        const map = new Map<number, string>();
        for (const kind of petKinds) {
          map.set(kind.value, kind.displayName);
        }

        setPetKindsMap(map);
      }

      const pets = await petsPromise;
      pets.sort((x, y) => (x.petId > y.petId ? -1 : 1));
      setAllPets(pets);
    } catch (err) {
      reportError(err);
      setError('System error. Please contact the system administrator.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Pet store';
    void refreshPets(true);
  }, [refreshPets]);

  return (
    <div className="all-pets-card">
      <div className="all-pets-card-header">
        <div>Pet store</div>
        <button type="button" className="btn btn-success" disabled={loading}>
          Add pet
        </button>
      </div>
      <div className="all-pets-card-body">
        {loading && <LoadingIndicator />}
        {error && <ErrorMessage message={error} />}
        {allPets && petKindsMap && (
          <PetsTable pets={allPets} petKindsMap={petKindsMap} />
        )}
      </div>
    </div>
  );
}
