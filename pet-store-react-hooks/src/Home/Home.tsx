import { useCallback, useEffect, useRef, useState } from 'react';

import { getAllPetsAsync, getPetKindsAsync } from '~infrastructure/api-client';
import type { PetListItem } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { LoadingIndicator } from '~infrastructure/components/LoadingIndicator/LoadingIndicator';

import { PetsTable } from './PetsTable';

import './Home.css';

export function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [allPets, setAllPets] = useState<PetListItem[] | undefined>();
  const [petKindsMap, setPetKindsMap] = useState<
    Map<number, string> | undefined
  >();

  const hasFetchedPetKinds = useRef<boolean>(false);

  const refreshPets = useCallback(async () => {
    setError(undefined);
    setLoading(true);

    try {
      const petsPromise = getAllPetsAsync();

      if (!hasFetchedPetKinds.current) {
        const petKinds = await getPetKindsAsync();

        const map = new Map<number, string>();
        for (const kind of petKinds) {
          map.set(kind.value, kind.displayName);
        }

        setPetKindsMap(map);
        hasFetchedPetKinds.current = true;
      }

      const pets = await petsPromise;
      pets.sort((x, y) => y.petId - x.petId);
      setAllPets(pets);
    } catch (err) {
      reportError(err);
      setError('System error. Please contact the system administrator.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPets();
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
        {/* Had to add !loading so that the table is hidden and the spinner is shown on refreshPets */}
        {allPets && petKindsMap && !loading && (
          <PetsTable
            pets={allPets}
            petKindsMap={petKindsMap}
            // Question: How should refreshPets() be handled?
            // Should the PetsTable component refresh them when a pet is deleted
            // Should DeletePetModal refresh them when a pet is deleted... Probably not
            // Should a callback be passed from DeletePetModal to PetsTable to here so that i call refreshPets()?
            refreshPets={refreshPets}
          />
        )}
      </div>
    </div>
  );
}
