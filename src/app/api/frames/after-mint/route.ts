import { createWeb3Client } from "@/app/utils/viem";
import { getFrameMessage, getFrameHtmlResponse } from "@/app/utils/farcaster/utils";
import { FrameRequest } from "@/app/utils/farcaster/types";
import { NextRequest, NextResponse } from "next/server";
import { Hash } from "viem";
import constants from "@/app/constants";

class FrameError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FrameError';
    }
}

// const updateServerIntent = async (contractId: ContractID, sponsoredTokenId: string, transactionHash: string) => {
//     try {
//         return fetch(`${process.env.NEXT_PUBLIC_HUB_URL}/v2/fulfill_tokenIntent`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "X-API-TOKEN": process.env.API_SECRET!,
//             },
//             body: JSON.stringify({
//                 contractId: contractId,
//                 tokenIntentId: sponsoredTokenId,
//                 txHash: transactionHash
//             })
//         })
//             .then(res => res.json())
//             .then(res => {
//                 if (res.success) {
//                     return res
//                 }
//             })
//     } catch (e) {
//         console.log(e)
//         throw new FrameError('Failed to update server intent')
//     }
// }


export async function POST(request: NextRequest) {

    try {

        const searchParams = request.nextUrl.searchParams;
        const requestData: FrameRequest = await request.json();


        const contractAddress = constants.CONTRACT_ADDRESS;
        const chainId = constants.CHAIN_ID;

        const { isValid, message } = await getFrameMessage(requestData, { neynarApiKey: process.env.NEYNAR_API_KEY });

        if (!isValid) {
            throw new FrameError('Invalid frame request');
        }

        if (!message.transaction) {
            throw new FrameError('Invalid transaction')
        }

        const explorer = chainId === 8453 ? 'https://basescan.org' : 'https://sepolia.basescan.org';

        const txHash = message.transaction.hash as Hash;

        const publicClient = createWeb3Client(chainId);


        const validateTransaction = async () => {

            const transaction = await publicClient!.waitForTransactionReceipt({ hash: txHash })
            if (transaction.status !== 'success') {
                throw new FrameError('Transaction failed');
            }

        }

        await validateTransaction();

        return new NextResponse(
            getFrameHtmlResponse({
                buttons: [
                    {
                        action: 'link',
                        label: 'Explore collection',
                        target: `${process.env.NEXT_PUBLIC_CLIENT_URL}`
                    },
                    {
                        action: 'link',
                        label: 'View transaction',
                        target: `${explorer}/tx/${txHash}`
                    }

                ],
                image: "https://ipfs.cork.wtf/ipfs/QmQCKPZu1FUV3aLQz2K2dGdsTT3DjJhJabYNE5UUULaw33",
            })
        )



    } catch (err) {
        if (err instanceof FrameError) {
            return new NextResponse(err.message, { status: 500 })
        } else {
            console.log(err)
            return new NextResponse('Invalid request', { status: 500 })
        }
    }

}