import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { DeletePetModal } from '~DeletePetModal/DeletePetModal';
import { PetModal } from '~PetModal/PetModal';
import type { PetListItem } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { LoadingIndicator } from '~infrastructure/components/LoadingIndicator/LoadingIndicator';
import {
  allPetsSelector,
  errorSelector,
  loadingSelector,
  petKindsMapSelector,
  petKindsSelector,
  refreshPetsThunk,
} from '~infrastructure/redux/pets-slice';
import { useAppDispatch } from '~infrastructure/redux/store';

import { PetTableRow } from './PetTableRow';

import './Home.css';

export function Home() {
  const dispatch = useAppDispatch();

  const allPets = useSelector(allPetsSelector);
  const petKinds = useSelector(petKindsSelector);
  const petKindsMap = useSelector(petKindsMapSelector);
  const loading = useSelector(loadingSelector);
  const error = useSelector(errorSelector);

  const [showPetModal, setShowPetModal] = useState<boolean>(false);
  const [petForDelete, setPetForDelete] = useState<PetListItem | undefined>();
  const [petIdForEdit, setPetIdForEdit] = useState<number | undefined>();

  const refreshPets = useCallback(() => {
    void dispatch(refreshPetsThunk());
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
