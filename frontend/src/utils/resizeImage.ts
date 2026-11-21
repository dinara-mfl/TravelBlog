// Longest side of an uploaded photo; enough for a large view, small enough for the free database
const MAX_SIDE = 2000
const JPEG_QUALITY = 0.85

/**
 * Shrinks a photo in the browser before the upload and converts it to JPEG.
 * A photo from a phone (3–6 MB) becomes about 300–500 KB.
 */
export async function resizeImage(file: File): Promise<Blob> {
    const image = await createImageBitmap(file) // also turns photos the right way up (EXIF orientation)
    const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.width * scale)
    canvas.height = Math.round(image.height * scale)
    const context = canvas.getContext('2d')
    if (!context) {
        throw new Error('Canvas is not supported')
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    image.close()

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Photo could not be converted'))),
            'image/jpeg',
            JPEG_QUALITY,
        )
    })
}