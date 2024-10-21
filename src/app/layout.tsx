import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import WalletProvider from "./providers/WalletProvider";
import { PolyfillContext } from "./providers/PolyfillContext";
import { fetchChannel } from "./utils/fetch/channel";
import SwrProvider from "./providers/SwrProvider";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import WalletConnectButton from "./components/WalletConnectButton";
import { Noggles } from "./components/Noggles";
import Image from "next/image";

export const revalidate = 60;

const epilogue = localFont({
  src: "./fonts/Epilogue-VariableFont_wght.ttf",
  variable: "--font-epilogue",
  weight: "100 900",
});



export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_CLIENT_URL!),
  title: "Cork",
  description: "Enjoy nouns on cork",
  icons: {
    icon: "/noggles.svg",
  },
  openGraph: {
    title: "Cork",
    description: "Enjoy nouns on cork",
    url: "/",
    siteName: "Cork",
    images: [
      {
        url: "/cork-og.png",
        width: 1200,
        height: 600,
        alt: "Cork",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};


const Navbar = () => {
  return (
    <div className="bg-accent1 text-3xl h-16 flex items-center">
      <div className="w-full lg:w-9/12 m-auto flex justify-between items-center p-2 lg:p-0">
        <Link href="/" passHref draggable={false}>
          {/* <div className="w-16 h-16">
            <Noggles color="#d19a54" />
          </div> */}
          <Image src="/noggles.svg" alt="noggles" width={72} height={72} />
        </Link>
        <div className="ml-auto">
          <WalletConnectButton />
        </div>
      </div>
    </div >
  );
}

const Footer = () => {
  return (
    <div className="text-lg h-12 flex items-center mt-auto absolute bottom-0 left-0 w-full">
      <div className="w-full lg:w-9/12 m-auto flex items-center gap-2 p-2 text-primary">
        <Link href={"https://uplink.wtf"} prefetch={false} draggable={false} target="_blank">by uplink.wtf</Link>
      </div>
    </div>
  )
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const channel = await fetchChannel();

  const fallback = {
    'channel': channel,
  }

  return (
    <html lang="en">
      <body className={`${epilogue.variable} antialiased font-[family-name:var(--font-epilogue)]`}>
        <WalletProvider>
          <PolyfillContext>
            <div className="flex flex-col gap-2">
              <Navbar />
              <div className="flex flex-col w-full lg:w-9/12 m-auto p-2 lg:p-0 mb-20">
                <SwrProvider fallback={fallback}>
                  {children}
                </SwrProvider>
              </div>
              {/* <Footer /> */}
            </div>
          </PolyfillContext>
        </WalletProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
