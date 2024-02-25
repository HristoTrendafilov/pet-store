import { http, HttpResponse, delay } from 'msw';
import { apiBaseUrl } from '~/infrastructure/api-client';

const serverDelay = 2000;

export const handlers = [
  http.get(`${apiBaseUrl}/pet/kinds`, async () => {
    await delay(serverDelay);
    return HttpResponse.json([
      { displayName: 'Cat', value: 1 },
      { displayName: 'Dog', value: 2 },
      { displayName: 'Parrot', value: 3 },
    ]);
  }),
  http.get(`${apiBaseUrl}/pet/all`, async () => {
    await delay(serverDelay);
    return HttpResponse.json([
      {
        petId: 1,
        petName: 'Gosho',
        addedDate: '2022-10-31',
        kind: 1,
      },
      {
        petId: 2,
        petName: 'Pesho',
        addedDate: '2022-10-25',
        kind: 2,
      },
      {
        petId: 3,
        petName: 'Kenny',
        addedDate: '2022-10-27',
        kind: 3,
      },
    ]);
  }),
];
