import {
  createSubmitSpinner,
  isNullOrWhitespace,
  formatDate,
} from './utils.js';
import { editPet, addPet } from './api.js';
import { hidePetModal } from './modals.js';
import { refreshPets } from './app.js';

export const formElements = {
  petName: document.getElementById('petName'),
  age: document.getElementById('age'),
  notes: document.getElementById('notes'),
  kind: document.getElementById('kind'),
  healthProblems: document.getElementById('healthProblems'),
  addedDatePicker: document.getElementById('addedDatePicker'),
  addedDateText: document.getElementById('addedDateText'),

  saveButton: document.getElementById('form-save-btn'),
  deleteButton: document.getElementById('form-delete-btn'),
  cancelButton: document.getElementById('form-cancel-btn'),

  petNameVal: document.getElementById('petName-validation'),
  ageVal: document.getElementById('age-validation'),
  kindVal: document.getElementById('kind-validation'),
  addedDateVal: document.getElementById('addedDate-validation'),
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
    hideFormValidations();

    const formData = new FormData(e.target);
    const pet = Object.fromEntries(formData.entries());

    const triggeredValidationsElements = validateFormInput(pet);
    if (triggeredValidationsElements.length > 0) {
      for (let validationElement of triggeredValidationsElements) {
        if (validationElement.hasAttribute('hidden')) {
          validationElement.removeAttribute('hidden');
        }
      }

      hidePetFormSubmitSpinner();
      return;
    }

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
  lockInputField(formElements.addedDatePicker);
  lockInputField(formElements.addedDateText);

  formElements.deleteButton.style.opacity = '1';
  formElements.deleteButton.disabled = false;

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
    unlockInputField(formElements.addedDatePicker);
  }
}

function validateFormInput(pet) {
  const triggeredValidationsElements = [];

  if (isNullOrWhitespace(pet.petName)) {
    triggeredValidationsElements.push(formElements.petNameVal);
  }
  if (isNullOrWhitespace(pet.kind)) {
    triggeredValidationsElements.push(formElements.kindVal);
  }
  if (isNullOrWhitespace(pet.age)) {
    triggeredValidationsElements.push(formElements.ageVal);
  }
  if (isNullOrWhitespace(pet.addedDate)) {
    triggeredValidationsElements.push(formElements.addedDateVal);
  }

  return triggeredValidationsElements;
}

export function hidePetFormSubmitSpinner() {
  formElements.saveButton.disabled = false;
  document.getElementById('pet-form-spinner').remove();
}

export function showPetFormSubmitSpinner() {
  formElements.saveButton.disabled = true;
  formElements.saveButton.appendChild(createSubmitSpinner('pet-form-spinner'));
}

export function hideFormValidations() {
  const validatioFields = document.querySelectorAll('.validation');
  for (let validation of validatioFields) {
    if (!validation.hasAttribute('hidden')) {
      validation.setAttribute('hidden', true);
    }
  }
}

export function resetForm() {
  document.getElementById('pet-modal-form').reset();
  hideFormValidations();
}

export function setFormAddedDate(date) {
  document.getElementById('addedDateText').value = formatDate(date);
  document.getElementById('addedDatePicker').valueAsDate = date;
}

document.getElementById('addedDatePicker').onchange =
  function handleDateChange() {
    setFormAddedDate(new Date(addedDatePicker.value));
  };
