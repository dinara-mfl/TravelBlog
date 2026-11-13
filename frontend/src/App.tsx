import {Navigate, Route, Routes} from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import TripDetailPage from './pages/TripDetailPage'
import {HOME_PATH, navPages} from './navigation'

export default function App() {
    return (
        <Routes>
            {/* Pages with the header and navigation */}
            <Route element={<Layout/>}>
                <Route path="/" element={<Navigate to={HOME_PATH} replace/>}/>
                {/* Menu pages: defined once in navigation.tsx */}
                {navPages.map((page) => (
                    <Route key={page.path} path={page.path} element={page.element}/>
                ))}
                <Route path="/trips/:id" element={<TripDetailPage/>}/>
            </Route>

            {/* Pages without the header */}
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
    )
}
