# Project Instructions

## Project

TravelBlog is a personal travel diary: users record trips with places on a map, photos, and notes, see their routes
and visited countries, and keep a wishlist of destinations. It is a group project of three people in a Java + React
course.

## Project Structure

- `/frontend` — React frontend application
- `/backend` — Spring Boot backend application
- `/docs` — project requirements and documentation
- `/project-templates` — the template from which `docs/deployment.md` was made
- `TravelBlog – Seitenentwürfe.html` — page mockups (trip overview, trip detail, world map, wishlist)

## Documentation

- `docs/requirements.md` — what the application should do. Read the relevant sections before implementing a feature.
- `docs/architecture.md` — architecture decisions and their reasons. Update it when a decision changes.
- `docs/deployment.md` — how the application is deployed on Render, with the secrets and environment variables.
- `docs/memory.md` — local only (gitignored). Working agreements and a short, dated history of decisions.

If a requested change conflicts with these documents, point out the conflict before implementing it.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- axios
- oxlint
- Tailwind CSS v4
- Leaflet with OpenStreetMap tiles, through react-leaflet

### Backend

- Java 25
- Spring Boot 4.1.2
- Maven
- Lombok
- Spring Web MVC
- Spring Validation
- Spring Data MongoDB
- Spring Security with JWT login tokens (jjwt)

### Infrastructure

- MongoDB
- GitHub Actions (`.github/workflows/`): pushes to branches other than `main` build and test the backend
  (`maven.yml`); on every pull request and push to `main` the backend is built, tested, and analyzed with SonarQube
  Cloud (`build_backend.yml`), the frontend is analyzed (`build_frontend.yml`), and pushes to `main` are deployed
  (`deploy.yml`). Details in
  `docs/architecture.md` → CI and Code Quality
- The frontend has no automated tests (not part of the course); its checks are lint, type check, and build
- External services, all free and without an API key: OpenStreetMap tiles, Nominatim (place search), Wikipedia
  (first sentences of the article about a stop's place)
- Deployment: on every push to `main`, `deploy.yml` builds one Docker image (backend with the frontend inside),
  pushes it to Docker Hub, and starts a deploy on Render. Details in `docs/deployment.md`

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
- The user interface is in German (the default) and English; the user switches with "DE | EN" in the header. All
  texts are in `frontend/src/i18n/texts.ts` (German and English side by side) and in the backend's
  `messages.properties` and `messages_en.properties`. A new text goes into both languages; no text is written directly into a component.
- Colors come from the theme tokens in `frontend/src/index.css`, which have a light and a dark value. Do not use fixed
  colors like `text-white` or `bg-red-50` in components, except on surfaces that are always dark (e.g. the photo
  viewer).
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

## Code Quality (SonarQube)

- New and changed code must not have SonarQube issues. The team checks with SonarQube for IDE in IntelliJ; the same
  rules decide the Quality Gate on pull requests.
- Fix an issue in the code rather than suppressing it; if a rule really does not fit, explain why in the pull request.
- Rules that came up in this project:
  - React component props are read-only: `function TripCard({trip}: Readonly<TripCardProps>)`.
  - Use semantic elements instead of ARIA roles, e.g. `<fieldset>` with `<legend>` instead of `<div role="group">`.
  - Make spacing in JSX explicit: text next to an element goes into its own element, e.g.
    `<span aria-hidden="true">+</span><span>Neue Reise</span>`.
  - Promises are never left floating: `void navigate('/trips')`; an async handler is passed as
    `onSubmit={(event) => void handleSubmit(event)}` and handles its errors itself with `try`/`catch`.
  - Use `SubmitEvent<HTMLFormElement>` for form submit handlers; `FormEvent` is deprecated in the React types.
  - A component returns the same type on every path, e.g. `return <>{children}</>` instead of `return children` next
    to `return <Navigate … />`.

## Security

- Never commit secrets, credentials, API keys, private keys, or `.env` files.
- Never print secrets or private keys in logs or command output.
- Never expose credentials in source code.
- Never modify or expose SSH private keys.
- Use environment variables or local configuration for secrets. The backend needs `MONGODB_URI` and `JWT_SECRET`
  (see `README.md`).

## Verification

After making changes:

- Run relevant frontend type checks, linting, and builds.
- Run relevant backend tests and builds.
- Verify both frontend and backend when a change affects their integration.
- Do not consider a task complete if relevant verification fails.
- Check new and changed files with SonarQube for IDE (see Code Quality).
- A pull request is ready to merge only when the CI build and the SonarQube Quality Gate have passed.

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
