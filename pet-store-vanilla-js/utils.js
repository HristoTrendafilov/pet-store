export function isNullOrWhitespace(value) {
    if (value == null || value.trim().length == 0) {
        return true;
    }

    return false;
};

export function setDatePrototypeFormating() {
    Date.prototype.getFormattedDate = function () {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${this.getDate()} ${monthNames[this.getMonth()]} ${this.getFullYear()}`;
    }
};

export function createSubmitSpinner(id) {
    const spinner = document.createElement('span');
    spinner.id = id;
    spinner.classList.add('submit-spinner');

    return spinner;
};