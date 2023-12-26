import { useState } from 'react';

import { deletePetAsync } from '~infrastructure/api-client';
import type { PetListItem } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { Modal } from '~infrastructure/components/Modal/Modal';
import { formatDate } from '~infrastructure/utils';

import '~infrastructure/components/Modal/Modal.css';

import './DeletePetModal.css';

type DeletePetModalProps = {
  pet: PetListItem;
  petKindsMap: Map<number, string>;
  // Question: because im handling things differently on this callback from the parent component
  // is it OK to use one callback with a parameter, or two - onClose() , onDelete()?
  onClose: (hasDeleted: boolean) => void;
};

export function DeletePetModal(props: DeletePetModalProps) {
  const { pet, petKindsMap, onClose } = props;

  const [error, setError] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  async function handleDeletePet() {
    setIsDeleting(true);

    try {
      await deletePetAsync(pet.petId);
      onClose(true);
    } catch (err) {
      reportError(err);
      setError('System error. Please contact the system administrator.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal onBackdropClick={() => !isDeleting && onClose(false)}>
      <div className="delete-pet-modal-wrapper">
        <div className="modal-header">
          <div>Delete pet #{pet.petId}</div>
          <button
            className="modal-close-header-btn"
            type="button"
            disabled={isDeleting}
            onClick={() => onClose(false)}
          >
            X
          </button>
        </div>
        <div className="modal-body">
          <div>Name: {pet.petName}</div>
          <div>Kind: {petKindsMap.get(pet.kind)}</div>
          <div>Date added: {formatDate(new Date(pet.addedDate))}</div>

          <div className="button-group">
            <button
              className="btn btn-danger"
              type="button"
              disabled={isDeleting}
              onClick={handleDeletePet}
            >
              Delete
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={isDeleting}
              onClick={() => onClose(false)}
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
