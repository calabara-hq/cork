import { ChannelToken, ChannelTokenIntent, isTokenIntent } from "@/app/types"
import { parseIpfsUrl } from "@/app/utils/ipfs"
import { IChannel, IInfiniteTransportConfig } from "@tx-kit/sdk/subgraph"
import { Address, maxUint40 } from "viem"
import { RenderStandardVideoWithLoader } from "../Video"
import { OptimizedImage } from "../OptimizedImage"
import { useWalletClient } from "wagmi"
import React, { useEffect, useState } from "react"
import { Button } from "../Button"
import { DisplayMode } from "./MintableTokenDisplay"
import toast from "react-hot-toast"
import { DialogContent, DialogHeader, DialogTitle } from "../Dialog"
import WalletConnectButton from "../WalletConnectButton"
import { BadgeCheck, Forward } from "lucide-react"
import { usePathname } from "next/navigation"
import { Slider } from "../Slider"

export type FeeStructure = {
    creatorPercentage: number
    channelPercentage: number
    referralPercentage: number
    sponsorPercentage: number
    uplinkPercentage: number
    ethMintPrice: bigint
    erc20MintPrice: bigint
    erc20Contract: Address
}

export const isErc20Mintable = (fees: FeeStructure) => {
    return fees.erc20MintPrice > BigInt(0)
}

export const formatFeeKey = (key: string, value: string) => {
    switch (key) {
        case "uplinkPercentage":
            return "Protocol Reward";
        case "creatorPercentage":
            return "Creator Reward";
        case "channelPercentage":
            return "Space Reward";
        case "referralPercentage":
            return "Referral Reward";
        case "sponsorPercentage":
            return "Sponsor Reward";
        default:
            return null;
    }
}

const constructTokenUrl = ({ displayMode, pathname, referral, token }: { displayMode: DisplayMode, pathname: string, referral: string, token: ChannelToken }) => {
    return `${process.env.NEXT_PUBLIC_CLIENT_URL}${pathname}${referral ? `?${referral}` : ''}`
}

export const ShareModalContent = ({ displayMode, token, handleClose }: { displayMode: DisplayMode, token: ChannelToken, handleClose: () => void }) => {
    const { data: walletClient } = useWalletClient();
    const pathname = usePathname();
    const [success, setSuccess] = useState(false);

    const handleShare = () => {
        const referralLink = walletClient?.account?.address ? `referrer=${walletClient.account.address}` : ''
        const shareUrl = constructTokenUrl({ displayMode, pathname, referral: referralLink, token })
        navigator.clipboard.writeText(shareUrl);
        setSuccess(true)
        toast.success("Link Copied")
        handleClose();
    };

    useEffect(() => {
        if (walletClient?.account.address) {
            handleShare();
        }
    }, [walletClient?.account.address])


    return (
        <div className="flex flex-col w-full gap-1 lg:gap-4 p-0 max-w-[350px]">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Post</DialogTitle>
                </DialogHeader>
                {!walletClient?.account.address && <p className="text-t2">Connect your wallet to earn referral rewards whenever someone mints with your link.</p>}
                <WalletConnectButton>
                    {success && (
                        <div className="flex flex-col gap-2 items-center text-center animate-springUp">
                            <BadgeCheck className="w-16 h-16 text-success" />
                            <p className="text-t1 text-lg font-bold">Link Copied!</p>
                        </div>
                    )}
                </WalletConnectButton>
                {!walletClient?.account.address &&
                    <React.Fragment>
                        <div className="w-full h-0.5 bg-base-200" />
                        <div className="flex flex-col gap-2">
                            <p className="text-t2">Or just copy link</p>
                            <Button variant="secondary" onClick={handleShare}>Copy Link</Button>
                        </div>
                    </React.Fragment>
                }
            </DialogContent>
        </div>
    )
}

