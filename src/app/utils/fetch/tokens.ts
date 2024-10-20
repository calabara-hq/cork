import constants from "@/app/constants"
import { clientByChainId, parseV2Metadata } from "../transmissions"
import { ChannelToken, TokenPage } from "@/app/types"
import { cache } from "react"

const client = clientByChainId(constants.CHAIN_ID)

export const fetchOnchainPosts = cache(async (pageSize: number, skip: number) => {

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
})

export const fetchSinglePost = async (id: string, isIntent: boolean = false): Promise<ChannelToken> => {
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