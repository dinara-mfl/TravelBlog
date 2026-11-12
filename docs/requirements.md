# Requirements

Wording: "must" = mandatory, "should" = expected, "may" = optional.

## 1. Project Overview

TravelBlog is a web application in which users document their own trips: they mark places on a map, attach photos and
personal notes to them, see the route they travelled, and see which countries they have already visited.

It is a group project of three people in a Java + React course, with about 30 hours per person. Each user works with
their own data only; it is a personal travel diary, not a social network.

## 2. Goals

* A user can record a trip place by place, with notes and photos, and find it again later.
* A trip can be viewed on a map as a route, including the distance travelled.
* A user can see at a glance which countries they have visited and where they still want to go.
* The first version is complete and presentable within the available time.

## 3. Core Features

* Registration and login with username and password
* Trips: create, edit, delete; overview and detail page
* Stops of a trip with coordinates, country, date, and a personal note
* Trip map with markers, the route between the stops, and the route length
* Photos attached to individual stops
* World map with the visited countries and the wishlist destinations
* Wishlist of places the user still wants to visit, with a reason and a priority
* Search and filter by year, country or city, and free text
* Place search by name when adding a stop
* Statistics: countries, stops, distance, breakdown by year

## 4. Trips

Trips are the main objects of the application. A trip belongs to exactly one user.

A trip must have a title and a date range. It may have a description and a cover image.

The overview page must display at least:

* all trips of the logged-in user as tiles, e.g. "Italien 2024, 12.–20. Mai"
* per trip: title, date range, number of stops, route length, number of photos

Users must be able to:

* create, edit, and delete their own trips
* open the detail page of a trip

### Trip detail page

The detail page must display the trip's title, date range, and description, the map (section 6), the stops in the
order of the visit (section 5), and the photos (section 7).

## 5. Stops

A stop is a place visited during a trip.

A stop must have a name, coordinates, a country, and a date. It may have a personal note, e.g. "Florenz, 14. Mai –
Sonnenuntergang am Piazzale Michelangelo, bestes Eis der Reise".

Users must be able to:

* add a stop by clicking on the map
* add a stop by searching for a place by name; coordinates and country are then filled in automatically
* edit and delete a stop

The order of the stops defines the course of the trip.

## 6. Trip Map

The map of a trip must display:

* all stops as markers; clicking a marker shows the stop's note and photos
* a line between the stops in the order of the visit
* the route length, e.g. "Rom → Florenz → Venedig: 490 km"

The route length is the sum of the straight-line distances between consecutive stops.

## 7. Photos

Users must be able to:

* upload several photos per stop
* see the photos of a trip as a gallery on the detail page
* open a photo in a large view by clicking it
* delete a photo

## 8. World Map

The world map must display:

* all countries the user has visited, highlighted in one color
* the wishlist destinations in a different color
* a counter, e.g. "14 Länder besucht"

Clicking a visited country must show the user's trips to that country.

A country counts as visited when at least one stop of the user lies in it.

## 9. Wishlist

The wishlist contains places or countries the user still wants to visit.

A wishlist entry must have a destination and a reason. It should have a priority, e.g. "Island – Nordlichter sehen,
am besten im Februar".

Users must be able to create, edit, and delete wishlist entries.

## 10. Search and Filter

Users must be able to find their trips:

* by year, e.g. all trips of 2023
* by country or city, e.g. "Italien" or "Prag"
* by free text in titles and notes

## 11. Statistics

The application should display for the logged-in user:

* number of visited countries
* number of stops
* total distance travelled
* a breakdown by year, e.g. "2024: 3 Reisen, 5 Länder, 4.200 km"

## 12. Authentication

Users log in with a username and a password. Users are stored in the application's database.

Users must be able to register themselves, log in, and log out.

All pages except login and registration must require a logged-in user.

A user must only see and change their own trips, stops, photos, and wishlist entries.

Stored passwords must not be retrievable in plaintext.

All users have the same rights; there are no roles and there is no admin area.

## 13. Non-Functional Requirements

### Security

* Authentication is required for all pages and API endpoints except login and registration.
* Access to data of other users must be prevented in the backend, not only hidden in the frontend.
* Secrets are provided only via environment variables.

### Performance

* The application is built for a small number of users (course project); no special performance requirements apply.

### Usability

* The application is called TravelBlog; the name is not translated.
* The user interface is in German in the first version.
* The design is modern, light, minimalist, and airy; the page mockups in `TravelBlog – Seitenentwürfe.html` are the
  reference.
* The application should be usable on mobile devices.

### Operation

* The application must run locally with a single backend and a single frontend start command.

## 14. Error Handling

The application should provide clear feedback when an operation fails.

Possible failures include:

* an external service (map tiles, place search) is unavailable
* a trip, stop, or photo no longer exists
* the user is not logged in or the resource belongs to another user
* an upload is rejected (file type, file size)
* invalid input in a form

Users should receive a clear but non-technical error message.

Technical error details should not be unnecessarily exposed to users.

## 15. Destructive Actions

Destructive actions should require explicit confirmation.

Confirmation should be presented using a modal.

Examples include:

* delete a trip (including its stops and photos)
* delete a stop (including its photos)
* delete a photo
* delete a wishlist entry

The confirmation should clearly describe the action being performed and, where applicable, its consequences.

## 16. Non-Goals

The initial version of the application is not intended to provide functionality for:

* comments, likes, and followers
* trips shared between several authors
* budget and expenses
* badges and achievements
* PDF export
* roles, permissions, and an admin area
* password reset by email

Features outside of this scope should not be implemented unless explicitly requested.

## 17. Future Ideas

Potential future functionality may include:

* short information about cities and sights from Wikipedia
* tags (e.g. "Berge", "Meer") and filtering by them
* public trips and a shared feed
* routes along roads instead of straight lines, and the means of transport per section
* historical weather for a stop's place and date
* reading a photo's location from its EXIF data
* turning a wishlist entry into a planned trip
* a language switch, so that each user can choose the language of the user interface

Future ideas should not be implemented unless explicitly requested.

## 18. Open Questions

* How is the login kept after authentication: session cookie or JWT?
* Where are uploaded photos stored (server disk, Cloudinary, MongoDB GridFS), and which limits apply (file size,
  number per stop)?
* Where is the application deployed?
