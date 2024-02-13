test('Error message is shown on failed network request', () => {});
test('Pet table rows are rendered properly', () => {
  // 1. The length of the rows should be exatctly the count fetched from the mock
  // 2. Added date column should be in the corrent format (dd MMM yyyy)
  // 3. Kind column should have the string representations of the pet kind
  // 4. Every row should have 2 buttons with the text - 'View / Edit' and 'Delete'
});
// Think about the case in <Home/> component
test('Add pet button is disabled if fetching pet kinds has failed', () => {});

// Questions
// 1. Should i validate the text of the buttons and pet table header?
// 2. Should i validate the structure of the table (exact amount of columns and the text in them)?
// 3.
