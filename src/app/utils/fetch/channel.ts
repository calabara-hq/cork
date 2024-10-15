import { IChannel } from "@tx-kit/sdk/subgraph"
import { clientByChainId, parseV2Metadata } from "../transmissions"
import constants from "@/app/constants"

const client = clientByChainId(constants.CHAIN_ID)

export const fetchChannel = async (): Promise<IChannel> => {

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