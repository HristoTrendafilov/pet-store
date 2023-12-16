import { useState } from 'react';

import { useSessionContext } from '~context/contextHelper';
import { DeletePetModal } from '~deletePetModal/DeletePetModal';
import type { IPet } from '~infrastructure/global';
import { formatDate } from '~infrastructure/utils-function';

import './petsTable.scss';

type PetsTableProps = {
  pets: IPet[];
  onPetActionTaken: () => void;
};

export function PetsTable(props: PetsTableProps) {
  const [showDeletePetModal, setShowDeletePetModal] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<IPet | undefined>(undefined);

  const { petKindsRecord } = useSessionContext();

  const { pets, onPetActionTaken } = props;

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
          onClose={(hasDeleted: boolean) => {
            setShowDeletePetModal(false);
            setSelectedPet(undefined);

            if (hasDeleted) {
              onPetActionTaken();
            }
          }}
        />
      )}
    </div>
  );
}
