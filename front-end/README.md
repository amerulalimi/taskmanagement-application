## What this project is

Frontend for a Task Management application built with React, TypeScript, and Vite.  
It provides:
- User authentication (login/register) against a Flask backend using HttpOnly JWT cookies.
- A protected dashboard where users can create, view, update, and delete their own tasks.
- A modern UI built with shadcn/ui, Tailwind, react-hook-form, and zod.

## How to run it

Prerequisites:
- Node 18+ and npm
- Backend API running on `http://localhost:5000` with routes:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /logout`
  - `GET/POST/PUT/DELETE /tasks`

Steps:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the API base URL (already configured for local Flask):
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open the URL printed by Vite (typically `http://localhost:5173`).
4. Build for production:
   ```bash
   npm run build
   ```
5. Optionally serve the build with the provided Dockerfile:
   ```bash
   docker build -t task-frontend .
   docker run -p 8080:80 task-frontend
   ```
   Then open `http://localhost:8080`.

## How it is structured

- **`src/App.tsx`**
  - Sets up routes: `/login`, `/register`, `/dashboard`.
  - Wraps the app in `AuthProvider` and the theme provider.
  - Uses `ProtectedRoute` to guard the dashboard.

- **`src/context/AuthContext.tsx`**
  - On load, calls `GET /tasks` to determine if the user is authenticated (based on the HttpOnly cookie).
  - Exposes:
    - `isAuthenticated`, `initialized`
    - `login()` – marks the user as authenticated after a successful `/auth/login`.
    - `logout()` – flips auth to false and calls `POST /logout` to clear the cookie.

- **`src/lib/api.ts`**
  - Axios instance:
    - `baseURL` = `VITE_API_BASE_URL` (defaults to `http://localhost:5000`).
    - `withCredentials: true` so cookies are sent and received.

- **Pages**
  - `src/pages/LoginPage.tsx`
    - Login form with `react-hook-form` + `zod` validation.
    - Calls `POST /auth/login`, then `login()` in auth context and redirects to `/dashboard`.
  - `src/pages/RegisterPage.tsx`
    - Registration form (email, password, confirm password, role).
    - Validated with `react-hook-form` + `zod`.
    - Calls `POST /auth/register` and then redirects to `/login`.
  - `src/pages/DashboardPage.tsx`
    - Dashboard layout with:
      - `DashboardSidebar` on the left.
      - Card containing the task `TaskTable` on the right.
    - Fetches tasks from `GET /tasks`.
    - Uses `TaskAddDialog` and `TaskEditDialog` to create and update tasks (`POST /tasks`, `PUT /tasks/:id`).
    - Deletes tasks with `DELETE /tasks/:id`.
    - Shows status notifications with `sonner`.

- **Components**
  - `src/components/ProtectedRoute.tsx`
    - Redirects to `/login` if `isAuthenticated` is false (once `initialized` is true).
  - `src/components/DashboardSidebar.tsx`
    - Static sidebar with app title, “Data Table” item, and Logout button.
  - `src/components/TaskTable.tsx`
    - Pure table component showing tasks, with update/delete buttons wired via props.
  - `src/components/TaskAddDialog.tsx` / `TaskEditDialog.tsx`
    - Dialog components that render the add/edit task forms, driven by the `DashboardPage` form instance.
  - `src/components/TaskTableSkeleton.tsx`
    - Skeleton placeholder used as a Suspense fallback while the table component is loading.

- **Styling and theme**
  - `src/index.css`
    - Tailwind + shadcn theme tokens (light/dark), base styles.
  - `src/context/ThemeContext.tsx` + `src/components/ThemeToggle.tsx`
    - Manages light/dark/system theme and toggles the `dark` class on the root element.

