import type { IPet, IPetKind } from '~infrastructure/global';

import { jsonParseReviver, logAndReturnError } from './utils';

const apiBaseUrl = 'http://localhost:5150';
const apiWaitTimeout = 5000;

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
    throw logAndReturnError(err, `Fetch error. ${apiErrorInfo}`);
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
    throw logAndReturnError(
      err,
      `Error parsing JSON response. ${apiErrorInfo}`
    );
  }
}

export function getAllPetsAsync(): Promise<IPet[]> {
  return fetchFromApiAsync<IPet[]>('/pet/all', 'GET');
}

export function getPetKindsAsync(): Promise<IPetKind[]> {
  return fetchFromApiAsync<IPetKind[]>('/pet/kinds', 'GET');
}