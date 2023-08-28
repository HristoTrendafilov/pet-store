import {
  showPetModalSpinner,
  hidePetModalSpinner,
  configureFormEditModal,
  configureFormNewModal,
  showDeleteModal,
} from './modals.js';

import { getPetKinds, getAllPets, getPet } from './api.js';
import { formatDate } from './utils.js';

export const petKinds = {};
window.addEventListener('DOMContentLoaded', async () => {
  const addPetBtn = document.getElementById('add-pet-btn');
  addPetBtn.disabled = true;
  addPetBtn.style.opacity = '0.5'

  await Promise.all([fetchAndCachePetKinds(), refreshPets()]);

  addPetBtn.disabled = false;
  addPetBtn.style.opacity = '1';
});

async function fetchAndCachePetKinds() {
  const petKindsResp = await getPetKinds();
  if (petKindsResp.isFailed) {
    // show the error
    return;
  }

  const petKindSelect = document.getElementById('kind');
  for (let kind of petKindsResp.payload) {
    petKinds[kind.value] = kind.displayName;

    const petKindOption = document.createElement('option');
    petKindOption.innerText = kind.displayName;
    petKindOption.value = kind.value;
    petKindSelect.append(petKindOption);
  }
}

export async function refreshPets() {
  showLoadingPetsSpinner();
  const tableBody = document.getElementById('data-table').tBodies[1];
  tableBody.innerHTML = '';

  const petsResp = await getAllPets();
  if (petsResp.isFailed) {
    // show the error
    return;
  }

  for (let pet of petsResp.payload.sort((a, b) => b.petId - a.petId)) {
    const tr = document.createElement('tr');
    tr.appendChild(createPetTableColumn(pet.petId));
    tr.appendChild(createPetTableColumn(pet.petName));
    tr.appendChild(createPetTableColumn(formatDate(new Date(pet.addedDate))));
    tr.appendChild(createPetTableColumn(petKinds[pet.kind]));
    tr.appendChild(createPetTableButtons(pet));

    tableBody.appendChild(tr);
  }

  hideLoadingPetsSpinner();
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
    showPetModalSpinner();
    configureFormEditModal(petId);

    const getPetResp = await getPet(petId);
    if (getPetResp.isFailed) {
      hidePetModalSpinner();
      return;
    }

    for (const [key, value] of Object.entries(getPetResp.payload)) {
      const formEl = document.getElementById(key);
        if (formEl.type === 'checkbox') {
          formEl.checked = value;
        } else {
          formEl.value = value;
        }
    }

    // When i use addEventListener, it triggers the event for every pet even thought there should be only 1
    document.getElementById('form-delete-btn').onclick = async function () {
      await showDeleteModal(getPetResp.payload);
    };

    hidePetModalSpinner();
  });

  return viewEditButton;
}

function createDeleteButton(pet) {
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('btn', 'btn-danger');

  deleteButton.addEventListener('click', async () => {
    await showDeleteModal(pet);
  })

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
