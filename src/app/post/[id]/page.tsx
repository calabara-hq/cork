import { ExpandedPostSkeleton, MintTokenSwitch } from "@/app/components/Mint";
import constants from "@/app/constants";
import SwrProvider from "@/app/providers/SwrProvider";
import { calculateImageAspectRatio } from "@/app/utils/farcaster/utils";
import { fetchSinglePost } from "@/app/utils/fetch/tokens";
import { parseIpfsUrl } from "@/app/utils/ipfs";
import { Metadata } from "next";
import { Suspense } from "react";


export async function generateMetadata({
    params,
    searchParams
}: {
    params: { id: string };
    searchParams: { [key: string]: string | undefined }
}): Promise<Metadata> {

    const postId = params.id

    const isIntent = false
    const referral = searchParams?.referrer ?? ""

    //const token = isIntent ? await fetchSingleTokenIntent(contractId, postId) : await fetchSingleTokenV2(contractId, postId)
    const token = await fetchSinglePost(postId)

    const aspect = await calculateImageAspectRatio(parseIpfsUrl(token.metadata?.image ?? '').gateway)

    const fcMetadata: Record<string, string> = {
        "fc:frame": "vNext",
        "fc:frame:image": parseIpfsUrl(token.metadata?.image ?? '').gateway,
        "fc:frame:image:aspect_ratio": aspect, // todo is this necc???
    };

    const mintableMetadata: Record<string, string> = {
        "fc:frame:button:1": "Mint",
        "fc:frame:button:1:action": "tx",
        "fc:frame:button:1:target": `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/frames/mint?postId=${postId}&intent=${isIntent ? 'true' : 'false'}&referrer=${referral}`,
        "fc:frame:button:1:post_url": `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/frames/after-mint`,
    }

    return {
        title: `${token.metadata?.name ?? `Post ${postId}`}`,
        description: `Collect ${token.metadata?.name}`,
        openGraph: {
            title: `${token.metadata?.name ?? `Post ${postId}`}`,
            description: `Collect ${token.metadata?.name ?? `post ${postId}`}`,
            images: [
                {
                    url: parseIpfsUrl(token.metadata?.image ?? '').gateway,
                    width: 600,
                    height: 600,
                    alt: `${postId} media`,
                },
            ],
            locale: "en_US",
            type: "website",
        },
        other: {
            ...fcMetadata,
            ...mintableMetadata
        },
    };
}


const PageContent = async ({ id, searchParams }: { id: string, searchParams: { [key: string]: string | undefined } }) => {

    //const isIntent = searchParams?.intent ? true : false
    const token = await fetchSinglePost(id)

    const fallback = {
        [`/singlePost/${id}`]: token,
    }

    return (
        <SwrProvider fallback={fallback}>
            <MintTokenSwitch
                referral={searchParams?.referral ?? ""}
                contractAddress={constants.CONTRACT_ADDRESS}
                postId={id}
                display="expanded"
                backwardsNavUrl='/'
            />
        </SwrProvider>
    )
}

export default function Page({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | undefined } }) {

    return (
        <div className="grid grid-cols-1 gap-6 w-full sm:w-10/12 m-auto h-full mt-4 ">
            <Suspense fallback={<ExpandedPostSkeleton />}>
                <PageContent id={params.id} searchParams={searchParams} />
            </Suspense>
        </div>
    );
}