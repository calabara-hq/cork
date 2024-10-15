import { TransmissionsClient, getSubgraphUrl } from '@tx-kit/sdk';
import { createWeb3Client } from './viem';
import { createWalletClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { isAddress } from "viem"
import { ChannelToken, ContractID, TokenMetadata } from "@/app/types";
import { IChannel, IToken } from "@tx-kit/sdk/subgraph";
import { Address } from "viem";


const { downlinkClient: baseSepoliaDownlinkClient, uplinkClient: baseSepoliaUplinkClient } = new TransmissionsClient({
    chainId: 84532,
    apiConfig: {
        serverUrl: getSubgraphUrl(84532)
    },
    publicClient: createWeb3Client(84532),
    walletClient: createWalletClient({
        chain: baseSepolia,
        transport: http(`https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`)
    })
})

const { downlinkClient: baseDownlinkClient, uplinkClient: baseUplinkClient } = new TransmissionsClient({
    chainId: 8453,
    apiConfig: {
        serverUrl: getSubgraphUrl(8453)
    },
    publicClient: createWeb3Client(8453),
    walletClient: createWalletClient({
        chain: base,
        transport: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`)
    })
})


export const clientByChainId = (chainId: number) => {
    if (chainId === 84532) {
        return { downlinkClient: baseSepoliaDownlinkClient, uplinkClient: baseSepoliaUplinkClient }
    } else if (chainId === 8453) {
        return { downlinkClient: baseDownlinkClient, uplinkClient: baseUplinkClient }
    }
}

export const concatContractID = ({ chainId, contractAddress }: { chainId: number, contractAddress: string }) => {
    return `${contractAddress}-${chainId}` as ContractID;
}

export const splitContractID = (contractID: string): { chainId: number, contractAddress: `0x${string}` } => {
    const [contractAddress, chainId] = contractID.split("-");

    // if (!getSupportedChains().includes(parseInt(chainId))) {
    //     throw new InvalidArgumentError(`Invalid contract address: ${contractAddress}`);
    // }

    // if (!isAddress(contractAddress)) {
    //     throw new InvalidArgumentError(`Invalid contract address: ${contractAddress}`);
    // }

    return { chainId: parseInt(chainId), contractAddress: contractAddress as `0x${string}` };
}

export const parseIpfsUrl = (url: string) => {
    if (url.startsWith('ipfs://')) {
        const hash = url.split('ipfs://')[1];
        return {
            raw: url,
            gateway: `https://uplink.mypinata.cloud/ipfs/${hash}`,
        }
    }
    if (url.startsWith('https://uplink.mypinata.cloud/ipfs/')) {
        const hash = url.split('https://uplink.mypinata.cloud/ipfs/')[1];
        return {
            raw: `ipfs://${hash}`,
            gateway: url,
        }
    }
    return {
        raw: url,
        gateway: url,
    }
}


export const parseV2Metadata = async (token: IToken): Promise<ChannelToken> => {

    if (!token.metadata) {
        try {
            const uri = parseIpfsUrl(token.uri).gateway;
            const metadataFn: () => Promise<TokenMetadata> = () => {
                return fetch(uri)
                    .then((res) => res.json())
                    .then((data: any) => {
                        return {
                            id: token.uri.split("ipfs://")[1],
                            name: data.name,
                            description: data.description,
                            image: data.image,
                            animation: data.animation_uri || '',
                            type: data.type,

                        }
                    })
            }

            const resolvedMetadata: TokenMetadata = await metadataFn();

            return {
                ...token,
                metadata: resolvedMetadata
            };

        } catch (e) {
            return token;
        }

    }

    return token;
}


/// todo - we really don't need to do this here. we can save the metadata in the db if we want to

// export const parseIntentMetadata = async (intentResponse: schema.dbTokenIntentType): Promise<TokenIntentWithMetadata> => {

//     const { tokenIntent } = intentResponse;
//     const parsedIntent = JSON.parse(tokenIntent);
//     const uri = parseIpfsUrl(parsedIntent.intent.message.uri).gateway;
//     const metadataFn: () => Promise<TokenMetadata> = () => {
//         return fetch(uri)
//             .then((res) => res.json())
//             .then((data: any) => {
//                 return {
//                     id: parsedIntent.intent.message.uri.split("ipfs://")[1],
//                     name: data.name,
//                     description: data.description,
//                     image: data.image,
//                     animation: data.animation_uri || '',
//                     type: "uplink-v2",

//                 }
//             })
//     }

//     const resolvedMetadata: TokenMetadata = await cachedFetch(uri, metadataFn);

//     return {
//         ...intentResponse,
//         ...parsedIntent,
//         metadata: resolvedMetadata,
//         uri: parsedIntent.intent.message.uri,
//         maxSupply: parsedIntent.intent.message.maxSupply,
//         totalMinted: "0",
//     };
// }
