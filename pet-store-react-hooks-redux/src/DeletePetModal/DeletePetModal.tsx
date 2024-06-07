import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { PetListItem } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { Modal } from '~infrastructure/components/Modal/Modal';
import {
  deletePetSelector,
  deletePetThunk,
} from '~infrastructure/redux/pets-slice';
import { useAppDispatch } from '~infrastructure/redux/store';
import { formatDate } from '~infrastructure/utils';

import './DeletePetModal.css';

type DeletePetModalProps = {
  pet: PetListItem;
  petKind: string | undefined;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeletePetModal(props: DeletePetModalProps) {
  // Question: I don`t think it`s necessary any more to pass petKinds as prop
  // as there is selector for the pet kinds and i can get the value of it from there
  // but as the petKindsMap can be undefined i will have to do a check and visualize kind under the condition of it existing
  // By this point i know there are going to be kinds in the redux state
  // Reference for row: 74
  const { pet, petKind, onClose, onDeleted } = props;

  const dispatch = useAppDispatch();

  const { loading, error } = useSelector(deletePetSelector);

  // Question: The dispatch may end up rejected and i should not call onDeleted() and onClose()
  // Is this OK check for the state of the dispatch or should i use result.meta.requestStatus === 'fulfilled'
  const handleDeletePet = useCallback(async () => {
    const result = await dispatch(deletePetThunk(pet.petId));
    if (deletePetThunk.fulfilled.match(result)) {
      onDeleted();
      onClose();
    }
  }, [onClose, onDeleted, pet.petId, dispatch]);

  const handleModalBackdropClick = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  // Question: if the thunk operation is rejected, the state has the error in it
  // When i close and open the modal, the error persists
  // Should i use some useEffect with cleanup for the error so its removed on modal close?

  return (
    <Modal
      ariaLabel="Delete pet modal"
      onBackdropClick={handleModalBackdropClick}
    >
      <div className="delete-pet-modal-wrapper">
        <div className="modal-header">
          <div>Delete pet #{pet.petId}</div>
          <button
            className="modal-close-header-btn"
            type="button"
            disabled={loading}
            onClick={onClose}
          >
            X
          </button>
        </div>
        <div className="modal-body">
          <div>Name: {pet.petName}</div>
          <div>Kind: {petKind}</div>
          <div>Date added: {formatDate(new Date(pet.addedDate))}</div>

          <div className="button-group">
            <button
              className="btn btn-danger"
              type="button"
              disabled={loading}
              onClick={handleDeletePet}
            >
              Delete {loading && <span className="submit-spinner" />}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={loading}
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
