"use client";
import { DeferredTokenIntentWithSignature } from "@tx-kit/sdk";
import { handleMutationError } from "./handleMutationError";
import { ContractID } from "@/app/types";

export const insertIntent = async (url: string, { arg }: { arg: { contractId: ContractID, tokenIntent: DeferredTokenIntentWithSignature } }) => {
    return fetch('api/add-intent', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            contractId: arg.contractId,
            tokenIntent: arg.tokenIntent
        })
    })
        .then(handleMutationError);
};
