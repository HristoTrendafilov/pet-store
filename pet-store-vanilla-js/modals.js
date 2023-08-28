import {
  resetForm,
  unlockFormFields,
  formElements,
  lockForm,
  fillFormInputs
} from './form.js';

import { getPet, deletePet } from './api.js';
import { petKindsEnum, refreshPets } from './app.js';
import { createSubmitSpinner, formatDate } from './utils.js';

// Pet modal
export function hidePetModal() {
  document.getElementById('pet-modal').style.display = 'none';
}

export function showPetModal() {
  document.getElementById('pet-modal').style.display = 'block';
}

export async function configureFormEditModal(petId) {
  document.getElementById('pet-modal-title').textContent = `View pet #${petId}`;
  resetForm();

  disablePetModalElementsEvents();
  showPetModal();
  showPetModalSpinner();

  const pet = await getPet(petId);
  fillFormInputs(pet);
  lockForm.call(pet);

  hidePetModalSpinner();
  enablePetModalElementsEvents();
}

export function configureFormNewModal() {
  resetForm();
  unlockFormFields(true);
  document.getElementById('pet-modal-title').textContent = 'Add pet';
  formElements.deleteButton.style.display = 'none';
  formElements.saveButton.textContent = 'Save';
  formElements.saveButton.classList.remove('btn-warning');
  formElements.saveButton.classList.add('btn-primary');
  formElements.lockButton.style.display = 'none';
  formElements.addedDate.valueAsDate = new Date();
  document.getElementById('pet-modal-form').dataset.isLocked = "false";
  showPetModal();
}

export function showPetModalSpinner() {
  document.getElementById('pet-modal-spinner').style.display = 'flex';
  document.getElementById('pet-modal-form').style.display = 'none';
}

export function hidePetModalSpinner() {
  document.getElementById('pet-modal-spinner').style.display = 'none';
  document.getElementById('pet-modal-form').style.display = 'flex';
}

document.getElementById('pet-modal-close').addEventListener('click', () => {
  hidePetModal();
});

document.getElementById('form-cancel-btn').addEventListener('click', () => {
  hidePetModal();
});

export function disablePetModalElementsEvents() {
  disableModalBackdropClosing();
  document.getElementById('pet-modal-close').style.pointerEvents = 'none';
  formElements.saveButton.disabled = true;
  formElements.deleteButton.disabled = true;
  formElements.cancelButton.disabled = true;
}

export function enablePetModalElementsEvents() {
  enableModalBackdropClosing();
  document.getElementById('pet-modal-close').style.pointerEvents = 'auto';
  formElements.saveButton.disabled = false;
  formElements.deleteButton.disabled = false;
  formElements.cancelButton.disabled = false;
}


// Delete modal
export async function showDeleteModal(pet) {
  document.getElementById(
    'delete-modal-title'
  ).textContent = `Delete pet #${pet.petId}`;
  const petInfoEl = document.getElementById('delete-modal-pet-info');
  petInfoEl.innerHTML = '';

  function createDeleteModalPetInfoElement(textContent) {
    const div = document.createElement('div');
    div.textContent = textContent;

    return div;
  }

  petInfoEl.appendChild(createDeleteModalPetInfoElement(`Name: ${pet.petName}`));
  petInfoEl.appendChild(createDeleteModalPetInfoElement(`Kind: ${petKindsEnum[pet.kind]}`));
  if (pet.hasOwnProperty('age')) {
    petInfoEl.appendChild(createDeleteModalPetInfoElement(`Age: ${pet.age}`));
  }
  if (pet.hasOwnProperty('notes')) {
    petInfoEl.appendChild(createDeleteModalPetInfoElement(`Notes: ${pet.notes ? pet.notes : ''}`));
  }
  if (pet.hasOwnProperty('healthProblems')) {
    petInfoEl.appendChild(createDeleteModalPetInfoElement(`Has health problems: ${pet.healthProblems ? 'yes' : 'no'}`));
  }
  petInfoEl.appendChild(createDeleteModalPetInfoElement(`Date added: ${formatDate(new Date(pet.addedDate))}`));

  document.getElementById('delete-modal').style.display = 'block';

  document.getElementById('delete-modal-delete-btn').onclick = async function (){
    showDeleteModalSubmitSpinner();
    disableDeleteModalElementsEvents();

    await deletePet(pet.petId);

    hideDeleteModalSubmitSpinner();
    enableDeleteModalElementsEvents();
    hideDeleteModal();
    hidePetModal();

    await refreshPets();
  };
}

export function hideDeleteModal() {
  document.getElementById('delete-modal').style.display = 'none';
}

function showDeleteModalSubmitSpinner() {
  document.getElementById('delete-modal-delete-btn').appendChild(createSubmitSpinner('delete-modal-submit-spinner'));
}

function hideDeleteModalSubmitSpinner() {
  document.getElementById('delete-modal-submit-spinner').remove();
}

document.getElementById('delete-modal-close').addEventListener('click', () => {
  hideDeleteModal();
});

document.getElementById('delete-modal-cancel-btn').addEventListener('click', () => {
  hideDeleteModal();
});

export function enableDeleteModalElementsEvents() {
  enableModalBackdropClosing();
  document.getElementById('delete-modal-close').style.pointerEvents = 'auto';
  document.getElementById('delete-modal-cancel-btn').disabled = false;
  document.getElementById('delete-modal-delete-btn').disabled = false;
}

export function disableDeleteModalElementsEvents() {
  disableModalBackdropClosing();
  document.getElementById('delete-modal-close').style.pointerEvents = 'none';
  document.getElementById('delete-modal-cancel-btn').disabled = true;
  document.getElementById('delete-modal-delete-btn').disabled = true;
}


// Common
function closeModalsOnOutsideClick(e) {
  const petModal = document.getElementById('pet-modal');
  const deleteModal = document.getElementById('delete-modal');
  if (e.target === petModal) {
    petModal.style.display = 'none';
  } else if (e.target === deleteModal) {
    deleteModal.style.display = 'none';
  }
}

export function disableModalBackdropClosing() {
  document.removeEventListener("click", closeModalsOnOutsideClick)
}

export function enableModalBackdropClosing() {
  document.addEventListener("click", closeModalsOnOutsideClick);
}

