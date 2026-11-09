# Current Site Status

## Overview

Digital Kids Assistant is currently an authenticated Phase 1 MVP for guided parent-child learning.

The application supports:

- Parent accounts
- Learner accounts
- Admin accounts
- Revision generation and marking
- Coding / AI lesson generation
- Spiritual guide lesson generation
- Hobbies & Creativity activity generation
- Learner progress tracking
- Learning interaction tracking

## Current Tech Stack

- Backend: FastAPI
- Frontend: Streamlit
- Database: SQLite
- ORM: SQLAlchemy
- Settings: `pydantic-settings`
- Authentication: JWT bearer tokens
- Password security: PBKDF2-SHA256 with salted hashes
- AI integration: OpenAI Responses API
- Offline/local fallback: Mock AI mode
- Deployment assets: Docker, Docker Compose, Nginx templates, backup/restore scripts

## Authentication and Roles

### Parent

- Can sign up through the public UI
- Can log in with email and password
- Can create and manage only their own learners
- Can generate revision for their own children
- Can mark learner revision answers
- Can generate Coding / AI, Spiritual Guide, and Hobbies activities for their own children
- Can view progress and tracked learning interactions for their own children

### Learner

- Can log in with username and password created by a parent
- Can access only learner-safe pages
- Can generate revision only for their own profile
- Can submit revision answers for parent review
- Can generate Coding / AI, Spiritual Guide, and Hobbies activities for their own profile
- Can view only their own progress and recent learning interactions
- Cannot create children, mark revision, or access parent/admin pages

### Admin

- Cannot be created through public signup
- Is created locally through `scripts/create_admin.py`
- Can log in with email and password
- Can view platform-wide parents, learners, students, progress, assessments, and learning/module interactions
- Does not receive password hashes in admin API responses

## Implemented Learning Modules

### Revision

- Generate CBC-style revision questions
- Store assessment attempts
- Submit learner answers
- Parent-only AI marking
- Track score, total marks, percentage, and question-level feedback

### Coding / AI Lesson

- Generate age-appropriate coding and AI lessons
- Structured lesson output with explanation, activity, quiz, and parent notes
- Tracked as a learning interaction

### Spiritual Guide

- Generate child-friendly spiritual lessons
- Structured output with Bible reference, story lesson, reflection questions, activity, and prayer
- Tracked as a learning interaction

### Hobbies & Creativity

- Categories: Music, Drawing, Creativity
- Supports difficulty, available time, available materials, and activity type
- Structured output with title, objective, materials, steps, estimated time, reflection questions, parent involvement, and follow-up activity
- Tracked as a learning interaction

## Progress and Tracking

The system currently tracks two kinds of learner activity:

- Revision assessment attempts
- Non-revision learning interactions

Tracked interaction modules:

- `coding_ai`
- `spiritual_guide`
- `hobbies_creativity`

Tracked interaction statuses:

- `generated`
- `assigned`
- `completed`
- `reviewed`

Parent, learner, and admin views expose progress according to role permissions.

## API Surface Implemented

Main backend route groups currently in use:

- `/auth`
- `/students`
- `/revision`
- `/learning`
- `/hobbies`
- `/learning-interactions`
- `/progress`
- `/admin`
- `/health`

## Frontend Status

The Streamlit frontend currently includes:

- Login and parent signup
- Role-based navigation for parent, learner, and admin
- Parent dashboards and learner management
- Learner-safe revision and lesson views
- Admin reporting pages
- Progress bars, status messages, helper text, and structured result cards/tables

## Deployment Readiness Status

The repository now also contains production-preparation assets:

- `compose.yaml`
- Hardened Dockerfiles
- Streamlit production config
- Nginx templates
- Backup and restore scripts
- Deployment validation script
- Deployment readiness assessment
- Server deployment guide

## Current Limitations

- SQLite is still the active database for MVP and first deployment
- No password reset flow yet
- JWT logout is client-side only
- Full production rate limiting is not implemented yet
- Automated pytest coverage has started but is not yet comprehensive
- Parent marking remains the only marking flow for revision

## Current Position

The site is beyond a bare MVP. It now functions as an authenticated multi-role learning assistant with tracked revision and non-revision activities, admin oversight, and initial production deployment assets, while still retaining a simple SQLite-based Phase 1 architecture.
