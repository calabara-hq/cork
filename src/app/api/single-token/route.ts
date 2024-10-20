import constants from '@/app/constants';
import { clientByChainId, parseV2Metadata } from '@/app/utils/transmissions';
import { NextRequest, NextResponse } from 'next/server';

const client = clientByChainId(constants.CHAIN_ID)

export async function GET(request: NextRequest): Promise<NextResponse> {

    try {

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return new NextResponse("Missing parameters", { status: 400 })
        }

        if (!client) {
            return new NextResponse("Client not found", { status: 400 })
        }

        const post = await client.downlinkClient.getChannelTokenPage({
            channelAddress: constants.CONTRACT_ADDRESS,
            filters: {
                pageSize: 1,
                skip: 0,
                where: {
                    tokenId_in: [id]
                }
            }
        }).then(data => data[0]).then(parseV2Metadata)


        return NextResponse.json(post, { status: 200 });
    } catch (err: any) {
        return new NextResponse(err.message, { status: 500 })
    }

}
