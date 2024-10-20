"use client";

import { IChannel, ICustomFees } from "@tx-kit/sdk/subgraph"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip"
import constants from "@/app/constants"
import { formatEther, formatUnits } from "viem"
import { useTokenInfo } from "@/app/hooks/useTokenInfo"


const hexToRgba = (hex: string, alpha: number) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


export const MintSplits = ({ channelFees, spaceName }: { channelFees: ICustomFees, spaceName: string }) => {

    const { symbol, decimals } = useTokenInfo(channelFees.erc20Contract, constants.CHAIN_ID);

    const chartData = [
        { recipient: "Creator", percentage: channelFees.creatorPercentage, fill: hexToRgba('var(--primary)', 1) },
        { recipient: "Referral", percentage: channelFees.mintReferralPercentage, fill: hexToRgba('var(--primary)', 0.9) },
        { recipient: "Sponsor", percentage: channelFees.sponsorPercentage, fill: hexToRgba('var(--primary)', 0.8) },
        { recipient: "Protocol", percentage: channelFees.uplinkPercentage, fill: hexToRgba('var(--primary)', 0.7) },
        { recipient: spaceName, percentage: channelFees.channelPercentage, fill: hexToRgba('var(--primary)', 0.6) },
    ];

    const formatErc20Amount = (amount: bigint) => {
        return formatUnits(amount, decimals ?? 18)
    }


    return (
        <Card className="p-2 lg:p-4 rounded-lg">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <CardTitle>Mint price</CardTitle>
                    <CardDescription className="text-t2">
                        {formatEther(channelFees.ethMintPrice)} ETH
                        {symbol ? ` / ${formatErc20Amount(channelFees.erc20MintPrice)} ${symbol}` : null}
                    </CardDescription>
                </div>
                <CardTitle>Splits</CardTitle>
            </div>

            <CardContent className="p-2">

                <div className="flex items-center gap-2 w-[500px] max-w-full">
                    {chartData.map((el, idx) => (
                        el.percentage > 0 && (
                            <TooltipProvider delayDuration={200} key={idx}>
                                <div
                                    className={`h-6 md:h-12`}
                                    //w-[${el.percentage * 5}px]
                                    style={{
                                        width: `${el.percentage * 5}px`,  // Dynamically set width based on percentage
                                        //backgroundColor: el.fill,  // Use the fill color from your data
                                    }}
                                >
                                    <Tooltip key={idx}>
                                        <TooltipTrigger
                                            className={`w-full h-full bg-primary`}
                                            style={{ opacity: 1 - 0.2 * idx }}
                                        />
                                        {/* <TooltipTrigger className={`w-full h-full bg-primary `} /> */}
                                        <TooltipContent>
                                            <div className="rounded-lg p-4 font-bold">
                                                <p>{el.recipient}: {el.percentage}%</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>
                        )
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-2">

                <div className="flex items-center flex-wrap gap-2">
                    {chartData.map((el, idx) => {
                        return (
                            <div key={idx} className="flex items-center gap-1">
                                <div
                                    className="h-3 w-3 bg-primary"
                                    style={{ opacity: 1 - 0.2 * idx }}
                                />
                                <p className="text-xs">{el.recipient}</p>
                            </div>
                        );
                    })}
                </div>
            </CardFooter>
        </Card>
    );

};