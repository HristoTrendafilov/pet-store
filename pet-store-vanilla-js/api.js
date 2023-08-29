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
    apiResponse = await fetch(`${apiBaseUrl}${endPoint}`, {
      method: method,
      headers: {
        'Content-type': 'application/json',
      },
      body: body,
      signal: AbortSignal.timeout(apiWaitTimeout),
    });
  } catch (err) {
    console.log(`Fetch error. ${apiErrorInfo}\n${err}`);
    return;
  }

  if (apiResponse && !apiResponse.ok) {
    console.log(`Received non successful status code: ${apiResponse.status}. ${apiErrorInfo}`);
    return;
  }

  try {
    return apiResponse.json();
  } catch (err) {
    console.log(`Error parsing JSON response. ${apiErrorInfo}\n${err}`);
  }
}
