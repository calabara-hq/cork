import constants from '@/app/constants';
import { ContractID } from '@/app/types';
import { createWeb3Client } from '@/app/utils/viem';
import { DeferredTokenIntentWithSignature } from '@tx-kit/sdk';
import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';
import { Address, Hex } from 'viem';

export async function POST(request: NextRequest): Promise<NextResponse> {

    const req = await request.json();

    const contractId = req.contractId as ContractID;
    const tokenIntent = req.tokenIntent as DeferredTokenIntentWithSignature;

    try {

        // validate the intent signature and store it in the database if the signatures do not match 

        const signature = tokenIntent.signature;
        const author = tokenIntent.author;

        const client = createWeb3Client(constants!.CHAIN_ID)

        // first, validate the signature

        const isValid = await client!.verifyTypedData({
            address: author as Address,
            domain: { ...tokenIntent.intent.domain, verifyingContract: tokenIntent.intent.domain.verifyingContract as Address },
            primaryType: tokenIntent.intent.primaryType,
            types: tokenIntent.intent.types,
            message: tokenIntent.intent.message,
            signature: signature as Hex
        })


        if (!isValid) {
            return new NextResponse("Invalid signature", { status: 401 })
        }

        // check if an intent with this nonce is already in the db

        const createdAtInSeconds = Math.floor(Date.now() / 1000);

        await sql`insert into tokenIntents
            (chainId, channelAddress, author, tokenIntent, deadline, createdAt, tokenId, nonce, banned)
            values
            (${constants.CHAIN_ID}, ${constants.CONTRACT_ADDRESS}, ${author}, ${JSON.stringify(tokenIntent.intent)}, ${tokenIntent.intent.message.deadline.toString()}, ${createdAtInSeconds.toString()}, 0, ${tokenIntent.intent.message.nonce}, false)
            on conflict(nonce) do nothing;
        `


        return NextResponse.json({ success: true }, { status: 200 });


    } catch (err: any) {
        return new NextResponse(err.message, { status: 500 })
    }








    // if (!id) {
    //     return NextResponse.badRequest('id is required');
    // }

    // const { rows } = await request.pg.query(
    //     sql`SELECT * FROM users WHERE id = ${id}`
    // );

    // return new NextResponse(rows[0] ? 200 : 404, rows[0]);
}