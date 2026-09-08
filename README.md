# Project & Task Management API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

A robust, production-ready RESTful API built with Node.js, Express 5, TypeScript, PostgreSQL, and Prisma ORM for managing multi-user workspaces, projects, and scoped tasks. The API features secure JWT authentication, granular ownership authorization, transitive project-based access controls, paginated and filterable task queries, strict schema validation using Zod, and centralized, error-resilient middleware.

---

## 📋 Table of Contents

- [Tech Stack](#️-tech-stack)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Setup Instructions](#️-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Database Design](#️-database-design)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Design Decisions & Assumptions](#-design-decisions--assumptions)
- [Known Limitations](#️-known-limitations)
- [Author](#-author)

---

## 🛠️ Tech Stack

- **Node.js**: Cross-platform JavaScript runtime powering server-side execution.
- **TypeScript**: Statically typed language providing type safety, contract enforcement, and maintainability across the codebase.
- **Express 5**: Modern web application framework routing incoming HTTP requests, controllers, and middleware pipelines.
- **PostgreSQL**: Reliable, ACID-compliant relational database serving as the persistent data store.
- **Prisma ORM**: Next-generation TypeScript ORM providing schema migrations, declarative modeling, and type-safe database queries.
- **JWT (jsonwebtoken)**: Stateless token-based authentication mechanism securing protected endpoints.
- **bcryptjs**: Adaptive cryptographic hashing library used to salt and hash sensitive user passwords before persistence.
- **Zod**: Declarative TypeScript-first validation library validating and sanitizing HTTP request bodies and query parameters.

---

## ✨ Features

- **JWT-Based Authentication**: Secure account registration, credential-based login, and protected profile retrieval (`/api/auth/me`).
- **Project CRUD with Ownership Authorization**: Users can create, read, update, and delete workspaces with strict isolation—users can only access projects they own.
- **Task CRUD with Project-Scoped Authorization**: Transitive access control ensuring tasks can only be created, fetched, or modified by the owner of the parent project.
- **Pagination and Filtering on Tasks**: Configurable limit and page offsets with status (`TODO`, `IN_PROGRESS`, `DONE`) and priority (`LOW`, `MEDIUM`, `HIGH`) filters.
- **Centralized Error Handling**: Standardized JSON responses for validation errors, authentication failures, Prisma constraint violations, and unexpected server errors without leaking internal stack traces.
- **Input Validation with Zod**: Strict runtime schema validation on payloads and query parameters before requests reach business logic services.

---

## ✅ Prerequisites

Before running this application, ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher
- **PostgreSQL**: A running instance locally or hosted remotely (e.g. Supabase, Neon, AWS RDS)
- **npm**: Node Package Manager (comes bundled with Node.js)

---

## ⚙️ Setup Instructions

Follow these numbered steps to configure, migrate, and run the server locally:

1. Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd project-management-api
   ```

2. Install all project dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and configure your variables:
   ```bash
   cp .env.example .env
   ```
   *(Refer to the [Environment Variables](#-environment-variables) section below for detailed variable descriptions).*

4. Create a PostgreSQL database matching the name and credentials configured in your `DATABASE_URL`.

5. Apply database migrations to bring your PostgreSQL schema up to date:
   ```bash
   npx prisma migrate deploy
   ```
   > **Note**: `npx prisma migrate deploy` is used to execute pending migrations in an existing schema. Run `npx prisma migrate dev` during local development when introducing new schema alterations.

6. Start the application server:
   - For local development with live hot-reloading:
     ```bash
     npm run dev
     ```
   - For a production-style compiled run:
     ```bash
     npm run build && npm start
     ```

7. The server will start and listen on the port specified in `.env` (default `4000`):
   ```
   Server is running on http://localhost:4000
   ```

8. Verify server health by executing a GET request against the health check endpoint:
   ```bash
   curl -X GET http://localhost:4000/health
   ```

---

## 🔑 Environment Variables

The application validates the presence of all required environment variables upon startup to ensure fail-fast reliability. Create a `.env` file at the root of the repository matching the specifications below:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | The HTTP port number on which the Express server listens | `4000` |
| `DATABASE_URL` | PostgreSQL connection string with credentials, host, port, and database name | `postgresql://postgres:password@localhost:5432/project_task_db` |
| `JWT_SECRET` | Secret cryptographic key used to sign and verify JSON Web Tokens | `d694582f0997...` (long random hex string) |
| `JWT_EXPIRES_IN` | Duration string defining the validity lifespan of issued JWT tokens | `1d` |

In production, `JWT_SECRET` should be a cryptographically secure, high-entropy random string. You can generate one via the Node.js CLI:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📁 Project Structure

The project follows a modular, layered architectural pattern where feature modules encapsulate their respective routes, controllers, services, and validation schemas:

```
src/
├── config/             # Application configuration and environment variable validation
│   ├── database.ts     # Singleton Prisma Client instance initialization
│   └── env.ts          # Startup environment validation and typed config exports
├── middleware/         # Express middleware interceptors
│   ├── authenticate.ts # JWT authentication and request user identity injection
│   └── validate.ts     # Generic Zod validation middleware for body and query data
├── modules/            # Feature-driven domain modules
│   ├── auth/           # Authentication domain (registration, login, profile)
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   └── auth.validation.ts
│   ├── project/        # Project domain (workspaces, ownership authorization)
│   │   ├── project.controller.ts
│   │   ├── project.routes.ts
│   │   ├── project.service.ts
│   │   └── project.validation.ts
│   └── task/           # Task domain (project tasks, filtering, assignment)
│       ├── task.controller.ts
│       ├── task.routes.ts
│       ├── task.service.ts
│       └── task.validation.ts
├── types/              # Ambient TypeScript declarations and custom Express extensions
│   └── express/        # Extension augmenting Express.Request with authenticated user payload
├── utils/              # Shared helper functions and error classes
│   ├── AppError.ts     # Custom HTTP error hierarchy (BadRequest, NotFound, etc.)
│   ├── jwt.ts          # JWT signing and verification helper functions
│   └── password.ts     # bcrypt password hashing and comparison routines
├── app.ts              # Express application factory, middleware chain, and error handler
└── server.ts           # Application entrypoint binding HTTP listener to port
```

---

## 🗄️ Database Design

The database schema models three core entities: `User`, `Project`, and `Task`. A `User` maintains a one-to-many relationship with owned `Project` records, each `Project` maintains a one-to-many relationship with child `Task` records with cascading deletes, and tasks maintain an optional foreign key reference to an assigned `User`.

See [docs/database-design.md](./docs/database-design.md) for the full schema design, indexing strategy, and onDelete decisions.

---

## 📡 API Documentation

This section provides complete endpoint specifications, input contracts, and response structures.

### Summary Table

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login and receive a JWT |
| `GET` | `/api/auth/me` | Yes | Get current authenticated user's profile |
| `POST` | `/api/projects` | Yes | Create a new project |
| `GET` | `/api/projects` | Yes | List all projects owned by the user |
| `GET` | `/api/projects/:id` | Yes | Get a single project by ID |
| `PATCH` | `/api/projects/:id` | Yes | Update a project (partial update) |
| `DELETE` | `/api/projects/:id` | Yes | Delete a project (cascades to its tasks) |
| `POST` | `/api/projects/:projectId/tasks` | Yes | Create a task under a project |
| `GET` | `/api/projects/:projectId/tasks` | Yes | List tasks (paginated, filterable by status/priority) |
| `GET` | `/api/tasks/:id` | Yes | Get a single task by ID |
| `DELETE` | `/api/tasks/:id` | Yes | Delete a task |
| `PATCH` | `/api/tasks/:id` | Yes | Update a task (partial update) |

---

### POST /api/auth/register
- **Auth Required**: No
- **Description**: Registers a new user account with a unique email, full name, and password.

#### Request Body
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongPassword123"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "createdAt": "2026-03-30T10:00:00.000Z"
  }
}
```

---

### POST /api/auth/login
- **Auth Required**: No
- **Description**: Authenticates user credentials and returns a signed JSON Web Token for authorizing subsequent requests.

#### Request Body
```json
{
  "email": "jane@example.com",
  "password": "strongPassword123"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01",
      "email": "jane@example.com"
    }
  }
}
```

---

### GET /api/auth/me
- **Auth Required**: Yes
- **Description**: Retrieves the profile details of the currently authenticated user identified by the Bearer token.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01",
    "email": "jane@example.com",
    "name": "Jane Doe"
  }
}
```

