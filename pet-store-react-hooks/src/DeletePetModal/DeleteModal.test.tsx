import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { DeletePetModal } from '~/DeletePetModal/DeletePetModal';
import { apiBaseUrl } from '~/infrastructure/api-client';
import { WaitHandle } from '~testing/WaitHandle';
import { petKindsMap, pets, petsList } from '~testing/data';
import { handlers } from '~testing/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Question: When i have pet for testing, is it OK to get it outside of the tests and use it in all of them?
const petForDelete = petsList.find((x) => x.petId === 44);
if (!petForDelete) {
  throw new Error('Pet with petId: 44 is not found in the testing data');
}

// Question: I'm defining the callback function here and cleaning the mock data in the tests i'm using them. OK?
const onClose = jest.fn();
const onDeleted = jest.fn();
jest.mock('~/infrastructure/reportError');

test('Header and pet information is displayed correctly, Delete and Cancel buttons are visualised', async () => {
  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsMap.get(petForDelete.kind)}
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

test('Modal is closed on header close button click', async () => {
  onClose.mockClear();
  const user = userEvent.setup();

  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsMap.get(petForDelete.kind)}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );

  const headerCloseButton = await screen.findByRole('button', { name: 'X' });
  await user.click(headerCloseButton);

  expect(onClose).toHaveBeenCalled();
});

test('Modal is closed on body Cancel button click', async () => {
  onClose.mockClear();
  const user = userEvent.setup();

  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsMap.get(petForDelete.kind)}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );

  const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
  await user.click(cancelButton);

  expect(onClose).toHaveBeenCalled();
});

test('Modal is closed on modal backdrop click', async () => {
  onClose.mockClear();
  const user = userEvent.setup();

  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsMap.get(petForDelete.kind)}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );

  const modalBackdrop = await screen.findByLabelText('modal backdrop');
  await user.click(modalBackdrop);

  expect(onClose).toHaveBeenCalled();
});

test('Modal is locked while deleting the pet and it is closed when deletion is successfull', async () => {
  onClose.mockClear();
  onDeleted.mockClear();

  const user = userEvent.setup();
  const waitHandle = new WaitHandle();

  server.resetHandlers(
    http.delete(`${apiBaseUrl}/pet/:petId`, async () => {
      await waitHandle.wait();

      const pet = pets.find((x) => x.petId === 44);
      return HttpResponse.json(pet);
    })
  );

  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsMap.get(petForDelete.kind)}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );

  const deleteButton = await screen.findByRole('button', { name: 'Delete' });
  await user.click(deleteButton);
  expect(deleteButton).toBeDisabled();

  // Question: Is there any point of testing the disabled state of the buttons here?
  const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
  expect(cancelButton).toBeDisabled();
  await user.click(cancelButton);
  expect(onClose).not.toHaveBeenCalled();

  const headerCloseButton = await screen.findByRole('button', { name: 'X' });
  expect(headerCloseButton).toBeDisabled();
  await user.click(headerCloseButton);
  expect(onClose).not.toHaveBeenCalled();

  const modalBackdrop = await screen.findByLabelText('modal backdrop');
  await user.click(modalBackdrop);
  expect(onClose).not.toHaveBeenCalled();

  waitHandle.release();

  // Question: On the line before im releasing the waitHandle, but the functions are not called yet
  // and as far as i saw, there is no way to wait for function to be called asynchronous
  await waitFor(() => {
    expect(onClose).toHaveBeenCalled();
    expect(onDeleted).toHaveBeenCalled();
  });
});

test('Error message is displayed on fail from deleting pet', async () => {
  const user = userEvent.setup();

  server.resetHandlers(
    http.delete(
      `${apiBaseUrl}/pet/:petId`,
      () => new HttpResponse(null, { status: 500 })
    )
  );

  render(
    <DeletePetModal
      pet={petForDelete}
      petKind={petKindsMap.get(petForDelete.kind)}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );

  const deleteButton = await screen.findByRole('button', { name: 'Delete' });
  await user.click(deleteButton);

  const errorMessage = await screen.findByLabelText('system-error-message');
  expect(errorMessage).toBeInTheDocument();
  // Question: Do i realy care about the error message text?
  expect(errorMessage).toHaveTextContent(
    'System error. Please contact the system administrator.'
  );
});
