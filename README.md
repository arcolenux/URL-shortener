# Snipli — Production-Grade URL Shortener & Link Infrastructure

Snipli is a high-velocity, production-grade URL shortener and link infrastructure platform built with **Java 21 (Spring Boot 3)** and **Next.js (React / TypeScript / Tailwind CSS)**, designed for zero-credential dependency deployment on **Google Cloud Platform**.

---

## Architecture Overview

```text
                    ┌────────────────────────┐
                    │       Next.js UI       │
                    │   TypeScript + React   │
                    └───────────┬────────────┘
                                │ HTTPS / API
                                ▼
                    ┌────────────────────────┐
                    │    Spring Boot API     │
                    │   Java 21 (Cloud Run)  │
                    └───────┬────────┬───────┘
                            │        │
                  hot path  │        │ source of truth
                            ▼        ▼
                         Redis    Firestore
                      (Memorystore)
                            │
                            │ async click task
                            ▼
                       Cloud Tasks
                            │
                            ▼
                    Internal Analytics
```

- **Redirect Hot Path (`GET /{code}`)**: Resolves through Redis first in sub-12ms, falling through to Firestore only on cache miss. Validates expiration and returns HTTP `301 Moved Permanently`.
- **Durable Asynchronous Analytics**: Dispatches click events via Google Cloud Tasks without blocking the client redirect latency.
- **Link Expiration & Custom Aliases**: Supports user-defined custom aliases and automatic expiration schedules with HTTP `410 Gone`.
- **Light-Mode First UI**: Clean SaaS design with Google Stitch tokens, real-time telemetry charts (Recharts), QR code generation, searchable link management, and responsive layouts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), TypeScript, React, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Java 21, Spring Boot 3.x, Gradle Kotlin DSL, Spring Data Redis, Actuator |
| **Database** | Google Cloud Firestore (Native Mode) |
| **Cache** | Google Cloud Memorystore (Redis 7) / Redis |
| **Queue** | Google Cloud Tasks |
| **Compute** | Google Cloud Run |
| **CI/CD** | Google Cloud Build & Google Artifact Registry |
| **Testing** | JUnit 5, Spring Boot Test, Mockito, Playwright E2E |

---

## Repository Structure

```text
snipli/
├── backend/                  # Spring Boot 3 + Java 21 REST API
│   ├── src/                  # Main and test source code
│   ├── build.gradle.kts      # Gradle Kotlin DSL build script
│   ├── settings.gradle.kts   # Project configuration
│   ├── gradlew / gradlew.bat # Gradle wrapper binaries
│   └── Dockerfile            # Multi-stage production container build
├── frontend/                 # Next.js App Router Web Application
│   ├── src/                  # React components, pages, hooks, and lib
│   ├── e2e/                  # Playwright end-to-end tests
│   ├── public/               # Static assets & brand SVGs
│   ├── package.json          # Dependencies & npm scripts
│   └── Dockerfile            # Multi-stage production container build
├── docker-compose.yml        # Local development infrastructure topology
├── cloudbuild.yaml           # Google Cloud Build CI/CD pipeline
├── .env.example              # Safe environment variable template
├── project.md                # Product & technical specification
├── design.md                 # Google Stitch visual design specification
├── instructions.md           # Engineering execution guidelines
└── README.md                 # Comprehensive project guide
```

---

## API Contract

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/links` | `X-Api-Key` | Create a short link (`url`, optional `alias`, optional `expiresAt`) |
| `GET` | `/api/v1/links` | `X-Api-Key` | Paginated search & status filtering (`search`, `status`, `page`, `size`) |
| `GET` | `/api/v1/links/dashboard` | `X-Api-Key` | Dashboard aggregations, totals, recent links, and click telemetry |
| `GET` | `/api/v1/links/{code}` | `X-Api-Key` | Get single short link metadata and status |
| `GET` | `/api/v1/links/{code}/stats`| `X-Api-Key` | Get click counts and timestamps for a short code |
| `DELETE`| `/api/v1/links/{code}` | `X-Api-Key` | Delete short link and evict from Redis cache |
| `GET` | `/{code}` | Public | High-performance redirect (`301 Moved Permanently` / `410 Gone` / `404`) |
| `POST` | `/internal/tasks/record-click` | Internal | Cloud Tasks worker for durable click recording |
| `GET` | `/health` | Public | Lightweight health check |

---

## Local Development Setup

### 1. Prerequisites
- **Java 21** (`java -version`)
- **Node.js 20+** & **npm** (`node -v`)
- **Docker** & **Docker Compose** (for emulator & Redis)

### 2. Start Local Infrastructure (Redis & Firestore Emulator)
```bash
docker-compose up -d firestore-emulator redis
```
This runs:
- **Firestore emulator** on port `8081`
- **Redis 7** on port `6379`

### 3. Run Backend (Port 8080)
```bash
cd backend

# Point to local emulator (PowerShell)
$env:FIRESTORE_EMULATOR_HOST="localhost:8081"
$env:GCP_PROJECT_ID="snipli-local"
$env:SNIPLI_API_KEY="snipli-dev-secret-key-12345"
$env:SNIPLI_BASE_URL="http://localhost:8080"

# Run Spring Boot
./gradlew bootRun
```

### 4. Run Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## Running Tests

### Backend Unit & Integration Tests (JUnit 5 + Mockito)
```bash
cd backend
./gradlew test
```

### Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

### Playwright End-to-End Tests
```bash
cd frontend
npx playwright test
```

---

## Google Cloud Production Deployment

Snipli is completely credential-independent and ready to deploy to any Google Cloud project.

### 1. Enable Google Cloud APIs
```bash
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  redis.googleapis.com \
  cloudtasks.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

### 2. Create Artifact Registry Repository
```bash
gcloud artifacts repositories create snipli \
  --repository-format=docker \
  --location=us-central1 \
  --description="Snipli Docker images"
```

### 3. Store Production API Key in Secret Manager
```bash
echo -n "YOUR_SECURE_API_KEY" | gcloud secrets create snipli-api-key --data-file=-
```

### 4. Deploy via Cloud Build
```bash
gcloud builds submit --config=cloudbuild.yaml
```

---

## Security & Performance Highlights
- **Least-Privilege Service Account**: Dedicated Cloud Run service account with `roles/datastore.user` and `roles/cloudtasks.enqueuer`.
- **No Client Secrets**: Frontend never receives administrative tokens or backend private keys.
- **Input Sanitization**: Strict scheme validation rejecting dangerous protocols (`javascript:`, `data:`, `file:`).
- **Graceful Degradation**: If Redis is temporarily unreachable, requests fall back directly to Firestore without downtime.
