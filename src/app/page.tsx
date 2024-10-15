
import { Suspense } from "react"
import constants from "./constants"
import { clientByChainId, parseV2Metadata } from "./utils/transmissions"
import { MintSplits } from "./components/MintSplits"
import { IChannel } from "@tx-kit/sdk/subgraph"
import { fetchChannel } from "./utils/fetch/channel"
import { fetchOnchainPosts } from "./utils/fetch/tokens"
import { unstable_serialize } from "swr"
import SwrProvider from "./providers/SwrProvider"
import { RenderPosts } from "./components/Posts"


const Header = async () => {
  const channel = await fetchChannel()
  return (
    <div className="grid grid-cols-1 md:grid-cols-[60%_40%]">
      <div className="flex flex-col gap-2">
        <p className="text-2xl">{channel.tokens[0].metadata?.name ?? ''}</p>
        <p>{channel.tokens[0].metadata?.description ?? ''}</p>
      </div>
      <div className="flex flex-col gap-2">
        {channel.fees && <MintSplits channelFees={channel.fees.fees} spaceName={channel.tokens[0].metadata?.name ?? ''} />}
        <button className="bg-green-500">Submit</button>
      </div>
    </div>
  )
}

const Posts = async ({
  tab
}: {
  tab: "default" | "popular" | "intent";
}) => {

  const [
    onchainTokens,
    // firstPageV1Tokens,
    // firstPageIntents,
    // popularTokens,
    // channel

  ] = await Promise.all([
    fetchOnchainPosts(50, 0),
    // fetchTokensV1(contractId, 50, 0),
    // fetchTokenIntents(contractId, 50, 0),
    // fetchPopularTokens(contractId, 50, 0),
    // fetchChannel(contractId)
  ])

  const fallback = {
    [unstable_serialize(() => ['posts', 50, 0])]: [onchainTokens],
    // [unstable_serialize(() => ['mintBoard', contractId, 'postsV1', 50, 0])]: [firstPageV1Tokens],
    // [unstable_serialize(() => ['mintBoard', contractId, 'intents', 50, 0])]: [firstPageIntents],
    // [unstable_serialize(() => ['mintBoard', contractId, 'popular', 50, 0])]: [popularTokens],
    // [`/swrChannel/${contractId}`]: channel,
  }

  return (
    <SwrProvider fallback={fallback}>
      <RenderPosts />
    </SwrProvider>
  );
};

export default function Home() {
  return (
    <div className="flex flex-col gap-2">
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <div className="">
        <Posts tab="default" />
      </div>
    </div>
  )
}
