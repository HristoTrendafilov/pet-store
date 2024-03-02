// Question: how to solve this: 'msw' should be listed in the project's dependencies, not devDependencies
import { HttpResponse, http } from 'msw';

import { petKinds, pets } from '~/Tests/data';
import { apiBaseUrl } from '~/infrastructure/api-client';

export const handlers = [
  http.get(`${apiBaseUrl}/pet/kinds`, () => HttpResponse.json(petKinds)),
  http.get(`${apiBaseUrl}/pet/all`, () => HttpResponse.json(pets)),
  http.get(`${apiBaseUrl}/pet/:petId`, ({ request }) => {
    const url = new URL(request.url);
    const paramPetId = url.searchParams.get('petId');
    if (!paramPetId) {
      return new HttpResponse(null, { status: 404 });
    }

    const petId = Number.parseInt(paramPetId, 10);
    const pet = pets.filter((x) => x.petId === petId);

    return HttpResponse.json(pet);
  }),
];
