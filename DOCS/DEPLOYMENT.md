# Deployment Guide

**Nebula Chat** can be deployed using Docker containers for easy portability and consistent environments.

## Prerequisites

- Docker Engine 20.10+ and Docker Compose 2.0+
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- (Optional) Redis server (included in docker-compose)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/AfyKirby1/Nebula-Chat.git
cd Nebula-Chat
```

### 2. Set Environment Variables

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_api_key_here
REDIS_URL=redis://redis:6379
```

**Note**: The `REDIS_URL` in docker-compose uses the service name `redis`, so it should be `redis://redis:6379` when running in Docker.

### 3. Build and Run with Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the Nebula Chat application
- Start Redis container
- Start the application container
- Set up networking between containers

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Docker Compose Services

### Application Service (`app`)
- **Port**: 3000
- **Image**: Built from local Dockerfile
- **Dependencies**: Redis (waits for Redis to be healthy)
- **Environment**: 
  - `GOOGLE_API_KEY` (required)
  - `REDIS_URL` (optional, defaults to `redis://redis:6379`)
  - `NODE_ENV=production`

### Redis Service (`redis`)
- **Port**: 6379 (exposed for debugging, but app uses internal network)
- **Image**: `redis:7-alpine`
- **Volume**: Persistent data storage (`redis-data`)
- **Health Check**: Ensures Redis is ready before app starts

## Production Deployment

### Environment Variables

For production, set environment variables securely:

```bash
# In your deployment environment
export GOOGLE_API_KEY=your_production_key
```

Or use Docker secrets or your cloud provider's secret management.

### Building the Image

```bash
docker build -t nebula-chat:latest .
```

### Running Standalone

```bash
docker run -d \
  --name nebula-chat \
  -p 3000:3000 \
  -e GOOGLE_API_KEY=your_key \
  -e REDIS_URL=redis://your-redis-host:6379 \
  nebula-chat:latest
```

### With External Redis

If you have a managed Redis service:

```bash
docker run -d \
  --name nebula-chat \
  -p 3000:3000 \
  -e GOOGLE_API_KEY=your_key \
  -e REDIS_URL=redis://your-redis-host:6379 \
  nebula-chat:latest
```

## Dockerfile Details

The Dockerfile uses a multi-stage build:

1. **deps**: Installs npm dependencies
2. **builder**: Builds the Next.js application
3. **runner**: Creates minimal production image with only necessary files

This results in a smaller final image (~200MB vs ~1GB with all dependencies).

## Health Checks

Both services include health checks:
- **Redis**: Checks connectivity with `redis-cli ping`
- **App**: Checks HTTP endpoint `/api/models`

View health status:
```bash
docker-compose ps
```

## Logs

View application logs:
```bash
docker-compose logs -f app
```

View Redis logs:
```bash
docker-compose logs -f redis
```

## Stopping Services

```bash
docker-compose down
```

To remove volumes (clears Redis data):
```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, modify `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Use 3001 instead
```

### Redis Connection Issues

Ensure the `REDIS_URL` uses the service name `redis` when running in docker-compose:
```env
REDIS_URL=redis://redis:6379
```

For external Redis, use the actual hostname/IP:
```env
REDIS_URL=redis://your-redis-host:6379
```

### Build Failures

Clear Docker cache and rebuild:
```bash
docker-compose build --no-cache
```

### Missing Environment Variables

Ensure `.env` file exists and contains `GOOGLE_API_KEY`:
```bash
cat .env
```

## Updating the Application

1. Pull latest changes:
   ```bash
   git pull
   ```

2. Rebuild and restart:
   ```bash
   docker-compose up -d --build
   ```

## Backup and Restore

### Redis Data

Redis data is stored in a Docker volume. To backup:

```bash
docker run --rm -v nebula-chat_redis-data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz /data
```

To restore:
```bash
docker run --rm -v nebula-chat_redis-data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/redis-backup.tar.gz"
```

## Security Notes

- **CRITICAL**: Always use the latest patched version of Next.js (currently 16.0.7+)
  - See [SECURITY.md](../SECURITY.md) for current security advisories
  - CVE-2025-66478 was patched in Next.js 16.0.7
- Never commit `.env` files to git
- Use Docker secrets or environment variable management in production
- Keep Docker images updated for security patches
- Consider using a reverse proxy (nginx/traefik) for production
- Enable HTTPS in production environments
- Rotate API keys and secrets regularly, especially after security updates

## Scaling

For horizontal scaling, you can run multiple app instances behind a load balancer. Ensure Redis is accessible to all instances:

```bash
docker-compose up -d --scale app=3
```

## Support

For issues or questions, see the main [README.md](../README.md) or open an issue on GitHub.

