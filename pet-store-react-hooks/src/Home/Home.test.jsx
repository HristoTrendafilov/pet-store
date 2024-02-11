import { setupServer } from 'msw/node';
import { handlers } from '~/Tests/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('Loading indicator is shown while fetching all pets and then hidden', () => {});

test('Add pet button is disabled while fetching all pets and then enabled', () => {});

test('The pet table should have exact rows as the fetched pets', () => {});
