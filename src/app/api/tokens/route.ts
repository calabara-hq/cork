import constants from '@/app/constants';
import { TokenPage } from '@/app/types';
import { clientByChainId, parseV2Metadata } from '@/app/utils/transmissions';
import { NextRequest, NextResponse } from 'next/server';

const client = clientByChainId(constants.CHAIN_ID)

export async function GET(request: NextRequest): Promise<NextResponse> {

    try {

        const searchParams = request.nextUrl.searchParams;
        const pageSize = searchParams.get('pagesize');
        const skip = searchParams.get('skip');

        if (!pageSize || !skip) {
            return new NextResponse("Missing parameters", { status: 400 })
        }

        if (!client) {
            return new NextResponse("Client not found", { status: 400 })
        }

        const posts = await client.downlinkClient.getChannelTokenPage({
            channelAddress: constants.CONTRACT_ADDRESS,
            filters: {
                pageSize: Number(pageSize) + 1,
                skip: Number(skip),
                where: {
                    tokenId_not_in: ["0",]  // ...bannedTokens]
                }
            }
        })

        const pageData = posts.slice(0, Number(pageSize))
        const resolvedTokens = await Promise.all(pageData.map(parseV2Metadata))

        const response: TokenPage = {
            data: resolvedTokens,
            pageInfo: {
                endCursor: pageData.length,
                hasNextPage: posts.length > Number(pageSize)
            }
        }

        return NextResponse.json(response, { status: 200 });
    } catch (err: any) {
        return new NextResponse(err.message, { status: 500 })
    }

}
