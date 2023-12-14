import { useSessionContext } from '~Context/contextHelper';
import { Modal } from '~infrastructure/components/Modal/Modal';
import type { IPet } from '~infrastructure/global';
import { formatDate } from '~infrastructure/utils';

import './deletePetModal.scss';

type DeletePetModalProps = {
  pet: IPet;
  onClose: () => void;
};

export function DeletePetModal(props: DeletePetModalProps) {
  const { pet, onClose } = props;

  const { petKindsRecord } = useSessionContext();

  return (
    <Modal>
      <div className="delete-pet-modal-wrapper">
        <div className="delete-pet-modal-header">
          <div>Delete pet #{pet.petId}</div>
          <button type="button" onClick={onClose}>
            X
          </button>
        </div>
        <div className="delete-pet-modal-body">
          <div>Name: {pet.petName}</div>
          <div>Kind: {petKindsRecord[pet.kind]}</div>
          <div>Age: {pet.age}</div>
          <div>Notes: {pet.notes}</div>
          <div>Has health problems {pet.healthProblems ? 'yes' : 'no'}</div>
          <div>Date added: {formatDate(pet.addedDate)}</div>

          <div className="button-group">
            <button className="btn btn-danger" type="button">
              Delete
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
