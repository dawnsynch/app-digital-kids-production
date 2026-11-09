# Architecture and provenance

## Validated sources

| Source | Observed state | Imported content |
| --- | --- | --- |
| Repository A: `digital-kids-assistant/digital-kids-assistant-phase1` | Git repository on `main`, tracking `origin/main`; observed HEAD `a054b80 fixed recurring bugs`; clean tracked worktree at inspection | FastAPI app, SQLAlchemy models, services, tests, Python dependencies, scripts, deployment references, Streamlit reference, marketing assets, SQLite snapshot |
| Repository B: `digital-kids-asssitant` | Directory is **not** a Git worktree; no commit, branch, remote, or history was available | React/Vite source, TypeScript configuration, assets, branding, routes, UI components, Playwright tests, design references, package lock |
| Destination: `digital-kids-learning-platform-ui-backend` | Existing directory was not a Git worktree and contained only `.github/deploy.yml` plus Finder metadata | Consolidated structure; the incomplete workflow was replaced by a workflow matching API + React images |

No Repository B or destination Git history was inferred. The misspelling in the Repository B directory name is retained only here as observed provenance.

## Runtime shape

```text
Browser
  -> React/Vite (development :5173; container :8080)
       -> typed client at frontend/src/api
       -> /api proxy
  -> FastAPI (:8000)
       -> SQLAlchemy
       -> SQLite in ./data
       -> OpenAI service or preserved mock-AI fallback

Legacy Streamlit (:8501, optional)
  -> FastAPI (:8000)
```

## Configuration conflict resolutions

| Conflict | Resolution |
| --- | --- |
| Repository A used `frontend/` for Streamlit; Repository B used the frontend role for React | React owns `frontend/`; Streamlit moved intact to `legacy/streamlit/` |
| Old UI Docker image served Streamlit on 8501 | `frontend/Dockerfile` now builds/serves React; `Dockerfile.legacy-streamlit` preserves the former UI separately |
| React dev server and Streamlit require different CORS origins | FastAPI defaults include ports 5173 and 8501; `ALLOWED_ORIGINS` remains configurable |
| Browser cannot resolve Docker service name `api` | Browser calls same-origin `/api`; Vite and Nginx proxy that path to FastAPI |
| React History API routes require fallback | Nginx uses `try_files ... /index.html` |
| Existing deployment workflow expected `Dockerfile.ui` | Workflow now produces `api` and `web` images from the consolidated Dockerfiles |
| SQLite data must survive consolidation | Original files remain at the source; a byte-for-byte snapshot was placed in destination `data/` and is Git-ignored; Docker uses a bind mount and has no reset step |

## Scope boundaries

- No learning algorithm, authorization rule, route contract, model, or AI service was replaced.
- React demo-only flows remain demo-only until an explicit integration milestone.
- SQLite remains the active database.
- The PostgreSQL work is documentation only.
- Design reference images and frontend test suites are retained under `frontend/`.

