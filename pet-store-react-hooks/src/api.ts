import type { IPet } from '~global';

import { logAndReturnError } from './utils';

const apiBaseUrl = 'http://localhost:5150';
const apiWaitTimeout = 5000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Question: Should i return a specific type, or a response of type success-error with the needed properties for the specific thing?
async function fetchFromApi<T>(
  endPoint: string,
  method: HttpMethod,
  body?: string
): Promise<T> {
  const apiErrorInfo = `endpoint: ${endPoint} | method: ${method}`;

  const fetchOptions: RequestInit = {
    method,
    // Question: Should i be more specific about the body type?
    body,
    signal: AbortSignal.timeout(apiWaitTimeout),
  };

  if (method !== 'GET') {
    // Question: Should i be more specific about the headers type?
    fetchOptions.headers = {
      'Content-type': 'application/json',
    };
  }

  // Question: should there be anything more specific than 'Response' from when i hover 'fetch'?
  let apiResponse: Response;
  try {
    apiResponse = await fetch(`${apiBaseUrl}${endPoint}`, fetchOptions);
  } catch (err) {
    throw logAndReturnError(err, `Fetch error. ${apiErrorInfo}`);
  }

  if (!apiResponse.ok) {
    throw new Error(
      `Received non successful status code: ${apiResponse.status}. ${apiErrorInfo}`
    );
  }

  try {
    // Question: Why do i have to return with 'await ...promise' and not just return the promise itself
    // Returning an awaited promise is required in this context
    return (await apiResponse.json()) as T;
  } catch (err) {
    throw logAndReturnError(
      err,
      `Error parsing JSON response. ${apiErrorInfo}`
    );
  }
}

export function getAllPetsASync(): Promise<IPet[]> {
  return fetchFromApi<IPet[]>('/pet/all', 'GET');
}
