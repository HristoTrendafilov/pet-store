import formElements from './formElements.js';
import api from './api.js';
import {petKinds, refreshPets} from './app.js';

export function isNullOrWhitespace(value) {
    if (value == null || value.trim().length == 0) {
        return true;
    }

    return false;
}

export function setDatePrototypeFormating() {
    Date.prototype.getFormattedDate = function () {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${this.getDate()} ${monthNames[this.getMonth()]} ${this.getFullYear()}`;
    }
}

export function ValidateForm(pet) {
    const triggeredValidations = [];

    if (isNullOrWhitespace(pet.petName)) {
        triggeredValidations.push('petName-validation');
    }
    if (isNullOrWhitespace(pet.kind)) {
        triggeredValidations.push('kind-validation');
    }
    if (isNullOrWhitespace(pet.age)) {
        triggeredValidations.push('age-validation');
    }
    if (isNullOrWhitespace(pet.addedDate)) {
        triggeredValidations.push('addedDate-validation');
    }

    return triggeredValidations;
}

export function HideFormValidations() {
    const validatioFields = document.querySelectorAll('.validation');
    for (let validation of validatioFields) {
        if (!validation.hasAttribute('hidden')) {
            validation.setAttribute('hidden', true);
        }
    }
}

export function hidePetModal() {
    document.getElementById('pet-modal').style.display = 'none';
}

export function showPetModal() {
    document.getElementById('pet-modal').style.display = 'block';
}

export function setFormAddedDate(date) {
    document.getElementById('addedDateText').value = date.getFormattedDate();
    document.getElementById('addedDatePicker').valueAsDate = date;
}

export function showPetFormSubmitSpinner() {
    formElements.saveButton.disabled = true;
    formElements.saveButton.appendChild(createSubmitSpinner('pet-form-spinner'));
}

export function hidePetFormSubmitSpinner() {
    formElements.saveButton.disabled = false;
    document.getElementById('pet-form-spinner').style.display = 'none';
}

function showDeleteModalSubmitSpinner() {
    const deleteButton = document.getElementById('delete-modal-delete-btn');
    deleteButton.disabled = true;
    deleteButton.appendChild(createSubmitSpinner('delete-modal-spinner'));
}

function hideDeleteModalSubmitSpinner() {
    const deleteButton = document.getElementById('delete-modal-delete-btn');
    deleteButton.disabled = false;
    document.getElementById('delete-modal-spinner').style.display = 'none';
}

export function resetFormModal() {
    document.getElementById('pet-modal-form').reset();
    HideFormValidations();
}

export function configureFormEditModal(petId) {
    resetFormModal();
    document.getElementById('pet-modal-title').textContent = `View pet #${petId}`;
    formElements.deleteButton.style.display = 'block';
    formElements.saveButton.textContent = 'Edit'
    formElements.saveButton.classList.remove('btn-primary');
    formElements.saveButton.classList.add('btn-warning');
    document.getElementById('form-delete-btn').onclick = function showDeleteModalFromButton() {
        showDeleteModal(petId);
    }
    lockFormModal();
    showPetModal();
}

export function configureFormNewModal() {
    resetFormModal();
    unlockFormModalFields(true);
    document.getElementById('pet-modal-title').textContent = 'Add pet';
    formElements.deleteButton.style.display = 'none';
    formElements.saveButton.textContent = 'Save'
    formElements.saveButton.classList.remove('btn-warning');
    formElements.saveButton.classList.add('btn-primary');
    setFormAddedDate(new Date());
    showPetModal();
}

function lockFormModal() {
    lockInputField(formElements.petName);
    lockInputField(formElements.age);
    lockInputField(formElements.notes);
    lockInputField(formElements.kind);
    lockInputField(formElements.healthProblems);
    lockInputField(formElements.addedDatePicker);
    lockInputField(formElements.addedDateText);

    document.getElementById('pet-modal-form').setAttribute('isLocked', 'true');
}

function lockInputField(element) {
    element.setAttribute('readonly', 'true');
    element.style.pointerEvents = "none";
    element.style.background = 'var(--locked)';
}

export function unlockFormModal() {
    unlockFormModalFields(false);

    formElements.saveButton.textContent = 'Save';
    formElements.saveButton.classList.remove('btn-warning');
    formElements.saveButton.classList.add('btn-primary');

    const modalTitle = document.getElementById('pet-modal-title');
    const petId = modalTitle.textContent.split(' ').pop();
    modalTitle.textContent = `Edit pet ${petId}`;

    document.getElementById('pet-modal-form').setAttribute('isLocked', 'false');
}

function unlockFormModalFields(isNew) {
    unlockInputField(formElements.petName);
    unlockInputField(formElements.age);
    unlockInputField(formElements.notes);
    unlockInputField(formElements.healthProblems);

    if(isNew) {
        unlockInputField(formElements.kind);
        unlockInputField(formElements.addedDateText);
        unlockInputField(formElements.addedDatePicker);
    }
}

function unlockInputField(element) {
    element.removeAttribute('readonly');
    element.style.pointerEvents = "auto";
    element.style.background = 'var(--white)';
}

export async function showDeleteModal(petId) {
    document.getElementById('delete-modal-title').textContent = `Delete pet #${petId}`;
    const petInfoEl = document.getElementById('delete-modal-pet-info');
    petInfoEl.innerHTML = '';

    document.getElementById('delete-modal').style.display = 'block';
    showDeleteModalSpinner();

    const getPetResp = await api.getPet(petId);
    if (getPetResp.isFailed) {
        // show the error
        return;
    }

    const pet = getPetResp.payload;

    petInfoEl.appendChild(createDeleteModalPetInfoElement(`Name: ${pet.petName}`));
    petInfoEl.appendChild(createDeleteModalPetInfoElement(`Kind: ${petKinds[pet.kind]}`));
    petInfoEl.appendChild(createDeleteModalPetInfoElement(`Age: ${pet.age}`));
    petInfoEl.appendChild(createDeleteModalPetInfoElement(`Has health problems: ${pet.healthProblems}`));
    petInfoEl.appendChild(createDeleteModalPetInfoElement(`Notes: ${pet.notes ? pet.notes : ''}`));
    petInfoEl.appendChild(createDeleteModalPetInfoElement(`Date added: ${new Date(pet.addedDate).getFormattedDate()}`));

    hideDeleteModalSpinner();

    const deleteButton = document.getElementById('delete-modal-delete-btn');
    deleteButton.onclick = async function deletePet() {
        showDeleteModalSubmitSpinner();
        const deleteResp = await api.deletePet(petId);
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

function createDeleteModalPetInfoElement(textContent) {
    const div = document.createElement('div');
    div.textContent = textContent;
    
    return div
}

export function hideDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
}

function createSubmitSpinner(id) {
    const spinner = document.createElement('span');
    spinner.id = id;
    spinner.classList.add('submit-spinner');

    return spinner;
}

function showDeleteModalSpinner() {
    document.getElementById('delete-modal-spinner').style.display = 'flex';
    document.getElementById('delete-modal-buttons').style.display = 'none';
}

function hideDeleteModalSpinner() {
    document.getElementById('delete-modal-spinner').style.display = 'none';
    document.getElementById('delete-modal-buttons').style.display = 'flex';
}

export function showPetModalSpinner() {
    document.getElementById('pet-modal-spinner').style.display = 'flex';
    document.getElementById('pet-modal-form').style.display = 'none';
}

export function hidePetModalSpinner() {
    document.getElementById('pet-modal-spinner').style.display = 'none';
    document.getElementById('pet-modal-form').style.display = 'flex';
}