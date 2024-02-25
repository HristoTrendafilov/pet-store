// @ts-ignore
import { startTestServer } from '~/Tests/server.js';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { Home } from '~/Home/Home';

startTestServer();

test('Card header is displayed', async () => {
  render(<Home />);

  const cardHeader = await screen.findByText(/pet store/i);
  expect(cardHeader).toBeInTheDocument();
});

test('Add pet button is disabled while fetching pets and then enabled', async () => {
  render(<Home />);

  const addPetButton = await screen.findByRole('button', { name: /add pet/i });
  expect(addPetButton).toBeDisabled();

  const loadingIndicator = await screen.findByLabelText('loading-indicator');
  await waitForElementToBeRemoved(loadingIndicator, { timeout: 2000 });

  expect(addPetButton).toBeEnabled();
});

test('The table is displayed, columns count and text inside of them is correct', () => {});
test('All table rows are rendered, cell values are visualized correctly and each row has the View/Edit and Delete button', () => {});

test('New pet modal is shown on Add pet button click and then closed', () => {});
test('View/Edit pet modal is shown on row button click and then closed', () => {});
test('Delete pet modal is shown on row button click and then closed', () => {});

test('Error message is displayed and Add pet button is disabled on fail from fetching pets', () => {});
test('Error message is displayed and Add pet button is disabled on fail from fetching pet kinds', () => {});
