const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = 5150;
const RESPONSE_DELAY = 1500;

let petIdState = 42;
const generateId = () => petIdState++;

const delay = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

const petList = [
  {
    petId: generateId(),
    petName: 'Gosho',
    age: 2,
    notes: 'White fur, very soft.',
    kind: 1,
    healthProblems: false,
    addedDate: '2022-10-31',
  },
  {
    petId: generateId(),
    petName: 'Pesho',
    age: 5,
    notes: undefined,
    kind: 2,
    healthProblems: false,
    addedDate: '2022-10-25',
  },
  {
    petId: generateId(),
    petName: 'Kenny',
    age: 1,
    notes: "Doesn't speak. Has the sniffles.",
    kind: 3,
    healthProblems: true,
    addedDate: '2022-10-27',
  },
];

const petKinds = [
  {
    displayName: 'Cat',
    value: 1,
  },
  {
    displayName: 'Dog',
    value: 2,
  },
  {
    displayName: 'Parrot',
    value: 3,
  },
];

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/pet/kinds', async (req, res) => {
  await delay(RESPONSE_DELAY);

  res.json(petKinds);
});

app.get('/pet/all', async (req, res) => {
  await delay(RESPONSE_DELAY);

  res.json(
    petList.map((pet) => ({
      petId: pet.petId,
      petName: pet.petName,
      addedDate: pet.addedDate,
      kind: pet.kind,
    }))
  );
});

app.get('/pet/:petId', async (req, res) => {
  await delay(RESPONSE_DELAY);

  const petId = Number(req.params.petId);
  const pet = petList.find((pet) => pet.petId === petId);

  if (pet) {
    res.json(pet);
  } else {
    res.sendStatus(404);
  }
});

app.post('/pet', async (req, res) => {
  await delay(RESPONSE_DELAY);

  const pet = {
    ...req.body,
    petId: generateId(),
  };

  petList.push(pet);

  res.json(pet);
});

app.put('/pet/:petId', async (req, res) => {
  await delay(RESPONSE_DELAY);

  const petId = Number(req.params.petId);

  const petIndex = petList.findIndex((pet) => pet.petId === petId);

  if (petIndex === -1) {
    res.sendStatus(404);
    return;
  }

  const newPet = { ...req.body, petId };

  petList[petIndex] = newPet;

  res.json(newPet);
});

app.delete('/pet/:petId', async (req, res) => {
  await delay(RESPONSE_DELAY);

  const petId = Number(req.params.petId);

  const petIndex = petList.findIndex((pet) => pet.petId === petId);

  if (petIndex === -1) {
    res.sendStatus(404);
    return;
  }

  const pet = petList[petIndex];

  petList.splice(petIndex, 1);

  res.json(pet);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});
