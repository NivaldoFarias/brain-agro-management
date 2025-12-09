# Docker Deployment Guide

This guide explains how to build and run the Brain Agriculture API using Docker and Docker Compose.

## Prerequisites

- Docker Engine 24.0+ or Docker Desktop
- Docker Compose v2.20+

## Quick Start

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration. Key variables for Docker:

```env
NODE_ENV=production
API__PORT=3000
API__JWT_SECRET=your-secure-secret-key-minimum-32-characters
API__CORS_ORIGIN=http://localhost:5173
API__SEED_DATABASE=false
```

### 2. Build and Run

```bash
# Build and start services
bun run docker:build
bun run docker:up

# View logs
bun run docker:logs

# Stop services
bun run docker:down

# Remove volumes (deletes database)
bun run docker:clean
```

### 3. Verify Deployment

- API Health: http://localhost:3000/api/health
- API Documentation: http://localhost:3000/reference

## Architecture

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimization:

1. **Builder Stage**: Installs dependencies and builds the application
2. **Production Stage**: Creates minimal runtime image with only production dependencies

### Directory Structure in Container

```
/app/
├── apps/api/
│   ├── dist/            # Built application
│   ├── src/database/    # Migration files
│   ├── data/            # SQLite database (volume mount)
│   └── logs/            # Application logs (volume mount)
├── packages/shared/
│   └── dist/            # Shared utilities
└── node_modules/        # Production dependencies
```

## Configuration

### Environment Variables

All environment variables use the `API__` prefix convention:

| Variable                    | Default                   | Description                      |
| --------------------------- | ------------------------- | -------------------------------- |
| `NODE_ENV`                  | `production`              | Runtime environment              |
| `API__PORT`                 | `3000`                    | Server port (internal)           |
| `API__BASE_PATH`            | `/api`                    | API base path                    |
| `API__LOG_LEVEL`            | `info`                    | Logging level                    |
| `API__LOG_TO_CONSOLE`       | `true`                    | Enable console logging           |
| `API__DATABASE_PATH`        | `./apps/api/data/agro.db` | SQLite database path             |
| `API__DATABASE_LOGGING`     | `false`                   | Enable SQL query logging         |
| `API__DATABASE_SYNCHRONIZE` | `false`                   | Auto-sync schema (never in prod) |
| `API__CORS_ORIGIN`          | `http://localhost:5173`   | Allowed CORS origin              |
| `API__THROTTLE_TTL_MS`      | `60000`                   | Rate limit window (ms)           |
| `API__THROTTLE_LIMIT`       | `100`                     | Max requests per window          |
| `API__JWT_SECRET`           | (required)                | JWT signing secret (32+ chars)   |
| `API__JWT_EXPIRATION`       | `1h`                      | JWT token expiration             |
| `API__SEED_DATABASE`        | `false`                   | Seed database on startup         |

### Volumes

Persistent data is stored in named Docker volumes:

- `brain-ag-api-data`: SQLite database files
- `brain-ag-api-logs`: Application logs

### Network

Services communicate through the `brain-ag-network` bridge network.

## Development Mode

For development with hot reload:

1. Uncomment volume mount in `docker-compose.yml`:

```yaml
volumes:
  - api-data:/app/apps/api/data
  - api-logs:/app/apps/api/logs
  - ./apps/api/src:/app/apps/api/src:ro # Enable this line
```

2. Rebuild and restart:

```bash
docker compose up -d --build
```

## Production Deployment

### Security Checklist

- [ ] Set strong `API__JWT_SECRET` (32+ characters)
- [ ] Configure specific `API__CORS_ORIGIN` (not `*`)
- [ ] Set `API__DATABASE_SYNCHRONIZE=false`
- [ ] Set `API__SEED_DATABASE=false`
- [ ] Review and adjust rate limiting (`API__THROTTLE_*`)
- [ ] Enable HTTPS/TLS via reverse proxy
- [ ] Configure firewall rules
- [ ] Set up log rotation for volume mounts

### Recommended Proxy Configuration (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## NPM Scripts Reference

All Docker operations are available as npm scripts in `package.json`:

| Script           | Command                                            | Description                              |
| ---------------- | -------------------------------------------------- | ---------------------------------------- |
| `docker:build`   | `docker compose build`                             | Build Docker images                      |
| `docker:up`      | `docker compose up -d`                             | Start services in detached mode          |
| `docker:down`    | `docker compose down`                              | Stop and remove services                 |
| `docker:restart` | `docker compose restart`                           | Restart services                         |
| `docker:logs`    | `docker compose logs -f`                           | Show and follow logs                     |
| `docker:status`  | `docker compose ps`                                | Show service status                      |
| `docker:shell`   | `docker compose exec api sh`                       | Open shell in API container              |
| `docker:health`  | `curl -f http://localhost:3000/api/health`         | Check API health endpoint                |
| `docker:clean`   | `docker compose down -v && docker system prune -f` | Remove all containers, volumes, and data |
| `docker:backup`  | `docker compose exec -T api cat ...`               | Backup database to timestamped file      |
| `docker:migrate` | `docker compose exec api bun run migration:run`    | Run database migrations                  |
| `docker:seed`    | `docker compose exec api bun run db:seed`          | Seed database with sample data           |
| `docker:stats`   | `docker stats --no-stream brain-ag-api`            | Show container resource usage            |

### Usage Examples

```bash
# Quick start
bun run docker:build
bun run docker:up
bun run docker:health

# View logs
bun run docker:logs

# Backup database
bun run docker:backup

# Clean everything
bun run docker:clean
```

## Troubleshooting

### Container Won't Start

Check logs:

```bash
bun run docker:logs
```

### Health Check Failing

Verify health endpoint:

```bash
bun run docker:health
```

### Database Issues

Reset database:

```bash
bun run docker:clean
bun run docker:up
```

### Build Failures

Clean rebuild:

```bash
bun run docker:down
bun run docker:build
bun run docker:up
```

## Monitoring

### View Logs

```bash
# Follow all logs
bun run docker:logs

# Last 100 lines (direct docker compose)
docker compose logs --tail=100 api
```

### Container Stats

```bash
bun run docker:stats
```

### Inspect Container

```bash
bun run docker:shell
```

## Backup and Restore

### Backup Database

```bash
bun run docker:backup
# Creates: backup-YYYYMMDD-HHMMSS.db
```

### Restore Database

```bash
docker cp ./backup.db brain-ag-api:/app/apps/api/data/agro.db
bun run docker:restart
```

## Performance Optimization

1. **Resource Limits**: Add to `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      memory: 256M
```

2. **Use BuildKit**:

```bash
DOCKER_BUILDKIT=1 docker compose build
```

3. **Multi-Platform Builds**:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t brain-ag-api .
```

## CI/CD Integration

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically:

- Builds and tests the application on push/PR
- Builds and pushes Docker images to GitHub Container Registry
- Runs on multiple platforms (linux/amd64, linux/arm64)

See `.github/workflows/ci.yml` for the complete configuration.

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Bun Docker Guide](https://bun.sh/docs/install/docker)
- [NestJS Production Guide](https://docs.nestjs.com/faq/deployment)
