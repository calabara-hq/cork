import Image from "next/image"


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

    const props = {
        ...(width && { width }),
        ...(height && { height }),
        ...(sizes && { sizes }),
        fill,
        className,

    }

    return (
        <Image
            src={url}
            alt={alt}
            {...props}
        />
    )
}