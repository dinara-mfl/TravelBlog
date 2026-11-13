import type {ReactElement} from 'react'
import TripsPage from './pages/TripsPage'
import WishlistPage from './pages/WishlistPage'
import WorldMapPage from './pages/WorldMapPage'

// Start page: the logo, "/" and the 404 page lead here.
export const HOME_PATH = '/trips'

type NavPage = {
    path: string
    label: string
    element: ReactElement
}

// Pages in the main navigation, in menu order.
// Each entry creates both the route (App.tsx) and the menu link (NavBar.tsx).
export const navPages: NavPage[] = [
    {path: HOME_PATH, label: 'Reisen', element: <TripsPage/>},
    {path: '/map', label: 'Weltkarte', element: <WorldMapPage/>},
    {path: '/wishlist', label: 'Wunschliste', element: <WishlistPage/>},
]
