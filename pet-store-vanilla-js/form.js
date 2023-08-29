import { createSubmitSpinner, showError, hideError } from './utils.js';
import { editPet, addPet } from './api.js';
import {
  enablePetModalEvents,
  disablePetModalEvents,
  disableModalsBackdropClosing,
  enableModalsBackdropClosing,
  showDeleteModal,
  setPetModalHeaderText,
  petModalElements
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
  deleteButton: document.getElementById('form-delete-btn'),
  cancelButton: document.getElementById('form-cancel-btn'),
  lockButton: document.getElementById('form-lock-btn'),
};

formElements.form
  .addEventListener('submit', async function handleFormSubmit(e) {
    e.preventDefault();
    const isFormLocked = e.target.dataset.isLocked;
    if (isFormLocked === 'true') {
      unlockForm();
      return;
    }

    hideError('submit-form-error');
    disablePetModalEvents();
    showFormSubmitSpinner();

    const pet = getFormValues(e.target);

    let petResponse;
    if (Number(pet.petId) > 0) {
      petResponse = await editPet(pet);
    } else {
      petResponse = await addPet(pet);
    }

    hideFormSubmitSpinner();
    enablePetModalEvents();

    if (!petResponse) {
      showError('submit-form-error');
      return;
    }

    fillFormInputs(petResponse);
    lockForm.call(petResponse);

    await refreshPets();
  });

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

export function lockForm() {
  setPetModalHeaderText(`View pet #${this.petId}`);
  enableModalsBackdropClosing();

  const pet = this;

  formElements.lockButton.style.display = 'none';
  formElements.deleteButton.style.display = 'block';

  formElements.deleteButton.style.display = 'block';
  formElements.saveButton.textContent = 'Edit';
  formElements.saveButton.classList.remove('btn-primary');
  formElements.saveButton.classList.add('btn-warning');

  function lockInput(element) {
    element.setAttribute('readonly', 'true');
    element.style.pointerEvents = 'none';
    element.style.background = 'var(--locked)';
  }

  lockInput(formElements.petName);
  lockInput(formElements.age);
  lockInput(formElements.notes);
  lockInput(formElements.kind);
  lockInput(formElements.healthProblems);
  lockInput(formElements.addedDate);

  formElements.form.dataset.isLocked = 'true';

  // When i use addEventListener, it triggers the event for every pet even thought there should be only 1
  formElements.deleteButton.onclick = async function () {
    await showDeleteModal(pet);
  };

  formElements.lockButton.onclick = function () {
    fillFormInputs(pet);
    lockForm.call(pet);
  };
}

export function unlockForm() {
  unlockFormInputs(false);
  disableModalsBackdropClosing();

  formElements.saveButton.textContent = 'Save';
  formElements.saveButton.classList.remove('btn-warning');
  formElements.saveButton.classList.add('btn-primary');

  formElements.lockButton.style.display = 'block';
  formElements.deleteButton.style.display = 'none';

  const petId = petModalElements.title.textContent.split(' ').pop();
  petModalElements.title.textContent = `Edit pet ${petId}`;

  formElements.form.dataset.isLocked = 'false';
}

export function unlockFormInputs(isNewPet) {
  function unlockInput(element) {
    element.removeAttribute('readonly');
    element.style.pointerEvents = 'auto';
    element.style.background = 'var(--white)';
  }

  unlockInput(formElements.petName);
  unlockInput(formElements.age);
  unlockInput(formElements.notes);
  unlockInput(formElements.healthProblems);

  if (isNewPet) {
    unlockInput(formElements.kind);
    unlockInput(formElements.addedDate);
  }
}

export function hideFormSubmitSpinner() {
  document.getElementById('pet-form-spinner').remove();
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
