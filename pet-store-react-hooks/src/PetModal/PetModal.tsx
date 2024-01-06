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

// Question: How do i handle numbers when passing the initial values of the form?
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

  // Question: Not the best way to use for the modal header id.
  // By the time i get to use this, i know there will be a value
  const petIdRef = useRef<number>(petId ?? 0);

  const unlockForm = useCallback(() => {
    setIsFormLocked(false);
    // Question: theese two things can be combined in some way
    setModalState('Edit');
    setModalHeaderTitle(`Edit pet #${petIdRef.current}`);
  }, []);

  const lockForm = useCallback(() => {
    setIsFormLocked(true);
    // Question: theese two things can be combined in some way
    setModalState('View');
    setModalHeaderTitle(`View pet #${petIdRef.current}`);
  }, []);

  // Question: Dont like the usage of parameter here
  const fetchPet = useCallback(async (existingPetId: number) => {
    setLoading(true);

    try {
      // Question: Because of the <React.StrictMode> this was triggering twice and messing up the logic with the locking
      // Was beginning to lose my sanity
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
    // Question: Either this or i call the function always and check for the petId inside of it
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
                  // Question: Should i create a callback function for every input
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
                  {/* Question: Seems too much work for this */}
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
