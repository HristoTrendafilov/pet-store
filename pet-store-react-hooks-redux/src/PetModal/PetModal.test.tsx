import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { PetModal } from '~PetModal/PetModal';
import { apiBaseUrl } from '~infrastructure/api-client';
import { toInputDate } from '~infrastructure/utils';
import { WaitHandle } from '~testing/WaitHandle';
import { petKinds, petKindsSignature, pets } from '~testing/data';
import { handlers } from '~testing/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.restoreAllMocks();
});
afterAll(() => server.close());

const petForEdit = pets.find((x) => x.petId === 44);
if (!petForEdit) {
  throw new Error('Pet with petId: 44 is not found in the testing data');
}

const { petId } = petForEdit;

jest.mock('~/infrastructure/reportError');

describe('Add pet modal', () => {
  test('Modal header is displayed correctly, all the inputs are unlocked with default values + Save and Cancel buttons', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    render(
      <PetModal
        petId={undefined}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const headerText = await screen.findByText('Add pet');
    expect(headerText).toBeInTheDocument();

    const headerCloseButton = await screen.findByRole('button', {
      name: 'close modal',
    });
    expect(headerCloseButton).toBeInTheDocument();

    const nameInput = await screen.findByLabelText('Name');
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toBeEnabled();

    const kindSelectInput = await screen.findByLabelText('Kind');
    expect(kindSelectInput).toBeInTheDocument();
    expect(kindSelectInput).toBeEnabled();

    const kindOptions = await within(kindSelectInput).findAllByRole('option');
    expect(kindOptions[0]).toHaveValue('');
    expect(kindOptions[0]).toHaveTextContent('');

    expect(kindOptions[1]).toHaveValue(petKinds[0].value.toString());
    expect(kindOptions[1]).toHaveTextContent(petKinds[0].displayName);

    expect(kindOptions[2]).toHaveValue(petKinds[1].value.toString());
    expect(kindOptions[2]).toHaveTextContent(petKinds[1].displayName);

    expect(kindOptions[3]).toHaveValue(petKinds[2].value.toString());
    expect(kindOptions[3]).toHaveTextContent(petKinds[2].displayName);

    const ageInput = await screen.findByLabelText('Age');
    expect(ageInput).toBeInTheDocument();
    expect(ageInput).toBeEnabled();

    const hasHealthProblemsCheck = await screen.findByLabelText(
      'Has health problems'
    );
    expect(hasHealthProblemsCheck).toBeInTheDocument();
    expect(hasHealthProblemsCheck).toBeEnabled();

    const notesInput = await screen.findByLabelText('Notes');
    expect(notesInput).toBeInTheDocument();
    expect(notesInput).toBeEnabled();

    const addedDateInput = await screen.findByLabelText('Added date');
    expect(addedDateInput).toBeInTheDocument();
    expect(addedDateInput).toBeEnabled();
    expect(addedDateInput).toHaveValue(toInputDate(new Date()));

    const saveButton = await screen.findByRole('button', {
      name: 'Save',
    });
    expect(saveButton).toBeInTheDocument();

    const cancelButton = await screen.findByRole('button', {
      name: 'Cancel',
    });
    expect(cancelButton).toBeInTheDocument();
  });

  test('When new pet is added, the modal state is changed to View and all inputs are locked', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    const user = userEvent.setup();

    render(
      <PetModal
        petId={undefined}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const nameInput = await screen.findByLabelText('Name');
    await user.type(nameInput, 'Test pet');

    const kindSelectInput = await screen.findByLabelText('Kind');
    await user.selectOptions(kindSelectInput, '1');

    const ageInput = await screen.findByLabelText('Age');
    await user.type(ageInput, '5');

    const hasHealthProblemsCheck = await screen.findByLabelText(
      'Has health problems'
    );
    await user.click(hasHealthProblemsCheck);

    const notesInput = await screen.findByLabelText('Notes');
    await user.type(notesInput, 'Test notes');

    const addedDateInput = await screen.findByLabelText('Added date');
    await user.clear(addedDateInput);
    const date = new Date();
    date.setDate(date.getDate() + 1);
    await user.type(addedDateInput, toInputDate(date));

    const saveButton = await screen.findByRole('button', {
      name: 'Save',
    });
    await user.click(saveButton);

    expect(onModified).toHaveBeenCalled();

    expect(nameInput).toBeDisabled();
    expect(ageInput).toBeDisabled();
    expect(kindSelectInput).toBeDisabled();
    expect(ageInput).toBeDisabled();
    expect(hasHealthProblemsCheck).toBeDisabled();
    expect(notesInput).toBeDisabled();
    expect(addedDateInput).toBeDisabled();

    const headerText = await screen.findByText(/View pet/i);
    expect(headerText).toBeInTheDocument();

    const editButton = await screen.findByRole('button', {
      name: 'Edit',
    });
    expect(editButton).toBeInTheDocument();

    const deleteButton = await screen.findByRole('button', {
      name: 'Delete',
    });
    expect(deleteButton).toBeInTheDocument();

    const cancelButton = await screen.findByRole('button', {
      name: 'Cancel',
    });
    expect(cancelButton).toBeInTheDocument();
  });

  test('onClose is called on header close button click', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    const user = userEvent.setup();

    render(
      <PetModal
        petId={undefined}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const headerCloseButton = await screen.findByRole('button', {
      name: 'close modal',
    });
    await user.click(headerCloseButton);

    expect(onClose).toHaveBeenCalled();
  });

  test('onClose is called on Cancel button click', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    const user = userEvent.setup();

    render(
      <PetModal
        petId={undefined}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const cancelButton = await screen.findByRole('button', {
      name: 'Cancel',
    });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  test('onClose is called on modal backdrop click', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    const user = userEvent.setup();

    render(
      <PetModal
        petId={undefined}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const modalBackdrop = await screen.findByLabelText('modal backdrop');
    await user.click(modalBackdrop);

    expect(onClose).toHaveBeenCalled();
  });
});

describe('View pet modal', () => {
  test('Modal header is displayed correctly, all the inputs are locked with pet values + Edit, Delete and Cancel buttons', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    render(
      <PetModal
        petId={petId}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const headerText = await screen.findByText('View pet #44');
    expect(headerText).toBeInTheDocument();

    const headerCloseButton = await screen.findByRole('button', {
      name: 'close modal',
    });
    expect(headerCloseButton).toBeInTheDocument();

    const nameInput = await screen.findByLabelText('Name');
    expect(nameInput).toHaveValue(petForEdit.petName);

    const kindSelectInput = await screen.findByLabelText('Kind');
    expect(kindSelectInput).toHaveValue(petForEdit.kind.toString());

    const ageInput = await screen.findByLabelText('Age');
    expect(ageInput).toHaveValue(petForEdit.age);

    const hasHealthProblemsCheck = await screen.findByLabelText(
      'Has health problems'
    );
    expect(hasHealthProblemsCheck).toBeChecked();

    const notesInput = await screen.findByLabelText('Notes');
    expect(notesInput).toHaveValue(petForEdit.notes);

    const addedDateInput = await screen.findByLabelText('Added date');
    expect(addedDateInput).toHaveValue(petForEdit.addedDate);

    const editButton = await screen.findByRole('button', {
      name: 'Edit',
    });
    expect(editButton).toBeInTheDocument();

    const deleteButton = await screen.findByRole('button', {
      name: 'Delete',
    });
    expect(deleteButton).toBeInTheDocument();

    const cancelButton = await screen.findByRole('button', {
      name: 'Cancel',
    });
    expect(cancelButton).toBeInTheDocument();
  });

  test('When the Delete button is clicked, the Delete pet modal is shown and closed on Cancel button click', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    const user = userEvent.setup();

    render(
      <PetModal
        petId={petId}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const deleteButton = await screen.findByRole('button', {
      name: 'Delete',
    });
    await user.click(deleteButton);

    const modal = await screen.findByRole('dialog', {
      name: 'Delete pet modal',
    });
    expect(modal).toBeInTheDocument();

    const deleteModalCancelButton = await within(modal).findByRole('button', {
      name: 'Cancel',
    });
    await user.click(deleteModalCancelButton);

    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(onModified).not.toHaveBeenCalled();
  });

  test('When pet is deleted, the delete modal onClose is called and Pet modal onClose and onModified are called', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    const user = userEvent.setup();

    render(
      <PetModal
        petId={petId}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const deleteButton = await screen.findByRole('button', {
      name: 'Delete',
    });
    await user.click(deleteButton);

    const modal = await screen.findByRole('dialog', {
      name: 'Delete pet modal',
    });
    expect(modal).toBeInTheDocument();

    const deleteModalDeleteButton = await within(modal).findByRole('button', {
      name: 'Delete',
    });
    await user.click(deleteModalDeleteButton);

    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    });

    expect(onClose).toHaveBeenCalled();
    expect(onModified).toHaveBeenCalled();
  });
});

