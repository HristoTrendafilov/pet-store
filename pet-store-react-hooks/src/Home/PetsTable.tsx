import type { PetListItem } from '~infrastructure/api-types';

import { PetTableRow } from './PetTableRow';

import './PetsTable.css';

interface PetsTableProps {
  pets: PetListItem[];
  petKindsMap: Map<number, string>;
  onDelete: (pet: PetListItem) => void;
}

export function PetsTable(props: PetsTableProps) {
  const { pets, petKindsMap, onDelete } = props;

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
              <PetTableRow
                key={pet.petId}
                pet={pet}
                petKindsMap={petKindsMap}
                onDelete={onDelete}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
}
