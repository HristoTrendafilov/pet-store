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
  let apiResponse;
  try {
     apiResponse = await fetch(`${apiBaseUrl}${endPoint}`, {
      method: method,
      headers: {
        'Content-type': 'application/json',
      },
      body: body,
       signal: AbortSignal.timeout(apiWaitTimeout)
    });
  } catch (err) {
    console.log(err);
  }

  if (apiResponse && !apiResponse.ok) {
    throw new Error(`Web error! Status code: ${apiResponse.status}`);
  }

  try {
    return apiResponse.json();
  } catch (err) {
    console.log(err);
  }
}
