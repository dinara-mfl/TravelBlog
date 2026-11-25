# Architecture Decisions

Decisions that complement `requirements.md`. Update this file when a decision changes.

## Deployment

- The application is deployed on Render as one Docker container; the steps are in `deployment.md`.
- One container instead of two: the frontend build is copied into the backend's `static` folder, so the backend
  delivers the frontend and the API from the same address. This needs no CORS setup and no second service.
- The image is built by GitHub Actions (`deploy.yml`) on every push to `main` and stored on Docker Hub; Render only
  runs it. The image is built from the finished jar, so the Dockerfile stays short.
- Spring Security requires a login only for `/api/**`; all other paths are the frontend's files and are public.
- `FrontendController` forwards the React Router paths to `index.html`, so pages can be opened directly and reloaded.
- During local development, the Vite dev server proxies `/api` to the backend on `http://localhost:8080`.
- Continuous integration and code analysis: see CI and Code Quality.

## CI and Code Quality

- GitHub Actions runs three check workflows (`.github/workflows/`); the fourth, `deploy.yml`, deploys every push to
  `main` (see Deployment):
  - `maven.yml` (Java CI with Maven): builds and tests the backend with `mvn -B clean verify` on every push to a branch
    other than `main`.
  - `build_backend.yml` (SonarQube_backend): on every pull request and push to `main`, builds and tests the backend
    and analyzes it with SonarQube Cloud.
  - `build_frontend.yml` (SonarQube_frontend): on every pull request and push to `main`, sends `frontend/src` to
    SonarQube Cloud for analysis; it does not lint or build before the scan.
- SonarQube Cloud is used because it was introduced in the course; it reports bugs, code smells, security hotspots,
  duplication, and test coverage, and comments the Quality Gate result on each pull request.
- Backend and frontend are two separate SonarQube Cloud projects in the organization `dinara-mfl`:
  `dinara-mfl_TravelBlog_backend` and `dinara-mfl_TravelBlog_frontend`.
- The workflows authenticate with the repository secret `SONAR_TOKEN`; the token is never committed.
- A pull request is merged only when its Quality Gate has passed.
- Backend coverage is measured with JaCoCo (`jacoco-maven-plugin` in `backend/pom.xml`); `mvn verify` writes the report
  to `backend/target/site/jacoco/jacoco.xml`.
- `build_backend.yml` runs `mvn -B verify` and the SonarQube Maven plugin in one command, in the working directory
  `backend/`: Maven builds, runs the tests, writes the JaCoCo report, and then starts the analysis, so the analysis
  covers only the backend and includes coverage. The organization is set in `backend/pom.xml`
  (`sonar.organization`), the project key in the workflow.
- The backend is not analyzed with SonarQube's automatic configuration, because it does not fit a repository that
  contains backend and frontend.
- The frontend has no automated tests: frontend testing is not part of the course. Frontend coverage is therefore
  excluded from the analysis (`sonar.coverage.exclusions=**/*`). Lint, type check, and build are the frontend checks;
  they currently run only locally (`npm run lint`, `npm run build`), not in CI.

## Configuration & Secrets

- Secrets are provided via environment variables: `MONGODB_URI` (database connection string) and `JWT_SECRET` (key
  that signs login tokens, at least 32 characters). Setup is described in `README.md`. Optional: `DEMO_PASSWORD`
  (see Authentication → Demo user).
- Tests use a fixed test-only secret from `backend/src/test/resources/application.properties`.
- `.env` files and keys are never committed.

## Authentication

- Users log in with username and password; they register themselves.
- Users are stored in the `users` collection; passwords are stored as hashes only.
- Spring Security protects every `/api` endpoint except `POST /api/auth/register` and `POST /api/auth/login`;
  without a valid token the backend answers 401.
- The login is kept with a JWT instead of a session cookie, because the backend then stays stateless
  (`SessionCreationPolicy.STATELESS`) and CSRF protection is not needed.
