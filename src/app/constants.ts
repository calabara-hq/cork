import { Address } from "viem";
import { ChainId } from "./types";

type Constants = {
    CONTRACT_ADDRESS: Address;
    CHAIN_ID: ChainId;
    INTENTS: boolean;
    WC_CHANNEL_KEY: string;
}

const constants = {
    CONTRACT_ADDRESS: '0x1e4fd9e582a0652e012763fdC2575308de8d3C83',
    CHAIN_ID: 84532,
    INTENTS: false,
    WC_CHANNEL_KEY: 'nouns'
} as Constants;

export default constants;