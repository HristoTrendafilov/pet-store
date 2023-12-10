# Instructions

- Restore the packages

```shell

npm i

```

- Start the development environment

```shell

npm start

```

# Restrictions

- Don't look at `server.js`.
- Don't install any npm packages.
- Don't change `package.json` or `package-lock.json`.
- Don't import libraries from external sources (links).
- Don't change any of the configuration files.

# Scripts

To format your code run:

```sh
npm run format
```

# Endpoints

- `GET /pet/kinds`: Returns a list of pet kinds.
- `GET /pet/all`: Returns a list of all pets.
- `GET /pet/:petId`: Returns a pet for a given `petID`.
- `POST /pet`: Creates a new pet.
- `PUT /pet/:petId`: Updates an existing pet.
- `DELETE /pet/:petId`: Deletes the specified pet.
