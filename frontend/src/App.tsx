import {Navigate, Route, Routes} from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import SlowServerNotice from './components/SlowServerNotice'
import TripDetailPage from './pages/TripDetailPage'
import {HOME_PATH, navPages} from './navigation'

export default function App() {
    return (
        <>
            <Routes>
                {/* Pages without the header, reachable without login */}
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>

                {/* Pages with the header and navigation, only for logged-in users */}
                <Route
                    element={
                        <ProtectedRoute>
                            <Layout/>
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<Navigate to={HOME_PATH} replace/>}/>
                    {/* Menu pages: defined once in navigation.tsx */}
                    {navPages.map((page) => (
                        <Route key={page.path} path={page.path} element={page.element}/>
                    ))}
                    <Route path="/trips/:id" element={<TripDetailPage/>}/>
                </Route>

                <Route path="*" element={<NotFoundPage/>}/>
            </Routes>
            {/* On every page, also on the login page: a note while the server wakes up */}
            <SlowServerNotice/>
        </>
    )
}