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
* Short information about a stop's place from Wikipedia, with a link to the article
* Statistics: countries, stops, distance, breakdown by year
* Tags for trips ("Berge", "Meer", "Städtetrip", "Essen", "Freunde & Familie") and filtering by them

## 4. Trips

Trips are the main objects of the application. A trip belongs to exactly one user.

A trip must have a date range and at least one stop; the first stop is chosen when the trip is created. It may have
a title, a description, a cover image, and tags. Without a title of its own, the trip is named after the places where
the user stayed overnight, e.g. "Rom – Florenz – Venedig", or after all its stops if there were none.

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

A stop must have a name, coordinates, a country, and a date (the arrival date, within the dates of the trip). It
may have a personal note, e.g. "Florenz, 14. Mai –
Sonnenuntergang am Piazzale Michelangelo, bestes Eis der Reise".

A stop must also say how the user spent the time there:

* Übernachtung: the user stayed overnight here. The stay lasts until the arrival at the next overnight stop, the
  last one until the end of the trip, and is shown with its dates and nights, e.g. "12.–15. Mai · 3 Nächte".
* Durchreise: a stop on the way to the next overnight stop, e.g. Siena between Rom and Florenz.
* Tagesausflug: there and back on the same day from the last overnight stop (its base), e.g. Tivoli from Rom.

The only stop of a trip lasts the whole trip, whatever its type.

Users must be able to:

* add a stop by clicking on the map
* add a stop by searching for a place by name; coordinates and country are then filled in automatically
* edit and delete a stop; the last stop of a trip can be changed but not deleted

The order of the stops defines the course of the trip.

A stop should show the first sentences of the Wikipedia article about its place in the language of the user
interface, with a link to the whole article and the source and license of the text (Wikipedia, CC BY-SA). Overnight
stops show it right away; for day trips and places on the way the user loads it with a button. A stop without a
matching article shows nothing (or, after the button, a short note).

## 6. Trip Map

The overnight stops and the stops passed on the way are the route of the trip; day trips are not part of it. A trip
without any overnight stop (e.g. a single day) has no base, so all its stops are the route.

The map of a trip must display:

* all stops as markers, day trips in a different style; clicking a marker shows the stop's note and photos
* a line between the stops on the route in the order of the visit
* a line in a different style from its base to each day trip
* the route length, e.g. "Rom → Florenz → Venedig: 490 km"

The route length is the sum of the straight-line distances between consecutive stops on the route. A day trip is
shown with its distance from its base, e.g. "Tagesausflug ab Rom · 26 km", and does not count towards the route
length.

## 7. Photos

Users must be able to:

* upload up to 5 photos per stop, also for the first place when a trip is created
* choose one photo of the trip as its cover image; without a choice the first photo is the cover
* see the photos of a trip as a gallery on the detail page
* open a photo in a large view by clicking it
* delete a photo

## 8. World Map

The world map must display:

* all countries the user has visited, highlighted in one color
* the wishlist destinations in a different color
* a counter, e.g. "14 Länder besucht"

As in the mockup, the page also shows the number of continents, the share of the world (measured against 195
countries), and the number of wishlist destinations and wishlist countries. Below the map, a list shows each visited
country with the year of the latest visit and the number of trips, e.g. "Italien · 2024 · 2 Reisen".

Clicking a visited country must show the user's trips to that country. Clicking a wishlist country shows the
wishlist destinations in that country, with priority and best travel time.

A country counts as visited when at least one stop of the user lies in it.

## 9. Wishlist

The wishlist contains places or countries the user still wants to visit.

A wishlist entry must have one or more countries and a reason. The countries are needed because the world map shows
the wishlist destinations by country; several countries are possible, e.g. "Patagonien" → Argentinien and Chile. It may
have a place or region inside these countries, e.g. "Patagonien" or "Machu Picchu"; without one, the entry is named
after its countries, e.g. "Island". It should have a priority, e.g. "Island – Nordlichter sehen, am besten im
Februar". It may have a best travel time, e.g. "Februar".

Users must be able to create, edit, and delete wishlist entries.

Users may plan a trip from a wishlist entry ("Reise planen", as in the mockup): the dialog for a new trip opens
with the destination as title and place search and the reason as description. The wishlist entry stays.

## 10. Search and Filter

Users must be able to find their trips:

* by year, e.g. all trips of 2023
* by country or city, e.g. "Italien" or "Prag"
* by free text in titles and notes
* by tags: several tags can be selected, and only trips that have all of them are shown

## 11. Statistics

The application should display for the logged-in user:

* number of visited countries
* number of stops
* total distance travelled
* a breakdown by year, e.g. "2024: 3 Reisen, 19 Tage, 5 Länder, 4.200 km"
* records: the longest trip, the trip with the longest route, and the trip with the most places (all trips if
  several share a record)
* the countries by travel days, e.g. "Italien · 3 Reisen · 21 Tage"
* the travel days per month over all years, and the busiest month
* the northernmost, southernmost, westernmost, and easternmost place, each with its trip

The statistics have their own page, so that the trip overview starts with the trips.

## 12. Authentication

Users log in with a username and a password. Users are stored in the application's database.

Users must be able to register themselves, log in, and log out.

All pages except login and registration must require a logged-in user.

A user must only see and change their own trips, stops, photos, and wishlist entries.

Stored passwords must not be retrievable in plaintext.

All users have the same rights; there are no roles and there is no admin area.

There is a demo account, so that visitors (e.g. in a presentation or from the README) can try the application without
registering. It has sample trips with stops and photos, and wishlist entries. Visitors may change its data; the
sample data is restored regularly (at every start of the application). The demo password is public and is used for
nothing else.

## 13. Non-Functional Requirements

### Security

* Authentication is required for all pages and API endpoints except login and registration.
* Access to data of other users must be prevented in the backend, not only hidden in the frontend.
* Secrets are provided only via environment variables.

### Performance

* The application is built for a small number of users (course project); no special performance requirements apply.

### Usability

* The application is called TravelBlog; the name is not translated.
* The user interface is in German and English. German is the default; on the first visit an English browser gets
  English. The user switches the language with "DE | EN" in the header and on the login page; the choice is kept in
  the browser. Error messages of the backend, place names from the place search, and Wikipedia texts follow the
  chosen language. The user's own content (titles, notes, the demo trips) is not translated.
* The design is modern, light, minimalist, and airy; the page mockups in `TravelBlog – Seitenentwürfe.html` are the
  reference.
* There is also a dark design. On the first visit the setting of the operating system decides; the user can switch
  with a button in the header and on the login page, and the choice is kept in the browser.
* The application should be usable on mobile devices.
* While a page loads its data, it shows placeholders in the shape of the content (skeleton loading) instead of an
  empty page or a loading text, so the page does not jump when the data arrives.
* When the server takes long to answer (e.g. it wakes up after a break on the free hosting plan), a short note says
  so, so the application does not look broken.

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

* short information about sights from Wikipedia (the places of stops already have it)
* tags for stops (once trips have stops), using the same list as the trip tags
* public trips and a shared feed
* routes along roads instead of straight lines, and the means of transport per section
* historical weather for a stop's place and date
* reading a photo's location from its EXIF data

Future ideas should not be implemented unless explicitly requested.

## 18. Open Questions

* Should the route length include the way from home and back? Then a trip to one place would have a length too.
  It needs a home place per user (e.g. in a profile) and a rule for trips that do not start at home.
