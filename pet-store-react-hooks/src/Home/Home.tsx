import { useCallback, useEffect, useState } from 'react';

import { getAllPetsAsync, getPetKindsAsync } from '~infrastructure/api';
import { DocumentTitle } from '~infrastructure/components/DocumentTitle';
import { ErrorMessage } from '~infrastructure/components/errorMessage/ErrorMessage';
import { LoadingIndicator } from '~infrastructure/components/loadingIndicator/LoadingIndicator';
import type { Pet } from '~infrastructure/global';
import { getErrorMessage } from '~infrastructure/utils-function';

import { PetsTable } from './PetsTable';

import './home.scss';

export function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [petKindsMap, setPetKindsMap] = useState<Map<number, string>>(
    new Map<number, string>()
  );

  const refreshPets = useCallback(async () => {
    setLoading(true);

    try {
      const pets = await getAllPetsAsync();
      pets.sort((x, y) => (x.petId > y.petId ? -1 : 1));

      setAllPets(pets);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const petKinds = await getPetKindsAsync();
        const map = new Map<number, string>();
        for (const kind of petKinds) {
          map.set(kind.value, kind.displayName);
        }

        setPetKindsMap(map);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    })();
  }, []);

  useEffect(() => {
    void refreshPets();
  }, [refreshPets]);

  return (
    <div className="home-wrapper">
      <DocumentTitle title="Pet store" />

      <div className="all-pets-card">
        <div className="all-pets-card-header">
          <div>Pet store</div>
          <button type="button" className="btn btn-success" disabled={loading}>
            Add pet
          </button>
        </div>
        <div className="all-pets-card-body">
          <ErrorMessage message={error} />

          {loading ? (
            <LoadingIndicator />
          ) : (
            <PetsTable pets={allPets} petKindsMap={petKindsMap} />
          )}
        </div>
      </div>
    </div>
  );
}
