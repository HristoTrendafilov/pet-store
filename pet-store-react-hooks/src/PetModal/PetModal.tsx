import {
  type FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { DeletePetModal } from '~DeletePetModal/DeletePetModal';
import {
  addPetAsync,
  editPetAsync,
  getPetAsync,
} from '~infrastructure/api-client';
import type { Pet } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { LoadingIndicator } from '~infrastructure/components/LoadingIndicator/LoadingIndicator';
import { Modal } from '~infrastructure/components/Modal/Modal';
import { toInputDate } from '~infrastructure/utils';

import './PetModal.css';

interface PetModalProps {
  petId?: number;
  petKindsMap: Map<number, string>;
  onClose: () => void;
  onModified: () => void;
}

// Create type like the Pet but with string values for all of them
// Create a Map type that changes the types of non string types to string except the booleans
const initialPetValues: Pet = {
  petId: 0,
  petName: '',
  kind: 0,
  age: 0,
  notes: '',
  healthProblems: false,
  addedDate: toInputDate(new Date()),
};

type ModalState = 'View' | 'Edit' | 'New';

export function PetModal(props: PetModalProps) {
  const { petId, petKindsMap, onClose, onModified } = props;

  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const [fetchedPet, setFetchedPet] = useState<Pet | undefined>();
  const [formValues, setFormValues] = useState<Pet>(initialPetValues);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormLocked, setIsFormLocked] = useState<boolean>(false);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const [modalHeaderTitle, setModalHeaderTitle] = useState<string>(
    petId ? `View pet #${petId}` : 'Add pet'
  );
  const [modalState, setModalState] = useState<ModalState>(
    petId ? 'View' : 'New'
  );

  // Do it as a useState and if its undefined dont show it
  const petIdRef = useRef<number>(petId ?? 0);

  const unlockForm = useCallback(() => {
    setIsFormLocked(false);
    setModalState('Edit');
    setModalHeaderTitle(`Edit pet #${petIdRef.current}`);
  }, []);

  const lockForm = useCallback(() => {
    setIsFormLocked(true);
    setModalState('View');
    setModalHeaderTitle(`View pet #${petIdRef.current}`);
  }, []);

  const fetchPet = useCallback(async (existingPetId: number) => {
    setLoading(true);

    try {
      const pet = await getPetAsync(existingPetId);

      setFetchedPet(pet);
      setFormValues(pet);

      setIsFormLocked(true);
    } catch (err) {
      reportError(err);
      setError('System error. Please contact the system administrator.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (petId) {
      void fetchPet(petId);
    }
  }, [petId, fetchPet]);

  const handleModalBackdropClick = useCallback(() => {
    if (!isSubmitting && !loading && modalState !== 'Edit') {
      onClose();
    }
  }, [isSubmitting, loading, modalState, onClose]);

  const handleLockButtonClick = useCallback(() => {
    lockForm();

    if (fetchedPet) {
      setFormValues(fetchedPet);
    }
  }, [lockForm, fetchedPet]);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const handleForDelete = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleted = useCallback(() => {
    setShowDeleteModal(false);
    onClose();
    onModified();
  }, [onClose, onModified]);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      let pet: Pet;
      try {
        if (formValues.petId > 0) {
          pet = await editPetAsync(formValues);
        } else {
          pet = await addPetAsync(formValues);
          petIdRef.current = pet.petId;
        }

        setFetchedPet(pet);
        setFormValues(pet);

        lockForm();
        onModified();
      } catch (err) {
        reportError(err);
        setError('System error. Please contact the system administrator.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [lockForm, onModified, setFormValues, formValues]
  );

  return (
    <Modal onBackdropClick={handleModalBackdropClick}>
      <div className="pet-modal-wrapper">
        <div className="modal-header">
          <div>{modalHeaderTitle}</div>
          <button
            className="modal-close-header-btn"
            type="button"
            disabled={isSubmitting || loading}
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="pet-modal-body">
          {loading && <LoadingIndicator />}

          {formValues && !loading && (
            <form className="pet-modal-form" onSubmit={handleFormSubmit}>
              <label className="form-row" htmlFor="petName">
                Name
                <input
                  value={formValues.petName}
                  onChange={(e) =>
                    setFormValues({ ...formValues, petName: e.target.value })
                  }
                  id="petName"
                  required
                  type="text"
                  disabled={isFormLocked || isSubmitting}
                />
              </label>
              <label className="form-row" htmlFor="kind">
                Kind
                <select
                  value={formValues.kind}
                  // Create useCallback for every function
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      kind: Number(e.target.value),
                    })
                  }
                  id="kind"
                  required
                  disabled={
                    isFormLocked || isSubmitting || formValues.petId > 0
                  }
                >
                  <option aria-label="empty-option" value="" />
                  {/* Save the array also and just pass it here */}
                  {Array.from(petKindsMap).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-row" htmlFor="age">
                Age
                <input
                  value={formValues.age}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      age: Number(e.target.value),
                    })
                  }
                  id="age"
                  required
                  min="0"
                  type="number"
                  disabled={isFormLocked || isSubmitting}
                />
              </label>
              <div>
                <label htmlFor="healthProblems">
                  <input
                    checked={formValues.healthProblems}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        healthProblems: e.target.checked,
                      })
                    }
                    id="healthProblems"
                    type="checkbox"
                    disabled={isFormLocked || isSubmitting}
                  />
                  Has health problems
                </label>
              </div>
              <label className="form-row" htmlFor="notes">
                Notes
                <textarea
                  value={formValues.notes}
                  onChange={(e) =>
                    setFormValues({ ...formValues, notes: e.target.value })
                  }
                  id="notes"
                  rows={5}
                  disabled={isFormLocked || isSubmitting}
                />
              </label>
              <label className="form-row" htmlFor="addedDate">
                Added date
                <input
                  value={formValues.addedDate}
                  onChange={(e) =>
                    setFormValues({ ...formValues, addedDate: e.target.value })
                  }
                  id="addedDate"
                  required
                  type="date"
                  disabled={
                    isFormLocked || isSubmitting || formValues.petId > 0
                  }
                />
              </label>

              {error && (
                <ErrorMessage message={error} style={{ marginTop: '.7rem' }} />
              )}

              <div className="pet-modal-buttons">
                {(modalState === 'New' || modalState === 'Edit') && (
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Save {isSubmitting && <span className="submit-spinner" />}
                  </button>
                )}

                {modalState === 'View' && (
                  <>
                    <button
                      className="btn btn-warning"
                      type="button"
                      onClick={unlockForm}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={handleForDelete}
                    >
                      Delete
                    </button>
                  </>
                )}

                {modalState === 'Edit' && (
                  <button
                    className="btn btn-warning"
                    type="button"
                    onClick={handleLockButtonClick}
                    disabled={isSubmitting}
                  >
                    Lock
                  </button>
                )}

                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeletePetModal
          pet={formValues}
          petKind={petKindsMap.get(formValues.kind)}
          onClose={closeDeleteModal}
          onDeleted={handleDeleted}
        />
      )}
    </Modal>
  );
}
