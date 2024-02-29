import { petKinds, pets, petsList } from '~/Tests/data';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { apiBaseUrl } from '~/infrastructure/api-client';
import userEvent from '@testing-library/user-event';
import { WaitHandle } from '~/Tests/WaitHandle';
import { handlers } from '~/Tests/handlers';

import { Home } from '~/Home/Home';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('Card header is displayed', () => {
  render(<Home />);

  const cardHeader = screen.getByText('Pet store');
  expect(cardHeader).toBeInTheDocument();
});

test('Add pet button is disabled while fetching pets and then enabled', async () => {
  const waitHandle = new WaitHandle();

  server.resetHandlers(
    http.get(`${apiBaseUrl}/pet/kinds`, async () => {
      await waitHandle.wait();
      return HttpResponse.json(petKinds);
    }),
    http.get(`${apiBaseUrl}/pet/all`, async () => {
      return HttpResponse.json(pets);
    })
  );

  render(<Home />);

  const addPetButton = screen.getByRole('button', { name: 'Add pet' });
  expect(addPetButton).toBeDisabled();

  const loadingIndicator = await screen.findByLabelText('loading-indicator');
  waitHandle.release();
  await waitForElementToBeRemoved(loadingIndicator);

  expect(addPetButton).toBeEnabled();
});

test('The table is displayed, columns count and text inside of them is correct', () => {
  render(<Home />);

  const table = screen.getByRole('table');
  expect(table).toBeInTheDocument();

  const headerCells = screen.getAllByRole('columnheader', { hidden: true });
  expect(headerCells).toHaveLength(5);

  expect(headerCells[0]).toHaveTextContent('#');
  expect(headerCells[1]).toHaveTextContent('Name');
  expect(headerCells[2]).toHaveTextContent('Added date');
  expect(headerCells[3]).toHaveTextContent('Kind');
  expect(headerCells[4]).toHaveTextContent('');
  expect(headerCells[4]).toHaveAttribute('colSpan', '2');
});

test('All table rows are rendered, cell values are visualized correctly and each row has the View/Edit and Delete button', async () => {
  const waitHandle = new WaitHandle();

  server.resetHandlers(
    http.get(`${apiBaseUrl}/pet/kinds`, async () => {
      return HttpResponse.json(petKinds);
    }),
    http.get(`${apiBaseUrl}/pet/all`, async () => {
      await waitHandle.wait();
      return HttpResponse.json(petsList);
    })
  );

  render(<Home />);

  const loadingIndicator = await screen.findByLabelText('loading-indicator');
  waitHandle.release();
  await waitForElementToBeRemoved(loadingIndicator);

  // Question: Not sure about getting all the rows and slicing the headers
  // Maybe to get the table and querySelector the rows?
  const tableRows = screen.getAllByRole('row').slice(1);
  expect(tableRows).toHaveLength(3);

  // First row
  const firstRowCells = tableRows[0].querySelectorAll('td');
  expect(firstRowCells[0]).toHaveTextContent('44');
  expect(firstRowCells[1]).toHaveTextContent('Kenny');
  expect(firstRowCells[2]).toHaveTextContent('27 Oct 2022');
  expect(firstRowCells[3]).toHaveTextContent('Parrot');

  const firstRowButtons = firstRowCells[4].querySelectorAll('button');
  expect(firstRowButtons).toHaveLength(2);
  expect(firstRowButtons[0]).toHaveTextContent('View / Edit');
  expect(firstRowButtons[1]).toHaveTextContent('Delete'); // Why does this pass with values of 'Del'?

  // Second row
  const secondRowCells = tableRows[1].querySelectorAll('td');
  expect(secondRowCells[0]).toHaveTextContent('43');
  expect(secondRowCells[1]).toHaveTextContent('Pesho');
  expect(secondRowCells[2]).toHaveTextContent('25 Oct 2022');
  expect(secondRowCells[3]).toHaveTextContent('Dog');

  const secondRowButtons = secondRowCells[4].querySelectorAll('button');
  expect(secondRowButtons).toHaveLength(2);
  expect(secondRowButtons[0]).toHaveTextContent('View / Edit');
  expect(secondRowButtons[1]).toHaveTextContent('Delete');

  // Third row
  const thirdRowCells = tableRows[2].querySelectorAll('td');
  expect(thirdRowCells[0]).toHaveTextContent('42');
  expect(thirdRowCells[1]).toHaveTextContent('Gosho');
  expect(thirdRowCells[2]).toHaveTextContent('31 Oct 2022');
  expect(thirdRowCells[3]).toHaveTextContent('Cat');

  const thirdRowButtons = thirdRowCells[4].querySelectorAll('button');
  expect(thirdRowButtons).toHaveLength(2);
  expect(thirdRowButtons[0]).toHaveTextContent('View / Edit');
  expect(thirdRowButtons[1]).toHaveTextContent('Delete');
});

