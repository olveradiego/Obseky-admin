# Users API Contract (`/api/admin/users`)

## Error contract (all endpoints in this module)
- Preferred shape for frontend:
  - `{ backendError: { code: string, message: string, details?: any }, code: string, message: string, details?: any }`
- Flat fields (`code/message/details`) are also included for backward compatibility.
- Status mapping:
  - `400` validation error (`VALIDATION_ERROR`)
  - `401` token missing/invalid (`UNAUTHORIZED`)
  - `403` role without permission or forbidden action (`FORBIDDEN`)
  - `404` resource/endpoint not found (`NOT_FOUND`)
  - `409` conflict (`CONFLICT`, e.g. duplicated email)
  - `500` internal (`INTERNAL_ERROR`)

## Access control
- Module access is controlled with the role-permission matrix for `users`.
- `SUPER_ADMIN`: allowed (`create/read/update/delete`).
- `ADMIN`: denied (`403` for all actions in this module).

## Success responses
- `GET /api/admin/users`
  - `200`: `{ items: User[], total: number }`
- `GET /api/admin/users/:id`
  - `200`: `{ item: User }`
- `POST /api/admin/users`
  - `201`: `{ item: User, message: "Usuario creado" }`
- `PATCH /api/admin/users/:id`
  - `200`: `{ item: User, message: "Usuario actualizado" }`
- `DELETE /api/admin/users/:id`
  - `200`: `{ item: { id: string }, message: "Usuario eliminado" }`
- `DELETE /api/admin/users/bulk`
  - Body: `{ ids: string[] }`
  - `200`: `{ item: { ids: string[] }, message: "Usuarios eliminados", requestedCount, deletedCount, deletedIds, notFoundCount, notFoundIds }`

## Validation rules
- `POST /`
  - `name` required, min length 2
  - `email` required, normalized with `trim().toLowerCase()`, valid format
  - `password` required, min length 8, always hashed (`bcrypt`)
  - `role` allowed values: only `ADMIN` or `SUPER_ADMIN`
- `PATCH /:id`
  - `id` must be valid `ObjectId`
  - payload must be non-empty
  - only provided fields are validated
  - if `password` is sent, it is re-hashed
  - `isActive` must be boolean if present
  - blocked fields: `_id`, `id`, `createdAt`, `updatedAt`, `restorePassword`
- `DELETE /:id`
  - `id` must be valid `ObjectId`
  - self-delete is blocked for the authenticated user
  - if user does not exist, returns `404`
- `DELETE /bulk`
  - `ids` must be a non-empty array of valid `ObjectId`
  - self-delete is blocked if authenticated user id is included

## Role compatibility (legacy)
- Accepted role input variants are normalized to official roles:
  - Admin: `ADMIN`, `Admin`, `admin`
  - Super admin: `SUPER_ADMIN`, `SuperAdmin`, `super_admin`, `super-admin`, `superadmin`
- In `POST`, role is strict (`ADMIN`/`SUPER_ADMIN`).
- In `PATCH`, role accepts legacy variants listed above.
- Stored role remains legacy-compatible in DB:
  - `SUPER_ADMIN` -> `SuperAdmin`
  - `ADMIN` -> `Admin`
- API output role is always normalized:
  - `ADMIN` or `SUPER_ADMIN`

## Password compatibility (legacy)
- Login compatibility remains unchanged:
  - bcrypt hash (`$2...`) is validated with `bcrypt.compare`
  - legacy plain text passwords are still accepted for existing users
- New passwords from `POST/PATCH` are always stored hashed.
