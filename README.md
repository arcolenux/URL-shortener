# Snipli — Production-Grade URL Shortener & Link Infrastructure

[![Live Website](https://img.shields.io/badge/Live%20Demo-snipli--url.vercel.app-blue?style=for-the-badge&logo=vercel)](https://snipli-url.vercel.app)
[![API Status](https://img.shields.io/badge/Backend%20API-Render%20Live-success?style=for-the-badge&logo=render)](https://snipli-backend.onrender.com/actuator/health)
[![Java](https://img.shields.io/badge/Java%2021-Spring%20Boot%203-orange?style=for-the-badge&logo=openjdk)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js%2016-TypeScript%20%2B%20Tailwind-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Firestore%20Native-4285F4?style=for-the-badge&logo=googlecloud)](https://cloud.google.com/firestore)

> **Snipli** is a modern, production-grade URL shortener and link infrastructure platform built with **Java 21 (Spring Boot 3)**, **Next.js (TypeScript / Tailwind CSS)**, **Google Cloud Firestore**, and **Upstash Redis**.

---

## 🌐 Live Production Links

- **Web Application**: [https://snipli-url.vercel.app](https://snipli-url.vercel.app)
- **Backend API (Render)**: [https://snipli-backend.onrender.com](https://snipli-backend.onrender.com)
- **API Health Check**: [https://snipli-backend.onrender.com/actuator/health](https://snipli-backend.onrender.com/actuator/health)

---

## 🚀 Key Features

- **⚡ Sub-12ms Edge Redirects**: High-velocity redirection path resolves through Upstash Redis cache first before falling back to Firestore.
- **🔐 Enterprise Authentication**: Secure BCrypt password hashing + HMAC-SHA512 JWT tokens with automatic session management.
- **📊 Real-Time Telemetry & Analytics**: Live click charts, daily aggregated trends, and clean zero-state metric tracking.
- **🛡️ Link Lifecycle & Expirations**: Custom aliases, custom expiration timestamps, and instant link editing/deletions.
- **📱 Responsive Design & QR Codes**: Dynamic QR code generator, copy-to-clipboard badges, and mobile-responsive UI.
- **🔄 Proactive Backend Warm-Up**: Automatic background pinging and resilient cold-start retry handling to wake free-tier services seamlessly.

---

## 🏛️ Architecture Overview

```text
                    ┌────────────────────────┐
                    │  Next.js 16 Web App    │
                    │   (Vercel Edge CDN)    │
                    └───────────┬────────────┘
                                │ HTTPS / JWT
                                ▼
                    ┌────────────────────────┐
                    │    Spring Boot API     │
                    │    Java 21 (Render)    │
                    └───────┬────────┬───────┘
                            │        │
                  hot path  │        │ source of truth
                            ▼        ▼
                      Upstash Redis  Google Cloud Firestore
                       (TLS Cache)     (Native Mode)
                            │
                            ▼
                    Sub-12ms 301 Redirect
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Java 21, Spring Boot 3.4.1, Gradle Kotlin DSL, Spring Data Redis, Spring Security Crypto, JJWT |
| **Database** | Google Cloud Firestore (Native Mode) |
| **Cache** | Upstash Serverless Redis (TLS / Lettuce Connection Factory) |
| **Hosting** | Vercel (Frontend Edge) & Render (Backend Docker Container) |
| **Testing** | JUnit 5, Spring Boot Test, Mockito, Playwright E2E |

---

## 📂 Repository Structure

```text
URL_shortener/
├── backend/                  # Spring Boot 3 + Java 21 REST API
│   ├── src/                  # Controller, Service, Model, DTO, Config layers
│   ├── build.gradle.kts      # Gradle Kotlin DSL build script
│   ├── gradlew / gradlew.bat # Gradle wrapper binaries
│   └── Dockerfile            # Production container build (Ubuntu Jammy + Temurin 21)
├── frontend/                 # Next.js 16 App Router Web Application
│   ├── src/                  # React components, dashboard, links, auth guard, api client
│   ├── e2e/                  # Playwright end-to-end test suite
│   ├── public/               # Brand SVGs and static assets
│   ├── package.json          # Dependencies & build scripts
│   └── Dockerfile            # Multi-stage standalone Next.js container
├── docker-compose.yml        # Local development infrastructure setup
└── README.md                 # Project documentation
```

---

## 🔌 API Reference

### Authentication Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/signup` | Public | Register a new user (`email`, `password`, `name`, optional `workspace`) |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user and receive JWT Bearer token |
| `GET` | `/api/v1/auth/me` | Bearer JWT | Get current authenticated user profile |

### Link Management & Analytics
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/links` | Bearer JWT | Create short link (`originalUrl`, optional `alias`, optional `expiresAt`) |
| `GET` | `/api/v1/links` | Bearer JWT | List and search links with pagination (`search`, `status`, `page`, `size`) |
| `GET` | `/api/v1/links/dashboard` | Bearer JWT | Fetch user dashboard metrics and 7-day click traffic graph |
| `GET` | `/api/v1/links/{code}` | Bearer JWT | Get specific short link details |
| `GET` | `/api/v1/links/{code}/stats`| Bearer JWT | Fetch link click counts and activity timestamps |
| `PUT` | `/api/v1/links/{code}` | Bearer JWT | Update destination URL or expiration date |
| `DELETE`| `/api/v1/links/{code}` | Bearer JWT | Delete short link and evict from Redis cache |
| `GET` | `/{code}` | Public | High-velocity 301 redirect / 410 gone |
| `GET` | `/actuator/health` | Public | Health status check |

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Java 21+** (`java -version`)
- **Node.js 20+** & **npm** (`node -v`)

### 2. Backend Setup
```bash
cd backend

# Create .env with your GCP project & Redis credentials
# Run the Spring Boot application
./gradlew bootRun
```
*Backend runs on `http://localhost:8080`.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🧪 Testing

### Backend Unit & Integration Tests
```bash
cd backend
./gradlew test
```

### Frontend Production Build & Typecheck
```bash
cd frontend
npm run build
```

---

## 📄 License
This project is open-source and available under the MIT License.