- `POST /api/auth/login` returns the token and the username. The token is signed with HMAC (`JWT_SECRET`), contains
  the user's id as subject, and is valid for 24 hours; there is no refresh token.
- The frontend stores the token in `localStorage` and sends it as `Authorization: Bearer <token>` with every request
  (`frontend/src/api/client.ts`). On a 401 it deletes the token and opens `/login`; logout deletes the token.
- `JwtFilter` reads the token; controllers get the logged-in user's id with `@AuthenticationPrincipal String userId`.
- All users have the same rights; there are no roles.
- Not supported: password reset by email.

### Demo user

- So that anyone can try the live application without registering (e.g. in a presentation or from the README),
  the backend creates a user `demo` with sample data: four trips in different years and countries and five wishlist
  entries (`DemoData`).
- The trips have sample photos with a cover photo each: eleven free photos from Unsplash (Unsplash License, free to
  use without attribution) in `backend/src/main/resources/demo-photos/`, scaled down to at most 1200 px (about
  2 MB together). The seeder stores them in GridFS like uploaded photos, so the app shows them the same way.
- `DemoDataSeeder` runs once at every start, but only when the environment variable `DEMO_PASSWORD` is set (on
  Render). Locally and in the tests there is no demo user.
- Every start replaces the trips (with their photos) and the wishlist of `demo` with the sample data. Visitors may change or delete them;
  Render restarts the service often (it sleeps without visitors), so the demo is soon clean again. Data of other
  users is never touched.
- The password comes from `DEMO_PASSWORD` instead of the source code: no password in the code, and changing the
  variable on Render changes the password. It is a demo-only password and may be shown in the README.

## Data Model

- MongoDB with three collections: `users`, `trips`, `wishlist`.
- A trip document contains its stops as an embedded array, because a trip is always loaded together with its stops
  and the detail page then needs a single query.
- Every trip and wishlist entry stores the id of its owner (`userId`); every query filters by the logged-in user.
- A wishlist entry stores its countries as a list of ISO 3166-1 alpha-2 codes (`countryCodes`, 1 to 10). The user
  picks them from a fixed list in the frontend (`utils/countries.ts`, generated from the same Natural Earth data as the
  world map, with German names and continents), so no place search is needed for the wishlist. The form asks for the
  countries first; the place or region is optional. Without one, the frontend sends the country names as the
  destination in the current language (e.g. "Island", "Argentinien, Chile"), so the backend still always gets a destination and did not change.
  Entries stored before countries existed are returned with an empty list.
- "Reise planen" on the wishlist passes the wish to the trips page in the React Router state (`tripDraft`), not in the
  URL, so the user's texts do not appear in the address. The trips page removes it from the history after reading it,
  so reloading does not open the dialog again.
- The API returns DTOs (e.g. `TripResponse`, `WishlistEntryResponse`), not the documents: the owner id stays on the
  server.
- `GET /api/trips` returns the user's trips sorted by start date, newest first.
- MongoDB has no foreign keys: when a trip is deleted, its photos are deleted in code.
- Coordinates are stored as GeoJSON points (`{ type: "Point", coordinates: [longitude, latitude] }`). The API sends
  and receives plain `latitude` and `longitude` fields instead; the backend converts them in one place
  (`TripService` / `StopService`), so the frontend and Leaflet never deal with the GeoJSON order.

## Trips and Stops

- Every trip has at least one stop. `POST /api/trips` requires `firstStop` (place and stop type; its date is the
  start date of the trip), so that the trip and its first place are saved together, and the last stop cannot be
  deleted (400). Creating a trip for one place therefore takes one dialog. Trips saved before this rule may still
  have no stops and are shown as they are.
- The title is optional. An empty title is stored as `null`, and the backend builds it on every read from the
  stops (`TripTitles`): the distinct names of the overnight stops, otherwise of all stops, at most three
  ("Rom – Florenz – Bologna und 2 weitere"); "Neue Reise" for a trip without stops. Because it is built and not
  stored, it follows every change of the stops. `TripResponse.title` is always the title to show; `customTitle` is
  the user's own title or `null`, so that the edit form can leave the field empty.
