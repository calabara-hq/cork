"use client";;
import { Button } from "../components/Button";
import React, { useEffect, useRef, useState } from "react";
import { concatContractID } from "../utils/transmissions";
import Link from "next/link";
import { MediaUpload } from "../components/MediaUpload";
import { Label } from "../components/Label";
import { useCreateTokenReducer } from "../hooks/useCreateTokenReducer";
import { maxUint256 } from "viem";
import constants from "../constants";
import toast from "react-hot-toast";
import { asPositiveInt } from "../utils/numbers";
import { useTransmissionsErrorHandler } from "../hooks/useTransmissionsErrorHandler";
import { MarkdownEditor } from "../components/Editor";
import Toggle from "../components/Toggle";
import { FormInput } from "../components/Input";
import { Option, OptionGroupOrCustom } from "../components/Option";
import { useChannel } from "../hooks/useChannel";
import useSWRMutation from "swr/mutation";
import { DeferredTokenIntentWithSignature } from "@tx-kit/sdk";
import { insertIntent } from "../utils/fetch/insertIntent";
import { Modal } from "../components/Modal";
import { BadgeCheck, LoaderCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { MDXEditorMethods } from "@mdxeditor/editor";
import OnchainButton from "../components/OnchainButton";

const chainId = constants.CHAIN_ID;
const contractAddress = constants.CONTRACT_ADDRESS;
const areIntentsEnabled = constants.INTENTS;

const contractId = concatContractID({ chainId, contractAddress });

const CreateToken = () => {

    const {
        state,
        setField,
        validate,
        isIntent,
        setIsIntent,
        txError,
        txStatus,
        tx,
        txResponse,
        txHash
    } = useCreateTokenReducer(contractAddress)

    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const { chain } = useAccount();
    const editorRef = useRef<MDXEditorMethods>(null)

    useEffect(() => { console.log(txError) }, [txError])

    useTransmissionsErrorHandler(txError);


    useEffect(() => {
        if (txStatus === "txInProgress") {
            setIsModalOpen(true);
        }

        if (txStatus == "complete") {
            handleTokenCreated();
            if (isIntent) setIsModalOpen(true);
        }
    }, [txStatus, setIsModalOpen, isIntent]);


    const { trigger, data: swrData, error: swrError, isMutating: isSwrMutating, reset: resetSwr } = useSWRMutation(
        `/api/insertIntent`,
        insertIntent,
        {
            onError: (err: any) => {
                console.log(err);
                resetSwr();
            },
        }
    );

    const uploadStatusCallback = (status: boolean) => {
        setIsUploading(status)
    }

    const ipfsImageCallback = (url: string) => {
        setField("imageURI", url)
    }

    const ipfsAnimationCallback = (url: string) => {
        setField("animationURI", url)
    }

    const mimeTypeCallback = (mimeType: string) => {
        setField("mimeType", mimeType);
    }

    const handleSubmit = async () => {
        const markdown = editorRef.current?.getMarkdown();

        const { success, data } = await validate(markdown ?? "");

        if (!success) {
            return toast.error("Some of your fields are invalid")
        }
        tx(data);
    }


    const handleTokenCreated = async () => {

        if (!isIntent) return toast.success("Token Created!")

        try {
            await trigger({
                contractId: contractId,
                tokenIntent: txResponse as DeferredTokenIntentWithSignature
            }).then(response => {
                if (!response.success) {
                    toast.error('Something went wrong')
                    return resetSwr()
                }

                return toast.success('Token Configured!')

            })
        } catch (e) {
            console.log(e)
            resetSwr()
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[60%_30%] w-full m-auto justify-end gap-2">
            <div className="flex flex-col gap-8 w-full lg:ml-auto md:max-w-[800px] bg-base-100 rounded-lg p-4">
                <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-t1">Create Post</h1>
                    </div>

                    <div className="flex flex-col max-w-xs gap-2">
                        <MediaUpload
                            acceptedFormats={['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'video/mp4']}
                            uploadStatusCallback={uploadStatusCallback}
                            ipfsImageCallback={ipfsImageCallback}
                            ipfsAnimationCallback={ipfsAnimationCallback}
                            mimeTypeCallback={mimeTypeCallback}
                            maxVideoDuration={210}
                        />
                        {state.errors?.imageURI?._errors && (
                            <Label>
                                <p className="text-error max-w-sm break-words">{state.errors.imageURI._errors.join(",")}</p>
                            </Label>
                        )}
                    </div>
                    <FormInput inputType="text" label="Title" value={state.title} placeholder={"My awesome creation"} onChange={(e) => setField("title", e.target.value)} error={state.errors?.title?._errors} />
                    <MarkdownEditor ref={editorRef} label={"Body (optional)"} error={state.errors?.description?._errors} markdown="" />
                </div>
            </div>


            <StudioSidebar areIntentsEnabled={areIntentsEnabled} isIntent={isIntent} setIsIntent={setIsIntent}>
                <OptionGroupOrCustom
                    value={state.maxSupply.toString()}
                    label={"Available Supply"}
                    options={[{ value: "1", label: "1" }, { value: "100", label: "100" }, { value: maxUint256.toString(), label: "unlimited" }]}
                    onOptionSelect={(option: Option) => setField("maxSupply", option.value)}
                    customLabel={"custom"}
                    customChild={
                        <FormInput
                            inputType="number"
                            value={state.maxSupply} // default to 100 on switchover
                            label={"Custom Supply"}
                            placeholder={"100"}
                            onChange={(e: any) => setField("maxSupply", asPositiveInt(e.target.value))}
                            error={state.errors?.maxSupply?._errors} />
                    } />

                <OnchainButton
                    chainId={chainId}
                    title={"Post"}
                    onClick={handleSubmit}
                    isLoading={txStatus === 'pendingApproval' || txStatus === 'txInProgress' || isUploading}
                    loadingChild={
                        <Button disabled>
                            <div className="flex gap-2 items-center">
                                <p className="text-sm">{
                                    isUploading ? <span>Uploading</span> :
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
            </StudioSidebar>

            <Modal
                isModalOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                className="w-full max-w-[500px]"
            >
                {txStatus === 'txInProgress' && (
                    <div className="animate-springUp flex flex-col gap-2 w-full h-[50vh] items-center justify-center">
                        <p className="text-lg text-t1 font-semibold text-center">Etching your creation into the ether</p>
                        <div className="text-xs text-primary ml-1 inline-block h-10 w-10 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                            role="status"
                        />
                    </div>
                )}

                {txStatus === 'complete' && txResponse && (
                    <div className="animate-springUp flex flex-col gap-3 w-full h-[50vh] items-center justify-center">
                        <BadgeCheck className="h-24 w-24 text-success" />
                        <h2 className="font-bold text-t1 text-xl">Successfully created your post.</h2>

                        {!isIntent && (
                            <div className="">
                                <Link href={`https://warpcast.com/~/compose?channelKey=${constants.WC_CHANNEL_KEY}${state.animationURI ? `&embeds[]=${state.animationURI}` : state.imageURI ? `&embeds[]=${state.imageURI}` : ''}&embeds[]=${process.env.NEXT_PUBLIC_CLIENT_URL}/post/${txResponse}`}
                                    passHref target="_blank">
                                    <Button className="w-full bg-warpcast text-accent1">Share on warpcast</Button>
                                </Link>
                            </div>
                        )}


                        <div className="flex gap-2 items-center">
                            {!isIntent && <Link
                                href={`${chain?.blockExplorers?.default?.url ?? ''}/tx/${txHash}`}
                                target="_blank"
                                rel="noopener norefferer"
                                passHref
                            >
                                <Button variant="ghost" className="w-auto">
                                    View Tx
                                </Button>
                            </Link>
                            }

                            <Link
                                href={'/'}
                            >
                                <Button>
                                    Home
                                </Button>
                            </Link>
                        </div>
                    </div>

                )}

            </Modal>
        </div>
    )
}

const StudioSidebar = ({
    areIntentsEnabled,
    isIntent,
    setIsIntent,
    children
}: {
    areIntentsEnabled: boolean,
    isIntent: boolean,
    setIsIntent: (value: boolean) => void,
    children: React.ReactNode
}) => {
    // todo some submitter requirements / user status
    return (
        <div className="flex flex-col gap-2 p-4 bg-base-100 rounded-lg self-start md:max-w-[800px] min-w-[300px]">
            {areIntentsEnabled &&
                <React.Fragment>
                    <div className="flex flex-row gap-2 items-center justify-between">
                        <p><b>Sponsor post onchain</b></p>
                        <Toggle checked={!isIntent} onCheckedChange={(isChecked) => setIsIntent(!isChecked)} />

                    </div>
                    <div className="h-2 w-full" />
                    <div className="bg-base-200 p-2 rounded-lg">
                        <p className="text-t2 text-sm">
                            Leaving this toggle off will allow you to post for free.
                            <br />
                            <br />
                            Alternatively, you can sponsor the post for a small gas fee and collect an onchain sponsorship reward each time someone mints.
                        </p>
                    </div>
                    <div className="bg-base-100 h-0.5 w-full" />
                </React.Fragment>
            }

            {children}
        </div>
    )
}

export default function Page() {

    return (
        <div className="flex flex-col gap-2">
            <CreateToken />
        </div>
    )
}