---

### POST /api/projects
- **Auth Required**: Yes
- **Description**: Creates a new project owned by the currently authenticated user.

#### Request Body
```json
{
  "name": "Mobile App Redesign",
  "description": "Redesigning the iOS and Android applications"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "8f3b25f4-279c-4469-80b6-3ff1dc08eb42",
    "name": "Mobile App Redesign",
    "description": "Redesigning the iOS and Android applications",
    "ownerId": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01",
    "createdAt": "2026-03-30T10:15:00.000Z",
    "updatedAt": "2026-03-30T10:15:00.000Z"
  }
}
```

---

### GET /api/projects
- **Auth Required**: Yes
- **Description**: Lists all projects owned by the authenticated user, ordered newest first.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "8f3b25f4-279c-4469-80b6-3ff1dc08eb42",
      "name": "Mobile App Redesign",
      "description": "Redesigning the iOS and Android applications",
      "ownerId": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01",
      "createdAt": "2026-03-30T10:15:00.000Z",
      "updatedAt": "2026-03-30T10:15:00.000Z"
    }
  ]
}
```

---

### GET /api/projects/:id
- **Auth Required**: Yes
- **Description**: Retrieves detailed information for a single project owned by the user.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "8f3b25f4-279c-4469-80b6-3ff1dc08eb42",
    "name": "Mobile App Redesign",
    "description": "Redesigning the iOS and Android applications",
    "ownerId": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01",
    "createdAt": "2026-03-30T10:15:00.000Z",
    "updatedAt": "2026-03-30T10:15:00.000Z"
  }
}
```

