import {
  type ChangeEvent,
  type FormEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

import { DeletePetModal } from '~DeletePetModal/DeletePetModal';
import type { Pet, PetFormData } from '~infrastructure/api-types';
import { ErrorMessage } from '~infrastructure/components/ErrorMessage/ErrorMessage';
import { LoadingIndicator } from '~infrastructure/components/LoadingIndicator/LoadingIndicator';
import { Modal } from '~infrastructure/components/Modal/Modal';
import {
  addPetThunk,
  editPetThunk,
  getPetThunk,
  petFormSelector,
  petListSelector,
} from '~infrastructure/redux/pets-slice';
import { useAppDispatch } from '~infrastructure/redux/store';
import { reportError } from '~infrastructure/reportError';
import { toInputDate } from '~infrastructure/utils';

import './PetModal.css';

interface PetModalProps {
  petId?: number;
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
  const { petId, onClose, onModified } = props;

  const dispatch = useAppDispatch();

  const { petKinds, petKindsMap } = useSelector(petListSelector);
  const { loadingPet, submitting, error } = useSelector(petFormSelector);

  const [fetchedPet, setFetchedPet] = useState<Pet | undefined>();
  const [formValues, setFormValues] = useState<PetFormValues>(initialPetValues);

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

    if (fetchedPet) {
      setModalHeaderTitle(`Edit pet #${fetchedPet.petId}`);
    }
  }, [fetchedPet]);

  const lockForm = useCallback((pet: Pet | undefined) => {
    setIsFormLocked(true);
    setModalState('View');

    if (pet) {
      setModalHeaderTitle(`View pet #${pet.petId}`);
    }
  }, []);

  const fetchPet = useCallback(
    async (propsPetId: number) => {
      try {
        const pet = await dispatch(getPetThunk(propsPetId)).unwrap();

        setFetchedPet(pet);
        setPetToFormValues(pet);
      } catch (err) {
        reportError(err);
      }
    },
    [setPetToFormValues, dispatch]
  );

  useEffect(() => {
    if (petId) {
      void fetchPet(petId);
    } else {
      setIsFormLocked(false);
    }
  }, [petId, fetchPet]);

  const handleModalBackdropClick = useCallback(() => {
    if (!submitting && !loadingPet && modalState !== 'Edit') {
      onClose();
    }
  }, [submitting, loadingPet, modalState, onClose]);

  const handleLockButtonClick = useCallback(() => {
    lockForm(fetchedPet);

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

      let pet: Pet;
      try {
        const petFormValues = getPetFromFormValues(formValues);
        if (fetchedPet) {
          pet = await dispatch(
            editPetThunk({ formData: petFormValues, petId: fetchedPet.petId })
          ).unwrap();
        } else {
          pet = await dispatch(addPetThunk(petFormValues)).unwrap();
        }

        setFetchedPet(pet);
        setPetToFormValues(pet);

        lockForm(pet);
        onModified();
      } catch (err) {
        reportError(err);
      }
    },
    [
      lockForm,
      onModified,
      getPetFromFormValues,
      setPetToFormValues,
      formValues,
      fetchedPet,
      dispatch,
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
            aria-label="close modal"
            disabled={submitting || loadingPet}
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="pet-modal-body">
          {loadingPet && <LoadingIndicator />}

          {!loadingPet && (
            <form className="pet-modal-form" onSubmit={handleFormSubmit}>
              <label className="form-row" htmlFor="petName">
                Name
                <input
                  value={formValues.petName}
                  onChange={setFormPetName}
                  id="petName"
                  required
                  type="text"
                  disabled={isFormLocked || submitting}
                />
              </label>
              <label className="form-row" htmlFor="kind">
                Kind
                <select
                  value={formValues.kind}
                  onChange={setFormPetKind}
                  id="kind"
                  required
                  disabled={isFormLocked || submitting || !!fetchedPet}
                >
                  <option aria-label="Empty" value="" />
                  {petKinds &&
                    petKinds.map((kind) => (
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
                  disabled={isFormLocked || submitting}
                />
              </label>
              <div>
                <label htmlFor="healthProblems">
                  <input
                    checked={formValues.healthProblems}
                    onChange={setFormPetHealthProblems}
                    id="healthProblems"
                    type="checkbox"
                    disabled={isFormLocked || submitting}
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
                  disabled={isFormLocked || submitting}
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
                  disabled={isFormLocked || submitting || !!fetchedPet}
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
                    disabled={submitting}
                  >
                    Save
                    {submitting && (
                      <span
                        role="alert"
                        aria-label="loading"
                        className="submit-spinner"
                      />
                    )}
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
                    disabled={submitting}
                  >
                    Lock
                  </button>
                )}

                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showDeleteModal && fetchedPet && petKindsMap && (
        <DeletePetModal
          pet={fetchedPet}
          petKind={petKindsMap[fetchedPet.kind]}
          onClose={closeDeleteModal}
          onDeleted={handleDeleted}
        />
      )}
    </Modal>
  );
}
