import { OutsideAlerter } from '~infrastructure/components/OutsideAlerter';
import { Modal } from '~infrastructure/components/modal/Modal';
import type { Pet, WithOptional } from '~infrastructure/global';
import { formatDate } from '~infrastructure/utils-function';

import './deletePetModal.scss';

// Question: Because we may not have all the properties at our disposal, is this OK to make them possibly undefined?
type PetWithOptionalProps = WithOptional<
  Pet,
  'age' | 'notes' | 'healthProblems'
>;

interface DeletePetModalProps {
  pet: PetWithOptionalProps;
  petKindsMap: Map<number, string>;
  // Question: because im handling things differently on this callback from the parent component
  // is it OK to use one callback with a parameter, or two - onCancel() , onSuccess()?
  onClose: (hasDeleted: boolean) => void;
}

export function DeletePetModal(props: DeletePetModalProps) {
  const { pet, petKindsMap, onClose } = props;

  return (
    <Modal>
      <OutsideAlerter onAlert={() => onClose(false)}>
        <div className="delete-pet-modal-wrapper">
          <div className="modal-header">
            <div>Delete pet #{pet.petId}</div>
            <button
              className="modal-close-header-btn"
              type="button"
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
              <b>Kind:</b> {petKindsMap.get(pet.kind)}
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
              <button className="btn btn-danger" type="button">
                Delete
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => onClose(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </OutsideAlerter>
    </Modal>
  );
}
