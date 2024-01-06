import { useCallback, useState } from 'react';

import { deletePetAsync } from '~infrastructure/api-client';
import type { Pet, PetListItem } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { Modal } from '~infrastructure/components/Modal/Modal';
import { formatDate } from '~infrastructure/utils';

import './DeletePetModal.css';

type DeletePetModalProps = {
  pet: PetListItem | Pet;
  petKind: string | undefined;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeletePetModal(props: DeletePetModalProps) {
  const { pet, petKind, onClose, onDeleted } = props;

  const [error, setError] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Question: There has to be a better way to check which type is passed
  const petHasWholeData = 'age' in pet;

  const handleDeletePet = useCallback(async () => {
    setIsDeleting(true);

    try {
      await deletePetAsync(pet.petId);
      onDeleted();
      onClose();
    } catch (err) {
      reportError(err);
      setError('System error. Please contact the system administrator.');
    } finally {
      setIsDeleting(false);
    }
  }, [onClose, onDeleted, pet.petId]);

  const handleModalBackdropClick = useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [isDeleting, onClose]);

  return (
    <Modal onBackdropClick={handleModalBackdropClick}>
      <div className="delete-pet-modal-wrapper">
        <div className="modal-header">
          <div>Delete pet #{pet.petId}</div>
          <button
            className="modal-close-header-btn"
            type="button"
            disabled={isDeleting}
            onClick={onClose}
          >
            X
          </button>
        </div>
        <div className="modal-body">
          <div>Name: {pet.petName}</div>
          <div>Kind: {petKind}</div>
          {petHasWholeData && (
            <>
              <div>Age: {pet.age}</div>
              <div>Notes: {pet.notes}</div>
              <div>
                Has health problems: {pet.healthProblems ? 'yes' : 'no'}
              </div>
            </>
          )}
          <div>Date added: {formatDate(new Date(pet.addedDate))}</div>

          <div className="button-group">
            <button
              className="btn btn-danger"
              type="button"
              disabled={isDeleting}
              onClick={handleDeletePet}
            >
              Delete {isDeleting && <span className="submit-spinner" />}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={isDeleting}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>

          {error && (
            <ErrorMessage message={error} style={{ marginTop: '.7rem' }} />
          )}
        </div>
      </div>
    </Modal>
  );
}
