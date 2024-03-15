test('The header text is displayed with the correnct pet id and close button', () => {});
test('Information about the pet in the body is correct + the Delete and Cancel buttons are visualized', () => {});

// Question: Should i test the closing of the modal in theese three tests or one handling all of them?
test('Modal is closed on header close button click', () => {});
test('Modal is closed on body Cancel button click', () => {});
test('Modal is closed on modal backdrop click', () => {});

test('Loading spinner is shown when Delete button is clicked, all buttons are disabled and the modal cannot be closed while the request is pending', () => {});

test('Error message is displayed on fail from deleting pet', () => {});

// Question: Here i`m testing the component in isolation, but the closing state is managed by the <Home/> component.
// How can i handle this without rendering <Home/> and then clicking on Delete button from some row
