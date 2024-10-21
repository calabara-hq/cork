

export const replaceGatewayLinksInString = (str: string) => {
    return str.replace(/https:\/\/ipfs.cork.wtf\/ipfs\//g, 'ipfs://');
}

export const replaceIpfsLinkWithGateway = (str: string) => {
    return str.replace(/ipfs:\/\/[^ ]+/g, (match) => {
        return `https://ipfs.cork.wtf/ipfs/${match.split('ipfs://')[1]}`;
    });
}


// given an ipfs url, return both the "raw" ipfs protocol url and the gateway url (ipfs.cork.wtf)
export const parseIpfsUrl = (url: string) => {
    if (url.startsWith('ipfs://')) {
        const hash = url.split('ipfs://')[1];
        return {
            raw: url,
            gateway: `https://ipfs.cork.wtf/ipfs/${hash}`,
        }
    }
    if (url.startsWith('https://ipfs.cork.wtf/ipfs/')) {
        const hash = url.split('https://ipfs.cork.wtf/ipfs/')[1];
        return {
            raw: `ipfs://${hash}`,
            gateway: url,
        }
    }
    return {
        raw: url,
        gateway: url,
    }
}

export const pinJSONToIpfs = async (data: any) => {
    try {
        const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            return null
        }

        const responseData = await response.json();
        return parseIpfsUrl(`ipfs://${responseData.IpfsHash}`);
    } catch (err) {
        console.error("Fetch error:", err);
        return null;
    }
};
