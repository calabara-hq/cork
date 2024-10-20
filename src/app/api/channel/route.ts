import constants from '@/app/constants';
import { clientByChainId, parseV2Metadata } from '@/app/utils/transmissions';
import { NextResponse } from 'next/server';

const client = clientByChainId(constants.CHAIN_ID)

export async function GET(): Promise<NextResponse> {

    try {

        if (!client) {
            return new NextResponse("Client not found", { status: 400 })
        }

        const channel = await client.downlinkClient.getChannel({
            channelAddress: constants.CONTRACT_ADDRESS,
            includeTokens: true
        }).then(async (channel) => {
            if (!channel) throw new Error("Channel not found")
            return { ...channel, tokens: ([await parseV2Metadata(channel.tokens[0])]) }
        })

        return NextResponse.json(channel, { status: 200 });

    } catch (err: any) {
        return new NextResponse(err.message, { status: 500 })
    }

}
