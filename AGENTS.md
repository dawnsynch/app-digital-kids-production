# Digital Kids Assistant - Codex Instructions

## Project Context

This is a Python-based AI learning platform for children.

Current stack:
- FastAPI backend
- Streamlit frontend
- SQLite database
- SQLAlchemy ORM
- OpenAI API
- Mock AI mode for local testing

The platform supports:
- CBC Kenya revision for Grade 5, 6, and 7
- Coding / AI lessons
- Spiritual guide lessons
- Parent dashboard
- Learner progress tracking

## Engineering Rules

- Keep the solution simple and MVP-friendly.
- Use FastAPI dependencies for authentication and authorization.
- Use SQLAlchemy models and sessions consistently.
- Use Pydantic schemas for request and response validation.
- Keep Streamlit UI simple and readable.
- Do not expose password hashes in API responses.
- Do not hardcode secrets.
- Preserve mock AI mode.
- Preserve existing AI features.
- Prefer clear error messages.
- Add or update README when making major changes.

## Security Rules

- Parent users can only access their own children.
- Learner users can only access their own student profile.
- Learners must not access parent-only features.
- Role checks must be enforced in backend APIs, not only hidden in the UI.
- Passwords must be hashed.
- JWT secrets must come from environment variables.
- Never log passwords or tokens.

## Testing Rules

After changes, verify:
- Parent registration
- Parent login
- Child creation
- Learner account creation
- Learner login
- Parent-only API protection
- Learner-only scoped access
- Existing revision generation
- Existing marking flow
- Existing coding lesson flow
- Existing spiritual guide flow