- The order of the embedded `stops` array is the order of the visit. It follows the stop dates; stops with the same
  date keep the order in which they were added. There is no manual reordering.
- Each stop has a type (`StopType`: `OVERNIGHT`, `PASSING_THROUGH`, `DAY_TRIP`), chosen by the user in the stop
  dialog and for the first stop in the trip dialog (preselected: overnight for a trip of several days, otherwise day
  trip). It is set by the user and not derived from the dates, because a stop without an overnight stay on the day of
  a move can be a day trip as well as a stop on the way. It replaced the boolean `overnight` (2026-11-20). Stops saved
  before keep their `overnight` field in MongoDB and are read as `OVERNIGHT` (true) or `DAY_TRIP` (false or missing)
  through `Stop.typeOrDefault()`; there is no migration script. New stops store no `overnight` field.
- The route (`TripRoute`) is made of the overnight stops and the stops passed on the way, in the order of the visit;
  a day trip belongs to the last overnight stop before it (its base) and is not part of the route. A trip without
  any overnight stop has no base, so all its stops are the route. `StopResponse` tells the frontend what to draw:
  `onRoute`, `baseStopId` (for a day trip), `distanceFromPreviousKm` (from the previous stop on the route, for a day
  trip from its base; null if there is none), and `departureDate` (see below).
- `departureDate` is the last day of a stay: for an overnight stop the arrival at the next overnight stop or the end of
  the trip, for the only stop of a trip the end of the trip, otherwise the arrival date. The backend computes it, so
  the frontend only formats it ("12.–15. Mai · 3 Nächte").
- A stop has one date, the arrival date. It must lie within the dates of the trip; a trip's dates cannot be changed
  so that a stop would lie outside them (both answered with 400).
- Each stop has an id (UUID) generated by the backend, so that a single stop can be changed or deleted:
  `POST /api/trips/{tripId}/stops`, `PUT` and `DELETE /api/trips/{tripId}/stops/{stopId}`. Each of them returns the
  whole trip, because the order of the stops and the distances can change.
- On the trip detail page, `TripStops` shows the stops in order with the distances between them; `StopDialog` adds
  and changes a stop. For now a stop is added by searching its place (`PlaceSearch`); adding by a click on the map
  follows with the trip map.
- `TripResponse` contains the stops with `distanceFromPreviousKm` and the trip's `routeLengthKm`; the frontend does
  not calculate distances.
- Each stop stores an ISO 3166-1 alpha-2 country code, set when the stop is created (from the place search or
  chosen by the user), because the world map and the statistics then need no geocoding.
- The route length is calculated in the backend with the haversine formula as the sum of the straight-line distances
  between consecutive stops on the route; day trips do not count. Routes along roads are not supported. A trip with
  one stop on the route has a length of 0, so the detail page and the trip card show the number of stops from two
  stops on and the route length only when it is not 0.

## Maps

- Maps use Leaflet with OpenStreetMap tiles, because both are free and need no API key.
- The world map colors countries from a GeoJSON file of country borders, matched by country code.
- The country borders are `frontend/public/countries.geojson`: a smaller copy of the Natural Earth countries
  (1:110m, public domain) with only the ISO code (`ISO_A2_EH`, because `ISO_A2` is `-99` for e.g. France and Norway),
  the German name, and the continent; Antarctica is left out. The file is loaded when the world map opens.
- French Guiana is a separate area with the code `GF` in that file, although Natural Earth counts it as part of France.
  Otherwise a wish or visit "Frankreich" would also color a piece of South America, which confuses users.
