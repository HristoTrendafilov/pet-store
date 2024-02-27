import { http, HttpResponse } from 'msw';
import { apiBaseUrl } from '~/infrastructure/api-client';
import { petKinds, pets } from '~/Tests/data';

export const handlers = [
  http.get(`${apiBaseUrl}/pet/kinds`, async () => {
    return HttpResponse.json(petKinds);
  }),
  http.get(`${apiBaseUrl}/pet/all`, async () => {
    return HttpResponse.json(pets);
  }),
  // Question: How can i pass the petId as :petId?
  http.get(`${apiBaseUrl}/pet/:petId`, async ({ request }) => {
    const url = new URL(request.url);
    const paramPetId = url.searchParams.get('petId');
    if (!paramPetId) {
      return new HttpResponse(null, { status: 404 });
    }

    const petId = Number.parseInt(paramPetId);
    const pet = pets.filter((x) => x.petId === petId);

    return HttpResponse.json(pet);
  }),
];
