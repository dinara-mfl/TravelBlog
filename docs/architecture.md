# Architecture Decisions

Decisions that complement `requirements.md`. Update this file when a decision changes.

## Deployment

- The deployment target is not decided (see `requirements.md` → Open Questions).
- During local development, the Vite dev server proxies `/api` to the backend on `http://localhost:8080`.
- GitHub Actions builds the backend with `mvn -B package` on every push.

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

- Backend tests mock the database (Mockito); no database or other infrastructure is needed to run them.
- Controller and security behavior is tested with MockMvc against the full application context.
