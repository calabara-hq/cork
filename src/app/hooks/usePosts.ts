"use client";
import useSWRInfinite from "swr/infinite";
import { ChannelToken, TokenPage } from "../types"
import { clientByChainId, parseV2Metadata } from "../utils/transmissions";
import constants from "../constants";

type GetPageKey = [string, number, number];



const client = clientByChainId(constants.CHAIN_ID)

export const fetchOnchainPosts_client = async (pageSize: number, skip: number) => {

    if (!client) {
        throw new Error("Client not found")
    }

    const posts = await client.downlinkClient.getChannelTokenPage({
        channelAddress: constants.CONTRACT_ADDRESS,
        filters: {
            pageSize: pageSize + 1,
            skip: skip,
            where: {
                tokenId_not_in: ["0",]  // ...bannedTokens]
            }
        }
    })

    const pageData = posts.slice(0, pageSize)
    const resolvedTokens = await Promise.all(pageData.map(parseV2Metadata))

    const response: TokenPage = {
        data: resolvedTokens,
        pageInfo: {
            endCursor: pageData.length,
            hasNextPage: posts.length > pageSize
        }
    }

    return response
}


export const usePosts = () => {

    const getKey = (pageIndex: number, previousPageData: TokenPage): GetPageKey | null => {
        // The first page has an index of 0
        if (pageIndex === 0) return ['posts', 50, 0];

        // Return null to stop fetching if there are no more pages
        if (!previousPageData.pageInfo.hasNextPage) return null;

        // Use the endCursor from the previous page for the next page
        return ['posts', 50, pageIndex * previousPageData.pageInfo.endCursor];
    };


    const { data, error, size, setSize, mutate } = useSWRInfinite(
        getKey,
        ([, limit, lastCursor]) => fetchOnchainPosts_client(limit, lastCursor)
    );

    const locatePageOfPost = (pages: Array<TokenPage>, tokenId: bigint) => {

        for (let i = 0; i < pages.length; i++) {
            for (let j = 0; j < pages[i].data.length; j++) {
                if (pages[i].data[j].tokenId === tokenId) {
                    return { pageIndex: i, postIndex: j }
                }
            }

        }

        return null;
    }

    const mintPaginatedPost = (tokenId: bigint, mintAmount: string) => {

        if (!data) return;

        const location = locatePageOfPost(data, tokenId);
        if (!location) return;

        mutate((currentPageData) => {
            return currentPageData?.map((page: TokenPage, index: number) => {
                if (index !== location.pageIndex) return page;

                return {
                    ...page,
                    data: page.data.map((post: ChannelToken, idx: number) => {
                        if (idx !== location.postIndex) return post;
                        return { ...post, totalMinted: BigInt(Number(post.totalMinted) + Number(mintAmount)) };
                    }),
                };
            });
        }, {
            revalidate: false
        }); // avoid revalidation after mutation

    }

    const receiveSponsorship = () => {
        mutate();
    }

    const deletePaginatedPost = (tokenId: bigint) => {
        if (!data) return;

        const location = locatePageOfPost(data, tokenId);
        if (!location) return;

        mutate((currentPageData) => {
            return currentPageData?.map((page, index) => {
                if (index !== location.pageIndex) return page;

                return {
                    ...page,
                    data: page.data.filter((_: any, idx: number) => idx !== location.postIndex)
                };
            });
        }, {
            revalidate: false
        })

    }

    return {
        data,
        error,
        size,
        setSize,
        mintPaginatedPost,
        receiveSponsorship,
        deletePaginatedPost
    };

}