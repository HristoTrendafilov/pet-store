import { createSubmitSpinner } from './utils.js';
import { editPet, addPet } from './api.js';
import { hidePetModal } from './modals.js';
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
};

document
  .getElementById('pet-modal-form')
  .addEventListener('submit', async function handleFormSubmit(e) {
    e.preventDefault();
    const isFormLocked = document
      .getElementById('pet-modal-form')
      .getAttribute('isLocked');
    if (isFormLocked == 'true') {
      unlockForm();
      return;
    }

    showPetFormSubmitSpinner();

    const pet = getFormValues(e.target);

    let response;
    if (Number(pet.petId) > 0) {
      response = await editPet(pet);
    } else {
      response = await addPet(pet);
    }

    if (response.isFailed) {
      // show the error
      return;
    }

    hidePetModal();
    hidePetFormSubmitSpinner();
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

  formElements.deleteButton.style.opacity = '1';
  formElements.deleteButton.disabled = false;
  formElements.deleteButton.style.pointerEvents = 'auto';

  document.getElementById('pet-modal-form').setAttribute('isLocked', 'true');
}

export function unlockForm() {
  unlockFormFields(false);

  formElements.saveButton.textContent = 'Save';
  formElements.saveButton.classList.remove('btn-warning');
  formElements.saveButton.classList.add('btn-primary');

  const modalTitle = document.getElementById('pet-modal-title');
  const petId = modalTitle.textContent.split(' ').pop();
  modalTitle.textContent = `Edit pet ${petId}`;

  formElements.deleteButton.style.opacity = '0.5';
  formElements.deleteButton.disabled = true;
  formElements.deleteButton.style.pointerEvents = 'none';

  document.getElementById('pet-modal-form').setAttribute('isLocked', 'false');
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
  formElements.saveButton.disabled = false;
  document.getElementById('pet-form-spinner').remove();
}

export function showPetFormSubmitSpinner() {
  formElements.saveButton.disabled = true;
  formElements.saveButton.appendChild(createSubmitSpinner('pet-form-spinner'));
}

export function resetForm() {
  document.getElementById('pet-modal-form').reset();
}
