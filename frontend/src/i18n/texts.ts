import type {Language} from './language'

// All texts of the user interface, German and English side by side, e.g. cancel: {de: 'Abbrechen', en: 'Cancel'}.
// A new text needs both languages: TypeScript reports a text with only one of them (see Translations below).
// Texts with a number or a name are small functions, e.g. trips(3) → "3 Reisen" / "3 trips", because the word order
// and the plural differ between the languages.
// Components get the texts of the chosen language with useLanguage(): const {t} = useLanguage(); t.nav.trips
const translations = {
    common: {
        cancel: {de: 'Abbrechen', en: 'Cancel'},
        save: {de: 'Speichern', en: 'Save'},
        saving: {de: 'Wird gespeichert …', en: 'Saving …'},
        uploadingPhotos: {de: 'Fotos werden hochgeladen …', en: 'Uploading photos …'},
        edit: {de: 'Bearbeiten', en: 'Edit'},
        delete: {de: 'Löschen', en: 'Delete'},
        close: {de: 'Schließen', en: 'Close'},
        optional: {de: '(optional)', en: '(optional)'},
        all: {de: 'Alle', en: 'All'},
        opensInNewTab: {de: ' (öffnet in einem neuen Tab)', en: ' (opens in a new tab)'},
        days: {
            de: (count: number) => (count === 1 ? '1 Tag' : `${count} Tage`),
            en: (count: number) => (count === 1 ? '1 day' : `${count} days`),
        },
        nights: {
            de: (count: number) => (count === 1 ? '1 Nacht' : `${count} Nächte`),
            en: (count: number) => (count === 1 ? '1 night' : `${count} nights`),
        },
        trips: {
            de: (count: number) => (count === 1 ? '1 Reise' : `${count} Reisen`),
            en: (count: number) => (count === 1 ? '1 trip' : `${count} trips`),
        },
        countries: {
            de: (count: number) => (count === 1 ? '1 Land' : `${count} Länder`),
            en: (count: number) => (count === 1 ? '1 country' : `${count} countries`),
        },
        places: {
            de: (count: number) => (count === 1 ? '1 Ort' : `${count} Orte`),
            en: (count: number) => (count === 1 ? '1 place' : `${count} places`),
        },
        photos: {
            de: (count: number) => (count === 1 ? '1 Foto' : `${count} Fotos`),
            en: (count: number) => (count === 1 ? '1 photo' : `${count} photos`),
        },
        photo: {de: (number: number) => `Foto ${number}`, en: (number: number) => `Photo ${number}`},
        // Shown while an API request takes long, e.g. when the server on Render wakes up after a break
        slowServer: {
            de: 'Der Server wacht gerade auf. Das kann bis zu einer Minute dauern – bitte kurz warten.',
            en: 'The server is waking up. This can take up to a minute – please wait a moment.',
        },
    },
    language: {
        label: {de: 'Sprache', en: 'Language'},
    },
    theme: {
        toDark: {de: 'Dunkles Design einschalten', en: 'Switch to dark design'},
        toLight: {de: 'Helles Design einschalten', en: 'Switch to light design'},
    },
    nav: {
        main: {de: 'Hauptnavigation', en: 'Main navigation'},
        trips: {de: 'Reisen', en: 'Trips'},
        map: {de: 'Weltkarte', en: 'World map'},
        stats: {de: 'Statistik', en: 'Statistics'},
        wishlist: {de: 'Wunschliste', en: 'Wishlist'},
        logout: {de: 'Abmelden', en: 'Log out'},
    },
    auth: {
        username: {de: 'Benutzername', en: 'Username'},
        password: {de: 'Passwort', en: 'Password'},
        loginTitle: {de: 'Willkommen zurück', en: 'Welcome back'},
        loginSubtitle: {de: 'Melde dich an, um deine Reisen zu sehen.', en: 'Log in to see your trips.'},
        noAccount: {de: 'Noch kein Konto?', en: 'No account yet?'},
        registerNow: {de: 'Jetzt registrieren', en: 'Sign up now'},
        loggingIn: {de: 'Wird angemeldet …', en: 'Logging in …'},
        login: {de: 'Anmelden', en: 'Log in'},
        loginFailed: {de: 'Anmeldung fehlgeschlagen.', en: 'Login failed.'},
        registerTitle: {de: 'Konto erstellen', en: 'Create an account'},
        registerSubtitle: {
            de: 'Alle Reisen an einem Ort – mit Karte, Fotos und Eindrücken.',
            en: 'All your trips in one place – with maps, photos and memories.',
        },
        haveAccount: {de: 'Schon ein Konto?', en: 'Already have an account?'},
        usernameHint: {de: '3 bis 30 Zeichen', en: '3 to 30 characters'},
        passwordHint: {de: 'Mindestens 8 Zeichen', en: 'At least 8 characters'},
        usernameLength: {
            de: 'Der Benutzername muss 3 bis 30 Zeichen lang sein.',
            en: 'The username must be 3 to 30 characters long.',
        },
        passwordLength: {
            de: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
            en: 'The password must be at least 8 characters long.',
        },
        registering: {de: 'Wird erstellt …', en: 'Creating …'},
        register: {de: 'Registrieren', en: 'Sign up'},
        registerFailed: {de: 'Registrierung fehlgeschlagen.', en: 'Sign-up failed.'},
    },
    notFound: {
        title: {de: 'Seite nicht gefunden', en: 'Page not found'},
        text: {de: 'Diese Seite gibt es nicht (mehr).', en: 'This page does not exist (anymore).'},
        back: {de: 'Zurück zu meinen Reisen', en: 'Back to my trips'},
    },
    trips: {
        title: {de: 'Meine Reisen', en: 'My trips'},
        subtitle: {
            de: 'Alle Reisen an einem Ort – mit Karte, Fotos und Eindrücken.',
            en: 'All your trips in one place – with maps, photos and memories.',
        },
        newTrip: {de: 'Neue Reise', en: 'New trip'},
        loading: {de: 'Reisen werden geladen …', en: 'Loading trips …'},
        loadError: {de: 'Deine Reisen konnten nicht geladen werden.', en: 'Your trips could not be loaded.'},
        emptyTitle: {de: 'Noch keine Reisen', en: 'No trips yet'},
        emptyText: {
            de: 'Sobald du deine erste Reise anlegst, erscheint sie hier.',
            en: 'As soon as you add your first trip, it appears here.',
        },
        noResultsTitle: {de: 'Keine Reisen gefunden', en: 'No trips found'},
        noResultsText: {
            de: 'Ändere den Suchbegriff, das Jahr oder die Tags.',
            en: 'Change the search text, the year or the tags.',
        },
        resetFilters: {de: 'Filter zurücksetzen', en: 'Reset filters'},
        searchLabel: {de: 'Reisen durchsuchen', en: 'Search trips'},
        searchPlaceholder: {de: 'Ort, Land oder Stichwort suchen', en: 'Search for a place, country or keyword'},
        filterByYear: {de: 'Nach Jahr filtern', en: 'Filter by year'},
        tags: {de: 'Tags', en: 'Tags'},
    },
    tags: {
        MOUNTAINS: {de: 'Berge', en: 'Mountains'},
        SEA: {de: 'Meer', en: 'Sea'},
        CITY_TRIP: {de: 'Städtetrip', en: 'City trip'},
        FOOD: {de: 'Essen', en: 'Food'},
        FRIENDS_AND_FAMILY: {de: 'Freunde & Familie', en: 'Friends & family'},
    },
    stopTypes: {
        question: {de: 'Wie warst du hier?', en: 'How did you spend your time here?'},
        labels: {
            OVERNIGHT: {de: 'Übernachtung', en: 'Overnight stay'},
            PASSING_THROUGH: {de: 'Durchreise', en: 'Passing through'},
            DAY_TRIP: {de: 'Tagesausflug', en: 'Day trip'},
        },
        hints: {
            OVERNIGHT: {de: 'Hier übernachtet', en: 'Stayed overnight here'},
            PASSING_THROUGH: {
                de: 'Unterwegs zum nächsten Übernachtungsort',
                en: 'On the way to the next overnight stay',
            },
            DAY_TRIP: {de: 'Hin und zurück am selben Tag', en: 'There and back on the same day'},
        },
    },
    tripDetail: {
        back: {de: 'Meine Reisen', en: 'My trips'},
        loading: {de: 'Reise wird geladen …', en: 'Loading trip …'},
        loadError: {de: 'Die Reise konnte nicht geladen werden.', en: 'The trip could not be loaded.'},
        deleteError: {de: 'Die Reise konnte nicht gelöscht werden.', en: 'The trip could not be deleted.'},
        notFoundTitle: {de: 'Reise nicht gefunden', en: 'Trip not found'},
        notFoundText: {de: 'Diese Reise gibt es nicht (mehr).', en: 'This trip does not exist (anymore).'},
        deleteTitle: {de: 'Reise löschen?', en: 'Delete trip?'},
        deleteMessage: {
            de: (title: string) => `„${title}“ wird mit allen Orten endgültig gelöscht.`,
            en: (title: string) => `“${title}” and all its places will be deleted for good.`,
        },
    },
    stops: {
        title: {de: 'Reiseverlauf', en: 'Itinerary'},
        add: {de: 'Ort hinzufügen', en: 'Add place'},
        deleteError: {de: 'Der Ort konnte nicht gelöscht werden.', en: 'The place could not be deleted.'},
        emptyTitle: {de: 'Noch keine Orte', en: 'No places yet'},
        emptyText: {
            de: 'Füge die Orte deiner Reise hinzu – sie erscheinen hier in der Reihenfolge deines Besuchs.',
            en: 'Add the places of your trip – they appear here in the order of your visit.',
        },
        photoAlt: {
            de: (name: string, number: number) => `${name}, Foto ${number} – groß anzeigen`,
            en: (name: string, number: number) => `${name}, photo ${number} – show large`,
        },
        cover: {de: 'Titelbild', en: 'Cover'},
        deleteTitle: {de: 'Ort löschen?', en: 'Delete place?'},
        deleteMessage: {
            de: (name: string) => `„${name}“ wird aus dieser Reise entfernt.`,
            en: (name: string) => `“${name}” will be removed from this trip.`,
        },
        // "394 km ab Rom", "Tagesausflug ab Rom · 26 km"
        // "394 km from Rome", "Day trip from Rome · 26 km"
        distanceFrom: {
            de: (km: string, place: string) => `${km} ab ${place}`,
            en: (km: string, place: string) => `${km} from ${place}`,
        },
        dayTripFrom: {
            de: (label: string, base: string, km: string) => `${label} ab ${base} · ${km}`,
            en: (label: string, base: string, km: string) => `${label} from ${base} · ${km}`,
        },
        places: {de: 'Orte', en: 'Places'},
        route: {de: 'Strecke (Luftlinie)', en: 'Route (straight line)'},
        zoomHint: {
            de: 'Zum Zoomen zwei Finger spreizen oder Strg + Mausrad',
            en: 'To zoom, pinch with two fingers or use Ctrl + mouse wheel',
        },
    },
    tripDialog: {
        newTitle: {de: 'Neue Reise', en: 'New trip'},
        editTitle: {de: 'Reise bearbeiten', en: 'Edit trip'},
        endBeforeStart: {
            de: 'Das Enddatum darf nicht vor dem Startdatum liegen.',
            en: 'The end date must not be before the start date.',
        },
        placeRequired: {de: 'Bitte einen Ort suchen und auswählen.', en: 'Please search for a place and choose it.'},
        saveError: {de: 'Die Reise konnte nicht gespeichert werden.', en: 'The trip could not be saved.'},
        morePlacesHint: {
            de: 'Weitere Orte fügst du danach auf der Seite der Reise hinzu.',
            en: 'You add more places on the page of the trip afterwards.',
        },
        title: {de: 'Titel', en: 'Title'},
        titlePlaceholder: {de: 'Leer lassen – wird aus den Orten erstellt', en: 'Leave empty – made from the places'},
        from: {de: 'Von', en: 'From'},
        to: {de: 'Bis', en: 'To'},
        description: {de: 'Beschreibung', en: 'Description'},
        coverPhoto: {de: 'Titelbild', en: 'Cover photo'},
        coverColor: {de: 'Farbe der Titelkarte', en: 'Color of the cover'},
        onlyWithoutPhotos: {de: ' (nur für Reisen ohne Fotos)', en: ' (only for trips without photos)'},
        tags: {de: 'Tags', en: 'Tags'},
        tagsHint: {de: '(optional, mehrere möglich)', en: '(optional, choose several)'},
    },
    coverColors: {
        SKY: {de: 'Himmelblau', en: 'Sky blue'},
        LAVENDER: {de: 'Lavendel', en: 'Lavender'},
        MINT: {de: 'Mint', en: 'Mint'},
        PEACH: {de: 'Pfirsich', en: 'Peach'},
        PINK: {de: 'Rosa', en: 'Pink'},
        SAND: {de: 'Sand', en: 'Sand'},
    },
    stopDialog: {
        newTitle: {de: 'Ort hinzufügen', en: 'Add place'},
        editTitle: {de: 'Ort bearbeiten', en: 'Edit place'},
        saveError: {de: 'Der Ort konnte nicht gespeichert werden.', en: 'The place could not be saved.'},
        name: {de: 'Name', en: 'Name'},
        arrival: {de: 'Ankunft', en: 'Arrival'},
        note: {de: 'Notiz', en: 'Note'},
        notePlaceholder: {
            de: 'z. B. Sonnenuntergang am Piazzale Michelangelo',
            en: 'e.g. Sunset at Piazzale Michelangelo',
        },
    },
    placeSearch: {
        label: {de: 'Ort suchen', en: 'Search for a place'},
        placeholder: {de: 'z. B. Florenz', en: 'e.g. Florence'},
        searching: {de: 'Suche …', en: 'Searching …'},
        search: {de: 'Suchen', en: 'Search'},
        error: {de: 'Die Ortssuche hat nicht funktioniert.', en: 'The place search did not work.'},
        noResults: {de: 'Kein Ort gefunden. Versuche einen anderen Namen.', en: 'No place found. Try another name.'},
        results: {de: 'Gefundene Orte – einen auswählen', en: 'Places found – choose one'},
    },
    photos: {
        label: {de: 'Fotos', en: 'Photos'},
        limitHint: {
            de: (max: number) => `(optional, höchstens ${max})`,
            en: (max: number) => `(optional, at most ${max})`,
        },
        wrongType: {
            de: 'Bitte nur Fotos im Format JPEG, PNG oder WebP wählen.',
            en: 'Please choose only photos in JPEG, PNG or WebP format.',
        },
        tooMany: {
            de: (max: number) => `Pro Ort sind höchstens ${max} Fotos möglich.`,
            en: (max: number) => `A place can have at most ${max} photos.`,
        },
        add: {de: 'Foto', en: 'Photo'},
        remove: {de: (name: string) => `${name} entfernen`, en: (name: string) => `Remove ${name}`},
        unavailable: {de: 'Foto nicht verfügbar', en: 'Photo not available'},
        // Shown after the stop or trip was saved but some photos were not
        saveWarning: {
            de: (failed: number) => (failed === 1
                ? '1 Foto konnte nicht gespeichert werden. Bitte versuche es noch einmal.'
                : `${failed} Fotos konnten nicht gespeichert werden. Bitte versuche es noch einmal.`),
            en: (failed: number) => (failed === 1
                ? '1 photo could not be saved. Please try again.'
                : `${failed} photos could not be saved. Please try again.`),
        },
    },
    lightbox: {
        label: {de: (place: string) => `Fotos von ${place}`, en: (place: string) => `Photos of ${place}`},
        position: {
            de: (number: number, total: number) => `${number} von ${total}`,
            en: (number: number, total: number) => `${number} of ${total}`,
        },
        previous: {de: 'Vorheriges Foto', en: 'Previous photo'},
        next: {de: 'Nächstes Foto', en: 'Next photo'},
        isCover: {de: '✓ Titelbild der Reise', en: '✓ Cover of the trip'},
        makeCover: {de: 'Als Titelbild', en: 'Make cover'},
        deletePhoto: {de: 'Foto löschen', en: 'Delete photo'},
        deleteTitle: {de: 'Foto löschen?', en: 'Delete photo?'},
        deleteMessage: {de: 'Das Foto wird endgültig gelöscht.', en: 'The photo will be deleted for good.'},
        coverError: {de: 'Das Titelbild konnte nicht gespeichert werden.', en: 'The cover could not be saved.'},
        deleteError: {de: 'Das Foto konnte nicht gelöscht werden.', en: 'The photo could not be deleted.'},
    },
    wikipedia: {
        heading: {de: 'Aus Wikipedia', en: 'From Wikipedia'},
        label: {de: (title: string) => `Aus Wikipedia: ${title}`, en: (title: string) => `From Wikipedia: ${title}`},
        readMore: {de: 'Ganzen Artikel lesen', en: 'Read the whole article'},
        credit: {de: 'Text: Wikipedia, ', en: 'Text: Wikipedia, '},
        licenseUrl: {
            de: 'https://creativecommons.org/licenses/by-sa/4.0/deed.de',
            en: 'https://creativecommons.org/licenses/by-sa/4.0/deed.en',
        },
        notFound: {
            de: 'Kein Wikipedia-Artikel zu diesem Ort gefunden.',
            en: 'No Wikipedia article found for this place.',
        },
        unavailable: {de: 'Wikipedia ist gerade nicht erreichbar.', en: 'Wikipedia is not available right now.'},
        loading: {de: 'Wikipedia wird geladen …', en: 'Loading Wikipedia …'},
        more: {
            de: (place: string) => `Mehr über ${place} aus Wikipedia`,
            en: (place: string) => `More about ${place} from Wikipedia`,
        },
    },
    stats: {
        title: {de: 'Statistik', en: 'Statistics'},
        subtitle: {
            de: 'Deine Reisen in Zahlen – Rekorde, Jahre, Länder und Monate.',
            en: 'Your trips in numbers – records, years, countries and months.',
        },
        loading: {de: 'Statistik wird geladen …', en: 'Loading statistics …'},
        loadError: {de: 'Die Statistik konnte nicht geladen werden.', en: 'The statistics could not be loaded.'},
        emptyText: {
            de: 'Sobald du deine erste Reise anlegst, erscheinen hier ihre Zahlen.',
            en: 'As soon as you add your first trip, its numbers appear here.',
        },
        trips: {de: 'Reisen', en: 'Trips'},
        travelDays: {de: 'Reisetage', en: 'Travel days'},
        countries: {de: 'Länder', en: 'Countries'},
        places: {de: 'Orte', en: 'Places'},
        totalDistance: {de: 'Strecke gesamt', en: 'Total distance'},
        records: {de: 'Rekorde', en: 'Records'},
        longestTrip: {de: 'Längste Reise', en: 'Longest trip'},
        longestRoute: {de: 'Weiteste Strecke', en: 'Longest route'},
        mostPlaces: {de: 'Meiste Orte', en: 'Most places'},
        byYear: {de: 'Nach Jahren', en: 'By year'},
        countriesByDays: {de: 'Länder nach Reisetagen', en: 'Countries by travel days'},
        showLess: {de: 'Weniger anzeigen', en: 'Show less'},
        showAllCountries: {
            de: (count: number) => `Alle ${count} Länder anzeigen`,
            en: (count: number) => `Show all ${count} countries`,
        },
        daysByMonth: {de: 'Reisetage nach Monaten', en: 'Travel days by month'},
        busiestMonths: {de: 'Am meisten unterwegs:', en: 'Most often on the road:'},
        extremePoints: {de: 'Extrempunkte', en: 'Extreme points'},
        north: {de: 'Nördlichster Ort', en: 'Northernmost place'},
        south: {de: 'Südlichster Ort', en: 'Southernmost place'},
        west: {de: 'Westlichster Ort', en: 'Westernmost place'},
        east: {de: 'Östlichster Ort', en: 'Easternmost place'},
    },
    worldMap: {
        title: {de: 'Weltkarte', en: 'World map'},
        subtitle: {
            de: 'Wo du schon warst – und wohin es noch gehen soll.',
            en: 'Where you have been – and where you still want to go.',
        },
        loading: {de: 'Weltkarte wird geladen …', en: 'Loading world map …'},
        mapError: {de: 'Die Weltkarte konnte nicht geladen werden.', en: 'The world map could not be loaded.'},
        tripsError: {de: 'Die Reisen konnten nicht geladen werden.', en: 'The trips could not be loaded.'},
        wishesError: {
            de: 'Die Wunschziele konnten nicht geladen werden.',
            en: 'The wishlist destinations could not be loaded.',
        },
        countriesVisited: {de: 'Länder besucht', en: 'Countries visited'},
        continents: {de: 'Kontinente', en: 'Continents'},
        worldShare: {de: 'Anteil der Welt', en: 'Share of the world'},
        wishes: {de: 'Wunschziele', en: 'Wishlist destinations'},
        wishCountries: {de: 'Wunschländer', en: 'Wishlist countries'},
        hintVisited: {
            de: 'Besuchte Länder erscheinen hier, sobald deine Reisen Stopps haben.',
            en: 'Visited countries appear here as soon as your trips have stops.',
        },
        hintWishes: {
            de: 'Wunschziele erscheinen, sobald sie ein Land haben.',
            en: 'Wishlist destinations appear as soon as they have a country.',
        },
        legendVisited: {de: 'Besucht', en: 'Visited'},
        legendWish: {de: 'Wunschziel', en: 'Wishlist destination'},
        legendOpen: {de: 'Noch offen', en: 'Not yet'},
        yourTrips: {de: 'Deine Reisen', en: 'Your trips'},
        yourWishes: {de: 'Deine Wunschziele', en: 'Your wishlist destinations'},
        toWishlist: {de: 'Zur Wunschliste', en: 'Go to the wishlist'},
        visitedCountries: {de: 'Besuchte Länder', en: 'Visited countries'},
        noVisitedCountries: {de: 'Noch keine Reisen mit Stopps.', en: 'No trips with stops yet.'},
        toTrips: {de: 'Zu meinen Reisen', en: 'Go to my trips'},
        noWishes: {de: 'Noch keine Wunschziele.', en: 'No wishlist destinations yet.'},
        bordersCredit: {de: 'Grenzen: Natural Earth', en: 'Borders: Natural Earth'},
    },
    wishlist: {
        title: {de: 'Wunschliste', en: 'Wishlist'},
        subtitle: {de: 'Orte, die du noch sehen möchtest – und warum.', en: 'Places you still want to see – and why.'},
        loading: {de: 'Wunschliste wird geladen …', en: 'Loading wishlist …'},
        loadError: {de: 'Die Wunschliste konnte nicht geladen werden.', en: 'The wishlist could not be loaded.'},
        deleteError: {de: 'Der Eintrag konnte nicht gelöscht werden.', en: 'The entry could not be deleted.'},
        empty: {
            de: 'Deine Wunschliste ist noch leer. Füge dein erstes Wunschziel hinzu.',
            en: 'Your wishlist is still empty. Add your first destination.',
        },
        priority: {
            de: (label: string) => `Priorität: ${label.toLowerCase()}`,
            en: (label: string) => `Priority: ${label.toLowerCase()}`,
        },
        bestTravelTime: {
            de: (time: string) => `Beste Reisezeit: ${time}`,
            en: (time: string) => `Best time to travel: ${time}`,
        },
        planTrip: {de: 'Reise planen', en: 'Plan trip'},
        deleteTitle: {de: 'Wunschziel löschen?', en: 'Delete destination?'},
        deleteMessage: {
            de: (destination: string) => `„${destination}“ wird endgültig von deiner Wunschliste entfernt.`,
            en: (destination: string) => `“${destination}” will be removed from your wishlist for good.`,
        },
        newTitle: {de: 'Neues Wunschziel', en: 'New destination'},
        editTitle: {de: 'Wunschziel bearbeiten', en: 'Edit destination'},
        countries: {de: 'Länder', en: 'Countries'},
        countryLimit: {de: (max: number) => `Höchstens ${max} Länder`, en: (max: number) => `At most ${max} countries`},
        addCountry: {de: 'Land hinzufügen …', en: 'Add a country …'},
        countryRequired: {de: 'Bitte mindestens ein Land wählen.', en: 'Please choose at least one country.'},
        destination: {de: 'Ort oder Region', en: 'Place or region'},
        destinationPlaceholder: {de: 'z. B. Patagonien oder Machu Picchu', en: 'e.g. Patagonia or Machu Picchu'},
        reason: {de: 'Warum möchtest du dorthin?', en: 'Why do you want to go there?'},
        reasonPlaceholder: {de: 'z. B. Nordlichter sehen', en: 'e.g. See the northern lights'},
        priorityLabel: {de: 'Priorität', en: 'Priority'},
        bestTravelTimeLabel: {de: 'Beste Reisezeit', en: 'Best time to travel'},
        bestTravelTimePlaceholder: {de: 'z. B. Februar', en: 'e.g. February'},
        saveFailed: {de: 'Speichern fehlgeschlagen.', en: 'Saving failed.'},
        saveChanges: {de: 'Änderungen speichern', en: 'Save changes'},
        add: {de: 'Zur Wunschliste hinzufügen', en: 'Add to wishlist'},
    },
    priorities: {
        HIGH: {de: 'Hoch', en: 'High'},
        MEDIUM: {de: 'Mittel', en: 'Medium'},
        LOW: {de: 'Niedrig', en: 'Low'},
    },
    continents: {
        AFRICA: {de: 'Afrika', en: 'Africa'},
        ASIA: {de: 'Asien', en: 'Asia'},
        EUROPE: {de: 'Europa', en: 'Europe'},
        NORTH_AMERICA: {de: 'Nordamerika', en: 'North America'},
        SOUTH_AMERICA: {de: 'Südamerika', en: 'South America'},
        OCEANIA: {de: 'Ozeanien', en: 'Oceania'},
        OPEN_OCEAN: {de: 'Ozeane', en: 'Open ocean'},
    },
} satisfies Translations