- The world map has no tile layer: it shows only the countries, colored as in the mockup (visited, wishlist, other).
- Leaflet is used through `react-leaflet`, so maps are written as React components.
- The trip map (`TripMap`) is part of "Reiseverlauf" on the detail page, as in the mockup: the map card on the left,
  the stops on the right; on narrow screens the map is above the list. On wide screens the card is sticky, so the map
  stays in view while the user scrolls through the stops. It shows OpenStreetMap tiles, the stops as numbered markers
  with their names (blue on the route, white with a blue ring for day trips), a dashed line between the stops on the
  route in the order of the visit, a thinner dotted line from its base to each day trip (not counted in the route
  length; day trips without a base have none), and below the map the number of places and the route length
  (`routeLengthKm`, shown only when there is a route).
  A click on a marker opens a popup with the name, dates, country, and note. In the list, a day trip shows its base
  and distance in its badge ("Tagesausflug ab Rom · 26 km") and gets no distance arrow; the arrow before the next stop
  on the route names where it is measured from when day trips lie in between ("186 km ab Rom").
  The markers are `divIcon`s styled with Tailwind, because Leaflet's default marker images are not found after the
  Vite build. A trip without stops shows no map.
- A single place gets a smaller map, zoomed out (at most zoom 5), so that it shows where in the country or the
  region the place lies; with a route the map is higher and zooms in up to zoom 12.
- The trip map fits itself to the stops when it opens and again when a stop is added, moved, or deleted, but not when
  only a name or a note changes, so it stays where the user moved it.
- On both maps a pinch on the touchpad or Ctrl (⌘) + mouse wheel zooms the map; plain scrolling scrolls the page and
  shows a short hint (`MapWheelZoom`). Browsers report a pinch as a wheel event with `ctrlKey`, so Leaflet's wheel zoom
  stays on and the component only keeps plain scrolling away from it. (Before, the wheel zoomed only after a click into
  the map, and a pinch zoomed the whole page.)
- The list of visited countries is the set of distinct country codes over all stops of the user. The frontend
  collects them from `GET /api/trips` (`utils/visitedCountries.ts`); there is no separate endpoint.
- Countries too small for the 1:110m borders (e.g. Malta) still count as visited and appear in the list, with the
  name from the browser (`Intl.DisplayNames`), but they are not colored on the map and have no continent.
- Clicking a visited country shows its trips below the map; clicking a wishlist country shows its wishlist
  destinations there (both parts for a country that is both). The entries of the list "Besuchte Länder" are buttons that
  do the same, because the countries on the Leaflet map cannot be reached with the keyboard.

## Place Search

- The place search uses Nominatim (OpenStreetMap). It returns the coordinates and the country code for a stop.
- Nominatim allows at most one request per second; the search is sent when the user submits it, not on every
  keystroke.
- The frontend does not call Nominatim directly but `GET /api/places?query=…`; the backend (`PlaceService`) asks
  Nominatim with a User-Agent that names the application, as its usage policy requires, and returns up to five
  places with name, full name, coordinates, and the country code in upper case. Results without a country (e.g. seas)
  are left out. If Nominatim cannot be reached, the API answers 503 with a message in the user's language.
- Nominatim is asked for names in the language of the user interface (`accept-language=de` or `en`), so a stop
  saved in English is called "Florence" and one saved in German "Florenz". The name is stored with the stop and
  not translated later.
- The Nominatim address is configured in `app.nominatim.base-url`; the tests use a fake address and
  `MockRestServiceServer`, so they never call the real service.

## Wikipedia

- A stop's card shows the first three sentences of the Wikipedia article about its place (`WikipediaInfo`), in the
  language of the user interface (de.wikipedia.org or en.wikipedia.org),
  with a link to the article and "Text: Wikipedia, CC BY-SA 4.0", which the license asks for.
- The frontend asks `GET /api/wikipedia?name=…&latitude=…&longitude=…`; the backend (`WikipediaService`) asks the
  MediaWiki API of that Wikipedia (`action=query`, `prop=extracts|coordinates|pageprops|info|langlinks`, redirects
  resolved) with the same User-Agent as for Nominatim. No API key is needed. The address is configured in
  `app.wikipedia.base-url` with a `{language}` part (`https://{language}.wikipedia.org`); the tests use a fake
  address and `MockRestServiceServer`.
