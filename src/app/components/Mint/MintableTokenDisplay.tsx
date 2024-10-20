"use client";
import { ChainId, ChannelToken, ChannelTokenIntent } from "@/app/types"
import { ITokenMetadata } from "@tx-kit/sdk/subgraph"
import { CounterInput, FeeStructure, RenderMintMedia, ShareButton } from "./MintUtils"
import { Address, formatEther, formatUnits, zeroAddress } from "viem"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/app/hooks/useDebounce"
import { BadgeCheck, LoaderCircle, MoveLeft, Zap } from "lucide-react";
import { Button } from "../Button";
import OnchainButton from "../OnchainButton";
import constants from "@/app/constants";
import { useAccount } from "wagmi";
import { useTokenInfo } from "@/app/hooks/useTokenInfo";
import { Modal } from "../Modal";
import Link from "next/link";
import { useCapabilities } from "wagmi/experimental";
import { NATIVE_TOKEN } from "@tx-kit/sdk";
import { useErc20Balance, useEthBalance } from "@/app/hooks/useTokenBalance";
import { AddressOrEns, NoggleAvatar } from "../User";
import { RenderMarkdown } from "../RenderMarkdown";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";

const compact_formatter = new Intl.NumberFormat('en', { notation: 'compact' })

export type DisplayMode = "modal" | "expanded" | "contest-modal" | "contest-expanded"

export type DisplayProps = {
    token: ChannelToken | ChannelTokenIntent,
    creator: string,
    metadata: ITokenMetadata | null, // todo type this
    fees: FeeStructure | null,
    mintToken: Address,
    setMintToken: (currency: Address) => void,
    isMintPeriodOver: boolean,
    saleEnd: number,
    totalMinted: string,
    maxSupply: string,
    handleSubmit: (quantity: number, mintToken: Address) => void,
    isTxPending: boolean,
    isTxSuccessful: boolean,
    txHash?: string,
    txStatus?: string,
    setIsModalOpen?: (open: boolean) => void
    handleShare: () => void
    backwardsNavUrl?: string
}

type FlowModalProps = {
    fees: FeeStructure | null
    mintToken: Address
    setMintToken: (token: Address) => void
    erc20Contract: Address
    debouncedMintQuantity: string
    setMintQuantity: (quantity: string) => void
    availableEditions: BigInt
    handleSubmit: (quantity: number, mintToken: Address) => void
    chainId: ChainId
    isTxPending: boolean
    isTxSuccessful: boolean
    txStatus?: string
    txHash?: string
}

type CurrencyOptionProps = {
    erc20Symbol: string
    erc20Decimals: number
} & FlowModalProps


