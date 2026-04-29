# Snipli — Production-Grade URL Shortener

A high-performance URL shortener service built with **Java 21** and **Spring Boot 3**, designed to run on **Google Cloud Platform**.

## Features

- **Short code generation** — 7-character Base62 codes via `SecureRandom` with collision detection
- **Custom aliases** — optional user-defined short codes
- **HTTP 301 redirects** — with Redis-backed caching (24h TTL)
- **Async click analytics** — via Google Cloud Tasks (non-blocking)
- **Link expiration** — optional ISO-8601 expiry with `410 Gone` responses
- **Stats endpoint** — total clicks, timestamps, per-link analytics
- **API key auth** — via `X-Api-Key` header (Secret Manager in production)

## Tech Stack

| Layer            | Technology                           |
|------------------|--------------------------------------|
| Language         | Java 21 (records, sealed types)      |
| Framework        | Spring Boot 3.x                      |
| Database         | Google Cloud Firestore (native mode) |
| Cache            | Google Cloud Memorystore — Redis 7   |
| Async Queue      | Google Cloud Tasks                   |
| Container        | Google Cloud Run                     |
| CI/CD            | Google Cloud Build                   |
| Build Tool       | Gradle (Kotlin DSL)                  |

## API Endpoints

| Method | Path                          | Auth     | Description              |
|--------|-------------------------------|----------|--------------------------|
| POST   | `/api/v1/links`               | API Key  | Create a short link      |
| GET    | `/{code}`                     | Public   | Redirect (301)           |
| GET    | `/api/v1/links/{code}/stats`  | API Key  | Get link statistics      |
| POST   | `/internal/tasks/record-click`| Internal | Cloud Tasks click handler|
| GET    | `/health`                     | Public   | Health check             |

## Local Development

### 1. Start infrastructure

```bash
docker-compose up -d
```

This starts:
- **Firestore emulator** on port `8081`
- **Redis 7** on port `6379`

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Run the application

```bash
# Point to Firestore emulator
export FIRESTORE_EMULATOR_HOST=localhost:8081

# Run with Gradle
./gradlew bootRun
```

The API will be available at `http://localhost:8080`.

### 4. Test it

```bash
# Create a short link
curl -X POST http://localhost:8080/api/v1/links \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: your-api-key-here" \
  -d '{"url": "https://example.com/very/long/url"}'

# Follow the redirect
curl -v http://localhost:8080/{shortCode}

# Check stats
curl http://localhost:8080/api/v1/links/{shortCode}/stats \
  -H "X-Api-Key: your-api-key-here"
```

### 5. Run tests

```bash
./gradlew test
```

## Deployment

The project includes a `cloudbuild.yaml` for automated CI/CD:

1. Run unit tests
2. Build Docker image
3. Push to Artifact Registry
4. Deploy to Cloud Run

Trigger a deployment by pushing to your connected Cloud Build repository.
