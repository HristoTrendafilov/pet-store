import type { PetKind, PetListItem } from '~infrastructure/api-types';

import { reportError } from './utils';

const apiBaseUrl = 'http://localhost:5150';
const apiWaitTimeout = 5000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
async function fetchJSON<T>(
  endPoint: string,
  method: HttpMethod,
  body?: string
): Promise<T> {
  const apiErrorInfo = `endpoint: ${endPoint} | method: ${method}`;

  const fetchOptions: RequestInit = {
    method,
    body,
    signal: AbortSignal.timeout(apiWaitTimeout),
  };

  if (method !== 'GET') {
    fetchOptions.headers = {
      'Content-type': 'application/json',
    };
  }

  let apiResponse: Response;
  try {
    apiResponse = await fetch(`${apiBaseUrl}${endPoint}`, fetchOptions);
  } catch (err) {
    reportError(err);
    throw new Error(`Fetch error. ${apiErrorInfo}`);
  }

  if (!apiResponse.ok) {
    throw new Error(
      `Received non successful status code: ${apiResponse.status}. ${apiErrorInfo}`
    );
  }

  try {
    return apiResponse.json() as T;
  } catch (err) {
    reportError(err);
    throw new Error(`Error parsing JSON response. ${apiErrorInfo}`);
  }
}

export function getAllPetsAsync(): Promise<PetListItem[]> {
  return fetchJSON<PetListItem[]>('/pet/all', 'GET');
}

export function getPetKindsAsync(): Promise<PetKind[]> {
  return fetchJSON<PetKind[]>('/pet/kinds', 'GET');
}
