import { useState } from 'react';

import { useSessionContext } from '~context/contextHelper';
import { deletePetAsync } from '~infrastructure/api';
import { ErrorMessage } from '~infrastructure/components/errorMessage/ErrorMessage';
import { Modal } from '~infrastructure/components/modal/Modal';
import type { IPet, WithOptional } from '~infrastructure/global';
import { OutsideAlerter } from '~infrastructure/utils-components';
import { formatDate, getErrorMessage } from '~infrastructure/utils-function';

import './deletePetModal.scss';

// Question: Because we may not have all the properties at our disposal, is this OK to make them possibly undefined?
type PetWithOptional = WithOptional<IPet, 'age' | 'notes' | 'healthProblems'>;

type DeletePetModalProps = {
  pet: PetWithOptional;
  // Question: because im handling things differently on this callback from the parent component
  // is it OK to use one callback with a parameter, or two - onCancel() , onSuccess()?
  onClose: (hasDeleted: boolean) => void;
};

export function DeletePetModal(props: DeletePetModalProps) {
  const { petKindsRecord } = useSessionContext();
  const [error, setError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const { pet, onClose } = props;

  async function handleDeletePet() {
    setIsDeleting(true);

    try {
      await deletePetAsync(pet.petId);
      onClose(true);
    } catch (err) {
      // Comment: The setError() and the getErrorMessage() doesnt feel quite right.
      setError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal>
      <OutsideAlerter onAlert={() => !isDeleting && onClose(false)}>
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
          <div className="modal-body delete-pet-modal-body">
            <div>
              <b>Name:</b> {pet.petName}
            </div>
            <div>
              <b>Kind:</b> {petKindsRecord[pet.kind]}
            </div>
            {pet.age && (
              <div>
                <b>Age:</b> {pet.age}
              </div>
            )}
            {pet.notes && (
              <div>
                <b>Notes:</b> {pet.notes}
              </div>
            )}
            {pet.healthProblems && (
              <div>
                <b>Has health problems</b> {pet.healthProblems ? 'yes' : 'no'}
              </div>
            )}
            <div>
              <b>Date added:</b> {formatDate(pet.addedDate)}
            </div>

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

            <ErrorMessage message={error} style={{ marginTop: '.7rem' }} />
          </div>
        </div>
      </OutsideAlerter>
    </Modal>
  );
}
