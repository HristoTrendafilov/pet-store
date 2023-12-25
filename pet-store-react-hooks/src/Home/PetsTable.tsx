import type { PetListItem } from '~infrastructure/api-types';
import { formatDate } from '~infrastructure/utils';

import './PetsTable.css';

interface PetsTableProps {
  pets: PetListItem[];
  petKindsMap: Map<number, string>;
}

export function PetsTable(props: PetsTableProps) {
  const { pets, petKindsMap } = props;

  return (
    <div className="pets-table-wrapper">
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
          {pets.length > 0 &&
            pets.map((pet) => (
              <tr key={pet.petId}>
                <td>{pet.petId}</td>
                <td>{pet.petName}</td>
                <td>{formatDate(new Date(pet.addedDate))}</td>
                <td>{petKindsMap.get(pet.kind)}</td>
                <td colSpan={2}>
                  <div>
                    <button className="btn btn-warning" type="button">
                      View / Edit
                    </button>
                    <button className="btn btn-danger" type="button">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
