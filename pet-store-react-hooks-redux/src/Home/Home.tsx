import { useCallback, useEffect, useRef, useState } from 'react';

import { reportError } from '~/infrastructure/reportError';
import { DeletePetModal } from '~DeletePetModal/DeletePetModal';
import { PetModal } from '~PetModal/PetModal';
import { getAllPetsAsync } from '~infrastructure/api-client';
import type { PetListItem } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { LoadingIndicator } from '~infrastructure/components/LoadingIndicator/LoadingIndicator';
import {
  fetchPetKinds,
  usePetKinds,
  usePetKindsMap,
} from '~infrastructure/redux/pets-slice';
import { useAppDispatch } from '~infrastructure/redux/store';

import { PetTableRow } from './PetTableRow';

import './Home.css';

export function Home() {
  const dispatch = useAppDispatch();

  const petKinds = usePetKinds();
  const petKindsMap = usePetKindsMap();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  const [allPets, setAllPets] = useState<PetListItem[] | undefined>();

  const [showPetModal, setShowPetModal] = useState<boolean>(false);
  const [petForDelete, setPetForDelete] = useState<PetListItem | undefined>();
  const [petIdForEdit, setPetIdForEdit] = useState<number | undefined>();

  const hasFetchedPetKinds = useRef<boolean>(false);

  const refreshPets = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    setAllPets(undefined);

    try {
      const petsPromise = getAllPetsAsync();

      if (!hasFetchedPetKinds.current) {
        // Question: So with the error handling of async thunks the best decision to not polute the redux actions with .fulfilled and .rejected state
        // for now was using the .unwrap() function of dispatch so that the error was thrown here and not in some property of the state
        await dispatch(fetchPetKinds()).unwrap();
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
  }, [dispatch]);

  const hideDeletePetModal = useCallback(() => {
    setPetForDelete(undefined);
  }, []);

  const showNewPetModal = useCallback(() => {
    setShowPetModal(true);
  }, []);

  const showEditPetModal = useCallback((petId: number) => {
    setPetIdForEdit(petId);
    setShowPetModal(true);
  }, []);

  const hidePetModal = useCallback(() => {
    setPetIdForEdit(undefined);
    setShowPetModal(false);
  }, []);

  useEffect(() => {
    void refreshPets();
  }, [refreshPets]);

  return (
    <div className="all-pets-card">
      <div className="all-pets-card-header">
        <div>Pet store</div>
        <button
          onClick={showNewPetModal}
          type="button"
          className="btn btn-success"
          disabled={loading}
        >
          Add pet
        </button>
      </div>
      <div className="all-pets-card-body">
        {error && <ErrorMessage message={error} />}

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Added date</th>
              <th>Kind</th>
              <th colSpan={2} aria-hidden />
            </tr>
          </thead>
          <tbody>
            {allPets &&
              petKindsMap &&
              allPets.map((pet) => (
                <PetTableRow
                  key={pet.petId}
                  pet={pet}
                  petKind={petKindsMap[pet.kind]}
                  onDelete={setPetForDelete}
                  onEdit={showEditPetModal}
                />
              ))}
          </tbody>
        </table>

        {loading && <LoadingIndicator />}
      </div>

      {petForDelete && petKindsMap && (
        <DeletePetModal
          pet={petForDelete}
          petKind={petKindsMap[petForDelete.kind]}
          onClose={hideDeletePetModal}
          onDeleted={refreshPets}
        />
      )}

      {showPetModal && petKinds && petKindsMap && (
        <PetModal
          petId={petIdForEdit}
          petKinds={petKinds}
          petKindsMap={petKindsMap}
          onClose={hidePetModal}
          onModified={refreshPets}
        />
      )}
    </div>
  );
}