export const MintExpandedDisplay = ({
    token,
    creator,
    metadata,
    fees,
    mintToken,
    setMintToken,
    isMintPeriodOver,
    saleEnd,
    totalMinted,
    maxSupply,
    handleSubmit,
    isTxPending,
    isTxSuccessful,
    txHash,
    txStatus,
    backwardsNavUrl,
    handleShare
}: DisplayProps) => {

    const [mintQuantity, setMintQuantity] = useState<string>('1');
    const debouncedMintQuantity = useDebounce(mintQuantity);
    const router = useRouter();
    const availableEditions = BigInt(maxSupply) - BigInt(totalMinted);
    const areEditionsSoldOut = availableEditions <= 0;
    const [isMintFlowModalOpen, setIsMintFlowModalOpen] = useState(false);

    const handleButtonClick = () => {
        if ((fees?.erc20Contract ?? zeroAddress) === zeroAddress) {
            handleSubmit(parseInt(debouncedMintQuantity), mintToken)
            setIsMintFlowModalOpen(true)
        }
        else {
            setIsMintFlowModalOpen(true)
        }
    }

    const handleBackNavigation = () => {
        if (window.history.length > 2) {
            router.back();
        } else {
            // Redirect to home or any default page if there's no navigation history
            router.push('/');
        }
    };

    return (
        <React.Fragment>
            <div className="flex flex-col gap-6">
                <div
                    className="flex flex-row gap-2 items-center font-bold hover:underline cursor-pointer"
                    onClick={handleBackNavigation}
                >
                    <MoveLeft className="w-4 h-4" />
                    <span>home</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6 w-full items-start">
                    <div className="flex flex-col gap-4 items-center justify-center flex-grow-0 m-auto w-full prose">
                        <RenderMintMedia imageURI={metadata?.image ?? ""} animationURI={metadata?.animation ?? ""} size="lg" />
                        {metadata?.description && <RenderMarkdown content={metadata.description} />}
                    </div>
                    <div className="flex flex-col gap-8 justify-start h-fit">
                        <div className="flex flex-col gap-4 w-full">
                            <div className="flex flex-col gap-2">
                                <p className="font-bold text-2xl break-words">{metadata?.name ?? ""}</p>
                                {/* <ShareButton displayMode="expanded" token={token} onClick={handleShare} className="h-8 p-2 border-none" /> */}
                                <div className="flex flex-row gap-2 items-center text-primary">
                                    <NoggleAvatar address={token.author} size={26} />
                                    <Link href={`https://basescan.org/address/${token.author}`} target="_blank" draggable={false} className="rounded-lg bg-accent2 text-xs px-2 py-1 h-full hover:bg-accent3">
                                        <AddressOrEns address={token.author} />
                                    </Link>
                                    <div className="ml-auto flex items-center gap-2">
                                        {Number(token.totalMinted) > 0 ? (
                                            <div className="flex flex-row items-center gap-1 text-sm font-medium rounded-lg bg-accent2 px-2">
                                                <Zap className="w-4 h-4 text-primary" />
                                                {compact_formatter.format(Number(token.totalMinted))}
                                            </div>
                                        ) : (
                                            <div />
                                        )}
                                        <ShareButton displayMode="expanded" token={token as ChannelToken} onClick={handleShare} className="h-6 p-2 border-none" />
                                    </div>
                                </div>
                            </div>

                            {!areEditionsSoldOut && !isMintPeriodOver &&
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="grid grid-cols-1 gap-2 w-full justify-between">
                                        {/* <CounterInput count={mintQuantity} setCount={setMintQuantity} max={availableEditions.toString()} /> */}
                                        <OnchainButton
                                            chainId={constants.CHAIN_ID}
                                            disabled={parseInt(mintQuantity) <= 0 || mintQuantity === "" || parseInt(mintQuantity) > availableEditions}
                                            title={"Collect"}
                                            onClick={handleButtonClick}
                                            isLoading={isTxPending}
                                            loadingChild={
                                                <Button disabled className="w-auto">
                                                    <div className="flex gap-2 items-center">
                                                        <p className="text-sm">{
                                                            txStatus === 'pendingApproval' ?
                                                                <span>Awaiting Signature</span>
                                                                :
                                                                <span>Processing</span>
                                                        }
                                                        </p>
                                                        <LoaderCircle className="w-4 h-4 text-t2 animate-spin" />
                                                    </div>
                                                </Button>
                                            }
                                        />
                                    </div>
                                    {/* <RenderFees fees={fees} quantity={debouncedMintQuantity} /> */}
                                </div>
                            }
                        </div>
                    </div>
                </div >
            </div>

            <MintFlowModal
                isModalOpen={isMintFlowModalOpen}
                handleClose={() => setIsMintFlowModalOpen(false)}
                handleExitMint={() => router.push(backwardsNavUrl ?? '/')}
                flowProps={
                    {
                        fees,
                        mintToken,
                        setMintToken,
                        erc20Contract: fees?.erc20Contract ?? zeroAddress,
                        debouncedMintQuantity,
                        setMintQuantity,
                        availableEditions,
                        handleSubmit,
                        chainId: constants.CHAIN_ID,
                        isTxPending,
                        isTxSuccessful,
                        txStatus,
                        txHash
                    }
                }
            />
        </React.Fragment >
    )
}

