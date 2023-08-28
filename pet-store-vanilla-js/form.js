import { createSubmitSpinner } from './utils.js';
import { editPet, addPet } from './api.js';
import {
  enablePetModalElementsEvents,
  disablePetModalElementsEvents,
  disableModalBackdropClosing,
  enableModalBackdropClosing,
  showDeleteModal,
} from './modals.js';
import { refreshPets } from './app.js';

export const formElements = {
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

document
  .getElementById('pet-modal-form')
  .addEventListener('submit', async function handleFormSubmit(e) {
    e.preventDefault();
    const isFormLocked = e.target.dataset.isLocked;
    if (isFormLocked === 'true') {
      unlockForm();
      return;
    }

    disablePetModalElementsEvents();
    showPetFormSubmitSpinner();

    const pet = getFormValues(e.target);

    let petResponse;
    if (Number(pet.petId) > 0) {
      petResponse = await editPet(pet);
    } else {
      petResponse = await addPet(pet);
    }

    hidePetFormSubmitSpinner();
    fillFormInputs(petResponse);
    lockForm.call(petResponse);
    enablePetModalElementsEvents();
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
  document.getElementById(
    'pet-modal-title'
  ).textContent = `View pet #${this.petId}`;
  enableModalBackdropClosing();

  const pet = this;

  formElements.lockButton.style.display = 'none';
  formElements.deleteButton.style.display = 'block';

  formElements.deleteButton.style.display = 'block';
  formElements.saveButton.textContent = 'Edit';
  formElements.saveButton.classList.remove('btn-primary');
  formElements.saveButton.classList.add('btn-warning');

  function lockInputField(element) {
    element.setAttribute('readonly', 'true');
    element.style.pointerEvents = 'none';
    element.style.background = 'var(--locked)';
  }

  lockInputField(formElements.petName);
  lockInputField(formElements.age);
  lockInputField(formElements.notes);
  lockInputField(formElements.kind);
  lockInputField(formElements.healthProblems);
  lockInputField(formElements.addedDate);

  document.getElementById('pet-modal-form').dataset.isLocked = 'true';

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
  unlockFormFields(false);
  disableModalBackdropClosing();

  formElements.saveButton.textContent = 'Save';
  formElements.saveButton.classList.remove('btn-warning');
  formElements.saveButton.classList.add('btn-primary');

  formElements.lockButton.style.display = 'block';
  formElements.deleteButton.style.display = 'none';

  const modalTitle = document.getElementById('pet-modal-title');
  const petId = modalTitle.textContent.split(' ').pop();
  modalTitle.textContent = `Edit pet ${petId}`;

  document.getElementById('pet-modal-form').dataset.isLocked = 'false';
}

export function unlockFormFields(isNewPet) {
  function unlockInputField(element) {
    element.removeAttribute('readonly');
    element.style.pointerEvents = 'auto';
    element.style.background = 'var(--white)';
  }

  unlockInputField(formElements.petName);
  unlockInputField(formElements.age);
  unlockInputField(formElements.notes);
  unlockInputField(formElements.healthProblems);

  if (isNewPet) {
    unlockInputField(formElements.kind);
    unlockInputField(formElements.addedDate);
  }
}

export function hidePetFormSubmitSpinner() {
  document.getElementById('pet-form-spinner').remove();
}

export function showPetFormSubmitSpinner() {
  formElements.saveButton.appendChild(createSubmitSpinner('pet-form-spinner'));
}

export function resetForm() {
  document.getElementById('pet-modal-form').reset();
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
