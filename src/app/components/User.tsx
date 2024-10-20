"use client";
import { useEffect } from "react";
import { Address } from "viem";
import { useWalletDisplayText } from "../hooks/useWalletDisplayText";
import { Noggles } from "./Noggles";

const formatAddress = (address: string) => {
    return `${address.substring(0, 4)}\u2026${address.substring(
        address.length - 4
    )}`;
};

// const generateColorFromAddress = (address: Address) => {
//     if (!address) return { foreground: "black", background: "white" };

//     const hexColor = address.slice(2, 8);
//     let r = parseInt(hexColor.substr(0, 2), 16);
//     let g = parseInt(hexColor.substr(2, 2), 16);
//     let b = parseInt(hexColor.substr(4, 2), 16);

//     // Minimum brightness threshold
//     const brightnessThreshold = 500;
//     const colorDecision = parseInt(hexColor, 16) % 3;

//     if (colorDecision === 0) {
//         r = 255; // Make red dominant
//         if (g + b < brightnessThreshold - r) {
//             g = g > b ? Math.min(255, brightnessThreshold - r - b) : g;
//             b = g > b ? b : Math.min(255, brightnessThreshold - r - g);
//         }
//     } else if (colorDecision === 1) {
//         g = 255; // Make green dominant
//         if (r + b < brightnessThreshold - g) {
//             r = r > b ? Math.min(255, brightnessThreshold - g - b) : r;
//             b = r > b ? b : Math.min(255, brightnessThreshold - g - r);
//         }
//     } else {
//         b = 255; // Make blue dominant
//         if (r + g < brightnessThreshold - b) {
//             r = r > g ? Math.min(255, brightnessThreshold - b - g) : r;
//             g = r > g ? g : Math.min(255, brightnessThreshold - b - r);
//         }
//     }

//     return {
//         foreground: `rgb(${r},${g},${b})`,
//         background: `rgba(${r},${g},${b},0.35)`,
//     };
// };

// do it for light theme now

const generateColorFromAddress = (address: Address) => {
    if (!address) return { foreground: "black", background: "white" };

    const hexColor = address.slice(2, 8);
    let r = parseInt(hexColor.substr(0, 2), 16);
    let g = parseInt(hexColor.substr(2, 2), 16);
    let b = parseInt(hexColor.substr(4, 2), 16);

    // Maximum brightness threshold
    const brightnessThreshold = 400;
    const colorDecision = parseInt(hexColor, 16) % 3;

    if (colorDecision === 0) {
        r = 255; // Make red dominant
        if (g + b > brightnessThreshold - r) {
            g = g > b ? Math.max(0, brightnessThreshold - r - b) : g;
            b = g > b ? b : Math.max(0, brightnessThreshold - r - g);
        }
    } else if (colorDecision === 1) {
        g = 255; // Make green dominant
        if (r + b > brightnessThreshold - g) {
            r = r > b ? Math.max(0, brightnessThreshold - g - b) : r;
            b = r > b ? b : Math.max(0, brightnessThreshold - g - r);
        }
    } else {
        b = 255; // Make blue dominant
        if (r + g > brightnessThreshold - b) {
            r = r > g ? Math.max(0, brightnessThreshold - b - g) : r;
            g = r > g ? g : Math.max(0, brightnessThreshold - b - r);
        }
    }

    return {
        foreground: `rgb(${r},${g},${b})`,
        background: `rgba(${r},${g},${b},0.35)`,
    };


}

export const NoggleAvatar = ({
    address,
    size,
    styleOverride,
}: {
    address: Address;
    size: number;
    styleOverride?: string;
}) => {
    const colors = generateColorFromAddress(address);
    const avatarStyle = {
        backgroundColor: colors.background,
        width: size,
        height: size,
    };

    return (
        <div
            style={avatarStyle}
            className={styleOverride ? styleOverride : "flex h-full items-center overflow-hidden p-1 rounded-lg transition-all duration-300 ease-linear"}
        >
            <Noggles color={colors.foreground} />
        </div>
    );
};




export const AddressOrEns = ({ address }: { address: null | undefined | string; }) => {
    const { displayText, getDisplayText } = useWalletDisplayText(address);

    useEffect(() => {
        getDisplayText(address);
    }, [address, getDisplayText]);

    return <span>{displayText}</span>;
};
