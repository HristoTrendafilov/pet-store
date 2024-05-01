import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { DeletePetModal } from '~/DeletePetModal/DeletePetModal';
import { apiBaseUrl } from '~/infrastructure/api-client';
import { WaitHandle } from '~testing/WaitHandle';
import { petKindsSignature, pets, petsList } from '~testing/data';
import { handlers } from '~testing/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.restoreAllMocks();
});
afterAll(() => server.close());

const petForDelete = petsList.find((x) => x.petId === 44);
if (!petForDelete) {
  throw new Error('Pet with petId: 44 is not found in the testing data');
}

jest.mock('~/infrastructure/reportError');

test('Header and pet information is displayed correctly, Delete and Cancel buttons are visualised', async () => {
  const onClose = jest.fn();
  const onDeleted = jest.fn();

  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsSignature[petForDelete.kind]}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );

  // Header
  const headerText = await screen.findByText('Delete pet #44');
  expect(headerText).toBeInTheDocument();

  const headerCloseButton = await screen.findByRole('button', { name: 'X' });
  expect(headerCloseButton).toBeInTheDocument();

  // Pet info
  const petName = await screen.findByText('Name: Kenny');
  expect(petName).toBeInTheDocument();

  const petKind = await screen.findByText('Kind: Parrot');
  expect(petKind).toBeInTheDocument();

  const petDateAdded = await screen.findByText('Date added: 27 Oct 2022');
  expect(petDateAdded).toBeInTheDocument();

  // Buttons
  const deleteButton = await screen.findByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();

  const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
  expect(cancelButton).toBeInTheDocument();
});

test('onClose is called on header close button click', async () => {
  const onClose = jest.fn();
  const onDeleted = jest.fn();

  const user = userEvent.setup();

  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsSignature[petForDelete.kind]}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );

  const headerCloseButton = await screen.findByRole('button', { name: 'X' });
  await user.click(headerCloseButton);

  expect(onClose).toHaveBeenCalled();
});

test('onClose is called on body Cancel button click', async () => {
  const onClose = jest.fn();
  const onDeleted = jest.fn();

  const user = userEvent.setup();

  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsSignature[petForDelete.kind]}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );

  const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
  await user.click(cancelButton);

  expect(onClose).toHaveBeenCalled();
});

test('onClose is called on modal backdrop click', async () => {
  const onClose = jest.fn();
  const onDeleted = jest.fn();

  const user = userEvent.setup();

  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsSignature[petForDelete.kind]}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );

  const modalBackdrop = await screen.findByLabelText('modal backdrop');
  await user.click(modalBackdrop);

  expect(onClose).toHaveBeenCalled();
});

test('Modal is locked while deleting the pet and it is closed when deletion is successfull', async () => {
  const onClose = jest.fn();
  const onDeleted = jest.fn();

  const user = userEvent.setup();
  const waitHandle = new WaitHandle();

  server.use(
    http.delete(`${apiBaseUrl}/pet/:petId`, async () => {
      await waitHandle.wait();

      const pet = pets.find((x) => x.petId === 44);
      return HttpResponse.json(pet);
    })
  );

  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsSignature[petForDelete.kind]}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );

  const deleteButton = await screen.findByRole('button', { name: 'Delete' });
  await user.click(deleteButton);
  expect(deleteButton).toBeDisabled();

  const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
  await user.click(cancelButton);
  expect(onClose).not.toHaveBeenCalled();

  const headerCloseButton = await screen.findByRole('button', { name: 'X' });
  await user.click(headerCloseButton);
  expect(onClose).not.toHaveBeenCalled();

  const modalBackdrop = await screen.findByLabelText('modal backdrop');
  await user.click(modalBackdrop);
  expect(onClose).not.toHaveBeenCalled();

  waitHandle.release();

  await waitFor(() => {
    expect(onClose).toHaveBeenCalled();
    expect(onDeleted).toHaveBeenCalled();
  });
});

test('Error message is displayed on fail from deleting pet', async () => {
  const onClose = jest.fn();
  const onDeleted = jest.fn();

  const user = userEvent.setup();

  server.use(
    http.delete(
      `${apiBaseUrl}/pet/:petId`,
      () => new HttpResponse(null, { status: 500 })
    )
  );

  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsSignature[petForDelete.kind]}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );

  const deleteButton = await screen.findByRole('button', { name: 'Delete' });
  await user.click(deleteButton);

  const errorMessage = await screen.findByRole('alert');
  expect(errorMessage).toHaveTextContent(
    'System error. Please contact the system administrator.'
  );
});
