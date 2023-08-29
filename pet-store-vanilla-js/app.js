import {
  configureFormEditModal,
  configureFormNewModal,
  showDeleteModal,
} from './modals.js';

import { getPetKinds, getAllPets } from './api.js';
import { formatDate, showError } from './utils.js';

export const petKindsEnum = {};
window.addEventListener('DOMContentLoaded', async () => {
  const addPetBtn = document.getElementById('add-pet-btn');
  addPetBtn.disabled = true;
  addPetBtn.style.opacity = '0.5';

  const [fetchedKinds, refreshedPets] = await Promise.all([fetchAndCachePetKinds(), refreshPets()]);
  if (fetchedKinds && refreshedPets) {
    addPetBtn.disabled = false;
    addPetBtn.style.opacity = '1';
  }
});

async function fetchAndCachePetKinds() {
  const petKinds = await getPetKinds();
  if (!petKinds) {
    showError('main-page-error');
    return false;
  }

  const petKindSelect = document.getElementById('kind');
  for (let kind of petKinds) {
    petKindsEnum[kind.value] = kind.displayName;

    const petKindOption = document.createElement('option');
    petKindOption.innerText = kind.displayName;
    petKindOption.value = kind.value;
    petKindSelect.append(petKindOption);
  }

  return true;
}

export async function refreshPets() {
  showLoadingPetsSpinner();
  const tableBody = document.getElementById('data-table').tBodies[1];
  tableBody.innerHTML = '';

  const pets = await getAllPets();
  if (!pets) {
    showError('main-page-error');
    hideLoadingPetsSpinner();
    return false;
  }

  for (let pet of pets.sort((a, b) => b.petId - a.petId)) {
    const tr = document.createElement('tr');
    tr.appendChild(createPetTableColumn(pet.petId));
    tr.appendChild(createPetTableColumn(pet.petName));
    tr.appendChild(createPetTableColumn(formatDate(new Date(pet.addedDate))));
    tr.appendChild(createPetTableColumn(petKindsEnum[pet.kind]));
    tr.appendChild(createPetTableButtons(pet));

    tableBody.appendChild(tr);
  }

  hideLoadingPetsSpinner();
  return true;
}

function createPetTableColumn(textContent) {
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

document.getElementById('add-pet-btn').addEventListener('click', () => {
  configureFormNewModal();
});

function showLoadingPetsSpinner() {
  document.getElementById('loading-pets-spinner').style.display = 'flex';
}

function hideLoadingPetsSpinner() {
  document.getElementById('loading-pets-spinner').style.display = 'none';
}
