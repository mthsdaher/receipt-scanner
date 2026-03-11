# Production Deployment (Docker Compose)

This repository is prepared for production-oriented deployment using:

- `docker-compose.yml` as the base stack
- `docker-compose.prod.yml` as production overrides
- `.env.docker` for secrets/runtime configuration

## 1) Prepare environment file

```bash
cp .env.docker.example .env.docker
```

Set strong values, especially:

- `JWT_SECRET`
- `FRONTEND_URL`
- `FRONTEND_URLS`
- `POSTGRES_PASSWORD`

## 2) Start production profile

```bash
docker compose --env-file .env.docker -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 3) Verify health

- Frontend: `http://<server-ip>/`
- Backend health: `http://<server-ip>/health`
- Backend readiness: `http://<server-ip>/ready`

## 4) Operational commands

Tail logs:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

Restart a service:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

Stop stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Security notes

- In production profile, only `frontend` exposes a host port.
- `backend`, `ocr`, and `postgres` remain internal to the Docker network.
- Services use healthchecks + `restart: unless-stopped`.
- Backend and OCR containers run as non-root users.
