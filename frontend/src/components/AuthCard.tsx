import type {ReactNode} from 'react'
import LanguageSwitch from './LanguageSwitch'
import ThemeToggle from './ThemeToggle'

type AuthCardProps = {
    title: string
    subtitle: string
    footer: ReactNode
    children: ReactNode
}

// Shared frame for the login and registration pages: design and language switch, logo, white card, link below
export default function AuthCard({title, subtitle, footer, children}: Readonly<AuthCardProps>) {
    return (
        <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
            {/* Top right, where the header has it on the other pages */}
            <div className="absolute top-4 right-6 flex items-center gap-3">
                <ThemeToggle/>
                <LanguageSwitch/>
            </div>
            <div className="flex w-full max-w-md flex-col gap-8">
                <div className="flex items-center justify-center gap-2.5 text-lg font-bold text-ink">
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
                    TravelBlog
                </div>

                <section className="rounded-card bg-surface p-8 shadow-card sm:p-10">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-1.5 text-muted">{subtitle}</p>
                    <div className="mt-8">{children}</div>
                </section>

                <p className="text-center text-[15px] text-muted">{footer}</p>
            </div>
        </main>
    )
}