# Containerization (Implementation)

## Table of Contents

- [Overview](#overview)
- [Containerization Steps](#containerization-steps)
- [Infrastructure as Code](#infrastructure-as-code-docker-compose)
- [Network and Storage](#network-and-storage)
- [How to Run](#how-to-run)


## Overview

The practical part of Lab 2 focuses on containerizing the 3-tier architecture from Lab 1: Nginx (Reverse Proxy), Node.js Web App, and MariaDB.


## Containerization Steps

1. Web App Dockerfile: Created `app/Dockerfile` using `node:20-alpine`. Implemented multi-stage builds:
   - Stage 1 (Builder): Installs dependencies and compiles TypeScript.
   - Stage 2 (Production): Copies only compiled artifacts (`dist/`, `views/`) and production dependencies, significantly reducing the final image size.
2. Nginx Configuration: Added `nginx/nginx.conf` for the reverse proxy. It listens on port 80 and forwards traffic to the internal Web App container (`proxy_pass http://webapp;`).
3. MariaDB: Integrated the official `mariadb:10.11` image. Database credentials and initialization parameters are injected via environment variables.


## Infrastructure as Code (Docker Compose)

The full application stack is described declaratively in `docker-compose.yml`.

- Declarative Links: Enforced startup order using `depends_on` (Nginx depends on Web App, Web App depends on MariaDB).
- Environment Uniformity: Guarantees identical execution environments across local development and production servers.
- Automated Migrations: The Web App container's entry command (`node dist/migrate.js && node dist/index.js`) executes database migrations before starting the HTTP server, ensuring required tables exist.

## Network and Storage

### Custom Bridge Network (`app_network`)

- Security: Only the Nginx service publishes port 80 to the host. The Web App and Database containers do not map any host ports, keeping them isolated and inaccessible from the outside.
- Internal DNS: Containers communicate using internal hostnames (`http://webapp` in Nginx, `DB_HOST=db` in Node.js) provided by Docker's built-in service discovery.

### Docker Volumes (`db_data`)

- Data Persistence: A named volume `db_data` is mounted to `/var/lib/mysql` inside the MariaDB container. This guarantees that all database records persist across container restarts, removals, and system reboots.


## How to Run

To build and start all containers:

```bash
docker-compose up -d --build
```

The application will be available at `http://localhost:3000`.

<img width="598" height="233" alt="Screenshot 2026-05-16 at 16 41 16" src="https://github.com/user-attachments/assets/b417973c-be62-4633-8b89-d614f02ecd43" />

> **Note:** The research part of Laboratory Work №2 (analysis of layer caching, multi-stage builds, alpine vs debian) is available in a separate repository: [https://github.com/AnnKuts/2-course-devops-lab2-research](https://github.com/AnnKuts/2-course-devops-lab2-research)
