import LogoutButton from '../components/LogoutButton'

export default function HomePage() {
    const username = localStorage.getItem('username')

    return (
        <main>
            <header>
                <span>TravelBlog</span>
                <span>{username}</span>
                <LogoutButton />
            </header>
            <h1>Meine Reisen</h1>
        </main>
    )
}