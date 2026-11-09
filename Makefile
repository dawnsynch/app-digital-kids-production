.PHONY: install api web legacy test test-backend test-frontend docker-up docker-down

install:
	python3 -m venv .venv
	. .venv/bin/activate && pip install -r requirements.txt
	cd frontend && npm ci

api:
	. .venv/bin/activate && uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

web:
	cd frontend && npm run dev

legacy:
	. .venv/bin/activate && streamlit run legacy/streamlit/frontend/streamlit_app.py

test: test-backend test-frontend

test-backend:
	. .venv/bin/activate && python -m pytest -q

test-frontend:
	cd frontend && npm run test:unit
	cd frontend && npm run build

docker-up:
	docker compose up --build

docker-down:
	docker compose down

