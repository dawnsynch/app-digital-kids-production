# Auth Enhancement Guide

## Database Changes

The auth upgrade adds a `users` table:

- `id`
- `full_name`
- `email`
- `username`
- `password_hash`
- `role`
- `parent_id`
- `student_id`
- `is_active`
- `created_at`

The `students` table now has `parent_id`, linking each new learner profile to the parent user who created it.

Relationships:

- Parent users have many students.
- Learner users belong to one parent through `parent_id`.
- Learner users are linked to exactly one student through `student_id`.
- Assessment attempts remain scoped by `student_id`.

For the MVP, startup runs a small SQLite migration that adds `students.parent_id` when upgrading an existing local database. A production version should use Alembic.

## API Changes

Auth endpoints:

- `POST /auth/register-parent`
- `POST /auth/login`
- `GET /auth/me`

Student endpoints:

- `POST /students` is parent-only.
- `GET /students` returns a parent user's own children or a learner user's own profile.
- `GET /students/{student_id}` checks ownership.
- `POST /students/{student_id}/learner-account` is parent-only and creates a login for that child.

Revision endpoints:

- `GET /revision/options` requires login.
- `POST /revision/generate` checks student ownership.
- `GET /revision/{assessment_id}` checks ownership through the assessment's student.
- `POST /revision/submit` is parent-only and checks assessment ownership.

Learning endpoints:

- `POST /learning/coding` requires login.
- `POST /learning/spiritual` requires login.
- Learners can only request lessons for their linked profile's grade.

Progress endpoints:

- `GET /progress/student/{student_id}` checks ownership.
- `GET /progress/summary` is parent-only and summarizes that parent's children.

## Role-Based Access Design

Roles are stored as strings:

- `parent`
- `learner`

Backend enforcement happens with FastAPI dependencies:

- `get_current_user` verifies the bearer token and loads the active user from the database.
- `require_parent` rejects non-parent users with `403`.
- `require_learner` is available for learner-only flows.
- `ensure_student_access` centralizes parent and learner student ownership checks.
- `ensure_assessment_access` checks an assessment through its linked student.

Streamlit also hides irrelevant pages, but the backend remains the source of truth.

## Parent User Flow

1. Parent registers with full name, email, and password.
2. Backend hashes the password and creates a parent user.
3. Parent logs in and receives a JWT.
4. Parent creates learner profiles.
5. Parent creates learner login accounts linked to individual student profiles.
6. Parent can generate revision, mark answers, generate lessons, and view progress for their own children only.

## Learner User Flow

1. Learner logs in with username and password.
2. Backend verifies the learner account and returns a JWT.
3. Learner sees only learner-safe Streamlit pages.
4. Learner can generate revision for their own student profile.
5. Learner can generate coding and spiritual lessons for their own grade.
6. Learner can view only their own progress.
7. Learner cannot create students, create learner accounts, access parent summaries, or submit marking.

## JWT Authentication

The project uses HMAC SHA-256 JWTs implemented with the Python standard library.

Token payload:

```json
{
  "sub": "user_id",
  "role": "parent",
  "exp": 1790000000
}
```

Settings come from environment variables:

- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`

Passwords are never stored in plain text. They are hashed with PBKDF2-SHA256 and a per-password random salt.

## Manual Test Steps

1. Set `USE_MOCK_AI=true` in `.env`.
2. Start FastAPI.
3. Start Streamlit.
4. Register a parent.
5. Create a learner.
6. Create a learner login.
7. Generate revision as the parent.
8. Mark the generated assessment as the parent.
9. View progress as the parent.
10. Log out.
11. Log in as the learner.
12. Confirm the learner only sees learner-safe pages.
13. Generate learner revision.
14. View learner progress.
15. Confirm learner cannot access marking or learner management in the UI.

## Smoke Test

Start FastAPI, then run:

```bash
python smoke_auth_flow.py
```

This validates the core API authorization boundaries without invoking OpenAI generation.
