import { useCallback } from 'react';

import type { PetListItem } from '~infrastructure/api-types';
import { formatDate } from '~infrastructure/utils';

interface PetTableRowProps {
  pet: PetListItem;
  petKindsMap: Map<number, string>;
  onDelete: (pet: PetListItem) => void;
}

export function PetTableRow(props: PetTableRowProps) {
  const { pet, petKindsMap, onDelete } = props;

  const handleForDelete = useCallback(() => {
    onDelete(pet);
  }, [pet, onDelete]);

  return (
    <tr>
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
            onClick={handleForDelete}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}