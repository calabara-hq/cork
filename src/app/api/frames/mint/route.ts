import { getFrameMessage } from "@/app/utils/farcaster/utils";
import { FrameRequest } from "@/app/utils/farcaster/types"; import { NextRequest, NextResponse } from "next/server";
import { Abi, Address, isAddress } from "viem";
import { infiniteChannelAbi, finiteChannelAbi } from "@tx-kit/sdk/abi";
import { TransmissionsClient } from "@tx-kit/sdk";
import { fetchSinglePost } from "@/app/utils/fetch/tokens";
import { createWeb3Client } from "@/app/utils/viem";
import { fetchChannel } from "@/app/utils/fetch/channel";
import constants from "@/app/constants";
import { ChannelToken, doesChannelHaveFees } from "@/app/types";


class FrameError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FrameError';
    }
}


type EthSendTransactionAction = {
    chainId: string;
    method: "eth_sendTransaction";
    attribution?: boolean;
    params: {
        abi: Abi | [];
        to: string;
        value?: string;
        data?: string;
    }
}

export async function POST(request: NextRequest) {

    try {
        const requestData: FrameRequest = await request.json();
        const searchParams = request.nextUrl.searchParams;
        const intent = searchParams.get('intent');
        const postId = searchParams.get('postId');
        const referral = searchParams.get('referrer')

        if (!postId) {
            throw new FrameError('Missing postId')
        }

        const contractAddress = constants.CONTRACT_ADDRESS;
        const chainId = constants.CHAIN_ID;

        const mintReferral = referral && isAddress(referral) ? referral : "";

        const [{ isValid, message }, channel] = await Promise.all([
            getFrameMessage(requestData, { neynarApiKey: process.env.NEYNAR_API_KEY }),
            fetchChannel()
        ]);


        if (!isValid) {
            throw new FrameError('Invalid frame request');
        }

        if (!message || !message.address) {
            throw new FrameError('Invalid address')
        }

        if (!channel) {
            throw new FrameError('Channel not found')
        }

        const mintPrice = doesChannelHaveFees(channel) ? BigInt(channel.fees?.fees.ethMintPrice ?? 0) : BigInt(0);

        const token = await fetchSinglePost(postId)

        if (!token) {
            throw new FrameError('Token not found')
        }

        const { uplinkClient } = new TransmissionsClient({
            chainId: chainId,
            publicClient: createWeb3Client(chainId)
        })

        const generateCalldata = async (token: ChannelToken) => {

            return uplinkClient.callData.mintTokenBatchWithETH({
                channelAddress: contractAddress,
                to: message!.address as Address,
                tokenIds: [BigInt((token as ChannelToken).tokenId)],
                amounts: [1],
                mintReferral,
                data: "",
                transactionOverrides: {
                    value: mintPrice
                }
            })

        }


        const calldata = await generateCalldata(token);


        const response: EthSendTransactionAction = {
            chainId: `eip155:${chainId.toString()}`,
            method: "eth_sendTransaction",
            params: {
                abi: [...finiteChannelAbi, ...infiniteChannelAbi],
                to: calldata.address,
                data: calldata.data,
                value: mintPrice.toString()
            }
        }

        return NextResponse.json(response)

    } catch (err) {
        if (err instanceof FrameError) {
            return new NextResponse(err.message, { status: 500 })
        } else {
            console.log(err)
            return new NextResponse('Invalid request', { status: 500 })
        }
    }
}