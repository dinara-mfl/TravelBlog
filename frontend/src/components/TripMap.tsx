import {useEffect} from 'react'
import {MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap} from 'react-leaflet'
import {divIcon, latLngBounds, type LatLngTuple} from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {useLanguage} from '../i18n/useLanguage'
import type {Stop} from '../types/trip'
import {getCountryName} from '../utils/countries'
import {formatStay} from '../utils/dates'
import {formatKm} from '../utils/tripFilters'
import MapWheelZoom from './MapWheelZoom'

type TripMapProps = {
    stops: Stop[] // in the order of the visit; at least one
    routeLengthKm: number // sum of the straight-line distances between the stops, from the backend
    className?: string // e.g. to make the card sticky on wide screens
}

// Space around the stops when the map fits them in, and the closest zoom, so that two places in one city
// still show the surroundings
const FIT_OPTIONS = {padding: [48, 48] as [number, number], maxZoom: 12}
// A single place is shown from far away, so that the map tells where in the country or the region it lies
const SINGLE_STOP_FIT_OPTIONS = {...FIT_OPTIONS, maxZoom: 5}

// Marker colors: blue for the stops on the route, the card color (white, dark in dark mode) with a blue ring for
// day trips
const ROUTE_MARKER_CLASSES = 'border-white bg-accent text-on-accent'
const DAY_TRIP_MARKER_CLASSES = 'border-accent bg-surface text-accent'

// A round marker; with several stops it shows the number of the stop in the order of the visit.
// A divIcon instead of Leaflet's default marker, because the default marker images are not found after the Vite build.
function stopIcon(label: string, onRoute: boolean) {
    const colors = onRoute ? ROUTE_MARKER_CLASSES : DAY_TRIP_MARKER_CLASSES
    return divIcon({
        className: '',
        html: `<span class="flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold shadow-card ${colors}">${label}</span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
    })
}

function fitOptions(stopCount: number) {
    return stopCount === 1 ? SINGLE_STOP_FIT_OPTIONS : FIT_OPTIONS
}

// Fits the map to the stops: once at the start and again whenever a stop is added, moved or deleted,
// but not when only a name or a note changes, so the map stays where the user moved it.
// The positions arrive as text, e.g. "43.77,11.25;45.44,12.33", because a new array after every save
// would run the effect each time.
// It has to be a component inside MapContainer, because only there useMap knows the map.
function FitToStops({positionsKey}: Readonly<{ positionsKey: string }>) {
    const map = useMap()

    useEffect(() => {
        const positions = positionsKey.split(';')
            .map((position) => position.split(',').map(Number) as LatLngTuple)
        // The box is higher with a route than with a single place; Leaflet has to measure it again first
        map.invalidateSize()
        map.fitBounds(latLngBounds(positions), fitOptions(positions.length))
    }, [map, positionsKey])

    return null
}

// The map card in "Reiseverlauf" (as in the mockup): the stops as numbered markers with their names, a line between
// the stops on the route (overnight stays and places on the way) in the order of the visit, a thin dotted line from
// the base to each day trip, and below the map the number of places and the route length.
// A click on a marker shows the place, its dates and the note.
export default function TripMap({stops, routeLengthKm, className = ''}: Readonly<TripMapProps>) {
    const {t, language} = useLanguage()
    const positions: LatLngTuple[] = stops.map((stop) => [stop.latitude, stop.longitude])
    const routePositions: LatLngTuple[] = stops
        .filter((stop) => stop.onRoute)
        .map((stop) => [stop.latitude, stop.longitude])
    // A line from the base to each day trip; day trips before the first overnight stop have no base and no line
    const dayTripLines = stops.flatMap((stop) => {
        const base = stops.find((candidate) => candidate.id === stop.baseStopId)
        if (!base) {
            return []
        }
        const line: LatLngTuple[] = [[base.latitude, base.longitude], [stop.latitude, stop.longitude]]
        return [{id: stop.id, line}]
    })
    const severalStops = stops.length > 1
    const hasRoute = routePositions.length > 1

    return (
        <div className={`flex flex-col gap-4 rounded-card bg-surface p-4 shadow-card ${className}`}>
            {/* isolate: Leaflet's layers have a high z-index; this keeps them below the rest of the page.
                The height is set here and not on MapContainer, because react-leaflet sets its class only once,
                and a single place needs less room than a route. */}
            <div className={`isolate overflow-hidden rounded-xl ${severalStops ? 'h-80 lg:h-[30rem]' : 'h-64 lg:h-80'}`}>
                <MapContainer
                    bounds={latLngBounds(positions)}
                    boundsOptions={fitOptions(stops.length)}
                    // Zooming with a pinch or Ctrl + mouse wheel; plain scrolling scrolls the page (MapWheelZoom below)
                    className="h-full w-full"
                >
                    <TileLayer
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        maxZoom={19}
                    />
                    {/* Day trips first, so the route line is drawn above them; thinner and dotted, not part of the route */}
                    {dayTripLines.map(({id, line}) => (
                        <Polyline
                            key={id}
                            positions={line}
                            className="stroke-accent"
                            weight={3}
                            opacity={0.7}
                            // Short dashes with round ends look like dots
                            dashArray="1 7"
                        />
                    ))}
                    {hasRoute && (
                        // The options as props, not as pathOptions: Leaflet reads className only when it creates the line
                        <Polyline
                            positions={routePositions}
                            className="stroke-accent"
                            weight={3}
                            opacity={0.8}
                            dashArray="8 8"
                        />
                    )}
                    {stops.map((stop, position) => (
                        <Marker
                            key={stop.id}
                            position={[stop.latitude, stop.longitude]}
                            // A single place has no number, as in the list next to the map
                            icon={stopIcon(severalStops ? String(position + 1) : '', stop.onRoute)}
                            title={stop.name}
                            alt={stop.name}
                        >
                            {/* The name next to the marker, always visible; the ! classes win over leaflet.css */}
                            <Tooltip
                                permanent
                                direction="right"
                                offset={[14, 0]}
                                className="rounded-full! border-0! px-2.5! py-0.5! font-sans text-[13px] font-semibold text-ink shadow-card! before:hidden"
                            >
                                {stop.name}
                            </Tooltip>
                            <Popup>
                                <div className="flex max-w-60 flex-col gap-1 font-sans">
                                    <strong className="text-base text-ink">{stop.name}</strong>
                                    <span className="text-[13px] font-semibold text-muted">
                                        {formatStay(stop.date, stop.departureDate, language)} · {getCountryName(stop.countryCode, language)}
                                    </span>
                                    {stop.note && <span className="text-sm text-ink-soft">{stop.note}</span>}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    <FitToStops positionsKey={positions.map((position) => position.join(',')).join(';')}/>
                    <MapWheelZoom/>
                </MapContainer>
            </div>
            {/* With one place the numbers would only say "1 Ort"; without a route there is no distance */}
            {severalStops && (
                <dl className="grid grid-cols-2 gap-4 px-2 pb-1">
                    <div className="flex flex-col gap-1">
                        <dt className="text-[13px] font-semibold text-muted">{t.stops.places}</dt>
                        <dd className="text-2xl font-bold">{stops.length}</dd>
                    </div>
                    {hasRoute && (
                        <div className="flex flex-col gap-1">
                            <dt className="text-[13px] font-semibold text-muted">{t.stops.route}</dt>
                            <dd className="text-2xl font-bold">{formatKm(routeLengthKm, language)}</dd>
                        </div>
                    )}
                </dl>
            )}
        </div>
    )
}