- A stop keeps the name it got from the place search in the language of that moment, e.g. "Venedig". If the
  user's Wikipedia has no article with that name, the other Wikipedia is asked, and its link to the article in the
  user's language is followed (`langlinks`): "Venedig" (de) → "Venice" (en). So the German demo trips also show
  English Wikipedia texts.
- The article is looked up by the stop's name and accepted only if it is no disambiguation page and its coordinates
  lie within 50 km of the stop, so "Florenz" does not return a town of the same name in the USA. Without a matching
  article the API answers 204 No Content and the card shows nothing. A stop renamed by the user (e.g. "Florenz
  (Altstadt)") then has no article; storing the article title from the place search would fix that later.
- Overnight stops load the article when the page opens; day trips and places on the way load it with a button, so
  a trip with many stops does not send a request for each of them. The answer is not stored or cached.
- If Wikipedia cannot be reached, the API answers 503; an overnight stop then shows nothing, a button shows a note.

## Photos

- Photo files are stored in MongoDB GridFS, in the same Atlas database: Render deletes its file system on every
  deploy, and GridFS needs no further service or API key. A stop stores only the ids of its photos (`photoIds`).
- At most 5 photos per stop; JPEG, PNG or WebP; at most 5 MB per file (`spring.servlet.multipart` and a check in
  `PhotoService`).
- The browser shrinks every photo to at most 2000 px on the long side (JPEG) before the upload, because the free
  Atlas cluster has 512 MB in total.
- Each GridFS file stores its owner (`metadata.userId`) and its trip (`metadata.tripId`). `GET /api/photos/{id}`
  returns the file only to its owner, otherwise 404. The frontend loads photos through axios with the token, because
  `<img>` cannot send the `Authorization` header.
- Cover: `Trip.coverPhotoId` is the photo the user chose. The API returns the chosen photo if it still exists,
  otherwise the first photo of the trip; without photos the card shows the cover color.
- Deleting a photo, a stop or a trip deletes its files in GridFS as well.

## Tags

- The tags are a fixed list: `MOUNTAINS` (Berge), `SEA` (Meer), `CITY_TRIP` (Städtetrip), `FOOD` (Essen),
  `FRIENDS_AND_FAMILY` (Freunde & Familie) — the enum `TripTag` in the backend, the labels in
  `frontend/src/i18n/texts.ts`. A fixed list avoids typos and duplicates such as "Meer" and "meer", and the filter
  always shows the same buttons.
- A trip stores its tags as a list in the trip document. The backend removes duplicates and sorts them in enum order;
  trips saved before tags existed are returned with an empty list. An unknown tag is rejected with 400.
- Stops will use the same list once they exist; a trip then matches a tag if the trip or one of its stops has it.

## Search and Statistics

- Search and the year filter on the trip overview run in the frontend (`frontend/src/utils/tripFilters.ts`): the page
  already loads all trips of the user, one person has tens of trips rather than thousands, and the result appears
  without a new request.
- A trip belongs to the year in which it starts.
- The tag filter accepts several tags and combines them with AND: only trips that have every selected tag are
  shown. "Alle" clears the selected tags. Tag, year, and search filters apply together.
- Free-text search covers trip titles, descriptions, tag names, and the stops' names, countries (names in the
  language of the user interface), and
  notes, so that "Florenz", "Frankreich" or "Eis" find a trip.
- Statistics are calculated from the user's trips on request; nothing is stored redundantly. They have their own
  page "Statistik" (`/stats`, `StatsPage`), so that the trip overview starts with the trips instead of a screen of
  numbers (the mockup had the tiles above the trips). The totals (`getTotals`: trips, travel days, distinct
  countries, stops, sum of the route lengths) are computed in the frontend from all trips of the user. A trip card
  shows its countries in route order and, from two stops on, the number of stops and the route length.
