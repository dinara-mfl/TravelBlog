import {useEffect, useState} from 'react'
import {useMap} from 'react-leaflet'
import {useLanguage} from '../i18n/useLanguage'

// How long the hint stays after the last scroll over the map
const HINT_DURATION_MS = 1500

// Zooming with the wheel as on other web maps: a pinch on the touchpad or Ctrl (⌘ on a Mac) + mouse wheel zooms
// the map; plain scrolling scrolls the page and shows a short hint how to zoom.
// The browser reports a pinch on the touchpad as a wheel event with ctrlKey. Leaflet's own wheel zoom handles it
// and stops the browser from zooming the whole page; this component only keeps plain scrolling away from Leaflet.
// It has to be a component inside MapContainer, because only there useMap knows the map.
export default function MapWheelZoom() {
    const map = useMap()
    const {t} = useLanguage()
    const [hintVisible, setHintVisible] = useState(false)

    useEffect(() => {
        const container = map.getContainer()
        let hideTimer: ReturnType<typeof setTimeout> | undefined

        function handleWheel(event: WheelEvent) {
            if (event.ctrlKey || event.metaKey) {
                return
            }
            // In the capture phase, before Leaflet's listener; without preventDefault the page scrolls as usual
            event.stopImmediatePropagation()
            setHintVisible(true)
            clearTimeout(hideTimer)
            hideTimer = setTimeout(() => setHintVisible(false), HINT_DURATION_MS)
        }

        container.addEventListener('wheel', handleWheel, {capture: true})
        return () => {
            container.removeEventListener('wheel', handleWheel, {capture: true})
            clearTimeout(hideTimer)
        }
    }, [map])

    // Above the tiles and markers (Leaflet's controls use z-index 1000); clicks go through to the map
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-1000 flex items-center justify-center bg-black/40 p-4 transition-opacity duration-300 ${
                hintVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <p className="rounded-full bg-surface px-5 py-2.5 text-center text-[15px] font-semibold text-ink shadow-card">
                {t.stops.zoomHint}
            </p>
        </div>
    )
}
