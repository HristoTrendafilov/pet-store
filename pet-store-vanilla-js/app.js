import {
  configureFormEditModal,
  configureFormNewModal,
  showDeleteModal,
} from './modals.js';

import { getPetKinds, getAllPets } from './api.js';
import { formatDate, showError } from './utils.js';
import { formElements } from './form.js'

const mainPageElements = {
  addPetButton: document.getElementById('add-pet-btn'),
  loadingPetsSpinner: document.getElementById('loading-pets-spinner'),
  tableBody: document.getElementById('data-table').tBodies[0]
}

export const petKindsEnum = {};
window.addEventListener('DOMContentLoaded', async () => {
  disableAddPetButton();

  const [fetchedKinds, refreshedPets] = await Promise.all([fetchAndCachePetKinds(), refreshPets()]);
  if (fetchedKinds && refreshedPets) {
    enableAddPetButton();
  }
});

function disableAddPetButton() {
  mainPageElements.addPetButton.disabled = true;
  mainPageElements.addPetButton.style.opacity = '0.5';
}

function enableAddPetButton() {
  mainPageElements.addPetButton.disabled = false;
  mainPageElements.addPetButton.style.opacity = '1';
}

async function fetchAndCachePetKinds() {
  const petKinds = await getPetKinds();
  if (!petKinds) {
    showError('main-page-error');
    return false;
  }

  for (let kind of petKinds) {
    petKindsEnum[kind.value] = kind.displayName;

    const petKindOption = document.createElement('option');
    petKindOption.innerText = kind.displayName;
    petKindOption.value = kind.value;
    formElements.kind.append(petKindOption);
  }

  return true;
}

export async function refreshPets() {
  showLoadingPetsSpinner();
  mainPageElements.tableBody.innerHTML = '';

  const pets = await getAllPets();
  if (!pets) {
    showError('main-page-error');
    hideLoadingPetsSpinner();
    return false;
  }

  for (let pet of pets.sort((a, b) => b.petId - a.petId)) {
    const tr = document.createElement('tr');
    tr.appendChild(createTableColumn(pet.petId));
    tr.appendChild(createTableColumn(pet.petName));
    tr.appendChild(createTableColumn(formatDate(new Date(pet.addedDate))));
    tr.appendChild(createTableColumn(petKindsEnum[pet.kind]));
    tr.appendChild(createPetTableButtons(pet));

    mainPageElements.tableBody.appendChild(tr);
  }

  hideLoadingPetsSpinner();
  return true;
}

function createTableColumn(textContent) {
  const td = document.createElement('td');
  td.textContent = textContent;
  return td;
}

function createPetTableButtons(pet) {
  const td = document.createElement('td');
  td.setAttribute('colspan', '2');

  const flexWrapperDiv = document.createElement('div');
  flexWrapperDiv.appendChild(createViewEditButton(pet.petId));
  flexWrapperDiv.appendChild(createDeleteButton(pet));

  td.appendChild(flexWrapperDiv);
  return td;
}

function createViewEditButton(petId) {
  const viewEditButton = document.createElement('button');
  viewEditButton.textContent = 'View / Edit';
  viewEditButton.classList.add('btn', 'btn-warning');

  viewEditButton.addEventListener('click', async () => {
    await configureFormEditModal(petId);
  });

  return viewEditButton;
}

function createDeleteButton(pet) {
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('btn', 'btn-danger');

  deleteButton.addEventListener('click', async () => {
    await showDeleteModal(pet);
  });

  return deleteButton;
}

mainPageElements.addPetButton.addEventListener('click', () => {
  configureFormNewModal();
});

function showLoadingPetsSpinner() {
  mainPageElements.loadingPetsSpinner.style.display = 'flex';
}

function hideLoadingPetsSpinner() {
  mainPageElements.loadingPetsSpinner.style.display = 'none';
}
