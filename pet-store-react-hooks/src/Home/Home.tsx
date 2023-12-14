import { useEffect, useState } from 'react';

// Question: What is up with the ~ ?
// Usage of relative parent imports is not allowed
import { getAllPetsAsync } from '~infrastructure/api';
import { LoadingIndicator } from '~infrastructure/components/LoadingIndicator';
import type { IPet } from '~infrastructure/global';
import { getErrorMessage } from '~infrastructure/utils';

import { PetsTable } from './PetsTable';

import './home.scss';

export function Home() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [allPets, setAllPets] = useState<IPet[]>([]);

  useEffect(() => {
    // Question: Should i always mark async functions in useEffect() as void?
    // Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator
    void (async () => {
      try {
        const pets = await getAllPetsAsync();
        setAllPets(pets);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="home-wrapper">
      <div className="all-pets-card">
        {error && <div>{error}</div>}
        <div className="all-pets-card-header">
          <div>Pet store</div>
          <button type="button" className="btn btn-success" disabled={loading}>
            Add pet
          </button>
        </div>
        <div className="all-pets-card-body">
          {loading ? <LoadingIndicator /> : <PetsTable pets={allPets} />}
        </div>
      </div>
    </div>
  );
}
