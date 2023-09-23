import {
  configureFormNewModal,
  configureFormEditModal,
  showDeleteModal,
} from './modals.js';
import { getPetKinds, getAllPets } from './api.js';
import { formatDate, hideError, showError } from './utils.js';
import { formElements } from './form.js';

const mainPageElements = {
  addPetButton: document.getElementById('add-pet-btn'),
  loadingPetsSpinner: document.getElementById('loading-pets-spinner'),
  tableBody: document.getElementById('data-table').tBodies[0],
};

export const petKindsEnum = {};
const allPets = [];
window.addEventListener('DOMContentLoaded', async () => {
  disableAddPetButton();
  await refreshPets(true);
  enableAddPetButton();
});

function disableAddPetButton() {
  mainPageElements.addPetButton.disabled = true;
  mainPageElements.addPetButton.style.opacity = '0.5';
}

function enableAddPetButton() {
  mainPageElements.addPetButton.disabled = false;
  mainPageElements.addPetButton.style.opacity = '1';
}

export async function refreshPets(fetchPetKinds = false) {
  hideError('main-page-error');
  showLoadingPetsSpinner();
  mainPageElements.tableBody.innerHTML = '';

  try {
    const allPetsPromise = getAllPets();

    if (fetchPetKinds) {
      const petKinds = await getPetKinds();
      for (let kind of petKinds) {
        petKindsEnum[kind.value] = kind.displayName;

        const petKindOption = document.createElement('option');
        petKindOption.innerText = kind.displayName;
        petKindOption.value = kind.value;
        formElements.kind.append(petKindOption);
      }
    }

    const pets = await allPetsPromise;
    for (let pet of pets.sort((a, b) => b.petId - a.petId)) {
      const tr = document.createElement('tr');
      tr.appendChild(createTableColumn(pet.petId));
      tr.appendChild(createTableColumn(pet.petName));
      tr.appendChild(createTableColumn(formatDate(new Date(pet.addedDate))));
      tr.appendChild(createTableColumn(petKindsEnum[pet.kind]));
      tr.appendChild(createPetTableButtons(pet));

      mainPageElements.tableBody.appendChild(tr);
      allPets.push(pet);
    }
  } catch (err) {
    console.error(err);
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
  flexWrapperDiv.appendChild(createDeleteButton(pet.petId));

  td.appendChild(flexWrapperDiv);
  return td;
}

function createViewEditButton(petId) {
  const viewEditButton = document.createElement('button');
  viewEditButton.textContent = 'View / Edit';
  viewEditButton.classList.add('btn', 'btn-warning');
  viewEditButton.dataset.petId = petId;
  viewEditButton.dataset.type = 'edit';

  return viewEditButton;
}

function createDeleteButton(petId) {
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.dataset.petId = petId;
  deleteButton.dataset.type = 'delete';

  return deleteButton;
}

mainPageElements.tableBody.addEventListener('click', async (e) => {
  if (e.target.tagName !== 'BUTTON') {
    return;
  }

  const dataSet = e.target.dataset;
  const petId = Number(dataSet.petId);

  const buttonType = dataSet.type;
  if (buttonType === 'edit') {
    await configureFormEditModal(petId);
  } else if (buttonType === 'delete') {
    const pet = allPets.find((x) => x.petId === petId);
    await showDeleteModal(pet);
  }
});

mainPageElements.addPetButton.addEventListener('click', () => {
  configureFormNewModal();
});

function showLoadingPetsSpinner() {
  mainPageElements.loadingPetsSpinner.style.display = 'flex';
}

function hideLoadingPetsSpinner() {
  mainPageElements.loadingPetsSpinner.style.display = 'none';
}