---

### PATCH /api/projects/:id
- **Auth Required**: Yes
- **Description**: Partially updates the name or description of an existing project owned by the user.

#### Request Body
```json
{
  "name": "Mobile App Redesign v2",
  "description": "Updated project scope for Q2"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "8f3b25f4-279c-4469-80b6-3ff1dc08eb42",
    "name": "Mobile App Redesign v2",
    "description": "Updated project scope for Q2",
    "ownerId": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01",
    "createdAt": "2026-03-30T10:15:00.000Z",
    "updatedAt": "2026-03-30T11:00:00.000Z"
  }
}
```

---

### DELETE /api/projects/:id
- **Auth Required**: Yes
- **Description**: Deletes a project owned by the user, cascading deletion to all tasks contained within it.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Project deleted"
}
```

---

### POST /api/projects/:projectId/tasks
- **Auth Required**: Yes
- **Description**: Creates a new task under a specific project owned by the authenticated user.

#### Request Body
```json
{
  "title": "Setup Authentication Flow",
  "description": "Implement JWT login and registration screens",
  "status": "TODO",
  "priority": "HIGH",
  "assignedToId": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "e4a280d1-0f73-4217-9159-86f72bcf1b37",
    "title": "Setup Authentication Flow",
    "description": "Implement JWT login and registration screens",
    "status": "TODO",
    "priority": "HIGH",
    "projectId": "8f3b25f4-279c-4469-80b6-3ff1dc08eb42",
    "assignedToId": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01",
    "createdAt": "2026-03-30T10:30:00.000Z",
    "updatedAt": "2026-03-30T10:30:00.000Z"
  }
}
```

---

### GET /api/projects/:projectId/tasks
- **Auth Required**: Yes
- **Description**: Lists paginated tasks under a project owned by the user, supporting status and priority filtering.
- **Query Parameters**:
  - `page` (optional, integer, default: `1`): The page number to retrieve.
  - `limit` (optional, integer, default: `10`, max: `100`): The number of tasks per page.
  - `status` (optional, string): Filter by task status (`TODO`, `IN_PROGRESS`, `DONE`).
  - `priority` (optional, string): Filter by task priority (`LOW`, `MEDIUM`, `HIGH`).

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "e4a280d1-0f73-4217-9159-86f72bcf1b37",
      "title": "Setup Authentication Flow",
      "description": "Implement JWT login and registration screens",
      "status": "TODO",
      "priority": "HIGH",
      "projectId": "8f3b25f4-279c-4469-80b6-3ff1dc08eb42",
      "assignedToId": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01",
      "createdAt": "2026-03-30T10:30:00.000Z",
      "updatedAt": "2026-03-30T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### GET /api/tasks/:id
- **Auth Required**: Yes
- **Description**: Retrieves a single task by ID if its parent project is owned by the authenticated user. Returns 404 if the task doesn't exist or belongs to a project the user doesn't own.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "e4a280d1-0f73-4217-9159-86f72bcf1b37",
    "title": "Setup Authentication Flow",
    "description": "Implement JWT login and registration screens",
    "status": "TODO",
    "priority": "HIGH",
    "projectId": "8f3b25f4-279c-4469-80b6-3ff1dc08eb42",
    "assignedToId": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01",
    "createdAt": "2026-03-30T10:30:00.000Z",
    "updatedAt": "2026-03-30T10:30:00.000Z"
  }
}
```

