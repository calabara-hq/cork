"use client"
import { getTokenInfo } from "@/app/utils/tokenInfo";
import { ChainId } from "@/app/types";
import { NATIVE_TOKEN } from "@tx-kit/sdk";
import { useEffect, useState } from "react";
import { Address, checksumAddress, getAddress, isAddress, zeroAddress } from "viem";
import { useMemo } from "react";

export const useTokenInfo = (tokenContract: Address, chainId: ChainId) => {
    const [symbol, setSymbol] = useState<string>();
    const [decimals, setDecimals] = useState<number>();
    const [tokenType, setTokenType] = useState<string>();
    const [error, setError] = useState<string>();

    const checksummedAddress = checksumAddress(tokenContract);

    useMemo(() => {
        if (isAddress(checksummedAddress) && checksummedAddress !== zeroAddress && checksummedAddress !== NATIVE_TOKEN) {
            getTokenInfo({ contractAddress: checksummedAddress, chainId }).then((res) => {
                setSymbol(res.symbol);
                setDecimals(res.decimals);
                setTokenType(res.type);
            })
        }
    }, [checksummedAddress, chainId])

    return {
        symbol,
        decimals,
        tokenType,
        error,
        isLoading: !error && !tokenType,
    }


}