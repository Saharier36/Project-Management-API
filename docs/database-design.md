# Database Design Documentation

This document records the architectural and schema design decisions for the Project & Task Management API database prior to Prisma schema implementation.

---

## Entities

### User
Represents registered accounts within the system.

| Field | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, default UUID v4 | Unique identifier for the user |
| `email` | String | Unique, Not Null | User login email address |
| `password` | String | Not Null | Hashed password string (bcrypt) |
| `name` | String | Not Null | User's full or display name |
| `createdAt` | DateTime | Not Null, default `now()` | Timestamp of record creation |
| `updatedAt` | DateTime | Not Null, auto-updated | Timestamp of record last update |

### Project
Represents a project workspace owned by a user.

| Field | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, default UUID v4 | Unique identifier for the project |
| `name` | String | Not Null | Name/title of the project |
| `description` | String | Nullable / Optional | Optional detailed project description |
| `ownerId` | UUID | Foreign Key -> `User.id`, Not Null | Identifier of the user who owns this project |
| `createdAt` | DateTime | Not Null, default `now()` | Timestamp of record creation |
| `updatedAt` | DateTime | Not Null, auto-updated | Timestamp of record last update |

### Task
Represents an individual task item associated with a project and optionally assigned to a user.

| Field | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, default UUID v4 | Unique identifier for the task |
| `title` | String | Not Null | Title/summary of the task |
| `description` | String | Nullable / Optional | Optional detailed task description |
| `status` | Enum | `TODO` \| `IN_PROGRESS` \| `DONE`, default `TODO` | Current lifecycle state of the task |
| `priority` | Enum | `LOW` \| `MEDIUM` \| `HIGH`, default `MEDIUM` | Priority ranking of the task |
| `projectId` | UUID | Foreign Key -> `Project.id`, Not Null | Parent project this task belongs to |
| `assignedToId`| UUID | Foreign Key -> `User.id`, Nullable | Assigned user identifier (if assigned) |
| `createdAt` | DateTime | Not Null, default `now()` | Timestamp of record creation |
| `updatedAt` | DateTime | Not Null, auto-updated | Timestamp of record last update |

---

## Relationships

- **User (1) to Project (N)**: A user can own multiple projects (`1:N`). Each project is strictly owned by exactly one user (`ownerId`).
- **Project (1) to Task (N)**: A project contains multiple tasks (`1:N`). Each task strictly belongs to exactly one project (`projectId`).
- **User (1) to Task (N) [Optional Assignment]**: A user can optionally be assigned to multiple tasks (`1:N`). A task can either have no assigned user (`assignedToId` is null) or be assigned to one user.

---

## Primary Key Strategy

All primary keys (`id`) across `User`, `Project`, and `Task` use **UUID** (v4) rather than sequential auto-increment integers.

### Rationale:
1. **Specification Requirement**: The project specification explicitly dictates UUID as the identifier type for all entities.
2. **Security & Anti-Enumeration**: Auto-increment integer IDs expose business metrics (e.g., total registered users or projects) and allow predictable enumeration attacks where malicious actors crawl resources by incrementing numerical IDs. UUIDs are non-sequential and cryptographically unpredictable, mitigating these enumeration risks.

---

## onDelete Behavior

Foreign key referential integrity rules are configured as follows:

| Relationship | Foreign Key | Action | Rationale |
| :--- | :--- | :--- | :--- |
| **Project -> Task** | `Task.projectId` | `Cascade` | A task cannot meaningfully exist without its parent project. Deleting a project should automatically delete all child tasks. |
| **User -> Project** | `Project.ownerId` | `Cascade` | A project cannot exist without an owner. Deleting a user account removes their owned projects and cascades to their tasks. |
| **User -> Task** | `Task.assignedToId` | `SetNull` | A task must persist even if the assigned user is deleted. The task simply reverts to an unassigned state (`assignedToId = null`). |

---

## Indexes

To ensure fast lookups and query efficiency, the following indexes are specified:

| Model | Target Column(s) | Index Type | Query Justification |
| :--- | :--- | :--- | :--- |
| **User** | `email` | Unique Index | Enforces uniqueness constraint and optimizes login lookups (`findUnique({ where: { email } })`). |
| **Project** | `ownerId` | Index | Optimizes retrieval on every "list my projects" endpoint (`WHERE ownerId = :userId`). |
| **Task** | `projectId` | Index | Optimizes retrieval on every "list tasks for project" endpoint (`WHERE projectId = :projectId`). |
| **Task** | `assignedToId` | Index | Accelerates lookups for tasks assigned to a specific user. |
| **Task** | `(projectId, status, priority)` | Composite Index | Directly accelerates multi-field filtering on `GET /api/projects/:projectId/tasks?status=...&priority=...` without requiring full table scans or multiple index intersections. |
