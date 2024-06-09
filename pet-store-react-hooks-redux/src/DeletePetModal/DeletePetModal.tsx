import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { PetListItem } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { Modal } from '~infrastructure/components/Modal/Modal';
import {
  clearDeletePetError,
  deletePetSelector,
  deletePetThunk,
} from '~infrastructure/redux/pets-slice';
import { useAppDispatch } from '~infrastructure/redux/store';
import { reportError } from '~infrastructure/reportError';
import { formatDate } from '~infrastructure/utils';

import './DeletePetModal.css';

type DeletePetModalProps = {
  pet: PetListItem;
  petKind: string | undefined;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeletePetModal(props: DeletePetModalProps) {
  const { pet, petKind, onClose, onDeleted } = props;

  const dispatch = useAppDispatch();

  const { loading, error } = useSelector(deletePetSelector);

  const handleOnClose = useCallback(() => {
    if (error) {
      dispatch(clearDeletePetError());
    }

    onClose();
  }, [dispatch, onClose, error]);

  const handleDeletePet = useCallback(async () => {
    try {
      await dispatch(deletePetThunk(pet.petId)).unwrap();
      onDeleted();
      handleOnClose();
    } catch (err) {
      reportError(err);
    }
  }, [handleOnClose, onDeleted, pet.petId, dispatch]);

  const handleModalBackdropClick = useCallback(() => {
    if (!loading) {
      handleOnClose();
    }
  }, [loading, handleOnClose]);

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
            onClick={handleOnClose}
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
              onClick={handleOnClose}
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
