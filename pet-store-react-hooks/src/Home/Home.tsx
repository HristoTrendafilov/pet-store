import { useEffect, useState } from 'react';

// Question: What is up with the ~ ?
// Usage of relative parent imports is not allowed
import { getAllPetsAsync } from '~infrastructure/api';
import { DocumentTitle } from '~infrastructure/components/DocumentTitle';
import { ErrorMessage } from '~infrastructure/components/errorMessage/ErrorMessage';
import { LoadingIndicator } from '~infrastructure/components/loadingIndicator/LoadingIndicator';
import type { IPet } from '~infrastructure/global';
import { getErrorMessage } from '~infrastructure/utils-function';

import { PetsTable } from './PetsTable';

import './home.scss';

export function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [allPets, setAllPets] = useState<IPet[]>([]);

  // Question: Because im calling this function in useEffect() and on deleteModal closing
  // i have extracted the logic here? Maybe some kind of dependency in the useEffect() array?
  async function refreshPetsAsync() {
    setLoading(true);

    try {
      const pets = await getAllPetsAsync();
      pets.sort((x, y) => (x.petId > y.petId ? -1 : 1));

      setAllPets(pets);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Question: Should i always mark async functions in useEffect() as void?
    // Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator
    void refreshPetsAsync();
  }, []);

  return (
    <div className="home-wrapper">
      <DocumentTitle title="Pet store" />
      <div className="all-pets-card">
        <div className="all-pets-card-header">
          <div>Pet store</div>
          <button type="button" className="btn btn-success" disabled={loading}>
            Add pet
          </button>
        </div>
        <div className="all-pets-card-body">
          <ErrorMessage message={error} />
          {loading ? (
            <LoadingIndicator />
          ) : (
            <PetsTable
              pets={allPets}
              // Question: Returning an awaited promise is not allowed in this context.
              // Should i not await the async function refreshPetsAsync?
              onPetActionTaken={() => refreshPetsAsync()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
