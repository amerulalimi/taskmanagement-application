## Task Management API - Backend

This backend is a Flask-based REST API for user authentication and task management.

All routes are prefixed from the root of the server (e.g. `http://localhost:5000/auth/register`). JSON is used for both requests and responses.

### Authentication

The API uses **JWT tokens stored in HTTP-only cookies**.

- After a successful login you receive:
  - a JSON body containing `access_token`
  - an **HTTP-only cookie** (used by the backend for auth)
- For browser clients (e.g. React on `http://localhost:5173`):
  - Call the API with `withCredentials: true` / `credentials: 'include'`
  - You **do not** need to send an `Authorization` header

---

## Auth Routes (`/auth`)

### POST `/auth/register`

- **Description**: Register a new user.
- **Auth**: Not required.
- **Request Body (JSON)**:

```json
{
  "email": "user@example.com",
  "password": "min-8-chars-password"
}
```

- **Validation**:
  - `email`: must be a valid email address.
  - `password`: minimum 8 characters.

- **Responses**:
  - **201 Created**

    ```json
    {
      "message": "User registered"
    }
    ```

  - **400 Bad Request**
    - When the user already exists:

      ```json
      {
        "error": "User already exists"
      }
      ```

    - When Pydantic validation fails (invalid email, short password, etc.):

      ```json
      [
        {
          "loc": ["field_name"],
          "msg": "error message",
          "type": "validation_error_type"
        }
      ]
      ```

---

### POST `/auth/login`

- **Description**: Log in an existing user and receive a JWT access token (in JSON and cookie).
- **Auth**: Not required.
- **Request Body (JSON)**:

```json
{
  "email": "user@example.com",
  "password": "min-8-chars-password"
}
```

- **Responses**:
  - **200 OK**

    ```json
    {
      "access_token": "<jwt-token-string>"
    }
    ```

    Additionally, an HTTP-only cookie is set (used automatically by `@jwt_required()`).

  - **401 Unauthorized**

    ```json
    {
      "error": "Invalid credentials"
    }
    ```

---

### POST `/auth/logout`

- **Description**: Log out the current user by clearing the JWT cookie.
- **Auth**: Required (must be logged in).
- **Request Body**: None.

- **Responses**:
  - **200 OK**

    ```json
    true
    ```

  - **401 Unauthorized**
    - If no valid JWT cookie is present.

---

## Task Routes (`/tasks`)

> **Note**: All `/tasks` routes require a valid JWT stored in the cookie (set on login).
>
> The token contains a `role` claim (`"admin"` or `"user"`):
> - **admin**: can see / update / delete **all tasks**
> - **user**: can only see / update / delete **their own tasks**

### GET `/tasks`

- **Description**:
  - If role is **user**: get the list of tasks belonging to the authenticated user.
  - If role is **admin**: get the list of **all tasks**.
- **Auth**: Required (JWT cookie).
- **Request Body**: None.

- **Responses**:
  - **200 OK**

    ```json
    [
      {
        "id": 1,
        "title": "Task title",
        "description": "Task description",
        "status": "pending"
      },
      {
        "id": 2,
        "title": "Another task",
        "description": "Another description",
        "status": "completed"
      }
    ]
    ```

  - **401 Unauthorized**
    - If token is missing or invalid (handled by `flask-jwt-extended`), a JSON error response is returned.

---

### POST `/tasks`

- **Description**: Create a new task for the authenticated user.
- **Auth**: Required (JWT cookie).
- **Request Body (JSON)**:

```json
{
  "title": "New task title",
  "description": "Task description",
  "status": "pending"
}
```

- **Notes**:
  - `title`: **required**, 1–100 characters.
  - `description`: **required**, non-empty string.
  - `status`: optional, defaults to `"pending"` if not provided.

- **Responses**:
  - **201 Created**

    ```json
    {
      "message": "Task created",
      "id": 123,
      "title": "New task title",
      "description": "Task description",
      "status": "pending"
    }
    ```

  - **400 Bad Request**
    - When the request body is missing:

      ```json
      {
        "error": "Request body is required"
      }
      ```

    - When Pydantic validation fails (e.g., missing `title`/`description`, too short/long, etc.):

      ```json
      [
        {
          "loc": ["field_name"],
          "msg": "error message",
          "type": "validation_error_type"
        }
      ]
      ```

  - **401 Unauthorized**
    - If token is missing or invalid.

---

### PUT `/tasks/<task_id>`

- **Description**:
  - **user**: update an existing task belonging to the authenticated user.
  - **admin**: update any task.
- **Auth**: Required (JWT cookie).
- **URL Params**:
  - `task_id` (int) – ID of the task to update.

- **Request Body (JSON)** – all fields optional:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed"
}
```

- **Notes**:
  - If a field is omitted or `null`, it will not be changed.
  - `title` (if provided) must not be empty.

- **Responses**:
  - **200 OK**

    ```json
    {
      "message": "Updated"
    }
    ```

  - **400 Bad Request**
    - Pydantic validation errors in the same array format as above.

  - **404 Not Found**
    - If the task with `task_id` does not exist or is not accessible to the current user (e.g. user trying to update someone else’s task).

  - **401 Unauthorized**
    - If token is missing or invalid.

---

### DELETE `/tasks/<task_id>`

- **Description**:
  - **user**: delete an existing task belonging to the authenticated user.
  - **admin**: delete any task.
- **Auth**: Required (JWT cookie).
- **URL Params**:
  - `task_id` (int) – ID of the task to delete.

- **Request Body**: None.

- **Responses**:
  - **200 OK**

    ```json
    {
      "message": "Deleted"
    }
    ```

  - **404 Not Found**
    - If the task with `task_id` does not exist or is not accessible to the current user.

  - **401 Unauthorized**
    - If token is missing or invalid.

---

## Running the Server

- **Entry point**: `run.py`
- **Default behavior**: Starts the Flask application in debug mode.

Example (from the project root):

```bash
python run.py
```

Make sure the following environment variables are set (e.g. in a `.env` file):

- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_NAME`
- `JWT_SECRET_KEY`

