const apiBaseUrl = 'http://localhost:5150';
const apiWaitTimeout = 5000;

export function getPet(petId) {
  return fetchFromApi(`/pet/${petId}`, 'GET');
}

export function addPet(pet) {
  return fetchFromApi('/pet', 'POST', JSON.stringify(pet));
}

export function editPet(pet) {
  return fetchFromApi(`/pet/${pet.petId}`, 'PUT', JSON.stringify(pet));
}

export function deletePet(petId) {
  return fetchFromApi(`/pet/${petId}`, 'DELETE');
}

export function getAllPets() {
  return fetchFromApi('/pet/all', 'GET');
}

export function getPetKinds() {
  return fetchFromApi('/pet/kinds', 'GET');
}

async function fetchFromApi(endPoint, method, body) {
  const apiErrorInfo = `endpoint: ${endPoint} | method: ${method}`;

  let apiResponse;
  try {
    // Question: Should i remove the 'Content-type' header if the method is 'GET'?
    apiResponse = await fetch(`${apiBaseUrl}${endPoint}`, {
      method: method,
      headers: {
        'Content-type': 'application/json',
      },
      body: body,
      signal: AbortSignal.timeout(apiWaitTimeout),
    });
  } catch (err) {
    throw new Error(`Fetch error. ${apiErrorInfo}`);
  }

  if (!apiResponse.ok) {
    throw new Error(
      `Received non successful status code: ${apiResponse.status}. ${apiErrorInfo}`
    );
  }

  try {
    return apiResponse.json();
  } catch (err) {
    throw new Error(`Error parsing JSON response. ${apiErrorInfo}`);
  }
}
