import { useEffect, useState } from 'react';

// Question: What is up with the ~ ?
// Usage of relative parent imports is not allowed
import { getAllPetsAsync } from '~api';
import type { IPet } from '~global';
import { formatDate, getErrorMessage } from '~utils';

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

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <div className="home-wrapper">
      <div className="all-pets-card">
        {error && <div>{error}</div>}
        <div className="all-pets-card-header">
          <div>Pet store</div>
          <button type="button" className="btn btn-success" disabled>
            Add pet
          </button>
        </div>
        <div className="all-pets-card-body">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Added date</th>
                <th>Kind</th>
                <th colSpan={2}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPets.length > 0 &&
                allPets.map((pet) => (
                  <tr key={pet.petId}>
                    <td>{pet.petId}</td>
                    <td>{pet.petName}</td>
                    <td>{formatDate(pet.addedDate)}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div id="loading-pets-spinner" className="spinner-wrapper">
            <div className="loading-spinner" />
          </div>
        </div>
      </div>
    </div>
  );
}
