import { createSubmitSpinner, showError, hideError } from './utils.js';
import { editPet, addPet } from './api.js';
import {
  enablePetModalEvents,
  disablePetModalEvents,
  disableModalsBackdropClosing,
  enableModalsBackdropClosing,
  showDeleteModal,
  setPetModalHeaderText,
  petModalElements,
} from './modals.js';
import { refreshPets } from './app.js';

export const formElements = {
  form: document.getElementById('pet-modal-form'),
  petName: document.getElementById('petName'),
  age: document.getElementById('age'),
  notes: document.getElementById('notes'),
  kind: document.getElementById('kind'),
  healthProblems: document.getElementById('healthProblems'),
  addedDate: document.getElementById('addedDate'),

  saveButton: document.getElementById('form-save-btn'),
  editButton: document.getElementById('form-edit-btn'),
  deleteButton: document.getElementById('form-delete-btn'),
  cancelButton: document.getElementById('form-cancel-btn'),
  lockButton: document.getElementById('form-lock-btn'),
};

formElements.form.addEventListener(
  'submit',
  async function handleFormSubmit(e) {
    e.preventDefault();

    hideError('submit-form-error');
    disablePetModalEvents();
    showFormSubmitSpinner();

    const pet = getFormValues(e.target);
    try {
      let petResponse;
      if (Number(pet.petId) > 0) {
        petResponse = await editPet(pet);
      } else {
        petResponse = await addPet(pet);
      }

      await refreshPets();
      fillFormInputs(petResponse);
      lockForm(petResponse);
    } catch (err) {
      console.error(err);
      showError('submit-form-error');
    } finally {
      hideFormSubmitSpinner();
      enablePetModalEvents();
    }
  }
);

function getFormValues(formEl) {
  const pet = {};

  const inputs = formEl.querySelectorAll('[name]');
  for (let input of inputs) {
    const inputName = input.name;
    if (input.type === 'checkbox') {
      pet[inputName] = input.checked;
    } else {
      pet[inputName] = input.value;
    }
  }

  return pet;
}

export function lockForm(pet) {
  setPetModalHeaderText(`View pet #${pet.petId}`);
  enableModalsBackdropClosing();

  formElements.lockButton.style.display = 'none'
  formElements.deleteButton.style.display = 'flex';

  formElements.saveButton.style.display = 'none';
  formElements.editButton.style.display = 'flex';

  formElements.form.dataset.isLocked = 'true';

  // Question: When i use addEventListener, it triggers the event for every pet even thought there should be only 1
  formElements.deleteButton.onclick = async function () {
    await showDeleteModal(pet);
  };

  formElements.lockButton.onclick = function () {
    fillFormInputs(pet);
    lockForm(pet);
  };
}

export function unlockFormInputs(isNewPet) {
  formElements.petName.disabled = false;
  formElements.age.disabled = false;
  formElements.notes.disabled = false;
  formElements.healthProblems.disabled = false;

  if (isNewPet) {
    formElements.kind.disabled = false;
    formElements.addedDate.disabled = false;
  }
}

export function hideFormSubmitSpinner() {
  const petFormSpinner = document.getElementById('pet-form-spinner');
  if (petFormSpinner) {
    petFormSpinner.remove();
  }
}

export function showFormSubmitSpinner() {
  formElements.saveButton.appendChild(createSubmitSpinner('pet-form-spinner'));
}

export function resetForm() {
  formElements.form.reset();
}

export function fillFormInputs(pet) {
  for (const [key, value] of Object.entries(pet)) {
    const formEl = document.getElementById(key);
    if (formEl.type === 'checkbox') {
      formEl.checked = value;
    } else {
      formEl.value = value;
    }
  }
}

export function showForm() {
  formElements.form.style.display = 'flex';
}

export function hideForm() {
  formElements.form.style.display = 'none';
}
