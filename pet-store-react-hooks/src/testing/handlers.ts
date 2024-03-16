import { HttpResponse, http } from 'msw';

import { apiBaseUrl } from '~/infrastructure/api-client';
import { petKinds, pets } from '~testing/data';

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
    const pet = pets.find((x) => x.petId === petId);

    return HttpResponse.json(pet);
  }),
  http.delete(`${apiBaseUrl}/pet/:petId`, ({ request }) => {
    const url = new URL(request.url);
    const paramPetId = url.searchParams.get('petId');
    if (!paramPetId) {
      return new HttpResponse(null, { status: 404 });
    }

    const petId = Number.parseInt(paramPetId, 10);
    const pet = pets.find((x) => x.petId === petId);

    return HttpResponse.json(pet);
  }),
];
