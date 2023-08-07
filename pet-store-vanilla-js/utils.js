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

export function showSubmitSpinner() {
    document.getElementById('submit-spinner').style.display = 'inline-block';
}

export function hideSubmitSpinner() {
    document.getElementById('submit-spinner').style.display = 'none';
}

export function ResetFormModal() {
    document.getElementById('pet-modal-form').reset();
    HideFormValidations();
}