// One text in both languages; for a function both versions take the same values
type Translation =
    | { de: string, en: string }
    | { de: (...values: never[]) => string, en: (...values: never[]) => string }

// A group of texts, e.g. "nav"; groups can contain groups, e.g. stopTypes.labels
type Translations = { [key: string]: Translation | Translations }

// The texts in one language: every {de, en} pair becomes the text of that language, e.g. t.common.cancel → "Cancel"
type InOneLanguage<T> = T extends { de: infer Text, en: unknown } ? Text : { [K in keyof T]: InOneLanguage<T[K]> }

export type Texts = InOneLanguage<typeof translations>

function isTranslation(value: Translation | Translations): value is Translation {
    return 'de' in value && 'en' in value
}

// Picks the texts of one language out of the pairs, group by group
function inOneLanguage(group: Translations, language: Language): unknown {
    return Object.fromEntries(Object.entries(group).map(([key, value]) => [
        key,
        isTranslation(value) ? value[language] : inOneLanguage(value, language),
    ]))
}

// The texts of each language, made once. Components use useLanguage(); helper functions outside of components
// (e.g. the trip search in utils/tripFilters.ts) get the language as a parameter and look the texts up here.
export const texts: Record<Language, Texts> = {
    de: inOneLanguage(translations, 'de') as Texts,
    en: inOneLanguage(translations, 'en') as Texts,
}
