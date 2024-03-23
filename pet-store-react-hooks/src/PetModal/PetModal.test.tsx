describe('Add pet modal', () => {
  test('Modal header is displayed correctly, all the inputs are unlocked with default values + Save and Cancel buttons', () => {
    // 1. Check the select input values for Kind
    // 2. Check the Added date input has a value of today
  });
  test('When new pet is added, the modal state is changed to View and all inputs are locked', () => {});
});

describe('View pet modal', () => {
  test('Modal header is displayed correctly, all the inputs are locked with pet values + Edit, Delete and Cancel buttons', () => {});
  test('When the Edit button is clicked, the modal state is changed to Edit', () => {});
  test('When the Delete button is clicked, the Delete pet modal is shown', () => {});
  test('When pet is deleted, the Delete pet modal and Pet modal are closed', () => {});
});

describe('Edit pet modal', () => {
  test('Modal header is displayed correctly, the editable inputs are unlocked + Save, Lock and Cancel buttons', () => {});
  test('When the Lock button is clicked, the modal state is changed to View and all changes are discarded', () => {});
  test('The modal cannot be closed on backdrop click', () => {});
});

test('Error message is displayed on fail from fetching the pet', () => {});
test('Error message is displayed on fail from saving the pet', () => {});
