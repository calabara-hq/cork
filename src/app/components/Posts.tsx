"use client";

import React, { useEffect, useMemo } from "react";
import { ChannelToken, ChannelTokenIntent, isTokenIntent } from "../types";
import { IChannel } from "@tx-kit/sdk/subgraph";
import RenderIfVisible from "./Virtualization";
import { useInView } from "react-intersection-observer";
import { usePosts } from "../hooks/usePosts";
import { TokenCard } from "./PostCard";
import Link from "next/link";
import { DeferredTokenIntentWithSignature } from "@tx-kit/sdk";

export const PostSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex w-full justify-evenly items-center">
                <div className="w-10/12 sm:w-full m-auto grid gap-4 post-columns auto-rows-fr">
                    <div className="space-y-2 border-accent2 border p-2 rounded-xl h-[318px] shimmer" />
                    <div className="space-y-2 lg:col-span-1 border-accent2 border p-2 rounded-xl h-[318px] shimmer" />
                    <div className="space-y-2 lg:col-span-1 border-accent2 border p-2 rounded-xl h-[318px] shimmer" />
                    <div className="space-y-2 lg:col-span-1 border-accent2 border p-2 rounded-xl h-[318px] shimmer" />
                    <div className="space-y-2 lg:col-span-1 border-accent2 border p-2 rounded-xl h-[318px] shimmer" />
                    <div className="space-y-2 lg:col-span-1 border-accent2 border p-2 rounded-xl h-[318px] shimmer" />


                </div>
            </div>
        </div>
    );
}


const MapTokens = React.memo(({
    tokens,
    //channel,
    //spaceName,
    // handleMint,
    // handleManage
}: {
    tokens: Array<ChannelToken | ChannelTokenIntent>,
    //channel: IChannel,
    //spaceName: string,
    // handleMint: (event: any, token: ChannelToken | ChannelTokenV1 | ChannelTokenIntent) => void,
    // handleManage: (event: any, token: ChannelToken | ChannelTokenV1 | ChannelTokenIntent) => void
}) => {

    return tokens.map((token, index) => {
        return (
            <RenderIfVisible
                key={index}
                defaultHeight={350}
                visibleOffset={200}
                stayRendered={false}

            >
                <Link
                    className="cursor-pointer shadow-lg shadow-black hover:shadow-[#262626] no-select"
                    //href={`/token/${token.tokenId}${isTokenIntent(token) && `?intent=true`}`}
                    href={isTokenIntent(token) ? `/post/${token.id}?intent=true` : `/post/${token.tokenId}`}
                // onClick={(event) => handleMint(event, token)}
                >
                    <div className="border bg-accent1 border-accent2 hover:border-accent3 rounded-lg">
                        <TokenCard
                            key={index}
                            token={token}
                        />
                    </div>
                </Link>
            </RenderIfVisible>
        )
    })

})

MapTokens.displayName = "MapTokens";

export const RenderPosts = () => {
    const { data: onchainPages, setSize: setOnchainSize } = usePosts();
    //const { channel } = useChannel(contractId);
    const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

    // Flatten the token lists and memoize the result
    const flatTokens = useMemo(() => {
        const flatTokensV2 = onchainPages?.flatMap(page => page.data) || [];
        return flatTokensV2
    }, [onchainPages]);

    const hasNextPage = onchainPages ? onchainPages[onchainPages.length - 1].pageInfo.hasNextPage : false;

    useEffect(() => {
        if (inView) {
            if (hasNextPage) {
                setOnchainSize((prev) => prev + 1)
            }
        }
    }, [inView, setOnchainSize, hasNextPage])


    if (!onchainPages) return <PostSkeleton />

    return (

        <div className="flex flex-col gap-8">
            <div className="w-10/12 sm:w-full m-auto grid gap-4 xl:gap-8 post-columns auto-rows-fr ">
                <MapTokens
                    tokens={flatTokens}
                //channel={channel}
                //spaceName={spaceName}
                //contractId={contractId}
                //handleMint={handleMint}
                //  handleShare={handleShare}
                //handleManage={handleManage}
                />

            </div>
            {/* <TokenModal
                spaceName={spaceName}
                contractId={contractId}
                channel={channel}
                isMintModalOpen={isMintModalOpen}
                isShareModalOpen={isShareModalOpen}
                isManageModalOpen={isManageModalOpen}
                focusedToken={focusedToken}
                setIsMintModalOpen={setIsMintModalOpen}
                setIsShareModalOpen={setIsShareModalOpen}
                setIsManageModalOpen={setIsManageModalOpen}
                setFocusedToken={setFocusedToken}
                handleModalClose={handleModalClose}
            /> */}
            <div ref={loadMoreRef} className="m-auto" >
                {hasNextPage && (
                    <div
                        className="m-auto text-xs text-primary ml-1 inline-block h-10 w-10 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                    />
                )}
            </div>

        </div >
    )
}
