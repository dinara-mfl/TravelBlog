import {Navigate, Route, Routes} from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import TripDetailPage from './pages/TripDetailPage'
import TripsPage from './pages/TripsPage'
import WishlistPage from './pages/WishlistPage'
import WorldMapPage from './pages/WorldMapPage'

export default function App() {
    return (
        <Routes>
            {/* Pages with the header and navigation */}
            <Route element={<Layout/>}>
                <Route path="/" element={<Navigate to="/trips" replace/>}/>
                <Route path="/trips" element={<TripsPage/>}/>
                <Route path="/trips/:id" element={<TripDetailPage/>}/>
                <Route path="/map" element={<WorldMapPage/>}/>
                <Route path="/wishlist" element={<WishlistPage/>}/>
            </Route>

            {/* Pages without the header */}
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
    )
}
