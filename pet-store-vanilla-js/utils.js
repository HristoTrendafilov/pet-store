const systemErrorText = 'System error. Please contact the system administrator.';

export function createSubmitSpinner(id) {
  const spinner = document.createElement('span');
  spinner.id = id;
  spinner.classList.add('submit-spinner');

  return spinner;
}

export function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function showError(elementId) {
  const mainPageError = document.getElementById(elementId);
  mainPageError.style.display = 'flex';
  mainPageError.textContent = systemErrorText;
  mainPageError.classList.add('system-error-message');
}