- The breakdown by year (`getTotalsByYear`, shown by `YearStats` under the tiles as "Nach Jahren") uses `getTotals`
  for the trips of each year, so its rules are the same: a trip counts in the year it starts, a country visited on
  two trips of a year counts once. Each row shows trips, travel days, countries, and distance, with a bar for the
  distance relative to the year with the longest one (the numbers are in the text; the bar is hidden from screen
  readers).
  A row links to the trip overview filtered by that year (`/trips?year=2024`); `TripsPage` takes the start value of
  its year filter from `?year`.
- The other statistics are computed in `frontend/src/utils/tripStats.ts`, one function per block:
  - Records (`getRecords`, `TripRecords`): most travel days, longest route, most stops. Trips that share a record are
    all shown; a record nobody holds (e.g. no route yet) is left out.
  - Countries by travel days (`getCountryTimes`, `CountryStats`): a stop covers the days from its arrival to its
    `departureDate`, so the day of a move counts for both countries; within one trip each day counts once per
    country. Sorted by days, then trips; the first eight are shown, the rest behind "Alle anzeigen".
  - Travel days per month (`getDaysPerMonth`, `MonthStats`): every day of every trip, over all years, so a trip from
    28 March to 10 April adds 4 days to March and 10 to April. The columns show a hint on hover; the busiest months
    are named below the chart, so the main number is readable without hovering.
  - Extreme points (`getExtremePoints`, `ExtremePoints`): the stops with the highest and lowest latitude and
    longitude; the date line is not treated specially.

## Frontend Conventions

- Styling uses Tailwind CSS v4. Theme colors are defined once in `frontend/src/index.css`; components use these
  colors instead of hard-coded ones.
- Dark mode: `index.css` defines every theme color a second time under the class `dark` on `<html>`; components
  keep their classes (`bg-surface`, `text-ink`, …) and only the values change. `ThemeToggle` (sun / moon next to
  "DE | EN") switches it and keeps the choice in `localStorage` (`theme`); without a choice the system setting
  decides (`theme.ts`). A small script in `index.html` sets the class before the first paint, so a dark page does not
  flash white.
  - Colors that differ in meaning have their own tokens: `danger` / `danger-soft` for errors, `on-accent` for text
    on accent buttons (white in light, dark in dark mode).
  - Surfaces that are always dark (photo viewer, dialog backdrop, the cover label on photos) use fixed colors such as
    `bg-slate-950` or `bg-black/50`, because `ink` becomes light in dark mode.
  - The street map tiles are darkened with a CSS filter; Leaflet's popups, labels, zoom buttons and credit line get
    the dark surface (`index.css`). The world map needs nothing extra, because it is drawn with theme colors.
  - A cover color the user chose is a fixed value; in dark mode it is half transparent over the dark card.
- The look follows the mockups in `TravelBlog – Seitenentwürfe.html`: light background, white cards with soft
  shadows and large corner radii, one blue accent color.
- Small screens are covered with Tailwind breakpoints; the main breakpoint is `md` (768 px).
- Pages load data once and are refreshed manually (no polling).
- While a page loads its data, it shows a skeleton instead of a loading text: grey, gently pulsing blocks in the
  shape and size of the real content (`components/skeletons/`), so the page does not jump when the data arrives.
  The base block is `Skeleton`; each page has its own skeleton (e.g. `TripCardsSkeleton`). The pulsing respects the
  system setting for less motion (`motion-safe:`); screen readers get a hidden "… wird geladen" text
  (`LoadingText`). Photos that are still loading pulse in the same way (`AuthImage`).
- When an API request takes longer than 4 seconds, a note at the bottom of the screen says that the server is waking
  up (`SlowServerNotice`, counted in `api/slowRequests.ts` by the axios interceptors). On Render's free plan the
  server sleeps after a while without visitors, and the first request afterwards takes about a minute; without the
  note the app would look broken. It appears on every page, also on the login page. The very first visit cannot show
  it, because the same server also delivers the page.
