import api from './api.js';
import {
    setDatePrototypeFormating,
    ValidateForm,
    HideFormValidations,
    hidePetModal,
    showPetModal,
    setFormAddedDate,
    showSubmitSpinner,
    hideSubmitSpinner,
    ResetFormModal
} from './utils.js';

const petModalForm = document.getElementById('pet-modal-form');

const petKinds = {};
window.addEventListener("DOMContentLoaded", async () => {
    setDatePrototypeFormating();

    const petKindsResp = await api.getPetKinds();
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
        petKindSelect.append(petKindOption)
    }

    await refreshPets();
});

// REFRESH PETS //
async function refreshPets() {
    const petsResp = await api.getAllPets();
    if (petsResp.isFailed) {
        // show the error
        return;
    }

    const tableBody = document.getElementById('table').tBodies[1];
    tableBody.innerHTML = '';

    for (let pet of petsResp.payload.sort((a, b) => b.petId - a.petId)) {
        const tr = document.createElement('tr');
        tr.appendChild(createPetTableColumn(pet.petId));
        tr.appendChild(createPetTableColumn(pet.petName));
        tr.appendChild(createPetTableColumn(new Date(pet.addedDate).getFormattedDate()));
        tr.appendChild(createPetTableColumn(petKinds[pet.kind]));
        tr.appendChild(createPetTableButtons(pet.petId));

        tableBody.appendChild(tr)
    }
}

function createPetTableColumn(textContent) {
    const td = document.createElement('td');
    td.textContent = textContent;

    return td;
}

function createPetTableButtons(petId) {
    const td = document.createElement('td');
    td.setAttribute('cospan', '2');
    td.appendChild(createViewEditButton(petId));
    td.appendChild(createDeleteButton(petId));

    return td;
}

function createViewEditButton(petId) {
    const viewEditButton = document.createElement('button');
    viewEditButton.textContent = 'View/Edit';
    viewEditButton.classList.add('btn', 'btn-warning');

    viewEditButton.onclick = async function editPet() {
        ResetFormModal();
        document.getElementById('pet-modal-title').textContent = `View pet #${petId}`;
        showPetModal();

        const getPetResp = await api.getPet(petId);
        if (getPetResp.isFailed) {
            // show the error
            return;
        }

        var dateRegex = /(\d{4})(-{1})(\d{2})(-{1})(\d{2})/g;
        for (const [key, value] of Object.entries(getPetResp.payload)) {
            const formEl = document.getElementById(key);
            if (dateRegex.test(value)) {
                setFormAddedDate(new Date(value));
            }
            else if (formEl) {
                if (formEl.type == 'checkbox') {
                    formEl.checked = value;
                } else {
                    formEl.value = value;
                }
            }
        }
    };

    return viewEditButton;
}

function createDeleteButton(petId) {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('btn', 'btn-danger',);

    return deleteButton;
}

// REFRESH PETS //

document.getElementById('add-pet-btn').onclick = function showPetModalNew() {
    ResetFormModal();

    document.getElementById('form-delete-btn').style.display = 'none';
    document.getElementById('pet-modal-title').textContent = 'Add pet';
    setFormAddedDate(new Date());

    showPetModal();
}

document.getElementById('addedDatePicker').onchange = function handleDateChange() {
    setFormAddedDate(new Date(addedDatePicker.value));
}

document.getElementById('pet-modal-close').onclick = function hideModalFromHeader() {
    hidePetModal();
}

document.getElementById('form-cancel-btn').onclick = function hideModalFromButton() {
    hidePetModal();
}

petModalForm.addEventListener('submit', async function handleFormSubmit(e) {
    e.preventDefault();
    const saveButton = document.getElementById('form-save-btn');
    saveButton.disabled = true;

    showSubmitSpinner();

    const formData = new FormData(petModalForm);
    const pet = Object.fromEntries(formData.entries());

    HideFormValidations();
    const triggeredValidations = ValidateForm(pet);
    if (triggeredValidations.length > 0) {
        for (let validationId of triggeredValidations) {
            const validationDiv = document.getElementById(validationId)
            if (validationDiv.hasAttribute('hidden')) {
                validationDiv.removeAttribute('hidden');
            }
        }

        saveButton.disabled = false;
        hideSubmitSpinner();
        return
    }

    const addPetResp = await api.addPet(pet);
    if (addPetResp.isFailed) {
        // show the error
        return;
    }

    hidePetModal();

    saveButton.disabled = false;
    hideSubmitSpinner();

    await refreshPets();
})