import { useCallback, useState } from 'react';

import { deletePetAsync } from '~infrastructure/api-client';
import type { PetListItem } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { Modal } from '~infrastructure/components/Modal/Modal';
import { formatDate } from '~infrastructure/utils';

import './DeletePetModal.css';

type DeletePetModalProps = {
  pet: PetListItem;
  petKindsMap: Map<number, string>;
  onClose: () => void;
  onDelete: () => void;
};

export function DeletePetModal(props: DeletePetModalProps) {
  const { pet, petKindsMap, onClose, onDelete } = props;

  const [error, setError] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeletePet = useCallback(async () => {
    setIsDeleting(true);

    try {
      await deletePetAsync(pet.petId);
      onDelete();
      onClose();
    } catch (err) {
      reportError(err);
      setError('System error. Please contact the system administrator.');
    } finally {
      setIsDeleting(false);
    }
  }, [onClose, onDelete, pet.petId]);

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
