import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Dialog, DialogContent } from "./Dialog";
import { cn } from "@/app/utils/shadcn";

export const Modal = ({
    isModalOpen,
    onClose,
    children,
    className,
}: {
    isModalOpen: boolean,
    onClose: () => void,
    children: React.ReactNode,
    className?: string,
}) => {
    const { connectModalOpen } = useConnectModal();

    const handleChange = (val: boolean) => {
        if (connectModalOpen) return;

        if (!val) {
            onClose();
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleChange} >
            <DialogContent className={cn(
                "max-w-[900px] bg-background overflow-hidden",
                className
            )}
            >
                {children}
            </DialogContent>
        </Dialog>
    )
}