const MintCurrencyOptions = ({ props, handleClose }: { props: CurrencyOptionProps, handleClose: () => void }) => {
    const [mintQuantity, setMintQuantity] = useState<string>('1');
    const debouncedMintQuantity = useDebounce(mintQuantity);

    const erc20AmountRequired = props.fees ? props.fees.erc20MintPrice * BigInt(debouncedMintQuantity) : BigInt(0);
    const ethAmountRequired = props.fees ? props.fees.ethMintPrice * BigInt(debouncedMintQuantity) : BigInt(0);

    const { balance: erc20Balance, isBalanceLoading: isErc20BalanceLoading } = useErc20Balance(props.mintToken, props.chainId);
    const { balance: ethBalance, isBalanceLoading: isEthBalanceLoading } = useEthBalance(props.chainId);

    const { data: capabilities } = useCapabilities()

    const areAuxiliaryFundsSupported = capabilities ? capabilities[props.chainId]?.auxiliaryFunds?.supported ?? false : false

    const isInsufficientErc20Balance = areAuxiliaryFundsSupported ? false : isErc20BalanceLoading ? false : erc20Balance < erc20AmountRequired
    const isInsufficientEthBalance = areAuxiliaryFundsSupported ? false : isEthBalanceLoading ? false : ethBalance < ethAmountRequired

    const mintButtonTitle = props.mintToken === NATIVE_TOKEN
        ? isInsufficientEthBalance ? `Insufficient balance` : "Collect"
        : isInsufficientErc20Balance ? `Insufficient ${props.erc20Symbol} balance` : "Approve & Collect"


    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Collect post</DialogTitle>
                <DialogDescription>

                </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col w-full sm:w-3/4 m-auto gap-8 h-[50vh] justify-center">
                <CounterInput count={mintQuantity} setCount={setMintQuantity} max={props.availableEditions.toString()} />

                <div className="flex flex-col gap-2">
                    <div
                        className={`text-lg text-center relative border border-accent2 bg-accent-1 hover:bg-accent2 no-select cursor-pointer ${props.mintToken === NATIVE_TOKEN && "border-secondary hover:border-secondary"} normal-case rounded-lg grid h-24 flex-grow place-items-center`}
                        onClick={() => props.setMintToken(NATIVE_TOKEN)}
                    >
                        Collect with <br />{formatEther(ethAmountRequired)} ETH
                        <BadgeCheck className={` absolute -top-3 -right-3 h-10 w-10 text-foreground fill-secondary ${props.mintToken === NATIVE_TOKEN ? "visible" : "invisible"}`} />

                    </div>
                    <div
                        className={`text-lg text-center relative border border-accent2 bg-accent-1 hover:bg-accent2 no-select cursor-pointer ${props.mintToken !== NATIVE_TOKEN && "border-primary hover:border-primary"} normal-case rounded-lg grid h-24 flex-grow place-items-center`}
                        onClick={() => props.setMintToken(props.erc20Contract)}
                    >
                        Collect with <br /> {compact_formatter.format(Number(formatUnits(erc20AmountRequired, props.erc20Decimals)))} {props.erc20Symbol}
                        <BadgeCheck className={` absolute -top-3 -right-3 h-10 w-10 text-forground fill-primary ${props.mintToken !== NATIVE_TOKEN ? "visible" : "invisible"}`} />
                    </div>
                </div>
                <OnchainButton
                    chainId={props.chainId}
                    title={mintButtonTitle}
                    disabled={props.mintToken === NATIVE_TOKEN ? isInsufficientEthBalance : isInsufficientErc20Balance}
                    onClick={() => props.handleSubmit(parseInt(debouncedMintQuantity), props.mintToken)}
                    isLoading={false}
                    loadingChild={<></>}
                />
            </div>
        </DialogContent>
    )
}


const MintFlowModal = ({
    isModalOpen,
    handleClose,
    handleExitMint,
    flowProps

}: { isModalOpen: boolean, handleClose: () => void, handleExitMint: () => void, flowProps: FlowModalProps }) => {

    const { chain } = useAccount();
    const { symbol, decimals } = useTokenInfo(flowProps.erc20Contract, flowProps.chainId);


    useEffect(() => {

        // a hacky way to close the modal when mint with eth fails and we don't want to show the currency options (since erc20 is not an option)
        if ((flowProps.txStatus === "error" || flowProps.txStatus === undefined) && isModalOpen && flowProps.erc20Contract === zeroAddress) {
            handleClose()
        }
    }, [flowProps.txStatus])

    return (
        <Modal isModalOpen={isModalOpen} onClose={handleClose} className="w-[350px]">
            {!flowProps.isTxPending && !flowProps.isTxSuccessful && <MintCurrencyOptions props={{ ...flowProps, erc20Decimals: decimals ?? 18, erc20Symbol: symbol ?? '' }} handleClose={handleClose} />}
            {flowProps.isTxPending && (
                <DialogContent>
                    <div className="flex flex-col gap-2 w-full h-[50vh] items-center justify-center">
                        <p className="text-lg text-t1 font-semibold text-center">
                            {flowProps.txStatus === "erc20ApprovalInProgress" ? `Approving use of ${symbol}` : "Collecting"}
                        </p>
                        <LoaderCircle className="w-12 h-12 text-primary animate-spin" />
                    </div>
                </DialogContent>
            )}
            {flowProps.isTxSuccessful && (
                <DialogContent>
                    <div className="flex flex-col gap-3 w-full h-[50vh] items-center justify-center">
                        <BadgeCheck className="h-48 w-48 text-success" />
                        <h2 className="font-bold text-t1 text-xl">Got it.</h2>
                        <div className="flex gap-2 items-center">
                            <Link
                                href={`${chain?.blockExplorers?.default?.url ?? ''}/tx/${flowProps.txHash}`}
                                target="_blank"
                                rel="noopener norefferer"
                                passHref
                            >
                                <Button variant="ghost">
                                    View Tx
                                </Button>
                            </Link>
                            <Button onClick={handleClose}>Close</Button>
                        </div>
                    </div>
                </DialogContent>
            )}
        </Modal>
    )
}

export const RenderDisplayWithProps = (props: DisplayProps & { displayMode: DisplayMode }) => {
    if (props.displayMode === "expanded") return <MintExpandedDisplay {...props} />
    return null
}