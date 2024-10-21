import { Address } from "viem";
import { ChainId } from "./types";

type Constants = {
    CONTRACT_ADDRESS: Address;
    CHAIN_ID: ChainId;
    INTENTS: boolean;
    WC_CHANNEL_KEY: string;
}

const constants = {
    CONTRACT_ADDRESS: '0xD01Efe422983294654694Af59cf0b3Db0ea81781',
    CHAIN_ID: 8453,
    INTENTS: false,
    WC_CHANNEL_KEY: 'nouns'
} as Constants;

export default constants;