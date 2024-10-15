"use client";

import React, { useEffect, useMemo } from "react";
import { ChannelToken } from "../types";
import { IChannel } from "@tx-kit/sdk/subgraph";
import RenderIfVisible from "./Virtualization";
import { useInView } from "react-intersection-observer";
import { usePosts } from "../hooks/usePosts";
import { TokenCard, TokenCardFooter } from "./PostCard";

export const PostSkeleton = () => {
    return (
        <p>Loading posts...</p>
    )
}


const MapTokens = React.memo(({
    tokens,
    //channel,
    //spaceName,
    // handleMint,
    // handleManage
}: {
    tokens: Array<ChannelToken>,
    //channel: IChannel,
    //spaceName: string,
    // handleMint: (event: any, token: ChannelToken | ChannelTokenV1 | ChannelTokenIntent) => void,
    // handleManage: (event: any, token: ChannelToken | ChannelTokenV1 | ChannelTokenIntent) => void
}) => {

    return tokens.map((token, index) => {
        return (
            <RenderIfVisible
                key={index}
                defaultHeight={400}
                visibleOffset={200}
                stayRendered={false}

            >
                <div
                    className="cursor-pointer shadow-lg shadow-black hover:shadow-[#262626] no-select rounded-lg"
                // onClick={(event) => handleMint(event, token)}
                >
                    <TokenCard
                        key={index}
                        token={token}
                        footer={
                            <TokenCardFooter
                                token={token}
                            //channel={channel}
                            //handleManage={handleManage}
                            />
                        }
                    />
                </div>
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
