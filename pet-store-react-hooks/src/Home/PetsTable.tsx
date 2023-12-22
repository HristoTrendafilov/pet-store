import { useState } from 'react';

import { DeletePetModal } from '~deletePetModal/DeletePetModal';
import type { Pet } from '~infrastructure/global';
import { formatDate } from '~infrastructure/utils-function';

import './petsTable.scss';

interface PetsTableProps {
  pets: Pet[];
  petKindsMap: Map<number, string>;
}

export function PetsTable(props: PetsTableProps) {
  const { pets, petKindsMap } = props;

  const [showDeletePetModal, setShowDeletePetModal] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>(undefined);

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
                <td>{formatDate(pet.addedDate)}</td>
                <td>{petKindsMap.get(pet.kind)}</td>
                <td colSpan={2}>
                  <div>
                    <button className="btn btn-warning" type="button">
                      View / Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPet(pet);
                        setShowDeletePetModal(true);
                      }}
                      className="btn btn-danger"
                      type="button"
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
          onClose={() => {
            setShowDeletePetModal(false);
            setSelectedPet(undefined);
          }}
        />
      )}
    </div>
  );
}
