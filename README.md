# CRUD-API

---

## Prerequisites

1. Install [Node.js](https://nodejs.org/en/download/)
2. Clone [Git repository](https://github.com/totoogg/CRUD-API.git)
3. Go to folder `CRUD-API`
4. Go to the `develop` branch
5. To install all dependencies use `npm install`

---

## Scripts

- The application is run in development mode: `npm run start:dev`
- The application is run in production mode: `npm run start:prod`
- The application operates in horizontal scaling mode with a load balancer: `npm run start:multi`

---

## Tests

- Run test scripts in command line: `npm run test`

---

## Requests

- **Get Users**
  Returns json data about users.
  **URL**
  `http://127.0.0.1:4000/api/users`
  **Method:**
  `GET`
  **Success Response:**

  - **Code:** 200
    **Content:**

  ```json
  [
    {
      "username": "John",
      "age": 14,
      "hobbies": ["football", "computer games"],
      "id": "7b145698-6714-46c8-88a1-e4b479d67027"
    }
  ]
  ```

- **Get User**
  Returns json data about specific user.
  **URL**
  `http://127.0.0.1:4000/api/users/{userId}`
  **Method:**
  `GET`
  **Success Response:**

  - **Code:** 200
    **Content:**

  ```json
  {
    "username": "John",
    "age": 14,
    "hobbies": ["football", "computer games"],
    "id": "7b145698-6714-46c8-88a1-e4b479d67027"
  }
  ```

  **Error Response:**

  - **Code:** 400
    **Content:**

  ```text
  Invalid user id
  ```

  - **Code:** 404
    **Content:**

  ```text
  User with id ${userId} does not exist
  ```

- **Create User**
  Creates a new user.
  **URL**
  `http://127.0.0.1:4000/api/users`
  **Method:**
  `POST`
  **Data Params(JSON)**
  `{ id: string; username: string; age: number; hobbies: string[]; }`

  ```json
  {
    "username": "John",
    "age": 14,
    "hobbies": ["football", "computer games"]
  }
  ```

  **Success Response:**

  - **Code:** 201
    **Content:**

  ```json
  {
    "username": "John",
    "age": 14,
    "hobbies": ["football", "computer games"],
    "id": "7b145698-6714-46c8-88a1-e4b479d67027"
  }
  ```

  **Error Response:**

  - **Code:** 400
    **Content:**

  ```text
  Incorrect data for user creation
  ```

- **Update User**
  Updates attributes of specified user.
  **URL**
  `http://127.0.0.1:4000/api/users/{userId}`
  **Method:**
  `PUT`
  **Data Params(JSON)**
  `{ id: string; username: string; age: number; hobbies: string[]; }`

  ```json
  {
    "username": "John",
    "age": 14,
    "hobbies": ["football", "computer games"]
  }
  ```

  **Success Response:**

  - **Code:** 200
    **Content:**

  ```json
  {
    "username": "John",
    "age": 14,
    "hobbies": ["football", "computer games"],
    "id": "7b145698-6714-46c8-88a1-e4b479d67027"
  }
  ```

  **Error Response:**

  - **Code:** 400
    **Content:**

  ```text
  IIncorrect data for user update
  ```

  - **Code:** 400
    **Content:**

  ```text
  Invalid user id
  ```

  - **Code:** 404
    **Content:**

  ```text
  User with id ${userId} does not exist
  ```

- **Delete User**
  Delete specified specified user.
  **URL**
  `http://127.0.0.1:4000/api/users/{userId}`
  **Method:**
  `DELETE`
  **Success Response:**

  - **Code:** 204

  **Error Response:**

  - **Code:** 400
    **Content:**

  ```text
  Invalid user id
  ```

  - **Code:** 404
    **Content:**

  ```text
  User with id ${userId} does not exist
  ```
