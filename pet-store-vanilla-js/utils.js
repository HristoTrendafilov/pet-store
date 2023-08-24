export function isNullOrWhitespace(value) {
  return value == null || value.trim().length == 0;
}

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