import { useCallback, useEffect, useRef, useState } from 'react';

import { DeletePetModal } from '~DeletePetModal/DeletePetModal';
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

  const [petForDelete, setPetForDelete] = useState<PetListItem | undefined>();

  const hasFetchedPetKinds = useRef<boolean>(false);

  const refreshPets = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setAllPets(undefined);

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

  const clearPetForDelete = useCallback(() => {
    setPetForDelete(undefined);
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
        {allPets && petKindsMap && (
          <PetsTable
            pets={allPets}
            petKindsMap={petKindsMap}
            onForDelete={setPetForDelete}
          />
        )}
      </div>

      {petForDelete && petKindsMap && (
        <DeletePetModal
          pet={petForDelete}
          petKindsMap={petKindsMap}
          onClose={clearPetForDelete}
          onDelete={refreshPets}
        />
      )}
    </div>
  );
}
