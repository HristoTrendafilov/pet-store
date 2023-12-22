import type { Pet, PetKind } from '~infrastructure/global';

import { reportError } from './utils-function';

const apiBaseUrl = 'http://localhost:5150';
const apiWaitTimeout = 5000;

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

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
async function fetchFromApiAsync<T>(
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
    reportError(err);
    throw new Error(`Fetch error. ${apiErrorInfo}`);
  }

  if (!apiResponse.ok) {
    throw new Error(
      `Received non successful status code: ${apiResponse.status}. ${apiErrorInfo}`
    );
  }

  try {
    const responseJson = await apiResponse.text();
    // Question: The Date properties from the api return as a string, so i needed to parse them to create the Date() from them
    return JSON.parse(responseJson, jsonParseReviver) as T;
  } catch (err) {
    reportError(err);
    throw new Error(`Error parsing JSON response. ${apiErrorInfo}`);
  }
}

export function getAllPetsAsync(): Promise<Pet[]> {
  return fetchFromApiAsync<Pet[]>('/pet/all', 'GET');
}

export function getPetKindsAsync(): Promise<PetKind[]> {
  return fetchFromApiAsync<PetKind[]>('/pet/kinds', 'GET');
}
