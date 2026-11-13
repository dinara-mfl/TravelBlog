import {Outlet} from 'react-router-dom'
import NavBar from './NavBar'

export default function Layout() {
    return (
        <div className="min-h-screen">
            <NavBar/>
            {/* Same width as the header content; spacing as in the mockups */}
            <main className="mx-auto max-w-280 px-6 pt-10 pb-16">
                <Outlet/>
            </main>
        </div>
    )
}
