// Question: Should i remove the console.log() and handle the error differently?
export function logAndReturnError(error: unknown, message?: string): Error {
  /* eslint-disable no-console */
  console.error(error);
  /* eslint-enable no-console */

  if (error instanceof Error) {
    return error;
  }

  return new Error(`${message}`);
}

// Question: When i use try-catch on api methods and the error is of type: unknown, is there a better way to extract the message?
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return error as string;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type JsonPropertyType = string | number | boolean | Date;
export function jsonParseReviver(_: string, value: JsonPropertyType) {
  if (typeof value === 'string' && /\d{4}-\d{2}-\d{2}/.test(value)) {
    const parts = value.split('-');
    return new Date(
      Number.parseInt(parts[0], 10),
      Number.parseInt(parts[1], 10) - 1,
      Number.parseInt(parts[2], 10)
    );
  }

  return value;
}
