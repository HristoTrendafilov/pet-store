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
import type { Pet, PetKind } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { LoadingIndicator } from '~infrastructure/components/LoadingIndicator/LoadingIndicator';
import { Modal } from '~infrastructure/components/Modal/Modal';
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
type PetFormValues = FormValues<Omit<Pet, 'petId'>>;

const initialPetValues: PetFormValues = {
  petName: '',
  kind: '',
  age: '',
  notes: '',
  healthProblems: false,
  addedDate: toInputDate(new Date()),
};

type ModalState = 'View' | 'Edit' | 'New';

export function PetModal(props: PetModalProps) {
  const { petId, petKinds, petKindsMap, onClose, onModified } = props;

  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const [fetchedPet, setFetchedPet] = useState<Pet | undefined>();
  const [formValues, setFormValues] = useState<PetFormValues>(initialPetValues);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormLocked, setIsFormLocked] = useState<boolean>(false);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const [modalHeaderTitle, setModalHeaderTitle] = useState<string>(
    petId ? `View pet #${petId}` : 'Add pet'
  );
  const [modalState, setModalState] = useState<ModalState>(
    petId ? 'View' : 'New'
  );

  // Question: I'm using a ref here because when i change it to useState,
  // when i lock the form the value in the state is undefined because of the batching perhaps...
  const petIdRef = useRef<number | undefined>(petId);

  // Question: I have created a Mapped type that converts the non-boolean types to string
  // and now i have these two methods to get the Pet type from the form values and the other way around
  const setPetToFormValues = useCallback((pet: Pet) => {
    const newFormValues: PetFormValues = {
      ...pet,
      kind: pet.kind.toString(),
      age: pet.age.toString(),
    };

    setFormValues(newFormValues);
  }, []);

  const getPetFromFormValues = useCallback((form: PetFormValues) => {
    const newPet: Omit<Pet, 'petId'> = {
      ...form,
      kind: Number(form.kind),
      age: Number(form.age),
    };

    return newPet;
  }, []);

  const unlockForm = useCallback(() => {
    setIsFormLocked(false);
    setModalState('Edit');

    if (petIdRef.current) {
      setModalHeaderTitle(`Edit pet #${petIdRef.current}`);
    }
  }, []);

  const lockForm = useCallback(() => {
    setIsFormLocked(true);
    setModalState('View');

    if (petIdRef.current) {
      setModalHeaderTitle(`View pet #${petIdRef.current}`);
    }
  }, []);

  const fetchPet = useCallback(
    async (propsPetId: number) => {
      setLoading(true);

      try {
        const pet = await getPetAsync(propsPetId);

        setFetchedPet(pet);
        setPetToFormValues(pet);

        setIsFormLocked(true);
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
      setPetToFormValues(fetchedPet);
    }
  }, [lockForm, fetchedPet, setPetToFormValues]);

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
        if (petIdRef.current) {
          pet = await editPetAsync(
            getPetFromFormValues(formValues),
            petIdRef.current
          );
        } else {
          pet = await addPetAsync(getPetFromFormValues(formValues));
          petIdRef.current = pet.petId;
        }

        setFetchedPet(pet);
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
    [lockForm, onModified, getPetFromFormValues, setPetToFormValues, formValues]
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
                  disabled={isFormLocked || isSubmitting || !!petIdRef.current}
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
                  disabled={isFormLocked || isSubmitting || !!petIdRef.current}
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

      {showDeleteModal && fetchedPet && (
        <DeletePetModal
          pet={fetchedPet}
          petKind={petKindsMap.get(fetchedPet.kind)}
          onClose={closeDeleteModal}
          onDeleted={handleDeleted}
        />
      )}
    </Modal>
  );
}
