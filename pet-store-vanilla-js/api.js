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
  const response = {
    payload: {},
    isFailed: false,
    error: '',
  };

  const apiResponse = await fetch(`http://localhost:5150${endPoint}`, {
    method: method,
    headers: {
      'Content-type': 'application/json',
    },
    body: body,
  });

  if (!apiResponse.ok) {
    throw new Error(`Web error! Status code: ${apiResponse.status}`);
  }

  response.payload = await apiResponse.json();
  return response;
}
