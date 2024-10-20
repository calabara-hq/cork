"use client"

import { ChannelToken, ChannelTokenIntent } from "@/app/types"
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { isMobile } from "../utils/isMobile";
import { parseIpfsUrl } from "../utils/ipfs";
import Image from "next/image";
import { ImageWrapper } from "./MediaWrapper";
import { RenderInteractiveVideoWithLoader } from "./Video";
import { Button } from "./Button";
import { ITokenMetadata } from "@tx-kit/sdk/subgraph";
import { AddressOrEns, NoggleAvatar } from "./User";
import { Zap } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
// import { RenderInteractiveVideoWithLoader } from "../VideoPlayer";
// import { parseIpfsUrl } from "@/lib/ipfs";
// import { ImageWrapper } from "../Submission/MediaWrapper";
// import UplinkImage from "@/lib/UplinkImage";
// import { AddressOrEns, Avatar } from "../AddressDisplay/AddressDisplay";

//import { Admin } from "@/types/space";
// import { isMobile } from "@/lib/isMobile";
// import { useInView } from "react-intersection-observer";
// import { Button } from "../DesignKit/Button";

const compact_formatter = new Intl.NumberFormat('en', { notation: 'compact' })

const CardMediaRenderer = ({ token, isActive }: { token: ChannelToken | ChannelTokenIntent, isActive: boolean }) => {

    if (token.metadata?.animation) return (
        <RenderInteractiveVideoWithLoader videoUrl={parseIpfsUrl(token.metadata.animation).gateway} posterUrl={parseIpfsUrl(token.metadata.image).gateway} isActive={isActive} />
    )

    else if (token.metadata?.image) return (
        <ImageWrapper >
            <OptimizedImage
                src={parseIpfsUrl(token.metadata.image).gateway}
                alt="submission image"
                width={300}
                height={400}
                sizes="30vw"
                className="object-contain w-full h-full transition-transform duration-300 ease-in-out rounded-xl"
            />
        </ImageWrapper>
    )

    else return null;
}

export const MintButton = ({ onClick, styleOverride }: { onClick: (event: React.MouseEvent<HTMLButtonElement>) => void, styleOverride?: string }) => {
    return (
        <Button
            variant="secondary"
            className={styleOverride}
            onClick={onClick}>
            Mint
        </Button>
    )
}


export const TokenCard = ({ token, showTotalMints = true }: { token: ChannelToken | ChannelTokenIntent, showTotalMints?: boolean }) => {
    const [isActive, setIsActive] = useState(false);
    const isMobileDevice = isMobile();

    const { ref, inView } = useInView({
        threshold: 1,
    });

    useEffect(() => {
        if (inView && isMobileDevice) {
            setIsActive(true);
        }
    }, [inView, isMobileDevice]);

    return (
        <div ref={ref} className="relative flex flex-col gap-2 rounded-lg w-full p-2"
            onMouseEnter={() => !isMobileDevice && setIsActive(true)}
            onMouseLeave={() => !isMobileDevice && setIsActive(false)}
        >
            <CardMediaRenderer token={token} isActive={isActive} />


            <div className="flex flex-row gap-2 items-center text-primary">
                <NoggleAvatar address={token.author} size={28} />
                <div className="rounded-lg bg-accent2 text-xs px-2 py-1">
                    <AddressOrEns address={token.author} />
                </div>
                {Number(token.totalMinted) > 0 ? (
                    <div className="flex flex-row items-center gap-1 text-sm font-medium rounded-lg bg-accent2 px-2 ml-auto">
                        <Zap className="w-4 h-4 text-primary" />
                        {compact_formatter.format(Number(token.totalMinted))}
                    </div>
                ) : (
                    <div />
                )}
            </div>



            <p className="font-bold text-t1 line-clamp-1">{token.metadata?.name ?? ""}</p>

        </div>

    )
}