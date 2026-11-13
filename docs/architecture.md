# Architecture Decisions

Decisions that complement `requirements.md`. Update this file when a decision changes.

## Deployment

- The deployment target is not decided (see `requirements.md` → Open Questions).
- During local development, the Vite dev server proxies `/api` to the backend on `http://localhost:8080`.
- Continuous integration and code analysis: see CI and Code Quality.

## CI and Code Quality

- GitHub Actions runs three workflows (`.github/workflows/`):
  - `maven.yml` (Java CI with Maven): builds and tests the backend with `mvn -B clean verify` on every push to a branch
    other than `main`, for feedback before a pull request is opened.
  - `build_backend.yml` (SonarQube_backend): on every pull request and push to `main`, builds and tests the backend,
    then analyzes it with SonarQube Cloud.
  - `build_frontend.yml` (SonarQube_frontend): on every pull request and push to `main`, runs `npm ci`,
    `npm run lint`, and `npm run build` (including the type check) in `frontend/`, then analyzes it with SonarQube
    Cloud. CI uses Node.js 22.
- `main` is not built by `maven.yml`, because `build_backend.yml` already builds and tests it.
- SonarQube Cloud is used because it was introduced in the course; it reports bugs, code smells, security hotspots,
  duplication, and test coverage, and comments the Quality Gate result on each pull request.
- Backend and frontend are two separate SonarQube Cloud projects in the organization `dinara-mfl`:
  `dinara-mfl_TravelBlog_backend` and `dinara-mfl_TravelBlog_frontend`.
- The workflows authenticate with the repository secret `SONAR_TOKEN`; the token is never committed.
- A pull request is merged only when its Quality Gate has passed.
- Backend coverage is measured with JaCoCo (`jacoco-maven-plugin` in `backend/pom.xml`); `mvn verify` writes the report
  to `backend/target/site/jacoco/jacoco.xml`.
- `build_backend.yml` first runs `mvn -B verify`, then the scan; the scanner gets the source, test, and class
  directories of `backend/` and the path of the JaCoCo report, so the analysis covers only the backend and includes
  coverage.
- The frontend has no automated tests: frontend testing is not part of the course. Frontend coverage is therefore
  excluded from the analysis (`sonar.coverage.exclusions=**/*`); lint, type check, and build are the frontend checks.

## Configuration & Secrets

- Secrets (e.g. the MongoDB connection string) are provided via environment variables.
- `.env` files and keys are never committed.

## Authentication

- Users log in with username and password; they register themselves.
- Users are stored in the `users` collection; passwords are stored as hashes only.
- Spring Security protects every `/api` endpoint except login and registration.
- All users have the same rights; there are no roles.
- Not decided: session cookie or JWT.
- Not supported: password reset by email.

## Data Model

- MongoDB with three collections: `users`, `trips`, `wishlist`.
- A trip document contains its stops as an embedded array, because a trip is always loaded together with its stops
  and the detail page then needs a single query.
- Every trip and wishlist entry stores the id of its owner; every query filters by the logged-in user.
- MongoDB has no foreign keys: when a trip is deleted, its photos are deleted in code.
- Coordinates are stored as GeoJSON points (`{ type: "Point", coordinates: [longitude, latitude] }`). Leaflet
  expects `[latitude, longitude]`; the order is converted in one place in the frontend.

## Trips and Stops

- The order of the embedded `stops` array is the order of the visit.
- Each stop stores an ISO 3166-1 alpha-2 country code, set when the stop is created (from the place search or
  chosen by the user), because the world map and the statistics then need no geocoding.
- The route length is calculated in the backend with the haversine formula as the sum of the straight-line distances
  between consecutive stops. Routes along roads are not supported.

## Maps

- Maps use Leaflet with OpenStreetMap tiles, because both are free and need no API key.
- The world map colors countries from a GeoJSON file of country borders, matched by country code.
- The list of visited countries is the set of distinct country codes over all stops of the user.

## Place Search

- The place search uses Nominatim (OpenStreetMap). It returns the coordinates and the country code for a stop.
- Nominatim allows at most one request per second; the search is sent when the user submits it, not on every
  keystroke.

## Photos

- A stop stores references to its photos; the photo files are not stored inside the trip document.
- Not decided: where the files are stored and which limits apply (see `requirements.md` → Open Questions).

## Search and Statistics

- Filtering by year and country uses queries on the trip's dates and on `stops.countryCode`.
- Free-text search covers trip titles, stop names, and notes.
- Statistics are calculated from the user's trips on request; nothing is stored redundantly.

## Frontend Conventions

- Styling uses Tailwind CSS v4. Theme colors are defined once in `frontend/src/index.css`; components use these
  colors instead of hard-coded ones.
- The look follows the mockups in `TravelBlog – Seitenentwürfe.html`: light background, white cards with soft
  shadows and large corner radii, one blue accent color.
- Small screens are covered with Tailwind breakpoints; the main breakpoint is `md` (768 px).
- Pages load data once and are refreshed manually (no polling).
- Routing uses React Router; HTTP requests use axios.
- User interface texts are in German. A language switch is a future idea and not built yet; the application name
  TravelBlog is the same in every language.

## Error Handling

- API errors use RFC 9457 `ProblemDetail`.
- Validation errors include an `errors` object (field name → message).
- A request for a resource of another user is answered like a missing resource (404).

## Testing

- Controllers are tested as integration tests: `@SpringBootTest` with MockMvc against the full application context
  and an embedded MongoDB (Flapdoodle), because this is the approach taught in the course and it also covers the
  repository and the JSON mapping.
- The embedded MongoDB is started by the tests themselves; no installed database or other infrastructure is needed.
  The first run downloads the MongoDB binary.
- Each test starts with an empty database.
- Service logic (e.g. the route length) is tested with plain unit tests; the repository is mocked with Mockito.
- Calls to external services (e.g. Nominatim) are mocked with `MockRestServiceServer`.