- The page always keeps room for the scrollbar (`scrollbar-gutter: stable` in `index.css`), so it does not shift
  sideways when switching between a short and a long page.
- Routing uses React Router; HTTP requests use axios.
- Code layout in `frontend/src/`: `pages/` (one component per route, named `…Page`), `components/` (reusable parts),
  `api/` (one file per backend resource, built on the shared axios client in `api/client.ts`), `types/` (types of the
  API responses), `utils/` (helpers such as date formatting).
- The menu pages are defined once in `navigation.tsx`; the routes in `App.tsx` and the links in `NavBar.tsx` are built
  from it. Pages behind the login are wrapped in `ProtectedRoute`.
- Dates come from the API as ISO strings (`2024-05-12`) and are shown in the language of the user interface with
  `Intl.DateTimeFormat` (`utils/dates.ts`), e.g. "12.–20. Mai 2024" or "12–20 May 2024"; they are formatted in UTC
  so the day does not shift with the time zone.
- Until trips have cover images, the trip cards use the four pastel cover colors of the mockups (`cover-1` to
  `cover-4` in the theme).
- See Languages below for the texts of the user interface.

## Languages

- The user interface is in German (the default) and English. The application name TravelBlog is the same in both.
- **Frontend:** all texts are in `frontend/src/i18n/texts.ts`, each with both languages side by side, e.g.
  `cancel: {de: 'Abbrechen', en: 'Cancel'}`. TypeScript reports a text with only one language. One file instead of
  one per language keeps the two versions of a text together; two files with the same keys also counted as
  duplicated code in SonarQube. `texts.de` and `texts.en` are picked from the pairs once. Texts with a number or a name are small functions, e.g.
  `trips(3)` → "3 Reisen" / "3 trips", because the word order and the plural differ between the languages.
  Components get the texts with `const {t} = useLanguage()` (`LanguageProvider` in `main.tsx`); helpers outside of
  components (dates, numbers, country names, the trip search) get the language as a parameter. No library is used:
  two languages and a few hundred texts do not need one.
- The chosen language is kept in `localStorage` (`language`); on the first visit it is English for an English
  browser and German for all others. "DE | EN" (`LanguageSwitch`) is in the header and on the login page.
- Dates and numbers use `de-DE` and `en-GB` (British English: the day comes before the month, as in German).
  English country names come from the browser (`Intl.DisplayNames`), with a few corrections, e.g. "DR Congo"
  instead of "Congo - Kinshasa". Continents are stored as keys (`EUROPE`) and named in the texts.
- A wishlist entry without its own place is named after its countries when it is saved (e.g. "Island"); the
  wishlist recognises such a name in both languages and shows the countries in the current language ("Iceland").
- Error texts are made when they are shown, not when the error happens, so they follow a change of the language.
- **Backend:** the API client sends the language in the `Accept-Language` header with every request. Messages for
  the user are in `messages.properties` (German) and `messages_en.properties` (English), with the same keys.
  Validation annotations use keys (`message = "{validation.name.required}"`); services throw a
  `LocalizedException` with a key and a status, and `GlobalExceptionHandler` looks up the text in the request's
  language. Without the header, or for a language without its own file, the texts are German
  (`spring.web.locale=de`, `spring.messages.fallback-to-system-locale=false`).
- Controllers that call external services get the request's `Locale` and pass `UserLanguage.of(locale)` ("de" or
  "en") to the place search and to Wikipedia.
- The user's own content (titles, notes, the demo trips) is not translated.

## Error Handling

- API errors use RFC 9457 `ProblemDetail` (`spring.mvc.problemdetails.enabled=true`); the frontend shows its `detail`
  text (`getErrorMessage` in `api/client.ts`) or a fallback message in the language of the user interface.
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
