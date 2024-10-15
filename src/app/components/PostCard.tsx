"use client"

import { ChannelToken } from "@/app/types"
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { isMobile } from "../utils/isMobile";
import { parseIpfsUrl } from "../utils/ipfs";
import Image from "next/image";
import { ImageWrapper } from "./MediaWrapper";
import { RenderInteractiveVideoWithLoader } from "./Video";
import { Button } from "./Button";
import { ITokenMetadata } from "@tx-kit/sdk/subgraph";
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


const CardRenderer = ({ token, isActive }: { token: ChannelToken, isActive: boolean }) => {


    if (token.metadata?.animation) return (
        <React.Fragment>
            <RenderInteractiveVideoWithLoader videoUrl={parseIpfsUrl(token.metadata.animation).gateway} posterUrl={parseIpfsUrl(token.metadata.image).gateway} isActive={isActive} />
            <p className="font-bold text-t1 line-clamp-1">{token.metadata.name}</p>
        </React.Fragment>
    )

    else if (token.metadata?.image) return (
        <React.Fragment>
            <ImageWrapper >
                <Image
                    src={parseIpfsUrl(token.metadata.image).gateway}
                    draggable={false}
                    alt="submission image"
                    fill
                    sizes="30vw"
                    className="object-contain w-full h-full transition-transform duration-300 ease-in-out rounded-xl"
                />
            </ImageWrapper>
            <p className="font-bold text-t1 line-clamp-1">{token.metadata.name}</p>
        </React.Fragment>
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

export const TokenCardFooter = ({
    token,
    //channel,
    //handleManage,
    mintLabel = "mints",
}: {
    token: ChannelToken
    //channel: Channel,
    //handleManage: (event: any, token: ChannelToken | ChannelTokenV1 | ChannelTokenIntent) => void,
    mintLabel?: string
}) => {

    return (
        <div className="flex flex-col w-full">
            <div className="flex w-full items-center gap-2">
                <div className="w-full gap-2 flex flex-wrap items-center font-semibold text-sm text-t2">
                    {/* <Avatar address={token.author} size={28} />
                    <AddressOrEns address={token.author} /> */}
                    {Number(token.totalMinted) > 0 ? (
                        <span className="ml-auto text-t2 text-sm font-medium">
                            {compact_formatter.format(Number(token.totalMinted))} {mintLabel}
                        </span>
                    ) : (
                        <span />
                    )}
                </div>

                {/* <AdminWrapper admins={channel.managers.map(manager => { return { address: manager } })}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-t2"
                        onClick={(event: any) => handleManage(event, token)}>
                        <MdOutlineSettings className="h-6 w-6" />
                    </Button>
                </AdminWrapper> */}


            </div>
        </div>
    )
}


export const TokenCard = ({ token, footer, showTotalMints = true }: { token: ChannelToken, footer: React.ReactNode, showTotalMints?: boolean }) => {
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
            <CardRenderer token={token} isActive={isActive} />
            <div className="bg-base w-full h-0.5" />
            {footer}
        </div>

    )
}