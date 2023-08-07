const api = (function api(){
    function getPet(petId) {
        return fetchFromApi(`/pet/${petId}`, 'GET');
    }

    function addPet(pet) {
        return fetchFromApi('/pet', 'POST', JSON.stringify(pet));
    }

    function editPet(pet) {
        return fetchFromApi(`/pet/${pet.petId}`, 'PUT', JSON.stringify(pet));
    }

    function deletePet(petId) {
        return fetchFromApi(`/pet/${petId}`, 'DELETE');
    }

    function getAllPets() {
        return fetchFromApi('/pet/all', 'GET');
    }

    function getPetKinds() {
        return fetchFromApi('/pet/kinds', 'GET');
    }

    async function fetchFromApi(endPoint, method, body) {
        const response = {
            payload: {},
            isFailed: false,
            error: ''
        }

        await fetch(`http://localhost:5150${endPoint}`,
        {
          method: method,
          headers: {
            'Content-type': 'application/json; charset=UTF-8'
          },
          body: body
        })
        .then(async (resp) => {
            response.payload = await resp.json();
        })
        .catch(err => {
            response.isFailed = true;
            response.error = err;
        });

        return response;
    }

    return {
        getPet,
        addPet,
        editPet,
        deletePet,
        getAllPets,
        getPetKinds,
    }
})();

export default api