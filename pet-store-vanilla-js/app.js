import {
  configureFormEditModal,
  configureFormNewModal,
  showDeleteModal,
} from './modals.js';

import { getPetKinds, getAllPets } from './api.js';
import { formatDate, showError } from './utils.js';
import { formElements } from './form.js';

const mainPageElements = {
  addPetButton: document.getElementById('add-pet-btn'),
  loadingPetsSpinner: document.getElementById('loading-pets-spinner'),
  tableBody: document.getElementById('data-table').tBodies[0],
};

export const petKindsEnum = {};
window.addEventListener('DOMContentLoaded', async () => {
  disableAddPetButton();
  showLoadingPetsSpinner();

  // Question: Its redundat to refresh the pets if we are not able do download the pet kinds.
  // I removed the Promise.all and just showed the spinner at the start
  // There is code duplication with the spinner here and in the refreshPets(). Maybe it's not the best practice.
  const fetchedPetKinds = await tryFetchPetKinds();
  if (fetchedPetKinds) {
    await refreshPets();
    enableAddPetButton();
  }

  hideLoadingPetsSpinner();
});

function disableAddPetButton() {
  mainPageElements.addPetButton.disabled = true;
  mainPageElements.addPetButton.style.opacity = '0.5';
}

function enableAddPetButton() {
  mainPageElements.addPetButton.disabled = false;
  mainPageElements.addPetButton.style.opacity = '1';
}

async function tryFetchPetKinds() {
  let fetchedPetKinds;

  try {
    const petKinds = await getPetKinds();
    for (let kind of petKinds) {
      petKindsEnum[kind.value] = kind.displayName;

      const petKindOption = document.createElement('option');
      petKindOption.innerText = kind.displayName;
      petKindOption.value = kind.value;
      formElements.kind.append(petKindOption);
    }
    fetchedPetKinds = true;
  } catch (err) {
    fetchedPetKinds = false;
    console.log(err);
    showError('main-page-error');
  }

  return fetchedPetKinds;
}

export async function refreshPets() {
  showLoadingPetsSpinner();
  mainPageElements.tableBody.innerHTML = '';

  try {
    const pets = await getAllPets();
    for (let pet of pets.sort((a, b) => b.petId - a.petId)) {
      const tr = document.createElement('tr');
      tr.appendChild(createTableColumn(pet.petId));
      tr.appendChild(createTableColumn(pet.petName));
      tr.appendChild(createTableColumn(formatDate(new Date(pet.addedDate))));
      tr.appendChild(createTableColumn(petKindsEnum[pet.kind]));
      tr.appendChild(createPetTableButtons(pet));

      mainPageElements.tableBody.appendChild(tr);
    }
  } catch (err) {
    console.log(err);
    showError('main-page-error');
  } finally {
    hideLoadingPetsSpinner();
  }
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
