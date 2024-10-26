"use client";
import Image from "next/image"
import { useEffect, useState } from "react"

export const OptimizedImage = ({
    src,
    alt,
    sizes,
    width,
    height,
    fill = false,
    quality = 85,
    className
}: {
    src: string,
    alt: string,
    sizes?: string,
    width?: number,
    height?: number,
    fill?: boolean,
    quality?: number,
    className?: string
}) => {

    const urlWidth = width ? `img-width=${width}` : ''
    const urlHeight = height ? `&img-height=${height}` : ''
    const urlQuality = `&img-quality=${quality}`
    const url = `${src}?${urlWidth}${urlHeight}${urlQuality}`

    const [error, setError] = useState(false)

    useEffect(() => {
        setError(false)
    }, [url])

    const props = {
        ...(width && { width }),
        ...(height && { height }),
        ...(sizes && { sizes }),
        fill,
        className,

    }

    return (
        <Image
            src={error ? src : url}
            alt={alt}
            onError={() => setError(true)}
            {...props}
        />
    )
}