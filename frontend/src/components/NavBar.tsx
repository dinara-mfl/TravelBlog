import {Link, NavLink} from "react-router-dom";
import {HOME_PATH, navPages} from '../navigation'

const linkBase = 'flex min-h-11 items-center rounded-full px-4 text-[15px] font-semibold'

export default function NavBar() {

    return (
        <header className="border-b border-line bg-surface">
            {/* Same width as the page content. On small screens: logo and profile in the first row,
          the links in a second row; from md (768 px) on: everything in one row */}
            <div className="mx-auto flex max-w-280 flex-wrap items-center gap-x-8 gap-y-2 px-6 py-3.5">
                <Link to={HOME_PATH} className="flex min-h-11 items-center gap-2.5 text-lg font-bold text-ink">
                    <CloudIcon/>
                    TravelBlog
                </Link>

                <nav
                    aria-label="Hauptnavigation"
                    className="order-last flex basis-full flex-wrap gap-1 md:order-0 md:flex-1 md:basis-auto"
                >
                    {navPages.map((page) => (
                        // NavLink marks the current page (also /trips/123 for "Reisen") and sets aria-current="page"
                        <NavLink
                            key={page.path}
                            to={page.path}
                            className={({isActive}) =>
                                isActive
                                    ? `${linkBase} bg-accent-soft text-accent`
                                    : `${linkBase} text-muted hover:text-ink`
                            }
                        >
                            {page.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Placeholder: shows the user's initials and opens the profile menu once login exists */}
                <button
                    type="button"
                    aria-label="Profil öffnen"
                    className="ml-auto flex size-11 cursor-pointer items-center justify-center rounded-full bg-accent-soft text-accent"
                >
                    <UserIcon/>
                </button>
            </div>
        </header>
    )
}

function CloudIcon() {
    return (
        <svg
            aria-hidden="true"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
        >
            <path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1-.5 8.5H7z"/>
        </svg>
    )
}

function UserIcon() {
    return (
        <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 21a8 8 0 0 1 16 0"/>
        </svg>
    )
}