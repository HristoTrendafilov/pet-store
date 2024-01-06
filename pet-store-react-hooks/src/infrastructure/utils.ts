export function reportError(error: unknown) {
  /* eslint-disable no-console */
  console.error(error);
  /* eslint-enable no-console */
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function toInputDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