---

### PATCH /api/tasks/:id
- **Auth Required**: Yes
- **Description**: Partially updates a task's title, description, status, priority, or assignee if its parent project is owned by the user.

#### Request Body
```json
{
  "status": "IN_PROGRESS",
  "priority": "HIGH"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "e4a280d1-0f73-4217-9159-86f72bcf1b37",
    "title": "Setup Authentication Flow",
    "description": "Implement JWT login and registration screens",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "projectId": "8f3b25f4-279c-4469-80b6-3ff1dc08eb42",
    "assignedToId": "c1f7b0be-7e27-4b71-9c7a-56e6d18a1a01",
    "createdAt": "2026-03-30T10:30:00.000Z",
    "updatedAt": "2026-03-30T11:15:00.000Z"
  }
}
```

---

### DELETE /api/tasks/:id
- **Auth Required**: Yes
- **Description**: Deletes a task if its parent project is owned by the authenticated user.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Task deleted"
}
```

---

## 🔐 Authentication

All protected routes require an `Authorization` HTTP header with a valid JSON Web Token formatted as a Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

The token is generated upon successful registration or login via `POST /api/auth/login`. Requests sent to protected routes without a valid token will be rejected with an HTTP `401 Unauthorized` response.

Example `curl` request accessing the authenticated user profile:

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🧠 Design Decisions & Assumptions

- **UUID (v4) Primary Keys**: Primary keys use UUID (v4) for all models (`User`, `Project`, `Task`), satisfying the specification and mitigating resource enumeration attacks that occur with predictable auto-incrementing IDs.
- **Unified 404 on Resource Access**: Accessing a project or task that does not exist OR belongs to another user both return `404 Not Found` (rather than `403 Forbidden`), preventing unauthorized users from probing or determining whether private resources exist.
- **Global User Assignment**: Because the schema does not include a team or organization membership model, a task's `assignedToId` can reference any registered user in the system (validated to exist in the database), not just the project owner.
- **Case-Insensitive Email Handling**: Email addresses are automatically normalized to lowercase before database persistence and lookup, ensuring case-insensitive registration and authentication.
- **Default Task States**: Tasks automatically default to status `TODO` and priority `MEDIUM` when those attributes are omitted from creation requests.

---

## ⚠️ Known Limitations

- **No Refresh Token Mechanism**: JWT authentication uses a single bearer token; once expired, users must re-authenticate via the login endpoint.
- **No Rate Limiting on Auth Endpoints**: Authentication endpoints currently lack IP-based rate limiting or brute-force throttling.
- **No Email Verification on Registration**: User accounts are activated immediately upon registration without verification links or OTP delivery.
- **No Automated Test Suite**: All endpoints were validated through comprehensive manual test routines throughout development, covering happy paths, input validation constraints, and authorization edge cases.

---

## 👤 Author

- **Developer**: Saharier Omi
- *Submitted as part of the Backend Intern Hiring Assignment.*