// Question: I have to make the modal button and content to be siblings instead of nested,
// because the error is bugging me
test('New pet modal is shown on Add pet button click and then closed', async () => {
  const user = userEvent.setup();
  const waitHandle = new WaitHandle();

  server.resetHandlers(
    http.get(`${apiBaseUrl}/pet/kinds`, async () => {
      return HttpResponse.json(petKinds);
    }),
    http.get(`${apiBaseUrl}/pet/all`, async () => {
      await waitHandle.wait();
      return HttpResponse.json(petsList);
    })
  );

  render(<Home />);

  const loadingIndicator = await screen.findByLabelText('loading-indicator');
  waitHandle.release();
  await waitForElementToBeRemoved(loadingIndicator);

  const addPetButton = screen.getByRole('button', { name: 'Add pet' });
  await user.click(addPetButton);

  const modal = screen.getByLabelText('modal');
  expect(modal).toBeInTheDocument();

  const modalCancelButton = screen.getByRole('button', { name: 'Cancel' });
  await user.click(modalCancelButton);

  expect(modal).not.toBeInTheDocument();
});

// Question: Should i test for every row click or just one is sufficient
test('View/Edit pet modal is shown on row button click and then closed', async () => {
  const user = userEvent.setup();
  const waitHandle = new WaitHandle();

  server.resetHandlers(
    http.get(`${apiBaseUrl}/pet/kinds`, async () => {
      return HttpResponse.json(petKinds);
    }),
    http.get(`${apiBaseUrl}/pet/all`, async () => {
      await waitHandle.wait();
      return HttpResponse.json(pets);
    }),
    http.get(`${apiBaseUrl}/pet/44`, async () => {
      await waitHandle.wait();
      const pet = pets.find((x) => x.petId === 44);
      return HttpResponse.json(pet);
    })
  );

  render(<Home />);

  // Question: in this case i dont care about the loading indicator
  // but i have to wait for it to dissapear so i can be sure the controls are there
  // Is there any way to ditch this logic?
  const loadingIndicator = await screen.findByLabelText('loading-indicator');
  waitHandle.release();
  await waitForElementToBeRemoved(loadingIndicator);

  const editPetButton = screen.getAllByRole('button', { name: 'View / Edit' });
  await user.click(editPetButton[0]);

  const modal = screen.getByLabelText('modal');
  expect(modal).toBeInTheDocument();

  // Same here
  const ModalLoadingIndicator =
    await screen.findByLabelText('loading-indicator');
  waitHandle.release();
  await waitForElementToBeRemoved(ModalLoadingIndicator);

  const modalCancelButton = screen.getByRole('button', { name: 'Cancel' });
  await user.click(modalCancelButton);

  expect(modal).not.toBeInTheDocument();
});

test('Delete pet modal is shown on row button click and then closed', async () => {
  const user = userEvent.setup();
  const waitHandle = new WaitHandle();

  server.resetHandlers(
    http.get(`${apiBaseUrl}/pet/kinds`, async () => {
      return HttpResponse.json(petKinds);
    }),
    http.get(`${apiBaseUrl}/pet/all`, async () => {
      await waitHandle.wait();
      return HttpResponse.json(pets);
    })
  );

  render(<Home />);

  const loadingIndicator = await screen.findByLabelText('loading-indicator');
  waitHandle.release();
  await waitForElementToBeRemoved(loadingIndicator);

  const deletePetButton = screen.getAllByRole('button', {
    name: 'Delete',
  });
  await user.click(deletePetButton[0]);

  const modal = screen.getByLabelText('modal');
  expect(modal).toBeInTheDocument();

  const modalCancelButton = screen.getByRole('button', { name: 'Cancel' });
  await user.click(modalCancelButton);

  expect(modal).not.toBeInTheDocument();
});

test('Error message is displayed on fail from fetching pets', async () => {
  server.resetHandlers(
    http.get(`${apiBaseUrl}/pet/kinds`, async () => {
      return HttpResponse.json(petKinds);
    }),
    http.get(`${apiBaseUrl}/pet/all`, async () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(<Home />);

  const errorMessage = await screen.findByLabelText('system-error-message');
  expect(errorMessage).toBeInTheDocument();
  expect(errorMessage).toHaveTextContent(
    'System error. Please contact the system administrator.'
  );
});

test('Error message is displayed on fetching pet kinds', async () => {
  server.resetHandlers(
    http.get(`${apiBaseUrl}/pet/kinds`, async () => {
      return new HttpResponse(null, { status: 500 });
    }),
    http.get(`${apiBaseUrl}/pet/all`, async () => {
      return HttpResponse.json(pets);
    })
  );

  render(<Home />);

  const errorMessage = await screen.findByLabelText('system-error-message');
  expect(errorMessage).toBeInTheDocument();
  expect(errorMessage).toHaveTextContent(
    'System error. Please contact the system administrator.'
  );
});

// Question: Why is the '% Branch' column at 93.75% ?
// Perhaps the errors from the modal and fetch