describe('Edit pet modal', () => {
  test('Modal header is displayed correctly, the editable inputs are unlocked + Save, Lock and Cancel buttons', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    const user = userEvent.setup();

    render(
      <PetModal
        petId={petId}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const editButton = await screen.findByRole('button', {
      name: 'Edit',
    });
    await user.click(editButton);

    const headerText = await screen.findByText('Edit pet #44');
    expect(headerText).toBeInTheDocument();

    const nameInput = await screen.findByLabelText('Name');
    expect(nameInput).toHaveValue(petForEdit.petName);
    expect(nameInput).not.toBeDisabled();

    const kindSelectInput = await screen.findByLabelText('Kind');
    expect(kindSelectInput).toHaveValue(petForEdit.kind.toString());
    expect(kindSelectInput).toBeDisabled();

    const ageInput = await screen.findByLabelText('Age');
    expect(ageInput).toHaveValue(petForEdit.age);
    expect(ageInput).not.toBeDisabled();

    const hasHealthProblemsCheck = await screen.findByLabelText(
      'Has health problems'
    );
    expect(hasHealthProblemsCheck).toBeChecked();
    expect(hasHealthProblemsCheck).not.toBeDisabled();

    const notesInput = await screen.findByLabelText('Notes');
    expect(notesInput).toHaveValue(petForEdit.notes);
    expect(notesInput).not.toBeDisabled();

    const addedDateInput = await screen.findByLabelText('Added date');
    expect(addedDateInput).toHaveValue(petForEdit.addedDate);
    expect(addedDateInput).toBeDisabled();

    const saveButton = await screen.findByRole('button', {
      name: 'Save',
    });
    expect(saveButton).toBeInTheDocument();

    const lockButton = await screen.findByRole('button', {
      name: 'Lock',
    });
    expect(lockButton).toBeInTheDocument();

    const cancelButton = await screen.findByRole('button', {
      name: 'Cancel',
    });
    expect(cancelButton).toBeInTheDocument();
  });

  test('When the Lock button is clicked, the modal state is changed to View and all changes are discarded', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    const user = userEvent.setup();

    render(
      <PetModal
        petId={petId}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const editButton = await screen.findByRole('button', {
      name: 'Edit',
    });
    await user.click(editButton);

    const nameInput = await screen.findByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Modified pet');

    const ageInput = await screen.findByLabelText('Age');
    await user.clear(ageInput);
    await user.type(ageInput, '2');

    const hasHealthProblemsCheck = await screen.findByLabelText(
      'Has health problems'
    );
    await user.click(hasHealthProblemsCheck);

    const notesInput = await screen.findByLabelText('Notes');
    await user.clear(notesInput);
    await user.type(notesInput, 'Modified notes');

    const lockButton = await screen.findByRole('button', {
      name: 'Lock',
    });
    await user.click(lockButton);

    const kindSelectInput = await screen.findByLabelText('Kind');
    const addedDateInput = await screen.findByLabelText('Added date');

    expect(nameInput).toHaveValue(petForEdit.petName);
    expect(nameInput).toBeDisabled();
    expect(kindSelectInput).toHaveValue(petForEdit.kind.toString());
    expect(kindSelectInput).toBeDisabled();
    expect(ageInput).toHaveValue(petForEdit.age);
    expect(ageInput).toBeDisabled();
    expect(hasHealthProblemsCheck).toBeChecked();
    expect(hasHealthProblemsCheck).toBeDisabled();
    expect(notesInput).toHaveValue(petForEdit.notes);
    expect(notesInput).toBeDisabled();
    expect(addedDateInput).toHaveValue(petForEdit.addedDate);
    expect(addedDateInput).toBeDisabled();

    const headerText = await screen.findByText('View pet #44');
    expect(headerText).toBeInTheDocument();

    const deleteButtonAfterLock = await screen.findByRole('button', {
      name: 'Edit',
    });
    expect(deleteButtonAfterLock).toBeInTheDocument();

    const deleteButton = await screen.findByRole('button', {
      name: 'Delete',
    });
    expect(deleteButton).toBeInTheDocument();
  });

  test('The modal cannot be closed while fetching the pet', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    const user = userEvent.setup();
    const waitHandle = new WaitHandle();

    server.use(
      http.get(`${apiBaseUrl}/pet/:petId`, async () => {
        await waitHandle.wait();
        return HttpResponse.json(petForEdit);
      })
    );

    render(
      <PetModal
        petId={petId}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const modalBackdrop = await screen.findByLabelText('modal backdrop');
    await user.click(modalBackdrop);
    expect(onClose).not.toHaveBeenCalled();

    const headerCloseButton = await screen.findByRole('button', {
      name: 'close modal',
    });
    await user.click(headerCloseButton);
    expect(onClose).not.toHaveBeenCalled();
  });

  test('The modal cannot be closed on backdrop click', async () => {
    const onClose = jest.fn();
    const onModified = jest.fn();

    const user = userEvent.setup();

    render(
      <PetModal
        petId={petId}
        petKinds={petKinds}
        petKindsSignature={petKindsSignature}
        onClose={onClose}
        onModified={onModified}
      />
    );

    const editButton = await screen.findByRole('button', {
      name: 'Edit',
    });
    await user.click(editButton);

    const modalBackdrop = await screen.findByLabelText('modal backdrop');
    await user.click(modalBackdrop);
    expect(onClose).not.toHaveBeenCalled();
  });
});

