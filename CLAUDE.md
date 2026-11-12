# Project Instructions

## Project

TravelBlog is a personal travel diary: users record trips with places on a map, photos, and notes, see their routes
and visited countries, and keep a wishlist of destinations. It is a group project of three people in a Java + React
course.

## Project Structure

- `/frontend` — React frontend application
- `/backend` — Spring Boot backend application
- `/docs` — project requirements and documentation
- `/project-templates` — the template for `docs/deployment.md`, to be filled in once the deployment target is decided
- `TravelBlog – Seitenentwürfe.html` — page mockups (trip overview, trip detail, world map, wishlist)

## Documentation

- `docs/requirements.md` — what the application should do. Read the relevant sections before implementing a feature.
- `docs/architecture.md` — architecture decisions and their reasons. Update it when a decision changes.
- `docs/memory.md` — local only (gitignored). Working agreements and a short, dated history of decisions.

There is no `docs/deployment.md` yet; the deployment target is not decided.

If a requested change conflicts with these documents, point out the conflict before implementing it.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- axios
- oxlint
- Tailwind CSS v4 (decided, not installed yet)
- Leaflet with OpenStreetMap tiles (decided, not installed yet)

### Backend

- Java 25
- Spring Boot 4.1.2
- Maven
- Lombok
- Spring Web MVC
- Spring Validation
- Spring Data MongoDB
- Spring Security (planned for login, not added yet)

### Infrastructure

- MongoDB
- GitHub Actions builds the backend on every push (`.github/workflows/maven.yml`)
- External services, all free and without an API key: OpenStreetMap tiles, Nominatim (place search)
- Deployment target: not decided

## Commands

### Backend (in `backend/`)

- Run tests: `./mvnw test`
- Build: `./mvnw clean package`
- Start locally: `./mvnw spring-boot:run`

### Frontend (in `frontend/`)

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Lint: `npm run lint`
- Build (includes type check): `npm run build`

## Architecture

- Keep business logic outside controllers.
- Use Controller → Service → Repository where applicable.
- Do not introduce layers or abstractions without a concrete reason.
- Frontend communicates with the backend through HTTP; all backend endpoints start with `/api`.
- During local development, the Vite development proxy forwards `/api` to `http://localhost:8080`.
- Every user sees and changes only their own data; the backend enforces this on every endpoint.
- The application is called TravelBlog in every language; the name is not translated.
- The user interface texts are in German for now; a language switch for the user is planned for a later version.
- Code, comments, and documentation are in English.

## Development Principles

- Prefer simple solutions over unnecessary abstractions.
- Inspect the existing codebase before introducing new patterns or dependencies.
- Prefer existing project conventions over personal preferences.
- Preserve existing functionality unless a change explicitly requires modifying it.
- Avoid unnecessary refactoring.
- Prefer incremental changes over large rewrites.
- Keep changes focused on the requested task.
- Do not modify unrelated code.
- Do not introduce new frameworks without discussing it first.
- Do not add new dependencies without a concrete reason.

## Security

- Never commit secrets, credentials, API keys, private keys, or `.env` files.
- Never print secrets or private keys in logs or command output.
- Never expose credentials in source code.
- Never modify or expose SSH private keys.
- Use environment variables or local configuration for secrets.

## Verification

After making changes:

- Run relevant frontend type checks, linting, and builds.
- Run relevant backend tests and builds.
- Verify both frontend and backend when a change affects their integration.
- Do not consider a task complete if relevant verification fails.

## Claude Code Workflow

- For non-trivial changes, first inspect the relevant code and propose an implementation plan.
- Wait for approval before implementing non-trivial changes.
- Small, obvious changes may be implemented directly when explicitly requested.
- Before implementing larger features, inspect the existing architecture and relevant requirements.
- Do not claim a task is complete without verifying the result.

## Git

- Keep changes logically focused.
- Do not modify Git history unless explicitly requested.
- Never commit changes unless explicitly requested.
- Never commit secrets.
- Three people work in this repository: work on a feature branch, not on `main`.
