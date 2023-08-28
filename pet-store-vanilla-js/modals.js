import {
  resetForm,
  unlockFormFields,
  formElements,
  lockForm,
} from './form.js';

import { getPet, deletePet } from './api.js';
import { petKinds, refreshPets } from './app.js';
import { createSubmitSpinner, formatDate } from './utils.js';

// Pet modal
export function hidePetModal() {
  document.getElementById('pet-modal').style.display = 'none';
}

export function showPetModal() {
  document.getElementById('pet-modal').style.display = 'block';
}

export function configureFormEditModal(petId) {
  resetForm();
  document.getElementById('pet-modal-title').textContent = `View pet #${petId}`;
  formElements.deleteButton.style.display = 'block';
  formElements.saveButton.textContent = 'Edit';
  formElements.saveButton.classList.remove('btn-primary');
  formElements.saveButton.classList.add('btn-warning');

  lockForm();
  showPetModal();
}

export function configureFormNewModal() {
  resetForm();
  unlockFormFields(true);
  document.getElementById('pet-modal-title').textContent = 'Add pet';
  formElements.deleteButton.style.display = 'none';
  formElements.saveButton.textContent = 'Save';
  formElements.saveButton.classList.remove('btn-warning');
  formElements.saveButton.classList.add('btn-primary');
  document.getElementById('pet-modal-form').setAttribute('isLocked', 'false');
  document.getElementById("addedDate").valueAsDate = new Date();
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
  petInfoEl.appendChild(createDeleteModalPetInfoElement(`Kind: ${petKinds[pet.kind]}`));
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

  document.getElementById('delete-modal-delete-btn').addEventListener('click', async () => {
    showDeleteModalSubmitSpinner();

    const deleteResp = await deletePet(pet.petId);
    if (deleteResp.isFailed) {
      // show the error
      hideDeleteModalSubmitSpinner();
      return;
    }

    hideDeleteModalSubmitSpinner();
    hideDeleteModal();
    hidePetModal();

    await refreshPets();
  })
}

export function hideDeleteModal() {
  document.getElementById('delete-modal').style.display = 'none';
}

function showDeleteModalSubmitSpinner() {
  const deleteButton = document.getElementById('delete-modal-delete-btn');
  deleteButton.disabled = true;
  deleteButton.appendChild(createSubmitSpinner('delete-modal-submit-spinner'));
}

function hideDeleteModalSubmitSpinner() {
  const deleteButton = document.getElementById('delete-modal-delete-btn');
  deleteButton.disabled = false;
  document.getElementById('delete-modal-submit-spinner').remove();
}

document.getElementById('delete-modal-close').addEventListener('click', () => {
  hideDeleteModal();
});

document.getElementById('delete-modal-cancel-btn').addEventListener('click', () => {
  hideDeleteModal();
});

export function enableModalsOnOutsideClick() {
  document.addEventListener("click", closeModalsOnOutsideClick);
}

export function disableModalsOnOutsideClick() {
  document.removeEventListener("click", closeModalsOnOutsideClick);
}

function closeModalsOnOutsideClick(e) {
  const petModal = document.getElementById('pet-modal');
  const deleteModal = document.getElementById('delete-modal');
  if (e.target === petModal) {
    petModal.style.display = 'none';
  } else if (e.target === deleteModal) {
    deleteModal.style.display = 'none';
  }
}