test('Error message is displayed on fail from fetching the pet', async () => {
  const onClose = jest.fn();
  const onModified = jest.fn();

  const waitHandle = new WaitHandle();

  server.use(
    http.get(`${apiBaseUrl}/pet/:petId`, async () => {
      await waitHandle.wait();
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(
    <PetModal
      petId={petId}
      petKinds={petKinds}
      petKindsSignature={petKindsSignature}
      onClose={onClose}
      onModified={onModified}
    />
  );

  const loadingIndicator = await screen.findByRole('alert', {
    name: 'loading',
  });
  waitHandle.release();
  await waitForElementToBeRemoved(loadingIndicator);

  const errorMessage = await screen.findByRole('alert');
  expect(errorMessage).toHaveTextContent(
    'System error. Please contact the system administrator.'
  );
});

test('Error message is displayed on fail from saving the pet', async () => {
  const onClose = jest.fn();
  const onModified = jest.fn();

  const waitHandle = new WaitHandle();
  const user = userEvent.setup();

  server.use(
    http.get(`${apiBaseUrl}/pet/:petId`, () => HttpResponse.json(petForEdit)),
    http.put(`${apiBaseUrl}/pet/:petId`, async () => {
      await waitHandle.wait();
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(
    <PetModal
      petId={petId}
      petKinds={petKinds}
      petKindsSignature={petKindsSignature}
      onClose={onClose}
      onModified={onModified}
    />
  );

  const editButton = await screen.findByRole('button', {
    name: 'Edit',
  });
  await user.click(editButton);

  const saveButton = await screen.findByRole('button', {
    name: 'Save',
  });
  await user.click(saveButton);

  const submitSpinner = await screen.findByRole('alert', {
    name: 'loading',
  });
  waitHandle.release();
  await waitForElementToBeRemoved(submitSpinner);

  const errorMessage = await screen.findByRole('alert');
  expect(errorMessage).toHaveTextContent(
    'System error. Please contact the system administrator.'
  );
});
