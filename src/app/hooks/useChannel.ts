"use client";
import { IChannel } from "@tx-kit/sdk/subgraph";
import useSWR from "swr";
import constants from "../constants";
import { clientByChainId, parseV2Metadata } from "../utils/transmissions";

const client = clientByChainId(constants.CHAIN_ID)

const fetchChannel_client = async (): Promise<IChannel> => {
    if (!client) {
        throw new Error("Client not found")
    }

    const channel = await client.downlinkClient.getChannel({
        channelAddress: constants.CONTRACT_ADDRESS,
        includeTokens: true
    }).then(async (channel) => {
        if (!channel) throw new Error("Channel not found")
        return { ...channel, tokens: ([await parseV2Metadata(channel.tokens[0])]) }
    })

    return channel;
}


export const useChannel = (refreshInterval?: number) => {
    const {
        data: channel,
        isLoading,
        error,
        mutate: mutateSwrChannel,
    }: { data?: IChannel; isLoading: boolean; error: any; mutate: any } = useSWR(
        'channel',
        () => fetchChannel_client(),
        { refreshInterval: refreshInterval ?? 0 }
    );

    return {
        channel,
        isLoading,
        error,
        mutateSwrChannel
    }
}
