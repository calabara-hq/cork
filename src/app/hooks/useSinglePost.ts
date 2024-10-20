"use client";
import useSWR from "swr";
import constants from "../constants";
import { clientByChainId, parseV2Metadata } from "../utils/transmissions";
import { ChannelToken } from "../types";

const client = clientByChainId(constants.CHAIN_ID)

const fetchSinglePost_client = async (id: string): Promise<ChannelToken> => {
    if (!client) {
        throw new Error("Client not found")
    }

    return client.downlinkClient.getChannelTokenPage({
        channelAddress: constants.CONTRACT_ADDRESS,
        filters: {
            pageSize: 1,
            skip: 0,
            where: {
                tokenId_in: [id]
            }
        }
    }).then(data => data[0]).then(parseV2Metadata)
}


export const useSinglePost = (id: string, refreshInterval?: number) => {
    const {
        data: post,
        isLoading,
        error,
        mutate: mutateSinglePost,
    }: { data?: ChannelToken; isLoading: boolean; error: any; mutate: any } = useSWR(
        [`/singlePost/${id}`],
        () => fetchSinglePost_client(id),
        { refreshInterval: refreshInterval ?? 0 }
    );


    const mintSinglePost = (mintAmount: string) => {

        mutateSinglePost((currentData: ChannelToken) => {
            return {
                ...currentData,
                totalMinted: currentData.totalMinted + BigInt(mintAmount)
            }
        }, {
            revalidate: false
        }) // avoid revalidation after mutation
    }


    return {
        post,
        isLoading,
        error,
        mintSinglePost,
        mutateSinglePost
    }
}