export const ShareButton = ({ displayMode, token, onClick, className }: { displayMode: DisplayMode, token: ChannelToken, onClick: (event?: any) => void, className?: string }) => {
    const { data: walletClient } = useWalletClient();
    const [shareText, setShareText] = useState("Share Post");

    const handleShare = (event: any, link: string) => {
        event.stopPropagation();
        event.preventDefault();
        setShareText("Link Copied");
        toast.success("Link Copied")
        navigator.clipboard.writeText(link);
        setTimeout(() => {
            setShareText("Share Post");
        }, 2000);
    };
    const handleShareClick = (event: any) => {

        if (walletClient?.account?.address) {
            const referralLink = walletClient?.account?.address ? `referrer=${walletClient?.account?.address}` : ''
            handleShare(event, constructTokenUrl({ displayMode, pathname: `/post/${token.tokenId}`, referral: referralLink, token }))
        }
        else {
            onClick(event);
        }
    }

    return (
        <Button
            variant="outline"
            className={`${className}`}
            onClick={handleShareClick}
        >
            <Forward className="w-4 h-4" />
        </Button>
    )
}

export const CounterInput = ({ count, setCount, max }: { count: string, setCount: (count: string) => void, max: string }) => {

    const visualMax = Number(max) > 1000 ? 1000 : Number(max)

    // const handleInputChange = (e) => {
    //     const asInteger = asPositiveInt(e.target.value)
    //     setCount(
    //         parseInt(asInteger) > parseInt(max)
    //             ?
    //             max
    //             :
    //             asInteger
    //     )
    // }

    return (
        <div className="flex flex-col w-full gap-2">
            <div className="flex flex-row gap-2 items-center">
                <p>amount: {count}</p>
                {/* <Input
                    type="number"
                    className="text-center w-[40px] bg-transparent"
                    variant="default"
                    onWheel={(e) => e.currentTarget.blur()}
                    value={count}
                    onChange={handleInputChange}
                /> */}
            </div>

            <Slider onValueChange={(value: number[]) => setCount(value[0].toString())} defaultValue={[1]} min={1} max={visualMax} step={1} />
        </div>
    )

    // const handleInputChange = (e) => {
    //     const asInteger = asPositiveInt(e.target.value)
    //     setCount(
    //         parseInt(asInteger) > parseInt(max)
    //             ?
    //             max
    //             :
    //             asInteger
    //     )
    // }

    // return (
    //     <div className="flex items-center w-full gap-1">
    //         <Button variant="ghost" className="m-auto text-t1" disabled={count === '1' || count === ''} onClick={() => setCount((Number(count) - 1).toString())}><LuMinusSquare className="w-4 h-4" /></Button>
    //         <div className="w-full">
    //             <Input
    //                 type="number"
    //                 className="text-center w-full max-w-full bg-transparent"
    //                 variant="default"
    //                 onWheel={(e) => e.currentTarget.blur()}
    //                 value={count}
    //                 onChange={handleInputChange}
    //             />
    //         </div>
    //         <Button variant="ghost" className="text-t1" disabled={max ? Number(count) >= Number(max) : false} onClick={() => setCount((Number(count) + 1).toString())}><LuPlusSquare className="w-4 h-4" /></Button>
    //     </div >
    //)
}

export const calculateSaleEnd = (channel: IChannel, token: ChannelToken | ChannelTokenIntent): number => {
    const transportConfig = channel.transportLayer.transportConfig as IInfiniteTransportConfig;

    if (isTokenIntent(token)) {
        return Number(token.deadline);
    }

    else {
        const saleEnd = Number((token as ChannelToken).blockTimestamp) + Number(transportConfig.saleDuration);
        return saleEnd >= Number(maxUint40) ? Number(maxUint40) : saleEnd
    }

}

export const isMintPeriodOver = (saleEnd: number) => {
    return saleEnd <= Math.floor(Date.now() / 1000);
}

export const RenderMintMedia = ({ imageURI, animationURI, size = "sm" }: { imageURI: string; animationURI: string, size?: string }) => {
    const gatewayImageURI = parseIpfsUrl(imageURI).gateway
    const gatewayAnimationURI = parseIpfsUrl(animationURI).gateway

    if (gatewayAnimationURI) {
        return (
            <RenderStandardVideoWithLoader videoUrl={gatewayAnimationURI} posterUrl={gatewayImageURI} />
        )

    }
    else if (gatewayImageURI) {
        return (
            <OptimizedImage
                src={gatewayImageURI}
                alt="Picture of the author"
                sizes={size === "sm" ? "30vw" : "50vw"}
                className={`w-full h-auto max-w-full ${size === "sm" ? "max-h-96" : "max-h-[700px]"} object-contain`}
                width={size === "sm" ? 500 : 700}
                height={size === "sm" ? 300 : 700}
            />
        )
    }
}
