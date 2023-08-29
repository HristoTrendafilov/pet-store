import {
  resetForm,
  unlockFormInputs,
  formElements,
  lockForm,
  fillFormInputs,
  showForm,
  hideForm
} from './form.js';

import { getPet, deletePet } from './api.js';
import { petKindsEnum, refreshPets } from './app.js';
import { createSubmitSpinner, formatDate, showError, hideError } from './utils.js';

// Pet modal
export const petModalElements = {
  modal: document.getElementById('pet-modal'),
  title: document.getElementById('pet-modal-title'),
  titleCloseButton: document.getElementById('pet-modal-close'),
  loadingSpinner: document.getElementById('pet-modal-spinner'),
}

export function setPetModalHeaderText(textContent) {
  petModalElements.title.textContent = textContent;
}

export function hidePetModal() {
  petModalElements.modal.style.display = 'none';
}

export function showPetModal() {
  petModalElements.modal.style.display = 'block';
  hideError('fetch-pet-error');
  hideError('submit-form-error');
}

export async function configureFormEditModal(petId) {
  hideForm();
  resetForm();

  setPetModalHeaderText(`View pet #${petId}`);
  disablePetModalEvents();
  showPetModalSpinner();
  showPetModal();

  const pet = await getPet(petId);
  hidePetModalSpinner();
  enablePetModalEvents();

  if (!pet) {
    showError('fetch-pet-error');
    return;
  }

  fillFormInputs(pet);
  lockForm.call(pet);

  showForm();
}

export function configureFormNewModal() {
  resetForm();
  unlockFormInputs(true);
  setPetModalHeaderText('Add pet');

  formElements.saveButton.textContent = 'Save';
  formElements.saveButton.classList.remove('btn-warning');
  formElements.saveButton.classList.add('btn-primary');

  formElements.deleteButton.style.display = 'none';
  formElements.lockButton.style.display = 'none';

  formElements.addedDate.valueAsDate = new Date();
  formElements.form.dataset.isLocked = 'false';

  showPetModal();
}

export function showPetModalSpinner() {
  petModalElements.loadingSpinner.style.display = 'flex';
}

export function hidePetModalSpinner() {
  petModalElements.loadingSpinner.style.display = 'none';
}

petModalElements.titleCloseButton.addEventListener('click', () => {
  hidePetModal();
});

formElements.cancelButton.addEventListener('click', () => {
  hidePetModal();
});

export function disablePetModalEvents() {
  disableModalsBackdropClosing();
  petModalElements.titleCloseButton.style.pointerEvents = 'none';

  formElements.saveButton.disabled = true;
  formElements.deleteButton.disabled = true;
  formElements.cancelButton.disabled = true;
}

export function enablePetModalEvents() {
  enableModalsBackdropClosing();
  petModalElements.titleCloseButton.style.pointerEvents = 'auto';

  formElements.saveButton.disabled = false;
  formElements.deleteButton.disabled = false;
  formElements.cancelButton.disabled = false;
}

// Delete modal
const deleteModalElements = {
  modal: document.getElementById('delete-modal'),
  title: document.getElementById('delete-modal-title'),
  titleCloseButton: document.getElementById('delete-modal-close'),
  petInfo: document.getElementById('delete-modal-pet-info'),
  deleteButton: document.getElementById('delete-modal-delete-btn'),
  cancelButton:document.getElementById('delete-modal-cancel-btn')
}

export async function showDeleteModal(pet) {
  deleteModalElements.title.textContent = `Delete pet #${pet.petId}`;
  deleteModalElements.petInfo.innerHTML = '';

  function createPetInfoElement(textContent) {
    const div = document.createElement('div');
    div.textContent = textContent;

    return div;
  }

  deleteModalElements.petInfo.appendChild(createPetInfoElement(`Name: ${pet.petName}`));
  deleteModalElements.petInfo.appendChild(createPetInfoElement(`Kind: ${petKindsEnum[pet.kind]}`));
  if (pet.hasOwnProperty('age')) {
    deleteModalElements.petInfo.appendChild(createPetInfoElement(`Age: ${pet.age}`));
  }
  if (pet.hasOwnProperty('notes')) {
    deleteModalElements.petInfo.appendChild(
      createPetInfoElement(`Notes: ${pet.notes ? pet.notes : ''}`)
    );
  }
  if (pet.hasOwnProperty('healthProblems')) {
    deleteModalElements.petInfo.appendChild(
      createPetInfoElement(
        `Has health problems: ${pet.healthProblems ? 'yes' : 'no'}`
      )
    );
  }
  deleteModalElements.petInfo.appendChild(
    createPetInfoElement(
      `Date added: ${formatDate(new Date(pet.addedDate))}`
    )
  );

  deleteModalElements.modal.style.display = 'block';

  deleteModalElements.deleteButton.onclick =
    async function () {
      hideError('delete-pet-error');
      showDeleteModalSubmitSpinner();
      disableDeleteModalEvents();

      const response = await deletePet(pet.petId);
      hideDeleteModalSubmitSpinner();
      enableDeleteModalEvents();

      if (!response) {
        showError('delete-pet-error');
        return;
      }

      hideDeleteModal();
      hidePetModal();

      await refreshPets();
    };
}

export function hideDeleteModal() {
  deleteModalElements.modal.style.display = 'none';
}

function showDeleteModalSubmitSpinner() {
  deleteModalElements.deleteButton
    .appendChild(createSubmitSpinner('delete-modal-submit-spinner'));
}

function hideDeleteModalSubmitSpinner() {
  document.getElementById('delete-modal-submit-spinner').remove();
}

deleteModalElements.titleCloseButton.addEventListener('click', () => {
  hideDeleteModal();
});

deleteModalElements.cancelButton.addEventListener('click', () => {
    hideDeleteModal();
  });

export function enableDeleteModalEvents() {
  enableModalsBackdropClosing();
  deleteModalElements.titleCloseButton.style.pointerEvents = 'auto';
  deleteModalElements.cancelButton.disabled = false;
  deleteModalElements.deleteButton.disabled = false;
}

export function disableDeleteModalEvents() {
  disableModalsBackdropClosing();
  deleteModalElements.titleCloseButton.style.pointerEvents = 'none';
  deleteModalElements.cancelButton.disabled = true;
  deleteModalElements.deleteButton.disabled = true;
}

// Common
function closeModalsOnBackdropClick(e) {
  if (e.target === petModalElements.modal) {
    petModalElements.modal.style.display = 'none';
  } else if (e.target === deleteModalElements.modal) {
    deleteModalElements.modal.style.display = 'none';
  }
}

export function disableModalsBackdropClosing() {
  document.removeEventListener('click', closeModalsOnBackdropClick);
}

export function enableModalsBackdropClosing() {
  document.addEventListener('click', closeModalsOnBackdropClick);
}
