import { NextRequest, NextResponse } from "next/server";
import { ENTRYPOINT_ADDRESS_V06 } from "permissionless/utils";
import { UserOperation } from "permissionless/types";
import { paymasterActionsEip7677 } from 'permissionless/experimental';

import { Chain, createClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";

const coinbaseSmartWalletProxyBytecode =
    "0x363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3";
const coinbaseSmartWalletV1Implementation =
    "0x000100abaad02f1cfC8Bbe32bD5a564817339E72";
const coinbaseSmartWalletFactoryAddress =
    "0x0BA5ED0c6AA8c49038F819E587E2633c4A9F428a";
const magicSpendAddress = "0x011A61C07DbF256A68256B1cB51A5e246730aB92";
const erc1967ProxyImplementationSlot =
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";



export async function POST(request: NextRequest) {
    try {

        const requestData = await request.json();
        const { method, params } = requestData;

        const userOp = params[0] as UserOperation<"v0.6">;
        const entrypoint = params[1] as string;
        const chainId = Number(params[2]);

        // todo validate the userOp

        // const sponsorable = await willSponsor({ userOp, entrypoint, chainId })

        // if (!sponsorable) throw new PaymasterError('This operation is not sponsorable')

        const chain = (chainId === baseSepolia.id ? baseSepolia : base) as Chain;

        const paymasterClient = createClient({
            chain: chain,
            transport: http(
                `https://api.developer.coinbase.com/rpc/v1/${chainId === baseSepolia.id ? 'base-sepolia' : 'base'}/${process.env.PAYMASTER_KEY}`
            )
            // @ts-ignore
        }).extend(paymasterActionsEip7677(ENTRYPOINT_ADDRESS_V06));


        if (method === "pm_getPaymasterStubData") {
            const result = await paymasterClient.getPaymasterStubData({
                chain: chain,
                userOperation: userOp,
            });
            return NextResponse.json({ result }, { status: 200 });
        } else if (method === "pm_getPaymasterData") {
            const result = await paymasterClient.getPaymasterData({
                chain: chain,
                userOperation: userOp,
            });
            return NextResponse.json({ result }, { status: 200 });
        }
        else {
            throw new Error('Invalid method')
        }

    } catch (err) {
        console.log(err)
        return new NextResponse('Invalid request', { status: 500 });
    }
}