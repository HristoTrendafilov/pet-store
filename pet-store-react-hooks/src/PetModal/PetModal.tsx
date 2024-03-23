import {
  type ChangeEvent,
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
import type { Pet, PetFormData, PetKind } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { LoadingIndicator } from '~infrastructure/components/LoadingIndicator/LoadingIndicator';
import { Modal } from '~infrastructure/components/Modal/Modal';
import { reportError } from '~infrastructure/reportError';
import { toInputDate } from '~infrastructure/utils';

import './PetModal.css';

interface PetModalProps {
  petId?: number;
  petKinds: PetKind[];
  petKindsMap: Map<number, string>;
  onClose: () => void;
  onModified: () => void;
}

type FormValues<T> = {
  [Property in keyof T]: T[Property] extends boolean ? boolean : string;
};
type PetFormValues = FormValues<PetFormData>;

const initialPetValues: PetFormValues = {
  petName: '',
  kind: '',
  age: '',
  notes: '',
  healthProblems: false,
  addedDate: toInputDate(new Date()),
};

type ModalState = 'View' | 'Edit' | 'New';
const modalAriaLabels = new Map<ModalState, string>([
  ['View', 'View pet modal'],
  ['Edit', 'Edit pet modal'],
  ['New', 'Add pet modal'],
]);

export function PetModal(props: PetModalProps) {
  const { petId, petKinds, petKindsMap, onClose, onModified } = props;

  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  // Question: Because i used this variable as a useState, when submitting the form i setted the value of it but
  // because the component wasn't rerendered with the new value, it was still undefined and the header wasn't updated correctly on Add pet
  const fetchedPetRef = useRef<Pet | undefined>();
  const [formValues, setFormValues] = useState<PetFormValues>(initialPetValues);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormLocked, setIsFormLocked] = useState<boolean>(true);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const [modalHeaderTitle, setModalHeaderTitle] = useState<string>(
    petId ? `View pet #${petId}` : 'Add pet'
  );
  const [modalState, setModalState] = useState<ModalState>(
    petId ? 'View' : 'New'
  );

  const setPetToFormValues = useCallback((pet: Pet) => {
    const newFormValues: PetFormValues = {
      ...pet,
      kind: pet.kind.toString(),
      age: pet.age.toString(),
    };

    setFormValues(newFormValues);
  }, []);

  const getPetFromFormValues = useCallback((form: PetFormValues) => {
    const newPet: PetFormData = {
      ...form,
      kind: Number(form.kind),
      age: Number(form.age),
    };

    return newPet;
  }, []);

  const unlockForm = useCallback(() => {
    setIsFormLocked(false);
    setModalState('Edit');

    if (fetchedPetRef.current) {
      setModalHeaderTitle(`Edit pet #${fetchedPetRef.current.petId}`);
    }
  }, [fetchedPetRef]);

  const lockForm = useCallback(() => {
    setIsFormLocked(true);
    setModalState('View');

    if (fetchedPetRef.current) {
      setModalHeaderTitle(`View pet #${fetchedPetRef.current.petId}`);
    }
  }, [fetchedPetRef]);

  const fetchPet = useCallback(
    async (propsPetId: number) => {
      setLoading(true);

      try {
        const pet = await getPetAsync(propsPetId);

        fetchedPetRef.current = pet;
        setPetToFormValues(pet);
      } catch (err) {
        reportError(err);
        setError('System error. Please contact the system administrator.');
      } finally {
        setLoading(false);
      }
    },
    [setPetToFormValues]
  );

  useEffect(() => {
    if (petId) {
      void fetchPet(petId);
    } else {
      setIsFormLocked(false);
      setLoading(false);
    }
  }, [petId, fetchPet]);

  const handleModalBackdropClick = useCallback(() => {
    if (!isSubmitting && !loading && modalState !== 'Edit') {
      onClose();
    }
  }, [isSubmitting, loading, modalState, onClose]);

  const handleLockButtonClick = useCallback(() => {
    lockForm();

    if (fetchedPetRef.current) {
      setPetToFormValues(fetchedPetRef.current);
    }
  }, [lockForm, fetchedPetRef, setPetToFormValues]);

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
        if (fetchedPetRef.current) {
          pet = await editPetAsync(
            getPetFromFormValues(formValues),
            fetchedPetRef.current.petId
          );
        } else {
          pet = await addPetAsync(getPetFromFormValues(formValues));
        }

        fetchedPetRef.current = pet;
        setPetToFormValues(pet);

        lockForm();
        onModified();
      } catch (err) {
        reportError(err);
        setError('System error. Please contact the system administrator.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      lockForm,
      onModified,
      getPetFromFormValues,
      setPetToFormValues,
      formValues,
      fetchedPetRef,
    ]
  );

  const setFormPetName = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setFormValues({ ...formValues, petName: e.target.value });
    },
    [formValues]
  );

  const setFormPetKind = useCallback(
    (e: ChangeEvent<HTMLSelectElement>): void => {
      setFormValues({ ...formValues, kind: e.target.value });
    },
    [formValues]
  );

  const setFormPetAge = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setFormValues({ ...formValues, age: e.target.value });
    },
    [formValues]
  );

  const setFormPetHealthProblems = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setFormValues({ ...formValues, healthProblems: e.target.checked });
    },
    [formValues]
  );

  const setFormPetNotes = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>): void => {
      setFormValues({ ...formValues, notes: e.target.value });
    },
    [formValues]
  );

  const setFormPetAddedDate = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setFormValues({ ...formValues, addedDate: e.target.value });
    },
    [formValues]
  );

  return (
    <Modal
      ariaLabel={modalAriaLabels.get(modalState)}
      onBackdropClick={handleModalBackdropClick}
    >
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
                  onChange={setFormPetName}
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
                  onChange={setFormPetKind}
                  id="kind"
                  required
                  disabled={
                    isFormLocked || isSubmitting || !!fetchedPetRef.current
                  }
                >
                  <option aria-label="empty-option" value="" />
                  {petKinds.map((kind) => (
                    <option key={kind.value} value={kind.value}>
                      {kind.displayName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-row" htmlFor="age">
                Age
                <input
                  value={formValues.age}
                  onChange={setFormPetAge}
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
                    onChange={setFormPetHealthProblems}
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
                  onChange={setFormPetNotes}
                  id="notes"
                  rows={5}
                  disabled={isFormLocked || isSubmitting}
                />
              </label>
              <label className="form-row" htmlFor="addedDate">
                Added date
                <input
                  value={formValues.addedDate}
                  onChange={setFormPetAddedDate}
                  id="addedDate"
                  required
                  type="date"
                  disabled={
                    isFormLocked || isSubmitting || !!fetchedPetRef.current
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

      {showDeleteModal && fetchedPetRef.current && (
        <DeletePetModal
          pet={fetchedPetRef.current}
          petKind={petKindsMap.get(fetchedPetRef.current.kind)}
          onClose={closeDeleteModal}
          onDeleted={handleDeleted}
        />
      )}
    </Modal>
  );
}
