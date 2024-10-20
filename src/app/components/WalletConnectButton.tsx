"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useCallback, useRef, useState } from "react";
// import { NoggleAvatar, UsernameDisplay } from "@/ui/AddressDisplay/AddressDisplay";
import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi';
import { Button } from "./Button";
import { LoaderCircle, Power } from "lucide-react";
// import { TbLoader2 } from "react-icons/tb";
// import { IoMdPower } from "react-icons/io";
import { Modal } from "./Modal";
import { AddressOrEns, NoggleAvatar } from "./User";
import { zeroAddress } from "viem";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./Dialog";

function AccountModal({
    isModalOpen,
    handleClose,
}: {
    isModalOpen: boolean;
    handleClose: () => void;
}) {
    const { data: walletClient } = useWalletClient();
    const { disconnect } = useDisconnect();

    return (
        <Modal isModalOpen={isModalOpen} onClose={handleClose} className="w-full max-w-[350px]">

            <div className="flex flex-col items-center gap-4">
                <NoggleAvatar
                    address={walletClient?.account.address ?? zeroAddress}
                    size={80}
                />
                <div className="font-bold text-lg">
                    <AddressOrEns address={walletClient?.account.address ?? zeroAddress} />
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <Button variant="destructive" onClick={() => {
                        disconnect()
                    }}>
                        <div className="flex gap-1 items-center p-2">
                            <p>Sign out</p>
                            <Power className="w-4 h-4" />
                        </div>
                    </Button>
                </div>
            </div>
        </Modal>
    )
}


const ConnectedAccountDisplay = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: walletClient } = useWalletClient();


    return (
        <div className="flex items-center justify-center lg:gap-2 w-full text-sm">
            <div tabIndex={0} role="button" onClick={() => setIsModalOpen(!isModalOpen)} className="flex gap-2 bg-accent2 hover:bg-accent3 w-fit rounded-xl items-center justify-start pr-2 font-bold  no-select text-t2">
                <NoggleAvatar
                    address={walletClient?.account.address ?? zeroAddress}
                    size={40}
                    styleOverride="flex h-full items-center overflow-hidden p-1 rounded-xl transition-all duration-300 ease-linear"
                />
                <div className="">
                    <AddressOrEns address={walletClient?.account.address ?? zeroAddress} />

                    {/* <UsernameDisplay user={walletClient?.account.address ?? zeroAddress} /> */}
                </div>

            </div>
            <AccountModal isModalOpen={isModalOpen} handleClose={() => setIsModalOpen(false)} />
        </div >
    );
};

export function CreateSmartWalletButton({ openConnectModal }: { openConnectModal: () => void }) {
    const { connectors, connect, data } = useConnect();
    const [isCreating, setIsCreating] = useState(false);

    const createWallet = useCallback(() => {
        setIsCreating(true);
        const coinbaseWalletConnector = connectors.find(
            (connector) => connector.id === 'coinbaseWalletSDK'
        );
        if (coinbaseWalletConnector) {
            connect({ connector: coinbaseWalletConnector }, {
                onSuccess: () => {
                    setIsCreating(false);
                    openConnectModal()
                },
                onSettled: () => {
                    setIsCreating(false);
                }
            });
        }
    }, [connectors, connect, setIsCreating]);


    return (
        <Button variant="outline" onClick={createWallet} className="h-10">
            {isCreating ?
                <span className="flex items-center gap-2">Creating<LoaderCircle className="w-4 h-4 text-t2 animate-spin" /></span>
                : "Create Wallet"
            }
        </Button>
    );
}

export default function WalletConnectButton({
    children,
    styleOverride,
    disabled = false
}: {
    children?: React.ReactNode;
    styleOverride?: string;
    disabled?: boolean;
}) {

    const { status } = useAccount();
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);


    // if (!status || status === "connecting")
    // return (
    //     <div className="grid grid-cols-2 items-center gap-2 max-w-full">

    //         <Button variant="outline" className="shimmer text-transparent">Placeholder</Button>
    //         <Button variant="outline" className="shimmer text-transparent">Placeholder</Button>

    //     </div>
    //     )

    // else
    return (
        <>
            <ConnectButton.Custom>
                {({ openConnectModal, account, mounted, chain }) => {

                    const ready = mounted;
                    const connected = ready && account && chain

                    const handleConnect = () => {
                        openConnectModal();
                        setIsWalletModalOpen(false);
                    }

                    if (!ready) {
                        return (
                            <Button variant="outline" className="shimmer text-transparent">Placeholder</Button>
                        )
                    }

                    else {

                        if (connected) {
                            if (children) return children;
                            else return <ConnectedAccountDisplay />
                        }
                        return (
                            <>
                                <Button variant="outline" onClick={() => setIsWalletModalOpen(true)}>
                                    Connect
                                </Button>
                                <Modal isModalOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} className="w-full max-w-[350px]">
                                    <DialogContent >
                                        <DialogHeader>
                                            <DialogTitle>Connect</DialogTitle>
                                            <DialogDescription>
                                                Sign in to your wallet to create and collect posts.
                                            </DialogDescription>
                                            <Button variant="default" className="h-10" onClick={handleConnect}>
                                                Sign in
                                            </Button>
                                        </DialogHeader>

                                        <DialogHeader>
                                            <DialogDescription>
                                                Don't have a wallet? We've got you covered.
                                            </DialogDescription>
                                            <CreateSmartWalletButton openConnectModal={handleConnect} />
                                        </DialogHeader>

                                        {/* <div className="grid grid-cols-2 items-center gap-2 max-w-full">
                                            <CreateSmartWalletButton openConnectModal={handleConnect} />

                                        </div> */}
                                    </DialogContent>
                                </Modal>
                            </>
                        );
                    }
                }}
            </ConnectButton.Custom>
        </>
    );
}
