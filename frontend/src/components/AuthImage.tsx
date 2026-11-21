import {useEffect, useState} from 'react'
import {loadPhotoUrl} from '../api/photos'

type AuthImageProps = {
    photoId: string
    alt: string
    className?: string
}

// A stored photo; it needs the token, so it is loaded with axios instead of a plain <img src>
export default function AuthImage({photoId, alt, className = ''}: Readonly<AuthImageProps>) {
    const [url, setUrl] = useState<string | null>(null)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        let cancelled = false
        loadPhotoUrl(photoId)
            .then((loaded) => {
                if (!cancelled) setUrl(loaded)
            })
            .catch(() => {
                if (!cancelled) setFailed(true)
            })
        return () => {
            cancelled = true
        }
    }, [photoId])

    if (!url) {
        // Grey placeholder of the same size while loading or if the photo is missing
        return (
            <div role="img" aria-label={failed ? 'Foto nicht verfügbar' : alt} className={`bg-chip ${className}`}/>
        )
    }
    return <img src={url} alt={alt} className={`object-cover ${className}`}/>
}