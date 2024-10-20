"use client";
import { doesChannelHaveFees } from "@/app/types";
import { DisplayMode, RenderDisplayWithProps } from "./MintableTokenDisplay"
import { useWalletClient } from "wagmi";
import { useMintTokenBatchWithETH, useMintTokenBatchWithERC20 } from "@tx-kit/hooks"
import { useState } from "react"
import { NATIVE_TOKEN } from "@tx-kit/sdk"
import { useTransmissionsErrorHandler } from "@/app/hooks/useTransmissionsErrorHandler"
import { Address, zeroAddress } from "viem"
import { calculateSaleEnd, FeeStructure, isMintPeriodOver, ShareModalContent } from "./MintUtils"
import { useCapabilities } from "wagmi/experimental";
import { usePosts } from "@/app/hooks/usePosts"
import constants from "@/app/constants";
import { Modal } from "../Modal";
import { useChannel } from "@/app/hooks/useChannel";
import { useSinglePost } from "@/app/hooks/useSinglePost";


export const ExpandedPostSkeleton = () => {
    return (

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6 w-full items-start mt-14">
            <div className="flex flex-col gap-4 items-center justify-center flex-grow-0">
                <div className="w-full h-96 m-auto bg-base-100 shimmer rounded-lg" />
            </div>
            <div className="flex flex-col gap-4 justify-start ">
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-2">
                        <div className="w-16 h-4 bg-base-100 shimmer rounded-lg" />
                        <div className="flex gap-2 items-center text-sm text-t2 bg-base rounded-lg p-1">
                            <div className="w-8 h-8 bg-base-100 shimmer rounded-lg" />
                            <div className="w-20 h-8 bg-base-100 shimmer rounded-lg" />
                        </div>
                    </div>
                    <div className="w-full h-8 bg-base-100 shimmer rounded-lg" />
                </div>
            </div>
        </div>
    );
};


export type MintTokenSwitchProps = {
    contractAddress: string,
    postId: string,
    referral: string,
    display: DisplayMode,
    setIsModalOpen?: (open: boolean) => void,
    backwardsNavUrl?: string
}

export const MintV2Onchain = ({
    contractAddress,
    postId,
    referral,
    setIsModalOpen,
    display,
    backwardsNavUrl
}: MintTokenSwitchProps) => {

    const { channel } = useChannel()
    const { post: token, mintSinglePost } = useSinglePost(postId)

    const { data: walletClient } = useWalletClient();
    const mintReferral = referral && referral.startsWith('0x') && referral.length === 42 ? referral : "";
    const { mintPaginatedPost } = usePosts();
    const { mintTokenBatchWithETH, status: ethTxStatus, txHash: ethTxHash, error: ethTxError } = useMintTokenBatchWithETH()
    const { mintTokenBatchWithERC20, mintTokenBatchWithERC20_smartWallet, status: erc20TxStatus, txHash: erc20TxHash, error: erc20TxError } = useMintTokenBatchWithERC20()

    const { data: capabilities } = useCapabilities()
    //const isSmartWallet = capabilities?.[chainId]?.atomicBatch?.supported ?? false
    const isSmartWallet = capabilities?.[constants.CHAIN_ID]?.atomicBatch?.supported ?? false

    const erc20Minter = isSmartWallet ? mintTokenBatchWithERC20_smartWallet : mintTokenBatchWithERC20

    const [isShareModalOpen, setIsShareModalOpen] = useState(false)

    const [mintToken, setMintToken] = useState<Address>(NATIVE_TOKEN)
    const isCurrencyEth = mintToken === NATIVE_TOKEN

    const txStatus = isCurrencyEth ? ethTxStatus : erc20TxStatus
    const isTxPending = txStatus === "pendingApproval" || txStatus === "txInProgress" || txStatus === "erc20ApprovalInProgress";
    const isTxSuccessful = txStatus === "complete";
    const txHash = isCurrencyEth ? ethTxHash : erc20TxHash
    const txError = isCurrencyEth ? ethTxError : erc20TxError

    useTransmissionsErrorHandler(txError)

    if (!channel || !token) return <ExpandedPostSkeleton />

    const fees: FeeStructure | null = doesChannelHaveFees(channel) ? {
        creatorPercentage: channel.fees?.fees.creatorPercentage ?? 0,
        channelPercentage: channel.fees?.fees.channelPercentage ?? 0,
        referralPercentage: channel.fees?.fees.mintReferralPercentage ?? 0,
        sponsorPercentage: channel.fees?.fees.sponsorPercentage ?? 0,
        uplinkPercentage: channel.fees?.fees.uplinkPercentage ?? 0,
        ethMintPrice: BigInt(channel.fees?.fees.ethMintPrice ?? 0),
        erc20MintPrice: BigInt(channel.fees?.fees.erc20MintPrice ?? 0),
        erc20Contract: channel.fees?.fees.erc20Contract ?? zeroAddress
    } : null;

    const saleEnd = calculateSaleEnd(channel, token)

    const handleSubmit = async (quantity: number, mintToken: Address) => {

        if (!walletClient?.account) return

        if (mintToken === NATIVE_TOKEN) {
            await mintTokenBatchWithETH({
                channelAddress: contractAddress,
                to: walletClient?.account.address,
                tokenIds: [BigInt(token.tokenId)],
                amounts: [quantity],
                mintReferral: mintReferral,
                data: "",
                ...(fees ? { transactionOverrides: { value: fees.ethMintPrice * BigInt(quantity) } } : {})
            })
        } else {

            await erc20Minter({
                channelAddress: contractAddress,
                to: walletClient?.account.address,
                tokenIds: [BigInt(token.tokenId)],
                amounts: [quantity],
                mintReferral: mintReferral,
                data: "",
            },
                mintToken,
                fees?.erc20MintPrice ?? BigInt(0) * BigInt(quantity)
            )
        }

        mintPaginatedPost(token.tokenId, quantity.toString())
        mintSinglePost(quantity.toString())
    }

    return (
        <>
            <RenderDisplayWithProps
                token={token}
                displayMode={display}
                creator={token.author}
                metadata={token.metadata}
                fees={fees}
                mintToken={mintToken}
                setMintToken={setMintToken}
                isMintPeriodOver={isMintPeriodOver(saleEnd)}
                saleEnd={saleEnd}
                totalMinted={token.totalMinted.toString()}
                maxSupply={token.maxSupply.toString()}
                handleSubmit={handleSubmit}
                isTxPending={isTxPending}
                isTxSuccessful={isTxSuccessful}
                txStatus={txStatus}
                txHash={txHash}
                setIsModalOpen={setIsModalOpen}
                handleShare={() => setIsShareModalOpen(true)}
                backwardsNavUrl={backwardsNavUrl}
            />
            <Modal isModalOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} className="w-fit">
                <ShareModalContent displayMode={display} token={token} handleClose={() => setIsShareModalOpen(false)} />
            </Modal>
        </>
    )
}




export const MintTokenSwitch = ({
    postId,
    contractAddress,
    referral,
    setIsModalOpen,
    display,
    backwardsNavUrl
}: MintTokenSwitchProps) => {
    return <MintV2Onchain
        contractAddress={contractAddress}
        postId={postId}
        referral={referral}
        setIsModalOpen={setIsModalOpen}
        display={display}
        backwardsNavUrl={backwardsNavUrl}
    />

}