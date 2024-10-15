import { Address } from "viem";
import { IChannel, IUpgradePath, IToken } from "@tx-kit/sdk/subgraph";

export type ChainId = 8453 | 84532;
export type ContractID = `0x${string}-${ChainId}`;

export type ChannelUpgradePath = IUpgradePath

// internal type to match metadata standards onchain
export type UploadToIpfsTokenMetadata = {
    name: string;
    description: string;
    image: string;
    type: "uplink-v2";
    content: {
        mime: string;
        uri: string;
    }
    animation_uri?: string;
}

// export type ChannelToken = {
//     id: string;
//     channelAddress: Address;
//     tokenId: string;
//     uri: string;
//     author: Address;
//     sponsor: Address;
//     totalMinted: string;
//     maxSupply: string;
//     createdAt: string;
//     blockNumber: string;
//     blockTimestamp: string;
//     metadata: TokenMetadata;
// }

export type ChannelToken = IToken

// export type ChannelTokenIntent = {
//     id: string;
//     spaceId: number;
//     channelId: number;
//     channelAddress: Address;
//     tokenIntent: string
//     deadline: string;
//     createdAt: string;
//     metadata: TokenMetadata;
//     uri: string;
//     totalMinted: "0";

// } & DeferredTokenIntentWithSignature;


export type ChannelTokenWithUserBalance = ChannelToken & {
    balance: string;
}

export type PageInfo = {
    pageInfo: {
        endCursor: number;
        hasNextPage: boolean;
    }
}

export type TokenPage = {
    data: Array<ChannelToken>
} & PageInfo

