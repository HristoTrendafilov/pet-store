import { useState } from 'react';

import { useSessionContext } from '~context/contextHelper';
import { DeletePetModal } from '~deletePetModal/DeletePetModal';
import type { IPet } from '~infrastructure/global';
import { formatDate } from '~infrastructure/utils';

import './petsTable.scss';

export function PetsTable({ pets }: { pets: IPet[] }) {
  const { petKindsRecord } = useSessionContext();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<IPet | undefined>(undefined);

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
                <td>{petKindsRecord[pet.kind]}</td>
                <td colSpan={2}>
                  <div>
                    <button className="btn btn-warning" type="button">
                      View / Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPet(pet);
                        setShowDeleteModal(true);
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
      {showDeleteModal && selectedPet && (
        <DeletePetModal
          pet={selectedPet}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
