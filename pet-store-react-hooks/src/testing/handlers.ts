import { HttpResponse, type PathParams, http } from 'msw';

import { apiBaseUrl } from '~/infrastructure/api-client';
import type { Pet } from '~infrastructure/api-types';
import { petKinds, pets } from '~testing/data';

interface ParamPetId {
  petId: string;
}

export const handlers = [
  http.get(`${apiBaseUrl}/pet/kinds`, () => HttpResponse.json(petKinds)),
  http.get(`${apiBaseUrl}/pet/all`, () => HttpResponse.json(pets)),
  http.get<ParamPetId>(`${apiBaseUrl}/pet/:petId`, ({ params }) => {
    const paramPetId = params.petId;
    if (!paramPetId) {
      return new HttpResponse(null, { status: 404 });
    }

    const petId = Number.parseInt(paramPetId, 10);
    const pet = pets.find((x) => x.petId === petId);

    return HttpResponse.json(pet);
  }),
  http.post<PathParams<string>, Pet, Pet>(
    `${apiBaseUrl}/pet`,
    async ({ request }) => {
      const petFromBody = await request.json();
      const nextPetId = Math.max(...pets.map((x) => x.petId)) + 1;

      const pet: Pet = {
        ...petFromBody,
        petId: nextPetId,
      };

      pets.push(pet);

      return HttpResponse.json(pet);
    }
  ),
  http.put<ParamPetId, Pet>(
    `${apiBaseUrl}/pet/:petId`,
    async ({ request, params }) => {
      const paramPetId = params.petId;
      if (!paramPetId) {
        return new HttpResponse(null, { status: 404 });
      }

      const petId = Number.parseInt(paramPetId, 10);
      const petIndex = pets.findIndex((pet) => pet.petId === petId);

      if (petIndex === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      const petFromBody = await request.json();

      const newPet = {
        ...petFromBody,
        petId,
      };

      // Question: Do i need to modify the list or just return the pet?
      pets[petIndex] = newPet;
      return HttpResponse.json(newPet);
    }
  ),
  http.delete<ParamPetId>(`${apiBaseUrl}/pet/:petId`, ({ params }) => {
    const paramPetId = params.petId;
    if (!paramPetId) {
      return new HttpResponse(null, { status: 404 });
    }

    const petId = Number.parseInt(paramPetId, 10);
    const petIndex = pets.findIndex((pet) => pet.petId === petId);
    if (petIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    // Question: because i'm deleting the pet in previous test and get it in the next one, i't permanently deleted.
    // Do i leave the delete logic, and just return the pet?
    const pet = pets[petIndex];
    // pets.splice(petIndex, 1);

    return HttpResponse.json(pet);
  }),
];
