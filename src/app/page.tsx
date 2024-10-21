
import { Suspense } from "react"
import { MintSplits } from "./components/MintSplits"
import { fetchChannel } from "./utils/fetch/channel"
import { fetchOnchainPosts } from "./utils/fetch/tokens"
import { unstable_serialize } from "swr"
import SwrProvider from "./providers/SwrProvider"
import { RenderPosts } from "./components/Posts"
import { Button } from "./components/Button"
import Link from "next/link"
import constants from "./constants"


// const Header = async () => {
//   const channel = await fetchChannel()

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-[60%_40%]">
//       <div className="flex flex-col gap-2">
//         <p className="text-2xl">{channel.tokens[0].metadata?.name ?? ''}</p>
//         <p>{channel.tokens[0].metadata?.description ?? ''}</p>
//       </div>
//       <div className="flex flex-col gap-2">
//         {channel.fees && <MintSplits channelFees={channel.fees.fees} spaceName={channel.tokens[0].metadata?.name ?? ''} />}
//         <Link href="/studio" passHref >
//           <Button className="w-full">Submit</Button>
//         </Link>
//       </div>
//     </div>
//   )
// }



const Scratch = async () => {

  const channel = await fetchChannel()

  return (
    <div className="flex flex-col gap-4 sticky top-4">
      <div className="flex flex-col gap-2 bg-accent1 rounded-lg p-2">
        {/* <p className="text-2xl">{channel.tokens[0].metadata?.name ?? ''}</p> */}
        <p>{channel.tokens[0].metadata?.description ?? ''}</p>
      </div>
      <div className="flex flex-col gap-4">
        {channel.fees && <MintSplits channelFees={channel.fees.fees} spaceName={constants.ORG_NAME} />}
        <Link href="/studio" passHref >
          <Button className="w-full h-12">Post</Button>
        </Link>
      </div >
    </div >
  )
}

const Posts = async ({
  tab
}: {
  tab: "default" | "popular" | "intent";
}) => {

  const [
    onchainTokens,
  ] = await Promise.all([
    fetchOnchainPosts(50, 0),
  ])

  const fallback = {
    [unstable_serialize(() => ['posts', 50, 0])]: [onchainTokens],
  }

  return (
    <SwrProvider fallback={fallback}>
      <RenderPosts />
    </SwrProvider>
  );
};

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[65%_30%] gap-4 justify-between">
      <div className="flex flex-col gap-2 order-2 md:order-1">
        <div className="">
          <Posts tab="default" />
        </div>
      </div>
      <div className="order-1 md:order-2">
        <Suspense fallback={<div>Loading...</div>}>
          <Scratch />
        </Suspense>
      </div>
    </div>
  )
}
