import { Address } from "viem";
import { ChainId } from "./types";

type Constants = {
    CONTRACT_ADDRESS: Address;
    CHAIN_ID: ChainId;
}

const constants = {
    CONTRACT_ADDRESS: '0x4258e59f0cac167fd63b4a48592460add90ec487',
    CHAIN_ID: 8453,
} as Constants;

export default constants;