import {
  resetForm,
  unlockFormFields,
  formElements,
  setFormAddedDate,
  lockForm,
} from './form.js';

import { getPet, deletePet } from './api.js';
import { petKinds, refreshPets } from './app.js';
import { createSubmitSpinner, formatDate } from './utils.js';

// PET MODAL //
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
  document.getElementById('form-delete-btn').onclick =
    function showDeleteModalFromButton() {
      showDeleteModal(petId);
    };
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
  setFormAddedDate(new Date());
  document.getElementById('pet-modal-form').setAttribute('isLocked', 'false');
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

document.getElementById('pet-modal-close').onclick =
  function hidePetModalFromHeader() {
    hidePetModal();
  };

document.getElementById('form-cancel-btn').onclick =
  function hidePetModalFromButton() {
    hidePetModal();
  };
// PET MODAL //

// DELETE MODAL //
export async function showDeleteModal(petId) {
  document.getElementById(
    'delete-modal-title'
  ).textContent = `Delete pet #${petId}`;
  const petInfoEl = document.getElementById('delete-modal-pet-info');
  petInfoEl.innerHTML = '';

  document.getElementById('delete-modal').style.display = 'block';
  showDeleteModalSpinner();

  const getPetResp = await getPet(petId);
  if (getPetResp.isFailed) {
    // show the error
    return;
  }

  const pet = getPetResp.payload;

  function createDeleteModalPetInfoElement(textContent) {
    const div = document.createElement('div');
    div.textContent = textContent;

    return div;
  }

  petInfoEl.appendChild(
    createDeleteModalPetInfoElement(`Name: ${pet.petName}`)
  );
  petInfoEl.appendChild(
    createDeleteModalPetInfoElement(`Kind: ${petKinds[pet.kind]}`)
  );
  petInfoEl.appendChild(createDeleteModalPetInfoElement(`Age: ${pet.age}`));
  petInfoEl.appendChild(
    createDeleteModalPetInfoElement(
      `Has health problems: ${pet.healthProblems}`
    )
  );
  petInfoEl.appendChild(
    createDeleteModalPetInfoElement(`Notes: ${pet.notes ? pet.notes : ''}`)
  );
  petInfoEl.appendChild(
    createDeleteModalPetInfoElement(
      `Date added: ${formatDate(new Date(pet.addedDate))}`
    )
  );

  hideDeleteModalSpinner();

  const deleteButton = document.getElementById('delete-modal-delete-btn');
  deleteButton.onclick = async function deletePetFromButton() {
    showDeleteModalSubmitSpinner();
    const deleteResp = await deletePet(petId);
    if (deleteResp.isFailed) {
      // show the error
      hideDeleteModalSubmitSpinner();
      return;
    }

    hideDeleteModalSubmitSpinner();
    hideDeleteModal();
    hidePetModal();
    await refreshPets();
  };
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

function showDeleteModalSpinner() {
  document.getElementById('delete-modal-spinner').style.display = 'flex';
  document.getElementById('delete-modal-buttons').style.display = 'none';
}

function hideDeleteModalSpinner() {
  document.getElementById('delete-modal-spinner').style.display = 'none';
  document.getElementById('delete-modal-buttons').style.display = 'flex';
}

document.getElementById('delete-modal-close').onclick =
  function hideDeleteModalFromHeader() {
    hideDeleteModal();
  };

document.getElementById('delete-modal-cancel-btn').onclick =
  function hideDeleteModalFromButton() {
    hideDeleteModal();
  };
// DELETE MODAL //
