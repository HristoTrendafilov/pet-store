import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

import { Home } from '~/Home/Home';
import { WaitHandle } from '~/Tests/WaitHandle';
import { petKinds, pets, petsList } from '~/Tests/data';
import { handlers } from '~/Tests/handlers';
import { apiBaseUrl } from '~/infrastructure/api-client';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.mock('~/infrastructure/reportError');

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
    http.get(`${apiBaseUrl}/pet/all`, () => HttpResponse.json(pets))
  );

  render(<Home />);

  const addPetButton = await screen.findByRole('button', { name: 'Add pet' });
  expect(addPetButton).toBeDisabled();

  const loadingIndicator = await screen.findByLabelText('loading-indicator');
  waitHandle.release();
  await waitForElementToBeRemoved(loadingIndicator);

  expect(addPetButton).toBeEnabled();
});

test('The table is displayed, columns count and text inside of them is correct', async () => {
  render(<Home />);

  const table = await screen.findByRole('table');
  expect(table).toBeInTheDocument();

  const headerCells = await screen.findAllByRole('columnheader', {
    hidden: true,
  });
  expect(headerCells).toHaveLength(5);

  expect(headerCells[0]).toHaveTextContent('#');
  expect(headerCells[1]).toHaveTextContent('Name');
  expect(headerCells[2]).toHaveTextContent('Added date');
  expect(headerCells[3]).toHaveTextContent('Kind');
  expect(headerCells[4]).toHaveTextContent('');
});

test('All table rows are rendered, cell values are visualized correctly and each row has the View/Edit and Delete button', async () => {
  const waitHandle = new WaitHandle();

  server.resetHandlers(
    http.get(`${apiBaseUrl}/pet/kinds`, () => HttpResponse.json(petKinds)),
    http.get(`${apiBaseUrl}/pet/all`, async () => {
      await waitHandle.wait();
      return HttpResponse.json(petsList);
    })
  );

  render(<Home />);

  const loadingIndicator = await screen.findByLabelText('loading-indicator');
  waitHandle.release();
  await waitForElementToBeRemoved(loadingIndicator);

  const tableRows = screen.getAllByRole('row').slice(1);
  expect(tableRows).toHaveLength(petsList.length);

  const firstRowCells = within(tableRows[0]).getAllByRole('cell');

  expect(firstRowCells[0]).toHaveTextContent('44');
  expect(firstRowCells[1]).toHaveTextContent('Kenny');
  expect(firstRowCells[2]).toHaveTextContent('27 Oct 2022');
  expect(firstRowCells[3]).toHaveTextContent('Parrot');

  const firstRowButtons = within(firstRowCells[4]).getAllByRole('button');
  expect(firstRowButtons).toHaveLength(2);
  expect(firstRowButtons[0]).toHaveTextContent('View / Edit');
  expect(firstRowButtons[1]).toHaveTextContent('Delete');
});

test('New pet modal is shown on Add pet button click and then closed', async () => {
  const user = userEvent.setup();

  render(<Home />);

  const addPetButton = await screen.findByRole('button', { name: 'Add pet' });
  await user.click(addPetButton);

  const modal = await screen.findByRole('dialog');
  expect(modal).toBeInTheDocument();

  const modalCancelButton = await screen.findByRole('button', {
    name: 'Cancel',
  });
  await user.click(modalCancelButton);

  // The element(s) given to waitForElementToBeRemoved are already removed. waitForElementToBeRemoved requires that the element(s) exist(s) before waiting for removal.
  expect(modal).not.toBeInTheDocument();
});

test('View/Edit pet modal is shown on row button click and then closed', async () => {
  const user = userEvent.setup();
  render(<Home />);

  const editPetButton = await screen.findAllByRole('button', {
    name: 'View / Edit',
  });
  await user.click(editPetButton[0]);

  const modal = await screen.findByRole('dialog');
  expect(modal).toBeInTheDocument();

  const modalCancelButton = await screen.findByRole('button', {
    name: 'Cancel',
  });
  await user.click(modalCancelButton);

  expect(modal).not.toBeInTheDocument();
});

test('Delete pet modal is shown on row button click and then closed', async () => {
  const user = userEvent.setup();
  render(<Home />);

  const deletePetButton = await screen.findAllByRole('button', {
    name: 'Delete',
  });
  await user.click(deletePetButton[0]);

  const modal = await screen.findByRole('dialog');
  expect(modal).toBeInTheDocument();

  const modalCancelButton = await screen.findByRole('button', {
    name: 'Cancel',
  });
  await user.click(modalCancelButton);

  expect(modal).not.toBeInTheDocument();
});

test('Error message is displayed on fail from fetching pets', async () => {
  const waitHandle = new WaitHandle();

  server.resetHandlers(
    http.get(`${apiBaseUrl}/pet/kinds`, () => HttpResponse.json(petKinds)),
    http.get(`${apiBaseUrl}/pet/all`, async () => {
      await waitHandle.wait();
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(<Home />);

  const loadingIndicator = await screen.findByLabelText('loading-indicator');
  waitHandle.release();
  await waitForElementToBeRemoved(loadingIndicator);

  const errorMessage = await screen.findByLabelText('system-error-message');
  expect(errorMessage).toBeInTheDocument();
  expect(errorMessage).toHaveTextContent(
    'System error. Please contact the system administrator.'
  );
});

test('Error message is displayed on fetching pet kinds', async () => {
  const waitHandle = new WaitHandle();

  server.resetHandlers(
    http.get(`${apiBaseUrl}/pet/kinds`, async () => {
      await waitHandle.wait();
      return new HttpResponse(null, { status: 500 });
    }),
    http.get(`${apiBaseUrl}/pet/all`, () => HttpResponse.json(pets))
  );

  render(<Home />);

  const loadingIndicator = await screen.findByLabelText('loading-indicator');
  waitHandle.release();
  await waitForElementToBeRemoved(loadingIndicator);

  const errorMessage = await screen.findByLabelText('system-error-message');
  expect(errorMessage).toBeInTheDocument();
  expect(errorMessage).toHaveTextContent(
    'System error. Please contact the system administrator.'
  );
});
