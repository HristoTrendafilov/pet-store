import { useState } from 'react';

import { DeletePetModal } from '~DeletePetModal/DeletePetModal';
import type { PetListItem } from '~infrastructure/api-types';
import { formatDate } from '~infrastructure/utils';

import './PetsTable.css';

interface PetsTableProps {
  pets: PetListItem[];
  petKindsMap: Map<number, string>;
  refreshPets: () => void;
}

export function PetsTable(props: PetsTableProps) {
  const { pets, petKindsMap, refreshPets } = props;

  const [showDeletePetModal, setShowDeletePetModal] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<PetListItem | undefined>();

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
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => {
                        setSelectedPet(pet);
                        setShowDeletePetModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {showDeletePetModal && selectedPet && (
        <DeletePetModal
          pet={selectedPet}
          petKindsMap={petKindsMap}
          onClose={(hasDeleted: boolean) => {
            setShowDeletePetModal(false);
            setSelectedPet(undefined);

            if (hasDeleted) {
              refreshPets();
            }
          }}
        />
      )}
    </div>
  );
}
